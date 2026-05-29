// src/App.jsx
import { useCallback, useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react"
import { getRandomMeme, getSafeMemeImageUrl } from "./MemeData";

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

// Keyboard Layout Matrix
const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"]
];

const THEME_STORAGE_KEY = "memedle-theme";

const getSavedThemePreference = () => {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark";
  } catch {
    return false;
  }
};

const saveThemePreference = (isDarkMode) => {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, isDarkMode ? "dark" : "light");
  } catch {
    // Storage can be blocked in private or hardened browser modes.
  }
};

export default function App() {
  const [targetMeme, setTargetMeme] = useState(() => getRandomMeme());
  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [gameStatus, setGameStatus] = useState("playing");
  const [toast, setToast] = useState("");
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const [isDarkMode, setIsDarkMode] = useState(getSavedThemePreference);

  useEffect(() => {
    saveThemePreference(isDarkMode);
  }, [isDarkMode]);

  // Universal Input Handler for both physical and on-screen keyboards
  const handleInput = useCallback((key) => {
    if (gameStatus !== "playing" || !targetMeme) return;
    const targetWord = targetMeme.word.replace("-", "");

    if (key === "ENTER") {

      // too short word
      if (currentGuess.length < targetWord.length) {
        setToast("TOO SHORT");
        setTimeout(() => setToast(""), 2000); // 
        return;
      }

      if (currentGuess.length === targetWord.length) {
        const newGuesses = [...guesses, currentGuess];
        setGuesses(newGuesses);

        // full word logic
        if (currentGuess === targetWord) {
          setGameStatus("won");
        } else if (newGuesses.length >= MAX_GUESSES) {
          setGameStatus("lost");
        }
        setCurrentGuess("");
      }
    } else if (key === "BACKSPACE") {
      setCurrentGuess((prev) => prev.slice(0, -1));
    } else if (/^[A-Z]$/.test(key) && currentGuess.length < targetWord.length) {
      setCurrentGuess((prev) => prev + key);
    }
  }, [currentGuess, gameStatus, guesses, targetMeme]);

  // Handle Physical Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") handleInput("ENTER");
      else if (e.key === "Backspace") handleInput("BACKSPACE");
      else if (/^[a-zA-Z]$/.test(e.key)) handleInput(e.key.toUpperCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleInput]);

  const resetGame = () => {
    setTargetMeme(getRandomMeme()); // Picks a new meme
    setGuesses([]);                 // Clears the board
    setCurrentGuess("");            // Clears the active row
    setGameStatus("playing");       // Resets the win/loss state
    setToast("");                   // Clears any stuck pop-ups
  };

  if (!targetMeme) return (
    <div className="min-h-screen bg-[#E0A016] flex items-center justify-center font-imprima">
      Loading...
    </div>
  );

  const targetWord = targetMeme.word.replace("-", "");
  const targetImage = getSafeMemeImageUrl(targetMeme.image);

  // Calculate keyboard letter statuses dynamically
  const keyStatuses = {};
  guesses.forEach((guess) => {
    const statuses = getGuessStatuses(guess, targetWord);
    guess.split("").forEach((letter, i) => {
      const status = statuses[i];
      // Only upgrade a key's status, never downgrade it (e.g., correct stays correct)
      if (status === "correct") {
        keyStatuses[letter] = "correct";
      } else if (status === "present" && keyStatuses[letter] !== "correct") {
        keyStatuses[letter] = "present";
      } else if (status === "absent" && !keyStatuses[letter]) {
        keyStatuses[letter] = "absent";
      }
    });
  });

  // dynamic theme colors
  const bgColor = isDarkMode ? "bg-[#333333]" : "bg-[#E0A016]";
  const memeTextColor = isDarkMode ? "text-[#09CD0F]" : "text-[#06810A]";
  const dleTextColor = "text-[#FFF9F9]";

  return (
    <div className={`min-h-screen flex flex-col items-center pt-8 sm:pt-10 px-4 pb-10 transition-colors duration-300 ${bgColor} font-imprima relative`}>

      <div className="absolute top-4 right-15 sm:top-6 sm:right-20 flex gap-2 sm:gap-3 z-40">
        {/* Info Icon (Upper Right) */}
        <button
          onClick={() => setIsInfoOpen(true)}
          className="p-2 rounded-full hover:bg-black/20 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className={`w-5 h-5 sm:w-6 sm:h-6 ${isDarkMode ? "text-white" : "text-black"}`}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
          </svg>
        </button>
      </div>

      {/* Theme Toggle Icon (Upper Right) */}
      <button
        onClick={() => setIsDarkMode(!isDarkMode)}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full hover:bg-black/20 transition-colors"
      >

        {isDarkMode ? (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      {/* Title */}
      <header className="mb-4 sm:mb-6 text-center w-full max-w-sm relative mt-4 sm:mt-0">
        <h1 className="text-4xl sm:text-5xl tracking-widest mt-2">
          <span className={memeTextColor}>MEME</span>
          <span className={dleTextColor}> - DLE</span>
        </h1>
      </header>

      {/* Meme Image Hint */}
      <div className="mb-6 sm:mb-8 w-full max-w-sm flex justify-center">
        {targetImage && (
          <img
            src={targetImage}
            alt="Guess this meme"
            className="max-w-full h-24 sm:h-32 md:h-48 object-cover rounded-sm border-none opacity-80"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        )}
      </div>

      {/* Grid Anchor Container */}
      <div className="relative flex flex-col gap-[3px] sm:gap-[6px] w-full items-center perspective-1000">

        {/* Centered "Too Short" Toast inside the Grid */}
        {toast && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 bg-white text-black px-8 py-3 rounded-lg shadow-2xl font-bold text-sm tracking-widest uppercase transition-opacity duration-300">
            {toast}
          </div>
        )}

        {/* Information Dialog Modal */}
        {isInfoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-lg shadow-2xl p-6 relative ${isDarkMode ? "bg-[#333333] text-gray-200 border border-gray-600" : "bg-[#FFF9F9] text-black"}`}>

              {/* Close 'X' Button */}
              <button
                onClick={() => setIsInfoOpen(false)}
                className="absolute top-4 right-4 p-1 rounded hover:bg-black/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Modal Content */}
              <h2 className="text-2xl font-bold tracking-widest mb-4">HOW TO PLAY</h2>

              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                Welcome to <span className="font-bold">MeMe-dle</span>, where your classic game of Wordle meets the chaos of all memes throughout mankind's history.
              </p>
              <p className="text-sm sm:text-base mb-4 leading-relaxed">
                It is not perfect and some of the answers might be confusing, so here are some tips:
              </p>

              <ul className="list-disc pl-5 text-sm sm:text-base flex flex-col gap-2 mb-6">
                <li>The ANSWER might come from how it's commonly known.</li>
                <li>The ANSWER might come from the affiliated person, event, or game.</li>
                <li>The ANSWER CAN BE ON THE FORM OF ACRONYM.</li>
                <li>The ANSWER might come from keywords associated with the image's text, origin, or viral punchline.</li>
              </ul>

              {/* Accept Button */}
              <button
                onClick={() => setIsInfoOpen(false)}
                className={`w-full py-3 font-bold tracking-widest uppercase rounded transition-transform active:scale-95
                ${isDarkMode ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}
              `}
              >
                Let's Go
              </button>
            </div>
          </div>
        )}

        {/* Game Grid w Animation */}
        {guesses.map((guess, rowIndex) => {
          const statuses = getGuessStatuses(guess, targetWord);
          return (
            <div key={rowIndex} className="flex gap-[3px] sm:gap-[6px] justify-center">
              {guess.split("").map((letter, i) => {

                // We define the EXACT hex colors here so we can pass them to the CSS Animation variable
                let finalBgHex = "#D9D9D9";
                if (statuses[i] === "correct") finalBgHex = "#16a34a"; // green-600
                else if (statuses[i] === "present") finalBgHex = isDarkMode ? "#eab308" : "#3b82f6";
                else if (statuses[i] === "absent") finalBgHex = "#4b5563"; // gray-600

                return (
                  <div
                    key={i}
                    className="flex items-center justify-center text-lg sm:text-xl rounded font-bold uppercase w-[30px] h-[30px] sm:w-[62px] sm:h-[62px] animate-flip"
                    style={{
                      "--final-bg": finalBgHex,        // Injects the target color into our CSS file
                      animationDelay: `${i * 0.15}s`, // Each tile waits 0.15s longer than the last!
                    }}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}

        {/* Current Guess Row (with Pop Animation) */}
        {gameStatus === "playing" && guesses.length < MAX_GUESSES && (
          <div className="flex gap-[3px] sm:gap-[6px] justify-center">
            {Array.from({ length: targetWord.length }).map((_, i) => {

              const isLastTypedTile = i === currentGuess.length - 1;

              return (
                <div
                  key={i}
                  onClick={isLastTypedTile ? () => handleInput("BACKSPACE") : undefined}
                  className={`flex items-center justify-center text-lg sm:text-xl rounded font-bold uppercase bg-[#D9D9D9] text-black w-[30px] h-[30px] sm:w-[62px] sm:h-[62px]
                  ${currentGuess[i] ? "animate-pop ring-2 ring-black/30" : ""}
                  ${isLastTypedTile ? "cursor-pointer hover:bg-white/10" : ""}
                `}
                >
                  {currentGuess[i] || ""}
                </div>
              );
            })}
          </div>
        )}

        {/* Render Empty Future Rows */}
        {Array.from({
          length: Math.max(0, MAX_GUESSES - guesses.length - (gameStatus === "playing" ? 1 : 0)),
        }).map((_, rowIndex) => (
          <div key={`empty-${rowIndex}`} className="flex gap-[3px] sm:gap-[6px] justify-center">
            {Array.from({ length: targetWord.length }).map((_, i) => (
              <div
                key={i}
                className="bg-[#D9D9D9] rounded w-[30px] h-[30px] sm:w-[62px] sm:h-[62px]"
              ></div>
            ))}
          </div>
        ))}
      </div>

      {/* Game Over Block */}
      <div
        className={`mt-2 w-full max-w-[260px] sm:max-w-xs h-14 sm:h-16 flex items-center justify-center text-white text-xs sm:text-sm font-bold tracking-wider 
          ${gameStatus === "lost" ? "bg-red-600" : (gameStatus === "won" ? "bg-[#365e1b]" : "opacity-0")}
        `}
      >
        {gameStatus === "won" ? "HUGE W!" : ""}
        {gameStatus === "lost" ? `L. IT WAS "${targetWord}"` : ""}
      </div>

      <div className="mt-6 sm:mt-8 w-full max-w-[260px] sm:max-w-sm flex justify-center items-center gap-3 sm:gap-4">

        {/* Reveal Button */}
        {gameStatus === "playing" && (
          <button
            onClick={() => setGameStatus("lost")}
            className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1
              ${isDarkMode ? "bg-red-900/40 text-red-300 hover:bg-red-800/60" : "bg-red-100 text-red-700 hover:bg-red-200"}
            `}
          >
            {/* Eye Icon */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Reveal
          </button>
        )}

        {/* Reset Button */}
        <button
          onClick={resetGame}
          className={`px-3 py-1.5 text-[10px] sm:text-xs font-bold rounded uppercase tracking-wider transition-all active:scale-95 flex items-center gap-1
            ${isDarkMode ? "bg-gray-700 text-white hover:bg-gray-600" : "bg-white text-black hover:bg-black/20"}
          `}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
          </svg>
          Next Meme
        </button>
      </div>

      {/* On-Screen Keyboard */}
      <div className="mt-4 sm:mt-6 w-full max-w-[500px] flex flex-col gap-[6px] sm:gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-[4px] sm:gap-2">
            {row.map((key) => {
              // Determine Key Color
              let keyBgColor = "bg-[#D9D9D9] text-black";
              if (keyStatuses[key] === "correct") keyBgColor = "bg-green-600 text-white";
              else if (keyStatuses[key] === "present") keyBgColor = isDarkMode ? "bg-yellow-500 text-white" : "bg-blue-500 text-white";
              else if (keyStatuses[key] === "absent") keyBgColor = "bg-gray-600 text-white opacity-60";

              const isActionKey = key === "ENTER" || key === "BACKSPACE";

              return (
                <button
                  key={key}
                  onClick={() => handleInput(key)}
                  className={`
                    ${keyBgColor} 
                    ${isActionKey ? "px-2 sm:px-4 text-[10px] sm:text-xs" : "flex-1 text-sm sm:text-base"} 
                    h-12 sm:h-14 font-bold rounded uppercase flex items-center justify-center 
                    active:scale-95 transition-transform select-none shadow-sm
                  `}
                >
                  {key === "BACKSPACE" ? (
                    // SVG Icon for Backspace looks much cleaner on mobile than the long word
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                    </svg>
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <Analytics />
    </div>
  );
}
