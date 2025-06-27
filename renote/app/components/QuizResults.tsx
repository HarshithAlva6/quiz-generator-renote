// app/components/QuizResults.tsx
'use client'; // This component also needs to be a client component

import React from 'react';

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
}

export function QuizResults({ score, totalQuestions }: QuizResultsProps) {
  // Calculate percentage, handling division by zero for no questions
  const percentage = totalQuestions > 0 ? ((score / totalQuestions) * 100).toFixed(0) : 0;

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 border rounded-lg shadow-lg bg-white max-w-md mx-auto">
      <h2 className="text-3xl font-bold mb-4 text-indigo-700">Quiz Completed!</h2>
      <p className="text-2xl mb-2">
        Your Score: <span className="font-semibold">{score}</span> / {totalQuestions}
      </p>
      <p className="text-3xl font-bold text-blue-600">Percentage: {percentage}%</p>
      
    </div>
  );
}
