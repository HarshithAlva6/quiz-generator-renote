'use client'; 

import React from 'react';
import {useRouter} from 'next/navigation';
interface QuizResultsProps {
  score: number;
  totalQuestions: number;
}

export function QuizResults({ score, totalQuestions }: QuizResultsProps) {
  const router = useRouter();

  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(0) : 0;
  const jumpHome = () => {
    router.push('/');
  }
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 rounded-2xl shadow-2xl bg-white/70 border border-violet-200 max-w-lg mx-auto backdrop-blur-md" style={{boxShadow: '0 8px 32px 0 rgba(80, 80, 180, 0.15)', WebkitBackdropFilter: 'blur(10px)'}}>
      <div className="mb-4 text-5xl">🏆</div>
      <h2 className="text-3xl font-extrabold mb-2 text-violet-800 tracking-tight drop-shadow">Quiz Completed</h2>
      <div className="text-4xl font-bold mb-2 text-emerald-600 drop-shadow-sm">
        <span className="text-2xl font-bold mb-6 text-emerald-600 drop-shadow-sm">Final Score: {score} / {totalQuestions}</span> 
      </div>
      <div className="text-2xl font-bold mb-6 text-emerald-600 drop-shadow-sm">Percentage: {percentage}%</div>
      <button
        onClick={jumpHome}
        className="mt-4 px-6 py-2 rounded-lg bg-violet-600 text-white font-semibold shadow-lg border-b-4 border-violet-800 hover:bg-violet-700 transition-all duration-150 active:translate-y-0.5 active:shadow-none"
      >
        Return to Quiz
      </button>
    </div>
  );
}
