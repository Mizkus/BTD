# Roman Empire SPA + FastAPI API

Учебный проект состоит из React‑приложения (SPA) и FastAPI‑сервера.  
Фронтенд показывает исторические материалы, вкладку с постами и загрузкой изображений, а также страницы API/статистики.  
Бэкенд проксирует данные JSONPlaceholder, инвертирует изображения и хранит KPI посещаемости в базе через SQLAlchemy + Alembic.

## Стэк
- React 19 + react-router-dom 6 + axios
- FastAPI + httpx + Pillow
- SQLAlchemy 2 + Alembic + SQLite (можно заменить на PostgreSQL)

## Как запустить

### 1. Бэкенд
```bash
cd fastapi-server
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt    # если есть; иначе pip install fastapi uvicorn[standard] sqlalchemy alembic httpx Pillow psycopg2-binary python-dotenv
alembic upgrade head              # создаёт базу и таблицы
python -m uvicorn main:app --reload
```
Сервер слушает `http://127.0.0.1:8000`.  
Документация доступна на `/docs` (Swagger) и `/redoc`. OpenAPI-файл лежит на `/openapi.json`.

### 2. Фронтенд
```bash
cd roman-empire
npm install
npm start
```
Приложение поднимется на `http://localhost:3000`.

## Основные возможности
- Вкладки «Введение», «Описание», «Заключение», «Посты», «API», «Статистика».
- Вкладка «Посты»: запросы постов через локальный FastAPI-прокси (fetch и axios), форма загрузки изображения — сервер возвращает инвертированную версию.
- Вкладка «API»: встроенный Swagger UI, рендерящий спецификацию `/openapi.json`.
- Вкладка «Статистика»: отображает KPI для всех страниц (количество визитов и суммарное время).
- Трекинг посещений/времени: при смене вкладок фронтенд вызывает `/kpi/visit` и `/kpi/time`, данные сохраняются в `app.db`.

## Создание страниц (pages) и KPI
Через Swagger (`POST /pages`) создайте страницы:
1. Введение
2. Описание
3. Заключение
4. API

Каждый вызов автоматически создаёт запись KPI. React-приложение использует эти ID, чтобы отправлять статистику.  
При необходимости можно добавить новые страницы — просто вызовите `/pages` и пропишите их ID в `PAGE_IDS` (в `src/App.js`).

## Очистка перед коммитом
- `roman-empire`: удалить `node_modules/` и `build/`.
- `fastapi-server`: удалить `venv/` и при желании `app.db` (миграции создадут заново).
- Убедиться, что `.gitignore` исключает виртуальные окружения, node_modules, build, SQLite файлы.
