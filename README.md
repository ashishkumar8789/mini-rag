# 🧠 Mini RAG Application  
### Retrieval-Augmented Generation (RAG)

A production-ready **Mini RAG (Retrieval-Augmented Generation)** application that enables users to upload text, perform semantic search using vector embeddings, rerank results for relevance, and generate accurate LLM-based answers with citations.

---

## 👤 Author Information

**Name:** Ashish Kumar  
**Roll Number:** 231210026  
**Branch:** Computer Science Engineering  
**Academic Level:** Pre-Final Year Undergraduate  

**Technical Skills:**
- C++, Python
- Machine Learning
- Large Language Models (LLMs)
- Retrieval-Augmented Generation (RAG)
- SQL
- Web Development  

 
**Resume:** https://drive.google.com/file/d/1hUqmP5lKEJQq7ZcwGtR0hr9tWm1rsON6/view?usp=drive_link  

---

## 🎯 Project Objective

The objective of this project is to design and implement a **lightweight yet production-ready Retrieval-Augmented Generation system**.

The project demonstrates:
- Practical integration of Large Language Models with external knowledge
- Vector similarity search using embeddings
- Reranking techniques to improve answer relevance
- End-to-end AI system design from ingestion to answer generation

### Target Use Cases
- AI Engineer / Machine Learning Intern assessments  
- College mini-project and final-year evaluations  
- Learning modern LLM-based application architecture  

---

## ✨ Key Features

- Semantic search using vector embeddings  
- Smart text chunking with overlap to preserve context  
- Vector database implemented using Supabase with pgvector  
- Reranking using Cohere Rerank v3 for improved relevance  
- LLM-based answer generation with citations  
- Performance tracking including time and cost estimation  
- Clean and responsive UI built with Next.js and Tailwind CSS  

---

## 🏗️ System Architecture

The application follows a modular pipeline architecture:

User Interface (Next.js + Tailwind CSS)  
→ API Routes (Upload, Query, Stats)  
→ Text Chunking and Embedding Generation  
→ Supabase Vector Store (pgvector with HNSW index)  
→ Retriever and Reranker (Cohere)  
→ LLM Answer Generator (GPT-3.5)

---

## 🔄 Application Workflow

### 1️⃣ Document Upload Flow

- User uploads or pastes text into the application  
- Text is split into chunks of **1000 tokens** with **10% overlap**  
- Embeddings are generated using OpenAI  
- Vector embeddings and metadata are stored in Supabase  

### 2️⃣ Query Flow

- User submits a natural language query  
- Query embedding is generated  
- Top 10 similar chunks are retrieved from the vector database  
- Results are reranked to select the top 5 most relevant chunks  
- LLM generates a final answer with citations  

---

## ⚙️ Technical Configuration

### Vector Database

- **Database:** Supabase (PostgreSQL)  
- **Extension:** pgvector  
- **Embedding Dimension:** 1536  
- **Index Type:** HNSW  
- **Similarity Metric:** Cosine similarity  

### Chunking Strategy

- **Chunk Size:** 1000 tokens  
- **Overlap:** 100 tokens  
- **Purpose:** Prevent loss of context at chunk boundaries  

### Models Used

- **Embedding Model:** text-embedding-3-small  
- **Language Model:** gpt-3.5-turbo  
- **Reranker:** rerank-english-v3.0  
- **Temperature:** 0.3 (focused and deterministic output)  

---

## 🚀 Installation and Setup

### Prerequisites

- Node.js version 18 or higher  
- Supabase account  
- OpenAI API key  
- Cohere API key  

### Setup Steps

Clone the repository:

```bash
git clone https://github.com/231210026-hub/mini-rag.git
cd mini-rag

