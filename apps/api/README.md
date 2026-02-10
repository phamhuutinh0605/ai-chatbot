# Shinhan Bank AI Chatbot - Backend API

NestJS backend với RAG (Retrieval-Augmented Generation) sử dụng Ollama và ChromaDB.

## 🏗️ Cấu trúc

```
src/
│   ├── auth/           # JWT authentication
│   ├── user/           # User management
│   ├── chat/           # WebSocket chat gateway
│   ├── document/       # Document indexing
│   ├── embedding/      # Ollama embeddings
│   ├── vector/         # ChromaDB vector store
│   ├── rag/            # RAG logic (chunking, prompt building)
│   └── health/         # Health checks
├── config/             # Configuration files
├── guards/             # Auth guards
├── strategies/         # Passport JWT strategies
├── decorators/         # Custom decorators (@IsPublic, @CurrentUser)
├── middlewares/        # Exception filters
├── enums/              # Error codes
├── constants/          # App constants
├── shared/
│   └── ollama/         # Ollama client
├── app.module.ts
└── main.ts
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Setup environment
cp .env.example .env
# Edit .env and change JWT secrets

# Run development
pnpm dev

# Build
pnpm build

# Run production
pnpm start
```

## 🔧 Environment Variables

```env
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000

# JWT (⚠️ Change these in production!)
JWT_ACCESS_TOKEN_SECRET=your-secret-key
JWT_ACCESS_TOKEN_EXPIRE=15m
JWT_REFRESH_TOKEN_SECRET=your-refresh-secret-key
JWT_REFRESH_TOKEN_EXPIRE=7d

# Ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=llama3
OLLAMA_EMBED_MODEL=nomic-embed-text

# ChromaDB
CHROMA_URL=http://localhost:8000
CHROMA_COLLECTION=shinhan-knowledge-base
```

## 📚 API Documentation

Swagger UI: http://localhost:4000/docs

### Endpoints

**Health:**
- `GET /api/v1/health` - Overall health check
- `GET /api/v1/health/ollama` - Ollama status
- `GET /api/v1/health/chroma` - ChromaDB status

**Auth:**
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/logout` - Logout
- `POST /api/v1/auth/refresh` - Refresh token

**User:**
- `GET /api/v1/users/me` - Get current user

**Documents:**
- `POST /api/v1/documents/index` - Index document
- `GET /api/v1/documents/count` - Get document count

**WebSocket:**
- `chat:send` - Send message
- `chat:token` - Receive streaming tokens
- `chat:done` - Message complete
- `chat:error` - Error occurred

## 🔐 Authentication

All endpoints (except auth and health) require JWT Bearer token:

```bash
Authorization: Bearer <access_token>
```

## 🧪 Testing

```bash
# Health check
curl http://localhost:4000/api/v1/health

# Register
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "password123",
    "confirmPassword": "password123"
  }'

# Login
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "test@example.com",
    "password": "password123"
  }'

# Index document (requires token)
curl -X POST http://localhost:4000/api/v1/documents/index \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "filename": "guide.md",
    "content": "# Guide\n\nContent here..."
  }'
```

## 🛠️ Development

### Generate new module

```bash
nest g module modules/your-module
nest g service modules/your-module
nest g controller modules/your-module
```

### Code style

```bash
# Format
pnpm format

# Lint
pnpm lint
```

## 📦 Dependencies

- **@nestjs/common** - NestJS core
- **@nestjs/config** - Configuration management
- **@nestjs/jwt** - JWT authentication
- **@nestjs/passport** - Passport integration
- **@nestjs/swagger** - API documentation
- **@nestjs/websockets** - WebSocket support
- **bcrypt** - Password hashing
- **class-validator** - DTO validation
- **helmet** - Security headers
- **express-rate-limit** - Rate limiting

## 🔒 Security Features

- JWT authentication with access/refresh tokens
- Password hashing with bcrypt (10 rounds)
- Rate limiting (300 req/5min)
- Helmet security headers
- CORS protection
- Input validation
- Global exception handling
- WebSocket authentication

## 📝 Notes

- User data is stored in-memory (replace with database in production)
- JWT secrets should be changed in production
- Ollama and ChromaDB must be running locally
- WebSocket requires authentication via handshake auth token
