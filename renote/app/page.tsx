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
      <h1 className = "text-3xl font-bold mb-4">ReNote</h1>
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
          className="bg-indigo-500 px-6 py-3 rounded-lg text-white flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-3"></div>
          Generating Questions...
        </button>):
        (<button
          onClick = {handleGenerate}
          disabled = {!notes.trim()}
          className="bg-indigo-500 px-6 py-3 rounded-lg text-white flex items-center gap-2">
            Generate Quiz
        </button>)}
      </div>
      
    </div>
  );
}
