'use client'

import {createContext, ReactNode, useContext, useState} from 'react';

type QuizCard = {
    question: string,
    answer: string
}
type QuizContextType = {
    quizCards: QuizCard[],
    setQuizCards: (card: QuizCard[]) => void
}
const QuizContext = createContext<QuizContextType|undefined>(undefined);
export function useQuizContext () {
    const context = useContext(QuizContext);
    if (!context) throw new Error("useQuizContext should be inside QuizContextProvider");
    return context;
}
export function QuizContextProvider ({children}: {children: ReactNode}) {
    const [quizCards, setQuizCards] = useState<QuizCard[]>([])
    return (
        <QuizContext.Provider value = {{quizCards, setQuizCards}}>
            {children}
        </QuizContext.Provider>
    )
}