'use client'

import {useState} from 'react';
import {useQuizContext} from '../context/QuizContext';

export function Quiz() {
    const {quizCards} = useQuizContext();
    const [curIndex, setCurIndex] = useState(0)
    const [answer, setAnswer] = useState("")
    const handleNext = () => {
        if (curIndex < quizCards.length-1){
            setCurIndex((prev) => prev+1)
        }
    }
    if (!quizCards || quizCards.length === 0 || !quizCards[curIndex]) {
        return <p className="text-gray-500">Loading questions...</p>;
    }
    console.log(quizCards);
    const curCard = quizCards[curIndex];
    return (
        <>
        <div className = "p-4 border rounded shadow mb-4">
            <p>{curCard.question}</p>
            <p>{curCard.answer}</p>
            <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                placeholder="Type your answer..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
        </div>
        <button className = "bg-indigo-500 px-6 py-3 rounded-lg text-white flex items-center gap-2"
        onClick = {handleNext}>{curIndex >= quizCards.length - 1?'Done':'Next'}</button>
        </>
    );
}