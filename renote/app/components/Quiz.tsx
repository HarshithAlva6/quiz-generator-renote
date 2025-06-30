'use client'

import {useState} from 'react';
import {useQuizContext} from '../context/QuizContext';
import { QuizResults } from './QuizResults';

export function Quiz() {
    const {quizCards} = useQuizContext();
    const [curIndex, setCurIndex] = useState(0)
    const [selectedOption, setOption] = useState<string | null>(null)
    const [allAnswers, setAllAnswers] = useState<Set<string>>(new Set())
    const [wrongChosen, setWrongChosen] = useState(false)
    const [score, setScore] = useState(0)
    const [completedQuiz, setCompletedQuiz] = useState(false)

    console.log(quizCards, "quizCards");

    const curCard = quizCards[curIndex];
    const availableOptions = curCard?.options.filter(option => 
        !allAnswers.has(option) && !wrongChosen) || [];

    const allFound = curCard?.theAnswer.length > 0 && curCard.theAnswer.every(answer => allAnswers.has(answer));
    const missedAnswers = wrongChosen
    ? curCard.theAnswer.filter(answer => !allAnswers.has(answer))
    : [];

    const handleOption = (option: string) => {
        if (!curCard) return;
        if (wrongChosen) return;
        setOption(option);
        if (curCard.theAnswer.includes(option)) {
            const newAnswer = new Set(allAnswers).add(option);
            setAllAnswers(newAnswer);
            if (newAnswer.size == curCard.theAnswer.length){
                setScore(prevScore => prevScore + 1);
                console.log("All Correct for this card! Current Score:", score + 1); 
            } 
        } else {
            setWrongChosen(true);
            console.log("Incorrect option selected. Current Score:", score);
        }
    };

    const handleNext = () => {
        if (!curCard || (!allFound && !wrongChosen)){
            return;
        }
        if (curIndex < quizCards.length-1) {
            setCurIndex((prev) => prev+1);
            setOption(null);
            setAllAnswers(new Set());
            setWrongChosen(false);
        }
        else {
            setCompletedQuiz(true);
        }
    }
    if (!quizCards || quizCards.length === 0 || !quizCards[curIndex]) {
        return <p className="text-gray-500">Loading questions...</p>;
    }
    console.log(quizCards);

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
            {availableOptions.length > 0 ? (
                availableOptions.map((option, index) => {
                let optionClasses = "block w-full p-3 rounded-md text-left transition-colors duration-200";
                const isSelectedCurrentClick = option === selectedOption;
                if (wrongChosen){
                        // If incorrect answer was chosen, all options become disabled and styled gray
                        optionClasses += " bg-gray-100 text-gray-700 border border-gray-300 opacity-50 cursor-not-allowed";
                    } else {
                        // Default styling for clickable options
                        optionClasses += " bg-blue-100 text-blue-800 border border-blue-400 hover:bg-blue-200 cursor-pointer";
                        if (isSelectedCurrentClick) {
                            optionClasses += " ring-2 ring-blue-500 border-blue-500"; // Highlight the just-clicked option
                        }
                    }

                    return (
                        <button
                        key={index}
                        className={optionClasses}
                        onClick={() => handleOption(option)}
                        disabled={wrongChosen}>
                        {option}
                        </button>
                    );
                })
            ) : (
                <p className="text-gray-500 text-center">No more options to select for this question.</p>
            )}
            </div>

            {/* Display correctly chosen answers */}
            {allAnswers.size > 0 && (
            <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-800 rounded-md">
                <p className="font-semibold mb-1">Your Selections:</p>
                    <ul className="list-disc pl-5">
                    {Array.from(allAnswers).map((answer, idx) => (
                        <li key={idx}>{answer}</li>
                    ))}
                    </ul>
            </div>
            )}

            {/* Display all correct answers (if an incorrect one was chosen) */}
            {wrongChosen && missedAnswers.length > 0 && (
                <div className="mt-4 p-3 bg-orange-100 border border-red-400 text-red-800 rounded-md">
                    <p className="font-semibold mb-1">You missed these correct answers:</p>
                    <ul className="list-disc pl-5">
                        {missedAnswers.map((answer, idx) => (
                            <li key={idx}>{answer}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>

            <button
            className={`px-6 py-3 rounded-lg text-white flex items-center gap-2 ${
                (allFound || wrongChosen) ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-gray-400 cursor-not-allowed'
            }`}
            onClick={handleNext}
            disabled={!allFound && !wrongChosen} // Disabled until current question is "resolved"
            >
            {curIndex >= quizCards.length - 1 ? 'Finish Quiz' : 'Next Question'}
            </button>
        </>
    );
}