# API Setup Guide

## Required Services

Ứng dụng này cần 2 services bên ngoài để hoạt động:

### 1. Ollama (AI Model Server)

**Cài đặt:**
- Download từ: https://ollama.ai/download
- Hoặc dùng Docker:
  ```bash
  docker run -d -p 11434:11434 --name ollama ollama/ollama
  ```

**Pull models cần thiết:**
```bash
ollama pull llama3
ollama pull nomic-embed-text
```

**Kiểm tra:**
```bash
curl http://localhost:11434/api/tags
```

### 2. ChromaDB (Vector Database)

**Cài đặt qua Docker:**
```bash
docker run -d -p 8000:8000 --name chromadb chromadb/chroma
```

**Hoặc cài đặt qua pip:**
```bash
pip install chromadb
chroma run --host localhost --port 8000
```

**Kiểm tra:**
```bash
curl http://localhost:8000/api/v1/heartbeat
```

## Environment Variables

Tạo file `.env` từ `.env.example`:

```bash
cp .env.example .env
```

Cấu hình các biến môi trường:

```env
# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=llama3
OLLAMA_EMBED_MODEL=nomic-embed-text

# ChromaDB
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=shinhan-knowledge-base
```

## Start API

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Health Check

Kiểm tra trạng thái các services:

```bash
curl http://localhost:4000/api/v1/health
```

Response mẫu:
```json
{
  "status": "healthy",
  "services": {
    "ollama": {
      "status": "up",
      "url": "http://localhost:11434"
    },
    "chroma": {
      "status": "up",
      "url": "http://localhost:8000"
    }
  },
  "timestamp": "2024-02-10T10:30:00.000Z"
}
```

## Troubleshooting

### Lỗi "fetch failed"

Nguyên nhân: Không kết nối được đến Ollama hoặc ChromaDB

Giải pháp:
1. Kiểm tra Ollama đang chạy: `curl http://localhost:11434/api/tags`
2. Kiểm tra ChromaDB đang chạy: `curl http://localhost:8000/api/v1/heartbeat`
3. Kiểm tra file `.env` có đúng URL không

### Lỗi "Cannot connect to AI service"

Ollama chưa chạy hoặc chưa pull models:
```bash
ollama serve
ollama pull llama3
ollama pull nomic-embed-text
```

### Lỗi "Cannot connect to vector database"

ChromaDB chưa chạy:
```bash
docker start chromadb
# hoặc
chroma run --host localhost --port 8000
```
