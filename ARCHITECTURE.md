## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         MINI RAG APP                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                          │
│  ┌───────────────┐        ┌───────────────┐                    │
│  │  Upload Form  │        │  Query Form   │                    │
│  │  - Text input │        │ - Question box│                    │
│  │  - Source     │        │ - Submit btn  │                    │
│  └───────┬───────┘        └───────┬───────┘                    │
│          │                        │                             │
│  ┌───────▼────────────────────────▼───────┐                    │
│  │    Results Display Component           │                    │
│  │  - Answer with inline citations [1][2] │                    │
│  │  - Performance metrics (timing, cost)  │                    │
│  │  - Source cards with rerank scores     │                    │
│  └────────────────────────────────────────┘                    │
│           Next.js 14 + React + Tailwind CSS                    │
└─────────────────────────────────────────────────────────────────┘
                             │
                             │ HTTP Requests
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API ROUTES LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ POST /upload │  │ POST /query  │  │ GET /stats   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                  │                  │
│         │                 │                  │                  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BUSINESS LOGIC LAYER                       │
│                                                                 │
│  ┌────────────────────┐     ┌────────────────────┐            │
│  │  Chunking Module   │     │  Retrieval Module  │            │
│  │  - Split text      │     │  - Vector search   │            │
│  │  - 1000 tok chunks │     │  - Top-K retrieval │            │
│  │  - 10% overlap     │     │  - Similarity calc │            │
│  └─────────┬──────────┘     └──────────┬─────────┘            │
│            │                           │                       │
│  ┌─────────▼──────────┐     ┌──────────▼─────────┐            │
│  │ Embedding Module   │     │  Reranking Module  │            │
│  │  - OpenAI API      │     │  - Cohere API      │            │
│  │  - text-embed-3-s  │     │  - rerank-v3.0     │            │
│  │  - 1536 dimensions │     │  - Top-5 results   │            │
│  └─────────┬──────────┘     └──────────┬─────────┘            │
│            │                           │                       │
│            │                 ┌─────────▼─────────┐            │
│            │                 │   LLM Module      │            │
│            │                 │  - GPT-3.5-turbo  │            │
│            │                 │  - Citation gen   │            │
│            │                 │  - Temp: 0.3      │            │
│            │                 └─────────┬─────────┘            │
│            │                           │                       │
└────────────┼───────────────────────────┼───────────────────────┘
             │                           │
             ▼                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                     VECTOR DATABASE LAYER                       │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Supabase (PostgreSQL + pgvector)           │   │
│  │                                                         │   │
│  │  Table: rag_documents                                  │   │
│  │  ├─ id: bigserial                                      │   │
│  │  ├─ content: text                                      │   │
│  │  ├─ embedding: vector(1536)                            │   │
│  │  ├─ metadata: jsonb                                    │   │
│  │  │   ├─ source                                         │   │
│  │  │   ├─ title                                          │   │
│  │  │   ├─ position                                       │   │
│  │  │   └─ chunk_params                                   │   │
│  │  └─ created_at: timestamp                              │   │
│  │                                                         │   │
│  │  Index: HNSW (vector_cosine_ops)                      │   │
│  │  - m = 16 (connections per layer)                     │   │
│  │  - ef_construction = 64 (quality parameter)           │   │
│  │                                                         │   │
│  │  Function: match_documents(query_embedding, k)        │   │
│  │  - Returns top-k similar documents                     │   │
│  │  - Cosine similarity scoring                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘


DATA FLOW DIAGRAMS
==================

1. UPLOAD FLOW
--------------
User Input (text) 
    → Chunking (1000 tokens, 10% overlap)
        → OpenAI Embeddings (1536d vectors)
            → Supabase Insert (with metadata)
                → Success Response (stats)

2. QUERY FLOW
-------------
User Query
    → Generate Query Embedding (OpenAI)
        → Vector Search (Top 10, Supabase)
            → Rerank (Top 5, Cohere)
                → Build Context
                    → LLM Generation (GPT-3.5)
                        → Format Answer + Citations
                            → Display Results


CONFIGURATION DETAILS
=====================

Chunking:
- Size: 1000 tokens (~750 words)
- Overlap: 100 tokens (10%)
- Method: Word-based splitting

Embeddings:
- Model: text-embedding-3-small
- Dimensions: 1536
- Cost: $0.02 per 1M tokens

Retrieval:
- Initial: Top 10 via cosine similarity
- Index: HNSW (Hierarchical Navigable Small World)

Reranking:
- Model: Cohere rerank-english-v3.0
- Final: Top 5 most relevant

LLM:
- Model: GPT-3.5-turbo
- Temperature: 0.3
- Max tokens: 500
- Cost: $0.50/1M input, $1.50/1M output


TECHNOLOGY STACK
================

Frontend:
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

Backend:
- Next.js API Routes
- Node.js runtime

Database:
- Supabase (PostgreSQL 15)
- pgvector extension

External APIs:
- OpenAI (embeddings + LLM)
- Cohere (reranking)

Deployment:
- Vercel (serverless)
- Edge functions
- Global CDN
