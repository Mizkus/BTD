from datetime import datetime, timedelta
from io import BytesIO

import httpx
from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import JWTError, jwt
from passlib.context import CryptContext
from PIL import Image, ImageOps
from sqlalchemy.orm import Session

from database import SessionLocal, get_db
from models import KPI, Page, Role, User
from schemas import (
    KPIOut,
    KPIUpdate,
    PageCreate,
    PageOut,
    TokenResponse,
    UserCreate,
    UserOut,
)


SECRET_KEY = "CHANGE_ME"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(status_code=401, detail="Could not validate credentials")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception
    return user


def get_admin_user(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role.name != "admin":
        raise HTTPException(status_code=403, detail="Admins only")
    return current_user


from PIL import Image, ImageOps

POSTS_URL = "https://jsonplaceholder.typicode.com/posts"

app = FastAPI(title="Local API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def ensure_default_roles() -> None:
    with SessionLocal() as db:
        roles: dict[str, Role] = {}
        for role_name in ("user", "admin"):
            role = db.query(Role).filter(Role.name == role_name).first()
            if not role:
                role = Role(name=role_name)
                db.add(role)
                db.commit()
                db.refresh(role)
            roles[role_name] = role

        admin_email = "admin@example.com"
        if not db.query(User).filter(User.email == admin_email).first():
            admin = User(
                email=admin_email,
                password_hash=get_password_hash("admin123"),
                role_id=roles["admin"].id,
            )
            db.add(admin)
            db.commit()


@app.get("/posts")
async def get_posts(current_user: User = Depends(get_current_user)):
    async with httpx.AsyncClient() as client:
        resp = await client.get(POSTS_URL)
        resp.raise_for_status()
        return resp.json()


@app.post("/invert-image")
async def invert_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    data = await file.read()
    try:
        image = Image.open(BytesIO(data)).convert("RGB")
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Невозможно прочитать изображение") from exc

    inverted = ImageOps.invert(image)
    buffer = BytesIO()
    inverted.save(buffer, format="PNG")
    buffer.seek(0)

    return StreamingResponse(buffer, media_type="image/png")


@app.post("/pages", response_model=PageOut)
def create_page(
    page: PageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    new_page = Page(name=page.name)
    db.add(new_page)
    db.flush()  # получаем id без commit
    new_kpi = KPI(page_id=new_page.id)
    db.add(new_kpi)
    db.commit()
    db.refresh(new_page)
    return new_page

@app.get("/pages/{page_id}", response_model=PageOut)
def get_page(
    page_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@app.post("/kpi/visit")
def increment_visit(
    page: KPIUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    kpi = db.query(KPI).filter(KPI.page_id == page.page_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="Page KPI not found")
    kpi.visits += 1
    db.commit()
    return {"page_id": page.page_id, "visits": kpi.visits}

@app.post("/kpi/time")
def add_time(
    data: KPIUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if data.seconds is None:
        raise HTTPException(status_code=400, detail="seconds required")
    kpi = db.query(KPI).filter(KPI.page_id == data.page_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="Page KPI not found")
    kpi.total_time_seconds += data.seconds
    db.commit()
    return {"page_id": data.page_id, "total_time_seconds": kpi.total_time_seconds}

@app.get("/kpi", response_model=list[KPIOut])
def get_all_kpi(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_admin_user),
):
    rows = (
        db.query(KPI, Page)
        .join(Page, KPI.page_id == Page.id)
        .all()
    )
    return [
        KPIOut(
            page_id=kpi.page_id,
            page_name=page.name,
            visits=kpi.visits,
            total_time_seconds=kpi.total_time_seconds,
        )
        for kpi, page in rows
    ]

@app.post("/auth/register", response_model=UserOut)
def register(user: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    role = db.query(Role).filter(Role.name == "user").first()
    if role is None:
        raise HTTPException(status_code=500, detail="Default role missing")

    new_user = User(
        email=user.email,
        password_hash=get_password_hash(user.password),
        role_id=role.id,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return UserOut(id=new_user.id, email=new_user.email, role=role.name)


@app.post("/auth/token", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    access_token = create_access_token({"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/auth/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return UserOut(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.name,
    )
