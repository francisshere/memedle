// src/App.jsx
import React, { useState, useEffect } from "react";
import { getRandomMeme } from "./MemeData";

const MAX_GUESSES = 6;

const getGuessStatuses = (guess, target) => {
  const statuses = Array(guess.length).fill("absent");
  const targetChars = target.split("");

  for (let i = 0; i < guess.length; i++) {
    if (guess[i] === target[i]) {
      statuses[i] = "correct";
      targetChars[i] = null; 
    }
  }

  for (let i = 0; i < guess.length; i++) {
    if (statuses[i] !== "correct" && targetChars.includes(guess[i])) {
      statuses[i] = "present";
      targetChars[targetChars.indexOf(guess[i])] = null; 
    }
  }
  return statuses;
};

export default function App() {
  const [targetMeme, setTargetMeme] = useState(null); // Now holds { word, image }
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing"); 

  // Dark Mode
  // Initialize state by checking localStorage first
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("memedle-theme");
    return savedTheme === "dark"; // Returns true if "dark", false if anything else or null
  });

  // Save to localStorage every time isDarkMode changes
  useEffect(() => {
    localStorage.setItem("memedle-theme", isDarkMode ? "dark" : "light");
  }, [isDarkMode]);

  // Initialize the game
  useEffect(() => {
    setTargetMeme(getRandomMeme());
  }, []);

  // Handle Physical Keyboard Input
  useEffect(() => {
    if (!targetMeme) return;
    const targetWord = targetMeme.word.replace("-", ""); // Ignore hyphens in words like ROLL-SAFE

    const handleKeyDown = (e) => {
      if (gameStatus !== "playing") return;

      if (e.key === "Enter") {
        if (currentGuess.length === targetWord.length) {
          const newGuesses = [...guesses, currentGuess];
          setGuesses(newGuesses);
          
          if (currentGuess === targetWord) {
            setGameStatus("won");
          } else if (newGuesses.length >= MAX_GUESSES) {
            setGameStatus("lost");
          }
          setCurrentGuess(""); 
        }
      } else if (e.key === "Backspace") {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-Za-z]$/.test(e.key) && currentGuess.length < targetWord.length) {
        setCurrentGuess((prev) => prev + e.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentGuess, gameStatus, targetMeme, guesses]);

  // Wait until the meme is loaded before rendering the UI
  if (!targetMeme) return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      Loading...
    </div>
  );

  const targetWord = targetMeme.word.replace("-", "");

  // dynamic theme colors
  const bgColor = isDarkMode ? "bg-[#333333]" : "bg-[#E0A016]";
  const memeTextColor = isDarkMode ? "text-[#09CD0F]" : "text-[#06810A]";
  const dleTextColor = "text-[#FFF9F9]";

return (
    <div className={`min-h-screen flex flex-col items-center pt-10 px-4 pb-10 transition-colors duration-300 ${bgColor} font-imprima relative`}>
      
      {/* Theme Toggle Icon (Upper Right) */}
      <button 
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-black/20 transition-colors"
      >
        {isDarkMode ? (
          // Sun Icon (Dark Mode)
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          // Moon Icon (Light Mode)
          <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* Title */}
      <header className="mb-6 text-center w-full max-w-sm relative">
        <h1 className="text-5xl tracking-widest mt-2">
          <span className={memeTextColor}>MEME</span>
          <span className={dleTextColor}> - DLE</span>
        </h1>
      </header>

      {/* Meme Image Hint */}
      <div className="mb-8 w-full max-w-sm flex justify-center">
        <img 
          src={targetMeme.image} 
          alt="Guess this meme" 
          className="max-w-full h-60 sm:h-60 object-cover rounded-sm border-none opacity-80"
        />
      </div>

      {/* Game Grid */}
      <div className="flex flex-col gap-[6px] w-full items-center">
        {guesses.map((guess, rowIndex) => {
          const statuses = getGuessStatuses(guess, targetWord);
          return (
            <div key={rowIndex} className="flex gap-[6px] justify-center">
              {guess.split("").map((letter, i) => {
                // Determine evaluated colors
                let tileColor = "bg-[#D9D9D9] text-black"; // Default from Figma

                if (statuses[i] === "correct") {
                  tileColor = "bg-green-600 text-white";
                } else if (statuses[i] === "present") {
                  // dark mode = yellow, light mode = blue
                  tileColor = isDarkMode ? "bg-yellow-500 text-white" : "bg-blue-500 text-white";
                } else if (statuses[i] === "absent") {
                  tileColor = "bg-gray-600 text-white";
                }

                return (
                  <div
                    key={i}
                    className={`flex items-center justify-center text-xl font-bold uppercase ${tileColor} w-[62px] h-[62px]`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Render Current Guess Row */}
        {gameStatus === "playing" && guesses.length < MAX_GUESSES && (
          <div className="flex gap-[6px] justify-center">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div
                key={i}
                className={`flex items-center justify-center text-xl font-bold uppercase bg-[#D9D9D9] text-black w-[62px] h-[62px]
                  ${currentGuess[i] ? "ring-2 ring-black/30" : ""}`}
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
          <div key={`empty-${rowIndex}`} className="flex gap-[6px] justify-center">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div
                key={i}
                className="bg-[#D9D9D9] w-[62px] h-[62px]"
              ></div>
            ))}
          </div>
        ))}
      </div>

      {/* Game Over Block (replaces the green box in Figma) */}
      <div 
        className={`mt-2 w-full max-w-xs h-16 flex items-center justify-center text-white text-sm font-bold tracking-wider 
          ${gameStatus === "lost" ? "bg-red-600" : "bg-[#365e1b]"}
        `}
      >

        {gameStatus === "won" ? "GIGA CHAD MOVE!": ""}
        {gameStatus === "lost" ? `MAJOR COPE. IT WAS ${targetWord}` : ""}
      </div>

    </div>
  );
}