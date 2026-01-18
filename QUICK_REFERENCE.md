# Quick Reference Guide

## 🚀 Quick Start Commands

```bash
# Initial setup
npm install
cp .env.example .env
# Edit .env with your API keys

# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run linter

# Helper scripts
npm run setup            # Run setup wizard (Windows)
npm run check            # Lint + build check
```

## 🔑 Environment Variables

```env
OPENAI_API_KEY=sk-...                    # Get from platform.openai.com
COHERE_API_KEY=...                       # Get from dashboard.cohere.com
SUPABASE_URL=https://xxx.supabase.co    # From Supabase project
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # From Supabase settings
VECTOR_COLLECTION_NAME=rag_documents    # Default collection name
EMBEDDING_DIMENSION=1536                # OpenAI embedding size
```

## 📊 Configuration Parameters

| Parameter | Value | Location |
|-----------|-------|----------|
| Chunk size | 1000 tokens | `lib/config.ts` |
| Chunk overlap | 100 tokens (10%) | `lib/config.ts` |
| Embedding model | text-embedding-3-small | `lib/config.ts` |
| Embedding dimensions | 1536 | `lib/config.ts` |
| LLM model | gpt-3.5-turbo | `lib/config.ts` |
| LLM temperature | 0.3 | `lib/llm.ts` |
| LLM max tokens | 500 | `lib/llm.ts` |
| Retrieval top-K | 10 | `lib/config.ts` |
| Rerank top-K | 5 | `lib/config.ts` |
| Rerank model | rerank-english-v3.0 | `lib/retriever.ts` |

## 🗄️ Database Schema

```sql
-- Table structure
CREATE TABLE rag_documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX ON rag_documents USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
CREATE INDEX ON rag_documents USING gin (metadata);

-- Function
CREATE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 10
) RETURNS TABLE(...) ...
```

## 🌐 API Endpoints

### POST /api/upload
Upload and process documents

**Body:**
```json
{
  "text": "Document content...",
  "source": "filename.txt",
  "title": "Optional Title"
}
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "chunksCreated": 5,
    "totalTokens": 4823,
    "estimatedCost": 0.000096,
    "processingTime": 1234
  }
}
```

### POST /api/query
Query documents with RAG

**Body:**
```json
{
  "query": "Your question?"
}
```

**Response:**
```json
{
  "answer": "Answer with [1][2] citations...",
  "citations": [...],
  "timing": {
    "retrievalMs": 123,
    "rerankMs": 456,
    "llmMs": 789,
    "totalMs": 1368
  },
  "usage": {
    "promptTokens": 234,
    "completionTokens": 56,
    "totalTokens": 290,
    "estimatedCost": 0.000345
  }
}
```

### GET /api/stats
Get database statistics

**Response:**
```json
{
  "count": 42
}
```

## 💰 Cost Estimates

| Operation | Cost (approximate) |
|-----------|-------------------|
| Embed 1000 tokens | $0.00002 |
| Rerank 10 docs | $0.001 |
| LLM query (500 tokens) | $0.0003 |
| **Total per query** | **$0.0014** |
| 1000 queries/day | $1.40/day |
| Monthly (30k queries) | ~$42/month |

## ⚡ Performance Benchmarks

| Operation | Expected Time |
|-----------|--------------|
| Chunking | < 50ms |
| Embedding (5 chunks) | 200-400ms |
| Vector search | 100-300ms |
| Reranking | 200-500ms |
| LLM generation | 500-1500ms |
| **Total query** | **1-3 seconds** |

## 🧪 Test Queries

### Simple (Single Document)
- "What is machine learning?"
- "How does CRISPR work?"
- "What causes climate change?"

### Medium (Understanding Required)
- "What are the challenges of renewable energy?"
- "What is quantum supremacy?"
- "What are ethical concerns with gene editing?"

### Complex (Cross-Document)
- "How can technology help fight climate change?"
- "What are ethical concerns with emerging technologies?"
- "What role does energy play in future technologies?"

## 🔍 Debugging

### Common Issues

**"Missing environment variable"**
```bash
# Check .env file exists and has all variables
cat .env
```

**"Failed to search documents"**
```bash
# Verify Supabase schema was applied
# Check Supabase dashboard -> Table Editor -> rag_documents exists
```

**"OpenAI API error"**
```bash
# Verify API key
# Check OpenAI usage at platform.openai.com
# Ensure account has credits
```

**"Slow queries"**
```bash
# Check network connection
# Verify Supabase region (closer = faster)
# Review API rate limits
```

### Console Commands

```bash
# Check Node version
node --version  # Should be 18+

# Check npm version
npm --version

# Clear cache
rm -rf .next node_modules
npm install

# Build check
npm run build

# Environment check
node -e "require('dotenv').config(); console.log(process.env.OPENAI_API_KEY ? '✓ OpenAI' : '✗ OpenAI')"
```

## 📁 Key Files

| File | Purpose |
|------|---------|
| `pages/index.tsx` | Main UI component |
| `pages/api/upload.ts` | Upload endpoint |
| `pages/api/query.ts` | Query endpoint |
| `lib/embeddings.ts` | Chunking & embeddings |
| `lib/retriever.ts` | Retrieval & reranking |
| `lib/llm.ts` | Answer generation |
| `lib/vectorStore.ts` | Database operations |
| `supabase_schema.sql` | Database schema |

## 🚢 Deployment Checklist

- [ ] Push code to GitHub
- [ ] Create Vercel account
- [ ] Import repository
- [ ] Add environment variables
- [ ] Deploy
- [ ] Test live URL
- [ ] Verify no console errors
- [ ] Test upload and query
- [ ] Update README with live URL

## 📚 Documentation Files

- `README.md` - Main documentation
- `SETUP.md` - Installation guide
- `TESTING.md` - Test cases
- `ARCHITECTURE.md` - Technical details
- `API_EXAMPLES.md` - API usage
- `PROJECT_SUMMARY.md` - Completion checklist
- `QUICK_REFERENCE.md` - This file

## 🔗 Useful Links

- OpenAI: https://platform.openai.com
- Cohere: https://dashboard.cohere.com
- Supabase: https://supabase.com
- Vercel: https://vercel.com
- Next.js Docs: https://nextjs.org/docs

## 🆘 Support

For issues:
1. Check TESTING.md for solutions
2. Review SETUP.md for configuration
3. See API_EXAMPLES.md for usage patterns
4. Check GitHub Issues (if available)

## 📝 License

MIT License - Free to use and modify

---

**Last Updated:** January 2026  
**Version:** 1.0.0  
**Built for:** AI Engineer Assessment - Track B
