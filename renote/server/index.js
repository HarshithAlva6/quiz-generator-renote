import 'dotenv/config'; // Modern way to load dotenv in ES Modules
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000'
}));
app.use(express.json())

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

//interface QueryRequest {
//  inputs: string;
//}
//
//interface ModelOutput {
//  label: string;
//  score: number;
//}

async function query(data) {
    console.log(process.env.HF_TOKEN);
  const response = await fetch(
    "https://router.huggingface.co/hf-inference/models/mrsinghania/asr-question-detection",
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Hugging Face API error: ${response.status} - ${errorText}`);
  }
  const result = (await response.json());
  return result;
}

// New API endpoint for question detection
app.post('/isQuestion', async (req, res) => {
  try {
      const { line } = req.body;

      if (!line || typeof line !== 'string') {
          return res.status(400).json({ error: "Invalid or missing 'line' in request body." });
      }

      const results = await query({ inputs: line });
      console.log(results, "result from Hugging Face"); // This log is now on your backend server

      // Assuming results structure remains consistent: results[0][0].label
      const isQuestion = (results[0] && results[0][0] && results[0][0].label === 'LABEL_1') ? 1 : 0;

      res.json({ isQuestion });
  } catch (error) {
      console.error("Error in /isQuestion backend endpoint:", error);
      res.status(500).json({ error: error.message ?? "Unknown server error" });
  }
});

// Basic route to check if backend is running
app.get('/', (req, res) => {
  res.send('Renote Backend Service is running!');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Renote Backend listening at http://localhost:${PORT}`);
});

app.post('/generateDistractors', async (req,res) => {
    try {
        const {question, theAnswer, numDistractors = 3, context = ""} = req.body;
        if (!question || !theAnswer) {
            return res.status(400).json({ error: "Missing 'question' or 'answer' in request body." });
        }

        if (!process.env.GOOGLE_API_KEY) {
            throw new Error("Google API Key is not configured in the backend environment.");
        }

        // Construct the prompt for Gemini
        let prompt = `I need ${numDistractors} plausible but incorrect distractors for a multiple-choice question.
        Question: "${question}"
        Correct Answer: "${theAnswer}"`;

        if (context) {
            prompt += `\nContext/Topic: "${context}"`;
        }

        prompt += `\nProvide the distractors as a JSON array of strings, like: ["distractor1", "distractor2", "distractor3"]. Do not include the correct answer.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text(); // This will be the JSON string

        console.log("Gemini raw response:", text);
        let distractors;
        try {
            // Attempt to parse JSON. Gemini might wrap it in markdown or other text.
            // This regex tries to find the first JSON array pattern in the string.
            const jsonMatch = text.match(/\[.*\]/s); 
            if (jsonMatch && jsonMatch[0]) {
                distractors = JSON.parse(jsonMatch[0]);
            } else {
                distractors = JSON.parse(text); // Fallback: try parsing directly if no markdown
            }

            // Basic validation to ensure it's an array
            if (!Array.isArray(distractors)) {
                 throw new Error("Gemini response is not a valid JSON array.");
            }

        } catch (jsonParseError) {
            console.error("Failed to parse Gemini response as JSON:", jsonParseError, "Raw text:", text);
            return res.status(500).json({ error: "Failed to parse AI response for distractors." });
        }
        
        // FINALLY: Send the parsed distractors back to the frontend
        res.json({ distractors });
    }
    catch (error) {
        console.error("Error in /generateDistractors backend endpoint:", error);
        res.status(500).json({ error: error.message ?? "Unknown server error" });
    }
})
//export async function POST(req: Request) {
//  try {
//    const { line } = (await req.json()) as { line: string };
//
//    const results = await query({ inputs: line });
//    console.log(results, "result")
//    const isQuestion = results[0][0].label === 'LABEL_1'?1:0;
//
//    return NextResponse.json({ isQuestion });
//  } catch (error: any) {
//    return NextResponse.json(
//      { error: error?.message ?? "Unknown error" },
//      { status: 500 }
//    );
//  }
//}