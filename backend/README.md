# Otaku Manga API - Backend

FastAPI backend for the Otaku Manga reader application.

## Tech Stack

- **FastAPI** - Web framework
- **PostgreSQL** - Database
- **SQLAlchemy** - ORM
- **Docker** - Database containerization

## Quick Start

### 1. Setup

```bash
# Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt
```

### 2. Start Database

```bash
docker-compose up -d
```

### 3. Run Server

```bash
uvicorn app.main:app --reload --port 8000
```

### 4. Access API

- **API:** http://localhost:8000
- **Swagger Docs:** http://localhost:8000/docs

## API Endpoints

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/db-health` | Database check |

### Manga
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/manga/` | List manga (with search & pagination) |
| GET | `/api/v1/manga/{slug}` | Get manga detail with chapters |
| POST | `/api/v1/manga/{slug}/like` | Like a manga |
| GET | `/api/v1/manga/{slug}/comments` | Get manga comments |
| POST | `/api/v1/manga/{slug}/comments` | Add manga comment |

### Chapters
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/chapters/{id}` | Get chapter with pages |
| POST | `/api/v1/chapters/{id}/like` | Like a chapter |
| GET | `/api/v1/chapters/{id}/next` | Get next chapter |
| GET | `/api/v1/chapters/{id}/prev` | Get previous chapter |
| GET | `/api/v1/chapters/{id}/comments` | Get chapter comments |
| POST | `/api/v1/chapters/{id}/comments` | Add chapter comment |

### Reading Progress
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/progress/{manga_id}` | Get reading progress |
| POST | `/api/v1/progress/` | Save/update progress |
| DELETE | `/api/v1/progress/{manga_id}` | Delete progress |

**Note:** Progress endpoints require `X-User-Token` header.

## Query Parameters

### Manga List (`GET /api/v1/manga/`)
- `search` - Filter by title/description
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

## Example Requests

```bash
# List manga with search
curl "http://localhost:8000/api/v1/manga/?search=demo&page=1"

# Get manga detail
curl "http://localhost:8000/api/v1/manga/demo-manga"

# Like a manga
curl -X POST "http://localhost:8000/api/v1/manga/demo-manga/like"

# Add comment
curl -X POST "http://localhost:8000/api/v1/manga/demo-manga/comments" \
  -H "Content-Type: application/json" \
  -d '{"user_name": "Reader", "text": "Great manga!"}'

# Save reading progress
curl -X POST "http://localhost:8000/api/v1/progress/" \
  -H "Content-Type: application/json" \
  -H "X-User-Token: my-unique-token" \
  -d '{"manga_id": 1, "chapter_id": 1, "page_index": 5}'
```

## Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI app entry point
│   ├── core/
│   │   └── config.py        # Settings
│   ├── db/
│   │   ├── base.py          # SQLAlchemy base
│   │   ├── session.py       # Database session
│   │   └── models/          # ORM models
│   ├── routers/             # API routes
│   │   ├── manga_routes.py
│   │   ├── chapter_routes.py
│   │   └── progress_routes.py
│   └── schemas/             # Pydantic schemas
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## CORS

Configured for:
- `http://localhost:3000`
- `http://127.0.0.1:3000`

