from io import BytesIO

import httpx
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from PIL import Image, ImageOps

POSTS_URL = "https://jsonplaceholder.typicode.com/posts"

app = FastAPI(title="Local API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/posts")
async def get_posts():
    async with httpx.AsyncClient() as client:
        resp = await client.get(POSTS_URL)
        resp.raise_for_status()
        return resp.json()


@app.post("/invert-image")
async def invert_image(file: UploadFile = File(...)):
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


from fastapi import Depends
from sqlalchemy.orm import Session

from database import get_db
from models import Page, KPI
from schemas import PageCreate, PageOut, KPIOut, KPIUpdate

@app.post("/pages", response_model=PageOut)
def create_page(page: PageCreate, db: Session = Depends(get_db)):
    new_page = Page(name=page.name)
    db.add(new_page)
    db.flush()  # получаем id без commit
    new_kpi = KPI(page_id=new_page.id)
    db.add(new_kpi)
    db.commit()
    db.refresh(new_page)
    return new_page

@app.get("/pages/{page_id}", response_model=PageOut)
def get_page(page_id: int, db: Session = Depends(get_db)):
    page = db.query(Page).filter(Page.id == page_id).first()
    if not page:
        raise HTTPException(status_code=404, detail="Page not found")
    return page

@app.post("/kpi/visit")
def increment_visit(page: KPIUpdate, db: Session = Depends(get_db)):
    kpi = db.query(KPI).filter(KPI.page_id == page.page_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="Page KPI not found")
    kpi.visits += 1
    db.commit()
    return {"page_id": page.page_id, "visits": kpi.visits}

@app.post("/kpi/time")
def add_time(data: KPIUpdate, db: Session = Depends(get_db)):
    if data.seconds is None:
        raise HTTPException(status_code=400, detail="seconds required")
    kpi = db.query(KPI).filter(KPI.page_id == data.page_id).first()
    if not kpi:
        raise HTTPException(status_code=404, detail="Page KPI not found")
    kpi.total_time_seconds += data.seconds
    db.commit()
    return {"page_id": data.page_id, "total_time_seconds": kpi.total_time_seconds}

@app.get("/kpi", response_model=list[KPIOut])
def get_all_kpi(db: Session = Depends(get_db)):
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
