from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from embedder import embed_text
from database import get_db, SessionLocal
from models import TextEmbedding, Space
from schemas import TextCreate, TextOut, Article, SpaceCreate, SpaceOut

app = FastAPI(title="Embedder Lab API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"ok": True, "message": "embedding backend ready (texts only)"}


def ensure_demo_space(db: Session):
    demo = db.query(Space).filter(Space.name == "demo").first()
    if not demo:
        demo = Space(name="demo")
        db.add(demo)
        db.commit()
        db.refresh(demo)
    return demo


def _short_name(text: str, words: int = 3):
    tokens = (text or "").split()
    if not tokens:
        return "текст"
    return " ".join(tokens[:words])


def seed_points(db: Session):
    ensure_demo_space(db)
    existing = db.query(TextEmbedding).count()
    if existing > 0:
        return
    seed_texts = [
        "Найдите путь по карте и объясните выбор маршрута.",
        "Сравните два абзаца и выделите ключевые различия.",
        "Сгенерируйте краткий заголовок для новости.",
        "Опишите изображение словами для невидящего человека.",
        "Сформулируйте вопросы к этому параграфу.",
        "Преобразуйте текст в список действий.",
        "Переведите предложение на английский язык.",
        "Нормализуйте числовые значения в тексте.",
        "Сгруппируйте эти предложения по темам.",
        "Определите тональность следующей фразы.",
    ]
    for idx, text in enumerate(seed_texts):
        embed_result = embed_text(text)
        row = TextEmbedding(
            short_name=_short_name(text),
            content=text,
            space="demo",
            x=embed_result["x"],
            y=embed_result["y"],
            embedding_json=None,
        )
        db.add(row)
    db.commit()


@app.on_event("startup")
def startup():
    db = SessionLocal()
    try:
        seed_points(db)
    finally:
        db.close()


@app.get("/api/points", response_model=List[TextOut])
def get_points(space: str = "demo", db: Session = Depends(get_db)):
    rows = (
        db.query(TextEmbedding)
        .filter(TextEmbedding.space == space)
        .order_by(TextEmbedding.id.desc())
        .all()
    )
    return [_to_schema(row) for row in rows]


@app.post("/api/texts", response_model=TextOut)
def post_text(payload: TextCreate, db: Session = Depends(get_db)):
    if not payload.content:
        raise HTTPException(status_code=400, detail="content required")
    embed_result = embed_text(payload.content)
    short_name = payload.shortName.strip() if payload.shortName else _short_name(payload.content)
    text_row = TextEmbedding(
        space=payload.space or "demo",
        short_name=short_name or "текст",
        content=payload.content,
        x=embed_result["x"],
        y=embed_result["y"],
        embedding_json=None,
    )
    db.add(text_row)
    db.commit()
    db.refresh(text_row)
    return _to_schema(text_row)


def _to_schema(row: TextEmbedding) -> TextOut:
    return TextOut(
        id=row.id,
        space=row.space,
        shortName=row.short_name,
        content=row.content,
        x=row.x,
        y=row.y,
    )


@app.get("/api/articles", response_model=List[Article])
def get_articles():
    return [
        Article(
            id="embedder",
            title="Qwen3-Embedding-0.6B",
            summary="Официальная страница модели на HuggingFace.",
            link="https://huggingface.co/Qwen/Qwen3-Embedding-0.6B",
        ),
        Article(
            id="embedder-report",
            title="Qwen Technical Report",
            summary="Официальный отчёт команды Qwen о архитектуре и возможностях семейства моделей (arXiv:2311.00655).",
            link="https://arxiv.org/abs/2311.00655",
        ),
        Article(
            id="st",
            title="Sentence-Transformers",
            summary="Библиотека, через которую идёт вызов эмбеддера.",
            link="https://www.sbert.net/",
        ),
        Article(
            id="plotly",
            title="Plotly Python",
            summary="Документация Plotly Python по созданию интерактивных scatter-графиков.",
            link="https://plotly.com/python/",
        ),
    ]


@app.get("/api/search")
def search(q: str = "", space: str = "demo", db: Session = Depends(get_db)):
    query = (q or "").lower()
    if not query:
        return []
    results = []
    # поиск по пространствам
    for sp in db.query(Space).all():
        if query in sp.name.lower():
            results.append(
                {
                    "id": sp.id,
                    "kind": "space",
                    "title": sp.name,
                    "summary": f"Пространство {sp.name}",
                    "space": sp.name,
                }
            )
    # поиск по текстам внутри выбранного пространства
    rows = db.query(TextEmbedding).filter(TextEmbedding.space == space).all()
    for row in rows:
        text = (row.content or "").lower()
        if query in text:
            results.append(
                {
                    "id": row.id,
                    "kind": "text",
                    "title": row.short_name or row.content[:20],
                    "summary": row.content[:120],
                    "space": row.space,
                }
            )
    return results


@app.get("/")
def root():
    return {"message": "Embedder embedding backend (FastAPI + SQLAlchemy + sentence-transformers, texts only)"}


@app.get("/api/spaces", response_model=List[SpaceOut])
def get_spaces(db: Session = Depends(get_db)):
    return db.query(Space).order_by(Space.id.desc()).all()


@app.post("/api/spaces", response_model=SpaceOut)
def create_space(payload: SpaceCreate, db: Session = Depends(get_db)):
    name = (payload.name or "").strip()
    if not name:
        raise HTTPException(status_code=400, detail="name required")
    exists = db.query(Space).filter(Space.name == name).first()
    if exists:
        return exists
    sp = Space(name=name)
    db.add(sp)
    db.commit()
    db.refresh(sp)
    return sp
