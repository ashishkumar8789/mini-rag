# API Usage Examples

This document shows how to interact with the Mini RAG API programmatically.

## Base URL
- Local: `http://localhost:3000`
- Production: `https://your-app.vercel.app`

## Authentication
No authentication required (add auth for production use).

---

## Upload Document

**Endpoint:** `POST /api/upload`

**Request:**
```json
{
  "text": "Your document text content here...",
  "source": "filename.txt",
  "title": "Optional Document Title"
}
```

**Response (Success):**
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

**Response (Error):**
```json
{
  "error": "Text and source are required"
}
```

### cURL Example
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Artificial Intelligence is transforming how we work and live.",
    "source": "ai-intro.txt",
    "title": "Introduction to AI"
  }'
```

### JavaScript/Fetch Example
```javascript
const uploadDocument = async (text, source, title) => {
  const response = await fetch('http://localhost:3000/api/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, source, title }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log(`✓ Uploaded: ${data.stats.chunksCreated} chunks created`);
    return data;
  } else {
    console.error(`✗ Error: ${data.error}`);
    throw new Error(data.error);
  }
};

// Usage
uploadDocument(
  "Your document text...",
  "document.txt",
  "My Document"
).then(stats => console.log(stats));
```

### Python Example
```python
import requests

def upload_document(text, source, title=None):
    url = "http://localhost:3000/api/upload"
    payload = {
        "text": text,
        "source": source,
        "title": title
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Uploaded: {data['stats']['chunksCreated']} chunks")
        return data
    else:
        error = response.json()
        print(f"✗ Error: {error['error']}")
        raise Exception(error['error'])

# Usage
with open('document.txt', 'r') as f:
    text = f.read()
    
upload_document(text, "document.txt", "My Document")
```

---

## Query Documents

**Endpoint:** `POST /api/query`

**Request:**
```json
{
  "query": "What is machine learning?"
}
```

**Response (Success):**
```json
{
  "answer": "Machine learning is a subset of AI that enables computers to learn from data [1][2]...",
  "citations": [
    {
      "index": 1,
      "content": "Machine learning, a subset of AI, enables...",
      "source": "ai-basics.txt",
      "title": "Introduction to AI",
      "position": 0,
      "rerankScore": 0.9543
    },
    {
      "index": 2,
      "content": "The training process involves adjusting...",
      "source": "ai-basics.txt",
      "title": "Introduction to AI",
      "position": 1,
      "rerankScore": 0.8721
    }
  ],
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

### cURL Example
```bash
curl -X POST http://localhost:3000/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is machine learning?"
  }'
```

### JavaScript/Fetch Example
```javascript
const queryDocuments = async (query) => {
  const response = await fetch('http://localhost:3000/api/query', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });
  
  const data = await response.json();
  
  if (response.ok) {
    console.log('Answer:', data.answer);
    console.log('Citations:', data.citations.length);
    console.log('Total time:', data.timing.totalMs, 'ms');
    console.log('Cost:', '$' + data.usage.estimatedCost.toFixed(6));
    return data;
  } else {
    console.error('Error:', data.error);
    throw new Error(data.error);
  }
};

// Usage
queryDocuments("What is machine learning?")
  .then(result => {
    console.log('\nAnswer:', result.answer);
    console.log('\nSources:');
    result.citations.forEach(cit => {
      console.log(`[${cit.index}] ${cit.source} (score: ${cit.rerankScore.toFixed(3)})`);
    });
  });
```

### Python Example
```python
import requests

def query_documents(query):
    url = "http://localhost:3000/api/query"
    payload = {"query": query}
    
    response = requests.post(url, json=payload)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Answer: {data['answer']}\n")
        print(f"Citations: {len(data['citations'])}")
        print(f"Total time: {data['timing']['totalMs']}ms")
        print(f"Cost: ${data['usage']['estimatedCost']:.6f}")
        return data
    else:
        error = response.json()
        print(f"Error: {error['error']}")
        raise Exception(error['error'])

# Usage
result = query_documents("What is machine learning?")

print("\nSources:")
for citation in result['citations']:
    print(f"[{citation['index']}] {citation['source']} (score: {citation['rerankScore']:.3f})")
```

---

## Get Statistics

**Endpoint:** `GET /api/stats`

**Response:**
```json
{
  "count": 42
}
```

### cURL Example
```bash
curl http://localhost:3000/api/stats
```

### JavaScript/Fetch Example
```javascript
const getStats = async () => {
  const response = await fetch('http://localhost:3000/api/stats');
  const data = await response.json();
  console.log(`Documents in database: ${data.count}`);
  return data;
};

getStats();
```

### Python Example
```python
import requests

def get_stats():
    url = "http://localhost:3000/api/stats"
    response = requests.get(url)
    
    if response.status_code == 200:
        data = response.json()
        print(f"Documents in database: {data['count']}")
        return data
    else:
        raise Exception("Failed to get stats")

get_stats()
```

---

## Batch Upload Example

Upload multiple documents programmatically:

### JavaScript
```javascript
const fs = require('fs');
const path = require('path');

async function batchUpload(directory) {
  const files = fs.readdirSync(directory);
  const results = [];
  
  for (const file of files) {
    if (file.endsWith('.txt')) {
      const filePath = path.join(directory, file);
      const text = fs.readFileSync(filePath, 'utf-8');
      
      console.log(`Uploading ${file}...`);
      
      try {
        const result = await uploadDocument(text, file);
        results.push({ file, success: true, stats: result.stats });
        console.log(`✓ ${file}: ${result.stats.chunksCreated} chunks`);
      } catch (error) {
        results.push({ file, success: false, error: error.message });
        console.error(`✗ ${file}: ${error.message}`);
      }
      
      // Rate limiting: wait 1 second between uploads
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return results;
}

// Usage
batchUpload('./sample-docs')
  .then(results => {
    const successful = results.filter(r => r.success).length;
    console.log(`\n✓ Uploaded ${successful}/${results.length} documents`);
  });
```

### Python
```python
import os
import time

def batch_upload(directory):
    results = []
    
    for filename in os.listdir(directory):
        if filename.endswith('.txt'):
            filepath = os.path.join(directory, filename)
            
            with open(filepath, 'r', encoding='utf-8') as f:
                text = f.read()
            
            print(f"Uploading {filename}...")
            
            try:
                result = upload_document(text, filename)
                results.append({
                    'file': filename,
                    'success': True,
                    'stats': result['stats']
                })
                print(f"✓ {filename}: {result['stats']['chunksCreated']} chunks")
            except Exception as e:
                results.append({
                    'file': filename,
                    'success': False,
                    'error': str(e)
                })
                print(f"✗ {filename}: {e}")
            
            # Rate limiting
            time.sleep(1)
    
    return results

# Usage
results = batch_upload('./sample-docs')
successful = sum(1 for r in results if r['success'])
print(f"\n✓ Uploaded {successful}/{len(results)} documents")
```

---

## Error Handling

### Common Error Codes

- **400 Bad Request**: Missing or invalid parameters
- **405 Method Not Allowed**: Wrong HTTP method
- **500 Internal Server Error**: Server-side error (API keys, database issues)

### Example Error Handling

```javascript
async function robustQuery(query, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await queryDocuments(query);
      return result;
    } catch (error) {
      console.error(`Attempt ${i + 1} failed:`, error.message);
      
      if (i < maxRetries - 1) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
}
```

---

## Rate Limiting Recommendations

To avoid hitting API rate limits:

1. **OpenAI**: Max 3,000 requests/min (tier 1)
2. **Cohere**: Max 10,000 requests/min (trial)
3. **Supabase**: Max 500 requests/min (free tier)

**Recommendation:** Add delays between batch operations (1-2 seconds).

---

## Cost Estimation Script

```javascript
function estimateCosts(documentsCount, queriesPerDay) {
  const avgChunksPerDoc = 5;
  const avgTokensPerChunk = 1000;
  const avgQueryTokens = 500;
  const avgResponseTokens = 200;
  
  // Upload costs
  const uploadTokens = documentsCount * avgChunksPerDoc * avgTokensPerChunk;
  const uploadCost = (uploadTokens / 1_000_000) * 0.02; // Embeddings
  
  // Query costs (per day)
  const embeddingCost = (queriesPerDay * avgQueryTokens / 1_000_000) * 0.02;
  const rerankCost = queriesPerDay * 0.001; // Approx $0.001 per query
  const llmCost = (queriesPerDay * avgQueryTokens / 1_000_000) * 0.5 + 
                  (queriesPerDay * avgResponseTokens / 1_000_000) * 1.5;
  
  const dailyQueryCost = embeddingCost + rerankCost + llmCost;
  const monthlyQueryCost = dailyQueryCost * 30;
  
  console.log('Cost Estimates:');
  console.log('================');
  console.log(`Upload ${documentsCount} docs: $${uploadCost.toFixed(4)}`);
  console.log(`Daily queries (${queriesPerDay}): $${dailyQueryCost.toFixed(4)}`);
  console.log(`Monthly queries: $${monthlyQueryCost.toFixed(2)}`);
  console.log(`Total first month: $${(uploadCost + monthlyQueryCost).toFixed(2)}`);
}

// Example: 100 documents, 1000 queries/day
estimateCosts(100, 1000);
```

---

## WebSocket Support (Future)

Currently, the API uses HTTP requests. For real-time updates, consider:

1. Server-Sent Events (SSE) for streaming LLM responses
2. WebSockets for bidirectional communication
3. Polling for long-running operations

Example SSE endpoint design:
```javascript
// Future: /api/query-stream
const eventSource = new EventSource('/api/query-stream?query=...');
eventSource.onmessage = (event) => {
  console.log('Token:', event.data);
};
```
