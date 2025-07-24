# renote

ReNote: AI-Powered Quiz Generator
🧠 Transform Your Notes into Interactive Quizzes with Intelligent AI 🚀
ReNote is a full-stack web application designed to revolutionize the way students and professionals create study materials. It automatically converts raw textual notes into interactive multiple-choice quiz cards, complete with questions, correct answers, and contextually relevant distractors. This project showcases a robust, layered architecture leveraging cutting-edge AI, RAG, and cloud technologies.

✨ Features
Intelligent Quiz Generation: Automatically creates multiple-choice questions and plausible distractors from unstructured text notes.

Multi-AI Integration: Seamlessly combines specialized AI models from Hugging Face and Google Gemini for different tasks.

Retrieval Augmented Generation (RAG): Grounds AI responses in your original notes for factual accuracy and reduced hallucinations.

Layered Caching & Deduplication: Optimizes performance and minimizes API costs with a multi-tiered caching and data management strategy.

Full-Stack Development: Provides a complete end-to-end solution with a modern web frontend and a scalable backend.

💡 Technical Architecture
ReNote employs a modular, microservices-oriented architecture to ensure scalability, maintainability, and efficient resource utilization.

+----------------+       +-------------------------+       +-----------------------+
|                |       |                         |       |                       |
|   Web Frontend |       |   Next.js Orchestration |       |  Express AI Service   |
| (React)        |------>|       Backend           |------>|        Backend        |
|                |       |   (/api/quizRag)        |       |  (/isQuestion,        |
|                |       |                         |       |   /generateDistractors)|
+----------------+       +-------------------------+       +-----------------------+
        ^                          |                                   |
        |                          |                                   |
        |                          v                                   v
        |                  +---------------------+           +---------------------+
        |                  |  MongoDB Atlas      |           |  Google Gemini API  |
        |                  |  (quizCards,        |           |  (gemini-pro,        |
        |                  |   noteChunks,       |           |   embedding-001)    |
        |                  |   Vector Search)    |           |                     |
        |                  +---------------------+           +---------------------+
        |                          ^
        |                          |
        |                  +---------------------+
        |                  |   Upstash Redis     |
        +------------------|      (Cache)        |
                           +---------------------+

Core Components:
Web Frontend: Built with Next.js and React, providing a user-friendly interface for note input and quiz display.

Next.js Orchestration Backend (/api/quizRag):

The central brain of the application.

Handles incoming requests from the frontend.

Manages the RAG pipeline (chunking, embedding, vector search).

Orchestrates calls to the separate AI Service Backend.

Interacts with MongoDB Atlas for persistent storage.

Integrates Redis for caching.

Utilizes LangChain.js for LLM orchestration and vector database integration.

Express AI Service Backend (server/index.js):

A lightweight Express.js application acting as a dedicated microservice for specific AI model inferences.

Exposes endpoints for:

/isQuestion: Calls a Hugging Face Transformer (mrsinghania/asr-question-detection) for question validation.

/generateDistractors: Calls Google Gemini 1.5 Pro for generating plausible incorrect answer options.

MongoDB Atlas:

quizCards Collection: Stores generated quiz cards (question, answers, options) for persistent storage.

noteChunks Collection: Stores chunks of original user notes along with their vector embeddings, serving as the knowledge base for RAG.

Atlas Vector Search Index: A specialized index on the noteChunks collection's embedding field, enabling efficient semantic similarity search (Approximate Nearest Neighbor - ANN).

Upstash Redis:

An ultra-fast, serverless, in-memory cache.

Used to store individual generated quiz cards for rapid retrieval, minimizing redundant AI calls and database lookups.

🧠 AI & Machine Learning Core
ReNote's intelligence is powered by a sophisticated blend of AI techniques and models:

Large Language Models (LLMs): Utilizes Google Gemini models for various generative tasks.

Retrieval Augmented Generation (RAG):

