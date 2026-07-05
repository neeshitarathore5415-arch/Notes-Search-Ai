# Project Flow - Notes Search Assistant

## Overview

This is a RAG (Retrieval-Augmented Generation) application that enables semantic search through uploaded PDF notes using AI-powered embeddings and vector similarity search.

## Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Frontend      │         │    Backend      │         │   External      │
│   (React)       │◄────────►   (Hono/Node)   │◄────────►   Services      │
│                 │  HTTP    │                 │  API    │                 │
│ - UploadForm    │         │ - PDF Process   │         │ - Cohere AI     │
│ - SearchForm    │         │ - Vector Store  │         │ - Qdrant        │
│ - AnswerCard    │         │ - Chat Service  │         │ - PostgreSQL    │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Flow 1: PDF Upload & Processing

### Step 1: User Uploads PDF
**Frontend** (`UploadForm.tsx`)
- User selects a PDF file
- File is sent via POST request to `POST /notes/upload`
- FormData contains the PDF file

### Step 2: Backend Receives File
**Backend** (`notes.routes.ts` → `/upload`)
- Parse multipart/form-data request
- Validate that a file was uploaded
- Extract the file from the request body

### Step 3: Save PDF to Disk
**Backend** (`upload.service.ts`)
- Save the uploaded PDF file to the `uploads` directory
- Return the file path for processing

### Step 4: Extract Text from PDF
**Backend** (`pdf.service.ts`)
- Use `pdf-parse` library to extract raw text from the PDF
- Return the complete text content

### Step 5: Chunk the Text
**Backend** (`chunk.service.ts`)
- Split the extracted text into smaller chunks (e.g., 500-1000 characters)
- Each chunk represents a segment of the document
- Chunks are stored in an array with their original order

### Step 6: Generate Embeddings
**Backend** (`embedding.service.ts`)
- Send each text chunk to Cohere AI API
- Cohere converts text into vector embeddings (numerical representations)
- Each chunk gets a corresponding vector (typically 1024 or 4096 dimensions)
- Return array of embeddings matching the chunks

### Step 7: Store Document Metadata in PostgreSQL
**Backend** (`document.service.ts`)
- Create a `Document` record with:
  - `id`: UUID
  - `title`: PDF title (filename without .pdf)
  - `filename`: Original filename
  - `createdAt`: Timestamp
- Create multiple `Chunk` records linked to the document:
  - `id`: UUID
  - `content`: Text chunk content
  - `chunkIndex`: Position in document
  - `documentId`: Foreign key to parent document

### Step 8: Create/Verify Qdrant Collection
**Backend** (`vector.service.ts`)
- Check if "notes" collection exists in Qdrant
- If not, create collection with:
  - Vector size matching Cohere embeddings
  - Distance metric: Cosine similarity

### Step 9: Store Vectors in Qdrant
**Backend** (`vector.service.ts`)
- Upsert vectors into Qdrant collection
- Each point contains:
  - `id`: Unique identifier
  - `vector`: The embedding vector
  - `payload`: Metadata (documentId, chunkIndex, content)
- Enables fast semantic similarity search

### Step 10: Return Success Response
**Backend** → **Frontend**
- Return success message with:
  - Document metadata
  - Extracted character count
  - Total chunks processed
- Frontend shows success message and enables search

---

## Flow 2: Semantic Search & AI Response

### Step 1: User Submits Query
**Frontend** (`SearchForm.tsx`)
- User types a natural language question
- Query is sent via POST request to `POST /notes/search`
- Request body contains `{ query: "user question" }`

### Step 2: Backend Receives Query
**Backend** (`notes.routes.ts` → `/search`)
- Parse JSON request body
- Validate that query is provided
- Extract the query string

### Step 3: Generate Query Embedding
**Backend** (`search.service.ts`)
- Send the user's query to Cohere AI API
- Convert the query into a vector embedding
- This embedding represents the semantic meaning of the question

