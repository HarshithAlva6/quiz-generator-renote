'use client'
import {useState} from 'react';
import { useQuizGenerator } from "./hooks/useQuizGenerator";
import {useRouter} from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [notes, setNotes] = useState("")
  const { generating, generateQues } = useQuizGenerator();

  const handleGenerate = async () => {
    generateQues(notes);
    await new Promise((resolve)=> setTimeout(resolve, 3000))
    router.push('/quiz');
  }
  return (
    <div className="max-w-3xl mx-auto text-center">
      <div className="shadow-lg rounded-xl flex items-center justify-center mb-4 p-3">
        <textarea 
          value={notes}
          onChange = {(e)=>setNotes(e.target.value)}
          placeholder="Add your notes!"
          className="w-full h-64 p-4 border rounded-lg" />
      </div>
      <div className="flex justify-center">
        {generating ? (
        <button
          className="mt-4 px-6 py-2 rounded-lg bg-violet-600 text-white font-semibold border-b-2 border-violet-800 flex items-center gap-2 text-base translate-y-0.5 shadow-none cursor-wait"
          style={{WebkitBackdropFilter: 'blur(8px)'}}
          disabled
        >
          <div className="animate-spin rounded-full h-4 w-4 border-b-3"></div>
          Generating Questions...
        </button>):
        (<button
          onClick = {handleGenerate}
          disabled = {!notes.trim()}
          className={`mt-4 px-6 py-2 rounded-lg bg-violet-600 text-white font-semibold shadow-lg border-b-4 border-violet-800 hover:bg-violet-700 transition-all duration-150 active:translate-y-0.5 active:shadow-none flex items-center gap-2 text-base ${!notes.trim() ? 'bg-gray-200 text-gray-400 cursor-not-allowed border-gray-200 hover:bg-gray-200' : ''}`}>
            Generate Quiz
        </button>)}
      </div>
      
    </div>
  );
}
