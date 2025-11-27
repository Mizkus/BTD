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