Purpose: To ensure AI-generated content is accurate, contextually relevant, and grounded in the user's original notes, reducing "hallucinations."

Process:

Ingestion: User notes are split into smaller, overlapping chunks using RecursiveCharacterTextSplitter.

Embedding: Each text chunk is converted into a high-dimensional numerical vector (embedding) using Google Gemini Embeddings (embedding-001).

Vector Storage: These chunks and their embeddings are stored in the noteChunks collection in MongoDB Atlas.

Retrieval: When a quiz question needs AI processing (validation or distractor generation), the question itself is embedded. A MongoDB Atlas Vector Search query then finds the most semantically similar chunks from the stored notes.

Augmentation: The retrieved context (original text from relevant chunks) is dynamically added to the prompts sent to the LLMs.

Specialized AI Models:

Hugging Face Transformer (mrsinghania/asr-question-detection): A fine-tuned model specifically for classifying text as a valid question or not, ensuring high-quality input for quiz generation.

Google Gemini 1.5 Pro: A powerful generative model used for creating diverse and plausible incorrect answer options (distractors).

LangChain.js: Orchestrates the entire AI pipeline, managing text splitting, embedding calls, vector store interactions, and dynamic prompt construction for LLMs.

Prompt Engineering: Custom prompts are carefully designed to guide LLMs for specific tasks (e.g., distractor generation, question quality).

⚡️ Data Flow & Optimization
ReNote employs a multi-layered optimization strategy to maximize performance and minimize operational costs:

Individual Quiz Card Cache (Redis):

Key: originalNotesHash (SHA-256 hash of question\nanswer for each card).

Flow: When a quiz card is requested, Redis is checked first. If found, it's served instantly, bypassing all database and AI calls for that specific card.

Benefit: Highest hit rate for frequently repeated individual questions, providing lightning-fast responses.

Mechanism: node-redis client with setEx and get operations.

Individual Quiz Card Deduplication (MongoDB quizCards):

Key: originalNotesHash.

Flow: If not in Redis, MongoDB's quizCards collection is checked. If found, it's retrieved and then stored in Redis for future fast access.

Benefit: Prevents redundant AI calls (Hugging Face, Gemini 1.5 Pro) and database writes for quiz cards that have been generated before.

Full Notes Ingestion Deduplication (MongoDB noteChunks):

Key: originalFullNotesHash (SHA-256 hash of the entire input notes).

Flow: Before processing a new set of notes for RAG, this hash is checked in the noteChunks collection.

Benefit: Prevents re-chunking, re-embedding (saving Gemini Embeddings API costs), and re-storing the same entire set of notes in the vector database.

This layered approach ensures that resources are only utilized when necessary, providing a highly efficient and cost-effective solution.

🛠️ Tech Stack
Frontend (Web): React.js, Next.js, TypeScript, Tailwind CSS

Orchestration Backend: Next.js API Routes (Node.js, TypeScript)

AI Service Backend: Express.js (Node.js)

AI Models: Google Gemini (gemini-pro, gemini-1.5-pro, embedding-001), Hugging Face Transformers (mrsinghania/asr-question-detection)

AI Frameworks: LangChain.js

Databases: MongoDB Atlas (Document Database, Vector Search), Redis (Upstash)

Cloud & DevOps: AWS (EC2, S3, Lambda, RDS - conceptual for professional experience, actual usage for projects), Azure DevOps, Docker, Kubernetes, GitLab/GitHub Actions, Terraform

Other Tools: UUID, Crypto, CORS, Dotenv, Fetch API, WebSockets, Kafka, Figma, Mapbox, Google Maps API, Zapier (conceptual for automation integration)

🚀 Getting Started
To run ReNote locally, you'll need to set up two backend services and the web frontend.

Prerequisites:
Node.js (v18+) & npm

Git

