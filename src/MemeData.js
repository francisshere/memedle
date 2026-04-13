export const memeWords = [
  "DOGE",
  "CHAD",
  "PEPE",
  "TROLL",
  "STONKS",
  "WOJAK",
  "BINGUS",
  "SIGMA",
  "BASED",
  "COPE"
];

export const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * memeWords.length);
  return memeWords[randomIndex];
};