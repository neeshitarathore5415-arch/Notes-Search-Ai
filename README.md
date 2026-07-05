# Notes Search Assistant

A RAG (Retrieval-Augmented Generation) application that allows users to upload PDF notes and search through them using AI-powered semantic search.

## Tech Stack

### Backend
- **Hono** - Fast web framework for Node.js
- **Prisma** - ORM for PostgreSQL database
- **Qdrant** - Vector database for semantic search
- **Cohere AI** - Embeddings generation
- **TypeScript** - Type-safe development

### Frontend
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Rsbuild** - Fast build tool
- **React Markdown** - Markdown rendering
- **Axios** - HTTP client

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL database
- Qdrant vector database (running locally or hosted)
- Cohere AI API key

## Project Structure

```
Task-3 Notes Search Assistant/
├── Backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── index.ts
│   └── package.json
└── Frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── App.tsx
    └── package.json
```

## Setup

### 1. Backend Setup

Navigate to the Backend directory:

```bash
cd Backend
```

Install dependencies:

```bash
npm install
```

Set up environment variables (create a `.env` file):

```env
DATABASE_URL=postgresql://user:password@localhost:5432/notes_db
QDRANT_URL=http://localhost:6333
COHERE_API_KEY=your_cohere_api_key_here
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Start the backend server:

```bash
npm run dev
```

The backend API will run on `http://localhost:5000`

### 2. Frontend Setup

Navigate to the Frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Features

- **PDF Upload**: Upload PDF notes to the system
- **Text Extraction**: Automatically extracts text from PDFs
- **Chunking**: Splits documents into manageable chunks
- **Vector Embeddings**: Generates embeddings using Cohere AI
- **Semantic Search**: Search through notes using natural language queries
- **AI Responses**: Get contextual answers based on your notes

## API Endpoints

- `GET /` - Health check and document count
- `POST /notes/upload` - Upload a PDF document
- `POST /notes/search` - Search through uploaded notes

## Database Schema

### Document
- `id` - UUID
- `title` - Document title
- `filename` - Original filename
- `createdAt` - Upload timestamp

### Chunk
- `id` - UUID
- `content` - Text content
- `chunkIndex` - Position in document
- `documentId` - Reference to parent document

## Development

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run start` - Start production server

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

- Ensure PostgreSQL and Qdrant are running before starting the backend
- Keep your Cohere API key secure and never commit it to version control
- The application uses CORS to allow frontend-backend communication
