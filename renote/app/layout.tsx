import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { QuizContextProvider } from './context/QuizContext';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Revise Notes with ReNote",
  description: "Notes Reinforced Learning",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen`}
      >
        <QuizContextProvider>
          <header className="w-full py-6 px-4 bg-white/80 shadow-md mb-8">
            <div className="max-w-3xl mx-auto flex items-center gap-2 justify-center">
              <span className="text-2xl font-bold text-indigo-700 tracking-tight">ReNote</span>
              <span className="ml-2 text-sm text-gray-500 font-mono">Notes Reinforced Learning</span>
            </div>
          </header>
          <main className="max-w-3xl mx-auto px-4">
            {children}
          </main>
        </QuizContextProvider>
      </body>
    </html>
  );
}
