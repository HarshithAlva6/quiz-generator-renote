//app/hooks/useQuizGenerator.ts
'use client'
import {useState} from 'react';
import { useQuizContext } from '../context/QuizContext';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL;

interface allCardsWithDistractors {
  question: string;
  theAnswer: string;
  options: string[];
}

export function useQuizGenerator () {
    const [generating, setGenerating] = useState(false);
    const {setQuizCards} = useQuizContext();

    const isValidQuestion = async (ques:string):Promise<Boolean> => {
        const response = await fetch(`${BACKEND_API_URL}/isQuestion`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ line: ques }),
          });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend error checking question:", errorData);
          throw new Error(errorData.error || `Backend responded with status ${response.status}`);
        }
        const { isQuestion } = await response.json();
        return isQuestion;
      }

      const fetchDistractors = async(question: string, theAnswer: string, context: string): Promise<string[]> => {
        const response = await fetch(`${BACKEND_API_URL}/generateDistractors`, {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({question, theAnswer, numDistractors: 3, context})
          });
          console.log(response, "response");
          if (!response.ok) {
            const errorData = await response.json();
            console.error("Backend error generating distractors:", errorData);
            throw new Error(errorData.error || `Backend responded with status ${response.status}`);
          }
          const { distractors } = await response.json();
          if (!Array.isArray(distractors)) {
              throw new Error("Backend did not return an array of distractors.");
          }
          return distractors;
        }


        const shuffleArray = (array: any[]): any[] => {
          for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]]; // Fisher-Yates shuffle
          }
          return array;
        }

        const generateQues = async (notes:string) => {
          setGenerating(true);
          const entries = notes.trim(); //trim spaces in end
          const cards = entries.split(/\n\s*\n/); //Identify newline, followed by spaces and newline again
          const allCards:allCardsWithDistractors[] = [];
          for (const card of cards) {
            const [question, answer] = card.split('\n');
            if (question && answer && await isValidQuestion(question)) {
              const distractors = await fetchDistractors(question, answer, notes)
              const allOptions = shuffleArray([answer, ...distractors])
              allCards.push({question: question.trim(), theAnswer: answer.trim(), options: allOptions})
            }
          }
          console.log(allCards, "allCards");
          setQuizCards(allCards);
          setGenerating(false);
        }

    return {generating, generateQues};
}