import { useState, useEffect, useMemo } from "react";

export default function TypingText({ onChange }: { onChange?: (text: string) => void }) {
  const words = useMemo(() => ["Chat with my helper about myself!", "Summarize information about Genesis"], []);
  const [displayText, setDisplayText] = useState("");
  const [wordIndex, setWordIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    if (onChange) onChange(displayText);
  }, [displayText, onChange]);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (charIndex < words[wordIndex].length) {
      timeout = setTimeout(() => {
        setDisplayText((prev) => prev + words[wordIndex][charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 80);
    } else {
      timeout = setTimeout(() => {
        setWordIndex((prev) => (prev + 1) % words.length);
        setCharIndex(0);
        setDisplayText("");
      }, 1800);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [charIndex, wordIndex, words]);

  return <span className="sr-only">{displayText || "\u00A0"}</span>;
}
