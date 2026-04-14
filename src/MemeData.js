export const memeData = [
  { word: "DOGE", image: "https://i.imgflip.com/4t0m5.jpg" },
  { word: "CHAD", image: "https://i.imgflip.com/35bdwf.jpg" },
  { word: "STONKS", image: "https://i.imgflip.com/3388rw.png" },
  { word: "ALIENS", image: "https://imgflip.com/s/meme/Ancient-Aliens.jpg" }, 
  { word: "ROLL-SAFE", image: "https://i.imgflip.com/1h7in3.jpg" },
  { word: "FINE", image: "https://i.imgflip.com/1if1k1.jpg" },
  { word: "DAMN", image: "https://i.imgflip.com/tc08x.jpg" },
  { word: "JUAN", image: "https://i.imgflip.com/4jg4me.jpg" },
  { word: "GREEN", image: "https://i.imgflip.com/8i9nai.png" },
  { word: "BLACKBEARD", image: "https://i.imgflip.com/8o96jr.png" },
  { word: "PEAK", image: "https://i.imgflip.com/ajqaov.png" },
  { word: "FREE", image: "https://i.imgflip.com/8v1jx7.jpg" },
  { word: "THINK", image: "https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExN2g1OWY5djkydXgzMjU3dzA4ajkxbGdwYzBtcWdjenVlNG1nNmxtMyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/CncEX02H3bxf6NjbK4/giphy.gif" },
  { word: "RAGEBAIT", image: "https://i.imgflip.com/9mjcoy.jpg" },
  { word: "BRAINROT", image: "https://i.imgflip.com/9p82jm.jpg" },
  { word: "SKIBIDI", image: "https://i.imgflip.com/7mzkd0.jpg" },
  { word: "AMOGUS", image: "https://i.imgflip.com/525km4.png" },
  { word: "NICHE", image: "https://i.imgflip.com/aduxgk.jpg" },
  { word: "CINEMA", image: "https://i.imgflip.com/8d317n.png" },
  { word: "LISTEN", image: "https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExMDE0cnZqeWNuZ3AwY2M2YW1qY3B3bGE1eG1paXI3dDQ2OGJnazY1aCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/HB0lWJK35iy6U0bBRj/giphy.gif" },
  { word: "SUNSHINE", image: "https://i.imgflip.com/8ke1ej.jpg" },
  { word: "KNOW", image: "https://i.imgflip.com/95y76p.png" },
  { word: "JARVIS", image: "https://i.imgflip.com/9ejgym.jpg" },
  { word: "NYAN", image: "https://i.imgflip.com/atevl.jpg" },
  { word: "DABABY", image: "https://i.imgflip.com/53jvnk.jpg" },
];

export const getRandomMeme = () => {
  const randomIndex = Math.floor(Math.random() * memeData.length);
  return memeData[randomIndex];
};