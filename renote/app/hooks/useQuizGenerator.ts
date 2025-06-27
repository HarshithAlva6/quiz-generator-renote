'use client'
import {useState} from 'react';
import { useQuizContext } from '../context/QuizContext';

export function useQuizGenerator () {
    const [generating, setGenerating] = useState(false);
    const {setQuizCards} = useQuizContext();

    const isValidQuestion = async (ques:string):Promise<Boolean> => {
        const response = await fetch("/api/isQuestion", {
          method: "POST",
          headers: {"Content-Type": "application/json"},
          body: JSON.stringify({ line: ques }),
          });
        console.log(response, "response AH");
        const { isQuestion } = await response.json();
        return isQuestion;
      }
      
      const generateQues = async (notes:string) => {
        setGenerating(true)
        const entries = notes.trim(); //trim spaces in end
        const cards = entries.split(/\n\s*\n/); //Identify newline, followed by spaces and newline again
        const allCards:{question: string, answer:string}[] = [];
        for (const card of cards) {
          const [question, answer] = card.split('\n');
          if (question && answer && await isValidQuestion(question)) {
            allCards.push({question: question, answer: answer})
          }
        }
        setQuizCards(allCards);
      }
    return {generating, generateQues};
}