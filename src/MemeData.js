export const memeData = [
  { word: "DOGE", image: "https://i.imgflip.com/4t0m5.jpg" },
  { word: "CHAD", image: "https://i.imgflip.com/39t1vc.jpg" },
  { word: "STONKS", image: "https://i.imgflip.com/30b1gx.jpg" },
  { word: "ALIENS", image: "https://i.imgflip.com/101217.jpg" }, 
  { word: "ROLL-SAFE", image: "https://i.imgflip.com/1h7in3.jpg" },
  { word: "FINE", image: "https://i.imgflip.com/1bhm.jpg" }
];

export const getRandomWord = () => {
  const randomIndex = Math.floor(Math.random() * memeWords.length);
  return memeWords[randomIndex];
};