MongoDB Atlas Account: M0 Sandbox cluster configured with Network Access (0.0.0.0/0 for testing) and a Database User. Ensure a Vector Search Index named default is created on quizdb.noteChunks with numDimensions: 768 and similarity: "cosine".

Google Cloud Project & API Key: Enable Generative Language API.

Hugging Face Account & API Token: For the question detection model.

Upstash Account: Create a free Redis database.

Setup Instructions:
Clone the Repository:

git clone [YOUR_REPO_URL]
cd renote/renote # Navigate to the root of your main project

Configure Environment Variables:

Create renote/.env.local (for Next.js app):

# --- For Next.js Frontend & Orchestration Backend ---
NEXT_PUBLIC_BACKEND_API_URL="http://localhost:3000" # Frontend calls this URL

# For Next.js Orchestration Backend to call your AI Service Backend
AI_SERVICE_BACKEND_URL="http://localhost:3001" 

# For LangChain's Google Generative AI Embeddings
GOOGLE_API_KEY_EMBEDDINGS="YOUR_GOOGLE_GEMINI_API_KEY_FOR_EMBEDDINGS"

# For MongoDB Atlas connection
MONGODB_URI="mongodb+srv://YOUR_DB_USER:YOUR_DB_PASSWORD@YOUR_CLUSTER_URL/quizdb?retryWrites=true&w=majority&appName=QuizApp"

# For Upstash Redis Cache
REDIS_URL="redis://YOUR_UPSTASH_USERNAME:YOUR_UPSTASH_PASSWORD@YOUR_UPSTASH_HOST:YOUR_UPSTASH_PORT"

Create renote/server/.env (for Express app):

# --- For AI Service Backend (Express App) ---
PORT=3001
FRONTEND_URL="http://localhost:3000" # For CORS

# For Hugging Face API calls
HF_TOKEN="YOUR_HUGGING_FACE_TOKEN"

# For Gemini 1.5 Pro (used in Express app)
GOOGLE_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_FOR_GEMINI_1_5_PRO" 

Installation:
Install dependencies for the Next.js app (from renote/renote root):

npm install mongodb uuid langchain @langchain/google-genai @langchain/mongodb @langchain/textsplitters redis

Install dependencies for the Express app (from renote/renote/server directory):

cd server
npm install express cors dotenv @google/generative-ai
cd .. # Go back to renote/renote root

Running the Application:
Start AI Service Backend (Express App):

Open a new terminal.

cd renote/renote/server

node index.js (or nodemon index.js if installed)

Keep this terminal running.

Start Next.js Orchestration Backend & Web Frontend:

Open a new terminal.

cd renote/renote (root of your Next.js project)

npm run dev

Keep this terminal running.

Usage:
Web App: Open your browser to http://localhost:3000. Enter notes and click "Generate Quiz."

🛣️ Future Enhancements
AI-Powered "Explain Answer" Feature: Provide detailed, AI-generated explanations for quiz answers, grounded in source notes.

Dynamic Question Types: Generate True/False, Fill-in-the-Blank, or Short Answer questions.

AI-Driven Difficulty: Automatically assign difficulty levels to questions.

Multi-Modal Input: Allow image uploads alongside text notes for visual quiz generation (leveraging Gemini's vision capabilities).

User Authentication: Implement user accounts to save and manage personal quiz collections.

Quiz Taking & Tracking: Build a dedicated quiz-taking interface with score tracking and progress analytics.

Improved UI/UX: Enhance the visual design and user flow for the web platform.

Mobile App Development: Extend the application to native mobile platforms (iOS/Android) using React Native, consuming the existing backend APIs. (Mentioned as a future enhancement now)

🤝 Connect with Me
LinkedIn: [Your LinkedIn Profile URL]

GitHub: [Your GitHub Profile URL]

Portfolio: [Your Portfolio URL]

npm i create-next-app@latest renote --app
npm install phosphor-react
npm i express dotenv cors

npm install @google/generative-ai