### Step 4: Vector Similarity Search
**Backend** (`search.service.ts`)
- Search Qdrant collection using the query embedding
- Qdrant finds the most similar vectors using cosine similarity
- Returns top 5 matching chunks with their payloads
- Results include:
  - Similarity score
  - Chunk content
  - Document metadata

### Step 5: Build Context
**Backend** (`notes.routes.ts`)
- Extract content from the search results
- Join all relevant chunks into a single context string
- This context provides the AI with relevant information from the notes

### Step 6: Generate AI Answer
**Backend** (`chat.service.ts`)
- Send query + context to Cohere Chat API
- System prompt instructs AI to:
  - Answer ONLY from provided context
  - Say "I don't know" if answer is not in context
- User message includes:
  - The retrieved context
  - The user's original question
- Cohere generates a contextual response

### Step 7: Return Response to Frontend
**Backend** → **Frontend**
- Return JSON with:
  - AI-generated answer
  - Search results (for reference)
- Frontend displays the answer in `AnswerCard` component

### Step 8: Display Answer
**Frontend** (`AnswerCard.tsx`)
- Render the AI response using `ReactMarkdown`
- Supports markdown formatting (headings, bold, lists)
- Shows user query and AI answer in a chat-like interface

---

## Data Flow Summary

### Upload Flow Data Transformations
```
PDF File → Raw Text → Text Chunks → Embeddings → Vectors
                                    ↓
                            PostgreSQL (Metadata)
                                    ↓
                            Qdrant (Vectors)
```

### Search Flow Data Transformations
```
User Query → Query Embedding → Vector Search → Relevant Chunks → Context → AI Answer
```

## Key Services & Their Roles

### Backend Services

| Service | File | Responsibility |
|---------|------|----------------|
| `upload.service` | `upload.service.ts` | Save uploaded PDF to disk |
| `pdf.service` | `pdf.service.ts` | Extract text from PDF |
| `chunk.service` | `chunk.service.ts` | Split text into chunks |
| `embedding.service` | `embedding.service.ts` | Generate embeddings via Cohere |
| `document.service` | `document.service.ts` | Store metadata in PostgreSQL |
| `vector.service` | `vector.service.ts` | Manage Qdrant collections & vectors |
| `search.service` | `search.service.ts` | Perform vector similarity search |
| `chat.service` | `chat.service.ts` | Generate AI responses via Cohere Chat |

### Frontend Components

| Component | File | Responsibility |
|-----------|------|----------------|
| `UploadForm` | `UploadForm.tsx` | Handle PDF upload UI & API call |
| `SearchForm` | `SearchForm.tsx` | Handle search query UI & API call |
| `AnswerCard` | `AnswerCard.tsx` | Display AI responses with markdown |
| `App` | `App.tsx` | Main application layout & state management |

## Database Schema

### PostgreSQL (Relational Data)
```
Document (id, title, filename, createdAt)
    ↓ 1:N
Chunk (id, content, chunkIndex, documentId)
```

### Qdrant (Vector Data)
```
Collection: "notes"
Points: {
  id: number,
  vector: number[],  // Embedding
  payload: {
    documentId: string,
    chunkIndex: number,
    content: string
  }
}
```

## External APIs

### Cohere AI
- **Embeddings API**: Converts text to vector embeddings
- **Chat API**: Generates contextual answers based on provided context

### Qdrant
- **Vector Database**: Stores and searches embeddings using similarity metrics

## Error Handling

- **Upload Validation**: Checks for valid PDF files
- **Query Validation**: Ensures search query is provided
- **API Error Handling**: Catches and logs Cohere API errors
- **Database Errors**: Prisma handles connection/query errors
- **Frontend Toasts**: User-friendly error notifications

## Performance Considerations

- **Chunking**: Smaller chunks improve search granularity
- **Embedding Caching**: Could cache embeddings for repeated queries
- **Vector Search Limit**: Returns top 5 results (configurable)
- **Batch Processing**: Embeddings generated in batches for efficiency
