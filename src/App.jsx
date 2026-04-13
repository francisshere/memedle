import React, { useState, useEffect } from "react";
import { getRandomWord } from "./MemeData";

const MAX_GUESSES = 6;

// Helper function to evaluate the guess against the target word
const getGuessStatuses = (guess, target) => {
  const statuses = Array(guess.length).fill("absent");
  const targetChars = target.split("");

  // First pass: find 'correct' letters (right letter, right spot)
  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      statuses[i] = "correct";
      targetChars[i] = null; // Mark as used
    }
  }

  // Second pass: find 'present' letters (right letter, wrong spot)
  for (let i = 0; i < guess.length; i++) {
    if (statuses[i] !== "correct" && targetChars.includes(guess[i])) {
      statuses[i] = "present";
      targetChars[targetChars.indexOf(guess[i])] = null; // Mark as used
    }
  }
  return statuses;
};

export default function App() {
  const [targetWord, setTargetWord] = useState("");
  const [guesses, setGuesses] = useState([]); // Array of strings representing completed rows
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); // 'playing', 'won', 'lost'

  // Initialize the game
  useEffect(() => {
    setTargetWord(getRandomWord());
  }, []);

  // Handle Physical Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus !== "playing" || !targetWord) return;

      if (e.key === "Enter") {
        if (currentGuess.length === targetWord.length) {
          const newGuesses = [...guesses, currentGuess];
          setGuesses(newGuesses);
          
          if (currentGuess === targetWord) {
            setGameStatus("won");
          } else if (newGuesses.length >= MAX_GUESSES) {
            setGameStatus("lost");
          }
          setCurrentGuess(""); // Reset current row
        }
      } else if (e.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < targetWord.length) {
        setCurrentGuess((prev) => prev + e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus, targetWord, guesses]);

  // Prevent rendering until targetWord is selected
  if (!targetWord) return null;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center pt-10 px-4">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          MEME-DLE
        </h1>
        <p className="text-gray-400 text-sm">Type your guess and press Enter</p>
      </header>

      {/* Game Grid */}
      <div className="flex flex-col gap-2 w-full max-w-xs sm:max-w-sm">
        {/* Render Past Guesses */}
        {guesses.map((guess, rowIndex) => {
          const statuses = getGuessStatuses(guess, targetWord);
          return (
            <div key={rowIndex} className="flex gap-2 justify-center">
              {guess.split("").map((letter, i) => (
                <div
                  key={i}
                  className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl font-bold uppercase border-2 
                    ${statuses[i] === "correct" ? "bg-green-500 border-green-500" : ""}
                    ${statuses[i] === "present" ? "bg-yellow-500 border-yellow-500" : ""}
                    ${statuses[i] === "absent" ? "bg-gray-700 border-gray-700 text-gray-300" : ""}
                  `}
                >
                  {letter}
                </div>
              ))}
            </div>
          );
        })}

        {/* Render Current Guess Row */}
        {gameStatus === "playing" && guesses.length < MAX_GUESSES && (
          <div className="flex gap-2 justify-center">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div
                key={i}
                className={`w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-2xl font-bold uppercase border-2 border-gray-600 
                  ${currentGuess[i] ? "border-gray-400 animate-pulse" : ""}`}
              >
                {currentGuess[i] || ""}
              </div>
            ))}
          </div>
        )}

        {/* Render Empty Future Rows */}
        {Array.from({
          length: Math.max(0, MAX_GUESSES - guesses.length - (gameStatus === "playing" ? 1 : 0)),
        }).map((_, rowIndex) => (
          <div key={`empty-${rowIndex}`} className="flex gap-2 justify-center">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div
                key={i}
                className="w-12 h-12 sm:w-14 sm:h-14 border-2 border-gray-700 bg-gray-800/50 rounded-sm"
              ></div>
            ))}
          </div>
        ))}
      </div>

      {/* Game Over Messages */}
      {gameStatus === "won" && (
        <div className="mt-8 p-4 bg-green-500/20 border border-green-500 rounded-lg text-center font-bold animate-bounce">
          Giga Chad Move! You guessed it!
        </div>
      )}
      {gameStatus === "lost" && (
        <div className="mt-8 p-4 bg-red-500/20 border border-red-500 rounded-lg text-center">
          <p className="font-bold mb-1">Major Cope.</p>
          <p>The word was: <span className="text-xl text-red-400">{targetWord}</span></p>
        </div>
      )}
    </div>
  );
}