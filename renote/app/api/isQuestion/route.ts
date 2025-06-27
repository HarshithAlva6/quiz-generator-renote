// app/api/isQuestion/route.ts
import { NextResponse } from "next/server";

interface QueryRequest {
  inputs: string;
}

interface ModelOutput {
  label: string;
  score: number;
}

async function query(data: QueryRequest): Promise<ModelOutput[][]> {
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
    throw new Error(`API error: ${response.status} - ${errorText}`);
  }
  const result = (await response.json()) as ModelOutput[][];
  return result;
}

export async function POST(req: Request) {
  try {
    const { line } = (await req.json()) as { line: string };

    const results = await query({ inputs: line });
    console.log(results, "result")
    const isQuestion = results[0][0].label === 'LABEL_1'?1:0;

    return NextResponse.json({ isQuestion });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message ?? "Unknown error" },
      { status: 500 }
    );
  }
}
