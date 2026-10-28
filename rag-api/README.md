# BookStore Lightweight RAG API

Context-ingestion RAG service for bookstore recommendations. It loads the current available books from the BookStore backend API, injects that snapshot into Gemini's `systemInstruction`, and returns only inventory-backed recommendations.

## Run locally

Requirements: Node.js 20+ and a Gemini API key.

```bash
cd rag-api
copy .env.example .env
# Set GEMINI_API_KEY in .env
npm install
npm run dev
```

`BOOKSTORE_BOOKS_URL` defaults to `http://localhost:8080/api/books`. In Docker Compose it must point to `http://backend:8080/api/books`. Set `RAG_ALLOWED_ORIGINS` to the frontend origin and provide `GEMINI_API_KEY` before using chat.

Production build:

```bash
npm run build
npm start
```

## Endpoints

Healthcheck:

```bash
curl http://localhost:3000/health
```

Chat:

```bash
curl -X POST http://localhost:3000/api/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"Tôi muốn tìm một cuốn sách về xây dựng thói quen tốt\"}"
```

On macOS/Linux, replace `^` with `\` for line continuation.

The chat response has this shape:

```json
{
  "success": true,
  "data": {
    "message": "...",
    "suggested_books": [
      {
        "id": "BOOK_03",
        "title": "Atomic Habits",
        "price": 159000,
        "stock": 18,
        "cover_image": "...",
        "author": "James Clear",
        "categories": ["Kỹ năng sống", "Phát triển bản thân"],
        "summary": "...",
        "tags": ["thói quen", "năng suất", "tự phát triển"]
      }
    ]
  }
}
```
