//app/hooks/useQuizGenerator.ts
'use client'
import {useState} from 'react';
import { useQuizContext } from '../context/QuizContext';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

export function useQuizGenerator () {
    const [generating, setGenerating] = useState(false);
    const {setQuizCards} = useQuizContext();

    const generateQues = async (notes:string) => {
      setGenerating(true);
      setQuizCards([]); // Clear previous quiz cards immediately
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/quizRag`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ notes }),
          });
      
       if (!response.ok) {
        const errorData = await response.json();
        console.error("Backend error generating quiz with RAG:", errorData);
        throw new Error(errorData.error || `Backend responded with status ${response.status}`);
       }
      
       const { quizCards } = await response.json();
       setQuizCards(quizCards);
        } catch (error) {
        console.error("Error in useQuizGenerator (RAG integration):", error);
        } finally {
        setGenerating(false);
        }
      }
    return {generating, generateQues};
}