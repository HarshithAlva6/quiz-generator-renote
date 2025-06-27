'use client'

import {useState} from 'react';
import {useQuizContext} from '../context/QuizContext';
import { QuizResults } from './QuizResults';

export function Quiz() {
    const {quizCards} = useQuizContext();
    const [curIndex, setCurIndex] = useState(0)
    const [selectedOption, setOption] = useState<string | null>(null)
    const [isAnswer, setIsAnswer] = useState(false)
    const [score, setScore] = useState(0)
    const [completedQuiz, setCompletedQuiz] = useState(false)
    console.log(quizCards, "quizCards");


    const handleOption = (option: string) => {
        setIsAnswer(true);
        setOption(option);
        if (option == curCard.theAnswer) {
            setScore(prevScore => prevScore + 1);
            console.log("Correct! Current Score:", score + 1); 
        } else {
            console.log("Incorrect. Current Score:", score);
        }
    }

    const handleNext = () => {
        if (curIndex < quizCards.length-1){
            setCurIndex((prev) => prev+1);
            setOption(null);
            setIsAnswer(false);
        }
        else {
            setCompletedQuiz(true);
        }
    }
    if (!quizCards || quizCards.length === 0 || !quizCards[curIndex]) {
        return <p className="text-gray-500">Loading questions...</p>;
    }
    console.log(quizCards);
    const curCard = quizCards[curIndex];
    if (completedQuiz) {
        return (
            <QuizResults 
                score={score} 
                totalQuestions={quizCards.length} 
            />
        );
    }
    return (
        <>
        <div className = "p-4 border rounded shadow mb-4">
        <h2 className="text-xl font-bold mb-4">Score: {score} / {quizCards.length}</h2>
        <p className="text-lg font-semibold mb-4">{curCard.question}</p>
            <div className = "space-y-3">
            {curCard.options.map((option, index) => {
                let optionClasses = "block w-full p-3 rounded-md text-left transition-colors duration-200";
                if (isAnswer){
                        if (option === curCard.theAnswer) {
                            optionClasses += " bg-green-200 text-green-800 border-2 border-green-500"; // Correct answer
                        } else if (option === selectedOption) {
                            optionClasses += " bg-red-200 text-red-800 border-2 border-red-500"; // Incorrectly selected
                        } else {
                            optionClasses += " bg-gray-100 text-gray-700 border border-gray-300 opacity-70 cursor-not-allowed"; // Unselected option
                        }
                    }
                         else { // Not yet answered, allow selection
                        optionClasses += " bg-blue-100 text-blue-800 border border-blue-400 hover:bg-blue-200 cursor-pointer";
                        if (option === selectedOption) {
                            optionClasses += " ring-2 ring-blue-500 border-blue-500"; // Highlight selected before checking
                        }
                    }
               return ( 
               <button className = {optionClasses}
               onClick = {() => handleOption(option)}>{option}</button>
            )})}
            </div>
        </div>
        <button className = "bg-indigo-500 px-6 py-3 rounded-lg text-white flex items-center gap-2"
        onClick = {handleNext}>{curIndex >= quizCards.length - 1?'Done':'Next'}</button>
        </>
    );
}