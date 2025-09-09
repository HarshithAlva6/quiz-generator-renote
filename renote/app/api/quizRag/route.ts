// Import necessary modules
import { MongoClient, ServerApiVersion } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai'; // Only need embeddings here
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { createClient } from 'redis';


// --- Environment Variables ---
// These MUST be set in your .env.local file (and your deployment environment like Vercel)
const MONGODB_URI = process.env.MONGODB_URI || "";
console.log(MONGODB_URI);
const DB_NAME = "notesdb";
const QUIZ_CARDS_COLLECTION = "quizCards";
const NOTE_CHUNKS_COLLECTION = "notesChunk";
const VECTOR_SEARCH_INDEX_NAME = "embed"; // Make sure this matches your MongoDB Atlas Vector Search index name
const REDIS_URL = process.env.REDIS_URL || ""; // Your Upstash Redis URL
const CACHE_TTL_SECONDS = 3600;

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY_EMBED || ""; // Your Google Gemini API Key (for embeddings)

// --- IMPORTANT: This points to your *separate* ai-service-backend.js ---
const AI_SERVICE_BACKEND_URL = process.env.AI_SERVICE_BACKEND_URL || "http://localhost:3001";

// --- MongoDB Client ---
const client = new MongoClient(MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  }
});
let dbConnected = false;
async function connectToDatabase() {
  if (!dbConnected) {
    await client.connect();
    dbConnected = true;
    console.log("Successfully connected to MongoDB!");
  }
  return client.db(DB_NAME);
}

// --- Hashing Utility ---
const generateSha256Hash = (inputString: string): string => {
  return crypto.createHash('sha256').update(inputString).digest('hex');
};

// --- LangChain Components ---
const embeddings = new GoogleGenerativeAIEmbeddings({ apiKey: GOOGLE_API_KEY, model: "embedding-001" }); // Gemini Embedding Model

// Text splitter for RAG preprocessing
const textSplitter = new RecursiveCharacterTextSplitter({
  chunkSize: 1000,
  chunkOverlap: 200,
});

// --- Helper for shuffling array ---
const shuffleArray = <T>(array: T[]): T[] => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Fisher-Yates shuffle
  }
  return array;
}

// We use a global client to avoid reconnecting on every request in a serverless environment
// This approach is common in Next.js API routes or Lambda functions for performance.
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedisClient() {
  if (!redisClient) {
    if (!REDIS_URL) {
      console.error("REDIS_URL is not set. Caching will be disabled.");
      return null;
    }
    try {
      redisClient = createClient({
        url: REDIS_URL,
      });
      redisClient.on('error', err => console.error('Redis Client Error', err));
      await redisClient.connect(); // Connect the client
      console.log("Successfully connected to Redis!");
    } catch (error) {
      console.error("Failed to connect to Redis:", error);
      redisClient = null; // Ensure client is null on failed connection
      return null;
    }
  }
  return redisClient;
}

