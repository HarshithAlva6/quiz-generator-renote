# 🧠 ReNote: AI-Powered Quiz Generator

**Transform Your Notes into Interactive Quizzes with Intelligent AI 🚀**

ReNote is a full-stack web application designed to revolutionize how students and professionals study. It automatically converts raw notes into interactive multiple-choice quiz cards with questions, correct answers, and contextually relevant distractors.

---

## ✨ Features

* 🧠 **Intelligent Quiz Generation**

  * Converts unstructured text into multiple-choice questions with distractors.
* 🤖 **Multi-AI Integration**

  * Uses models from Hugging Face and Google Gemini.
* 📚 **Retrieval-Augmented Generation (RAG)**

  * Grounds AI responses in your original notes for factual accuracy and reduced hallucinations.
* ⚡ **Layered Caching & Deduplication**

  * Optimizes performance and minimizes API costs with a multi-tiered caching and deduplication system.
* 🌐 **Full-Stack Development**

  * Modern frontend + scalable backend.

---

## 💡 Technical Architecture

```
+----------------+       +-------------------------+       +-----------------------+
|                |       |                         |       |                       |
|   Web Frontend |       |   Next.js Orchestration |       |  Express AI Service   |
|   (React)      |------>|       Backend           |------>|  (/isQuestion,        |
|                |       |   (/api/quizRag)        |       |   /generateDistractors)|
+----------------+       +-------------------------+       +-----------------------+
        ^                          |                                   |
        |                          |                                   |
        |                          v                                   v
        |                  +---------------------+           +---------------------+
        |                  |  MongoDB Atlas      |           |  Google Gemini API  |
        |                  |  (quizCards,        |           |  (gemini-pro,        |
        |                  |   noteChunks,       |           |   embedding-001)    |
        |                  |   Vector Search)    |           |                     |
        +------------------+---------------------+           +---------------------+
        |                          ^
        |                          |
        |                  +---------------------+
        |                  |   Upstash Redis     |
        +------------------|      (Cache)        |
                           +---------------------+
```

---

## 🔩 Core Components

### 🖥 Web Frontend

* Built with **Next.js** and **React**.
* User-friendly interface for entering notes and viewing quizzes.

### 🔁 Next.js Orchestration Backend (`/api/quizRag`)

* Central brain of the app.
* Manages:

  * RAG pipeline (chunking, embedding, retrieval).
  * AI service orchestration.
  * MongoDB and Redis integration.
  * Uses **LangChain.js** for AI workflows.

### ⚙️ Express AI Service Backend (`/isQuestion`, `/generateDistractors`)

* Microservice built with **Express.js**.
* Responsible for:

  * Validating questions via Hugging Face.
  * Generating distractors via Google Gemini 1.5 Pro.

### 🧠 MongoDB Atlas

* `quizCards`: Stores final quiz cards.
* `noteChunks`: Stores vectorized note chunks.
* **Atlas Vector Search** enables ANN semantic similarity queries.

### ⚡ Upstash Redis

* Serverless cache for quiz cards.
* Prevents redundant processing.

---

## 🧠 AI & Machine Learning Core

### ✅ Retrieval Augmented Generation (RAG)

* **Ingestion**: Notes split using `RecursiveCharacterTextSplitter`.
* **Embedding**: Converted using **Gemini Embeddings (embedding-001)**.
* **Storage**: Chunks stored in MongoDB with `noteChunks` collection.
* **Retrieval**: Similarity search via Atlas Vector Index.
* **Augmentation**: Retrieved context is injected into prompts for Gemini/Hugging Face.

### 🔍 Specialized AI Models

* **Hugging Face**: `mrsinghania/asr-question-detection` for checking valid questions.
* **Google Gemini**:

  * `gemini-pro` for prompt completions.
  * `embedding-001` for semantic search.
* **LangChain.js**: Manages orchestration, vector search, and prompt design.

---

## ⚡ Data Flow & Optimization

### 🔄 Redis Caching

* Key: `SHA-256(question + answer)`
* If cache hit → serve directly.
* Otherwise → query MongoDB → store in Redis → serve.

### 🔁 MongoDB Deduplication

* Prevents re-chunking and re-embedding if same notes are submitted.
* Saves on embedding costs.

---

## 🛠️ Tech Stack

| Layer     | Tech                                                |
| --------- | --------------------------------------------------- |
| Frontend  | Next.js, React, TypeScript, Tailwind CSS            |
| Backend   | Express.js, Node.js, TypeScript, LangChain.js       |
| AI Models | Google Gemini (pro, embedding), Hugging Face (HF)   |
| Database  | MongoDB Atlas (document + vector search)            |
| Caching   | Upstash Redis                                       |
| DevOps    | Docker, GitHub Actions, AWS (conceptual), Terraform |
| Tooling   | UUID, Crypto, Dotenv, CORS, WebSockets, Mapbox      |

---

## 🚀 Getting Started

### 📋 Prerequisites

* Node.js v18+
* MongoDB Atlas account with vector search enabled
* Google Cloud project with Gemini API
* Hugging Face API token
* Upstash Redis account

### Clone & Setup

```bash
git clone https://github.com/your-username/renote
cd renote/renote
```

### Create `.env.local`

```env
NEXT_PUBLIC_BACKEND_API_URL=http://localhost:3000
AI_SERVICE_BACKEND_URL=http://localhost:3001
GOOGLE_API_KEY_EMBEDDINGS=your_google_embeddings_key
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/quizdb
REDIS_URL=redis://user:pass@upstash-host:port
```

### Create `server/.env`

```env
PORT=3001
FRONTEND_URL=http://localhost:3000
HF_TOKEN=your_huggingface_token
GOOGLE_API_KEY=your_google_gemini_pro_key
```

---

### 📦 Install Dependencies

#### For Next.js App

```bash
npm install mongodb uuid langchain @langchain/google-genai @langchain/mongodb @langchain/textsplitters redis
```

#### For Express Backend

```bash
cd server
npm install express cors dotenv @google/generative-ai
cd ..
```

---

### ▶️ Run the Application

```bash
# Start Express AI Microservice
cd server
node index.js

# In a new terminal
cd ..
npm run dev
```

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🛣️ Future Enhancements

* 💬 AI-generated answer explanations
* 🧩 More question types (T/F, fill-in-the-blank)
* 🎚️ AI-graded difficulty levels
* 📸 OCR + image-to-quiz support
* 🔐 User login and saved quizzes
* 📊 Score tracking and quiz history
* 📱 Mobile app (React Native)
