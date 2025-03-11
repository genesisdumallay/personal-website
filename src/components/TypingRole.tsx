import { useState, useEffect } from "react";

export default function TypingText() {
  const words = ["Aspiring Software Engineer", "Computer Science Student", "This Site is Best Viewed on Desktop!"];
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (charIndex < words[wordIndex].length) {
      const typingTimeout = setTimeout(() => {
        setDisplayText((prev) => prev + words[wordIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 80);

      return () => clearTimeout(typingTimeout);
    } else {
      setTimeout(() => {
        setIsBlinking(true);
      }, 1200);
    }
  }, [charIndex, wordIndex]);

  useEffect(() => {
    if (isBlinking) {
      let blinkCount = 0;
      const blinkInterval = setInterval(() => {
        setOpacity((prev) => (prev === 1 ? 0 : 1));
        blinkCount++;
        if (blinkCount === 4) {
          clearInterval(blinkInterval);
          setTimeout(() => {
            setWordIndex((prev) => (prev + 1) % words.length);
            setCharIndex(0);
            setDisplayText("");
            setIsBlinking(false);
            setOpacity(1);
          }, 500);
        }
      }, 200);

      return () => clearInterval(blinkInterval);
    }
  }, [isBlinking, wordIndex]);

  return (
    <h2
      style={{
        fontWeight: 600,
        fontSize: "clamp(1rem, 5vw, 1rem)",
        marginTop: "clamp(-1.2rem, 5vw, -1.2rem)",
        marginLeft: "clamp(0.5rem, 5vw, 0.5rem)",
        minHeight: "1.3rem",
        transition: "opacity 0.2s ease-in-out",
        opacity: opacity,
      }}
    >
      {displayText || "\u00A0" /* Keeps space when empty */}
    </h2>
  );
}
