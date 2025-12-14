# Embedder Embedding Lab (React + FastAPI + SQLite)

Простой пример: фронтенд на React, бэкенд на FastAPI (Python), хранилище в MySQL и вызов эмбеддера через `sentence-transformers` (Embedder-Embedding-0.6B, с запасным MiniLM).

## Запуск (кратко)
1) Обновите Node до 18+ (напр. `nvm install 20 && nvm use 20`).  
2) Примените миграции Alembic (SQLite файл `embeddings.db` создаётся рядом):
```bash
cd qwen-embedding-docs/backend
pip install -r requirements.txt
alembic upgrade head
```
3) Бэкенд (Python):
```bash
cd qwen-embedding-docs/backend
uvicorn main:app --reload --port 5174  # SQLite используется по умолчанию
```
4) Фронтенд:
```bash
cd qwen-embedding-docs/frontend
npm install
npm run dev   # http://localhost:5173
```

## Что делает
- `/api/points?space=demo` — точки текущего пространства.  
- `/api/texts` — добавляет текст и сразу получает эмбеддинг + (x,y) проекцию.  
- `/api/upload-txt` — загрузка .txt, каждая строка становится точкой.  
- `/api/articles` — ссылки на Embedder и связанные материалы.  
- `/api/search` — поиск по текстам в выбранном пространстве.

## О договорённостях
- Файлы фронтенда в `.js`, логика максимально простая.  
- Бэкенд только на Python (FastAPI + SQLAlchemy + Alembic).  
- Визуализация — обычный SVG scatter с hover-подсказкой (короткое имя текста).  
- Если Embedder-Embedding-0.6B недоступна, embedder.py fallback использует MiniLM, чтобы пример запускался оффлайн.  
- Структура БД создаётся через Alembic миграции (директория `backend/alembic`).