// --- Main API Handler for all quiz generation logic ---
export async function POST(req: Request) {
  const { notes }: { notes: string } = await req.json();

  if (!notes) {
    return new Response(JSON.stringify({ error: 'Notes are required' }), { status: 400 });
  }

  const db = await connectToDatabase();
  const quizCardsCollection = db.collection(QUIZ_CARDS_COLLECTION);
  const noteChunksCollection = db.collection(NOTE_CHUNKS_COLLECTION);

  // Initialize LangChain's MongoDB Atlas Vector Search and Retriever
  const vectorStore = new MongoDBAtlasVectorSearch(embeddings, {
    collection: noteChunksCollection,
    indexName: VECTOR_SEARCH_INDEX_NAME,
    textKey: "pageContent",
    embeddingKey: "embedding",
  });
  const retriever = vectorStore.asRetriever();

  const generatedQuizCards: allCardsWithDistractors[] = [];
  const entries = notes.trim();
  const cards = entries.split(/\n\s*\n/);

  const fullNotesHash = generateSha256Hash(notes);
  const redis = await getRedisClient();

  let notesAlreadyIngested = false;
  console.log(fullNotesHash, "Full Notes AH");
  try {
    const existingChunk = await noteChunksCollection.findOne({
      "originalFullNotesHash": fullNotesHash
    });
    if(existingChunk){
      notesAlreadyIngested = true;
      console.log(`Full notes (hash: ${fullNotesHash}) already ingested. Skipping re-embedding.`);      
    }
  }
  catch (error){
    console.error("Error checking for existing notes ingestion:", error);
  }
  // --- Step 1: Process and Ingest Notes into Vector Database (RAG Preprocessing) ---
  if (!notesAlreadyIngested) {
    try {
      const docs = await textSplitter.createDocuments([notes]);
      const docsWithMetadata = docs.map(doc => ({
        ...doc,
        metadata: { ...doc.metadata, originalFullNotesHash: fullNotesHash }
      }));
      await vectorStore.addDocuments(docsWithMetadata);
      console.log("Notes chunks embedded and stored in MongoDB Atlas using Gemini Embeddings.");
    } catch (error) {
      console.error("Error during notes ingestion into vector store:", error);
    }
  }


  // --- Step 2: Iterate through each potential quiz card from notes ---
  for (const card of cards) {
    const [questionRaw, answerRaw] = card.split('\n');
    if (!questionRaw || !answerRaw) {
      console.warn("Skipping malformed card segment:", card);
      continue;
    }

    const question = questionRaw.trim();
    const answer = answerRaw.trim();
    const contentToHash = `${question}\n${answer}`;
    const currentQuizCardHash = generateSha256Hash(contentToHash);

    let quizCardToReturn: allCardsWithDistractors | null = null;
    // --- Check Redis for individual card ---
    if (redis) {
      try {
        const cachedCard = await redis.get(currentQuizCardHash);
        if (cachedCard) {
          console.log(`Serving individual quiz card from Redis cache (hash: ${currentQuizCardHash})`);
          quizCardToReturn = JSON.parse(cachedCard);
        }
      } catch (cacheError) {
        console.error(`Error retrieving individual card from Redis cache (${currentQuizCardHash}):`, cacheError);
      }
    }
    // --- If not in Redis, check MongoDB for existing quiz card ---
    if (!quizCardToReturn) {
      try {
        const existingQuizCard = await quizCardsCollection.findOne<allCardsWithDistractors & { originalNotesHash: string }>({ originalNotesHash: currentQuizCardHash });
        if (existingQuizCard) {
          console.log(`Serving individual quiz card from MongoDB (hash: ${currentQuizCardHash})`);
          quizCardToReturn = {
            question: existingQuizCard.question,
            theAnswer: existingQuizCard.theAnswer,
            options: existingQuizCard.options
          };
          // --- If found in Mongo, cache it in Redis for next time ---
          if (redis) {
            try {
              await redis.setEx(currentQuizCardHash, CACHE_TTL_SECONDS, JSON.stringify(quizCardToReturn));
              console.log(`Stored individual quiz card in Redis cache from Mongo (hash: ${currentQuizCardHash}).`);
            } catch (cacheError) {
              console.error(`Error storing individual card in Redis from Mongo (${currentQuizCardHash}):`, cacheError);
            }
          }
        }
      } catch (mongoError) {
        console.error(`Error checking Mongo for existing quiz card (${currentQuizCardHash}):`, mongoError);
      }
    }


    // --- If still not found (Redis or Mongo), proceed with AI generation ---
    if (!quizCardToReturn) {
      try {
        // --- RAG Step: Retrieve context from vector database ---
        const relevantDocs = await retriever.invoke(question);
        const retrievedContext = relevantDocs.map(doc => doc.pageContent).join("\n\n");
        console.log(`Retrieved context for "${question}":\n${retrievedContext.substring(0, Math.min(retrievedContext.length, 200))}...`);

        const isQuestionResponse = await fetch(`${AI_SERVICE_BACKEND_URL}/isQuestion`, {
            method: "POST", headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ line: question }),
        });
        if (!isQuestionResponse.ok) {
            const errorData = await isQuestionResponse.json();
            console.error("Error from AI Service Backend /isQuestion:", errorData);
            throw new Error(`AI Service Backend /isQuestion failed: ${errorData.error}`);
        }
        const { isQuestion } = await isQuestionResponse.json();
        const isQuestionValid = isQuestion === 1;

        if (isQuestionValid) {
          const distractorsResponse = await fetch(`${AI_SERVICE_BACKEND_URL}/generateDistractors`, {
              method: "POST", headers: {"Content-Type": "application/json"},
              body: JSON.stringify({ question, theAnswer: answer, numDistractors: 3, context: retrievedContext }),
          });
          if (!distractorsResponse.ok) {
              const errorData = await distractorsResponse.json();
              console.error("Error from AI Service Backend /generateDistractors:", errorData);
              throw new Error(`AI Service Backend /generateDistractors failed: ${errorData.error}`);
          }
          const { distractors } = await distractorsResponse.json();

          const theAnswerArray = answer.split(',').map(item => item.trim()).filter(item => item !== '');
          const allOptions = shuffleArray([...theAnswerArray, ...distractors]);

          quizCardToReturn = { // Assign to the shared variable
            question: question,
            theAnswer: theAnswerArray,
            options: allOptions,
          };

          const newQuizCardDocument = { // The document to insert into Mongo
            quizCardId: uuidv4(), originalNotesHash: currentQuizCardHash, // Ensure originalNotesHash is correctly set
            question: question, theAnswer: theAnswerArray, options: allOptions,
            generatedAt: new Date().toISOString(),
          };

          await quizCardsCollection.insertOne(newQuizCardDocument);
          console.log(`Generated and stored new quiz card in MongoDB (hash: ${currentQuizCardHash}).`);

          // --- NEW CACHING STEP 3: Store newly generated card in Redis ---
          if (redis) {
            try {
              await redis.setEx(currentQuizCardHash, CACHE_TTL_SECONDS, JSON.stringify(quizCardToReturn));
              console.log(`Stored newly generated quiz card in Redis cache (hash: ${currentQuizCardHash}).`);
            } catch (cacheError) {
              console.error(`Error storing newly generated card in Redis (${currentQuizCardHash}):`, cacheError);
            }
          }

        } else {
          console.warn(`Question "${question}" deemed invalid by Hugging Face AI. Skipping.`);
        }
      } catch (error) {
        console.error(`Error processing quiz card "${question}":`, error);
      }
    }

    if (quizCardToReturn) { // Only push if a valid card was obtained/generated
        generatedQuizCards.push(quizCardToReturn);
    }
  }
  return new Response(JSON.stringify({ quizCards: generatedQuizCards }), { status: 200 });
}
interface allCardsWithDistractors {
  question: string;
  theAnswer: string[];
  options: string[];
}