"use client";
import { useEffect, useState } from 'react';

export default function TypeWriter({ texts, speed = 100, delay = 2000 }) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentText = texts[currentTextIndex];
    
    const type = () => {
      if (!isDeleting) {
        if (displayText.length < currentText.length) {
          setDisplayText(currentText.substring(0, displayText.length + 1));
          setTimeout(type, speed);
        } else {
          setTimeout(() => setIsDeleting(true), delay);
        }
      } else {
        if (displayText.length > 0) {
          setDisplayText(currentText.substring(0, displayText.length - 1));
          setTimeout(type, speed / 2);
        } else {
          setIsDeleting(false);
          setCurrentTextIndex((prev) => (prev + 1) % texts.length);
        }
      }
    };

    const timeout = setTimeout(type, isDeleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex, texts, speed, delay]);

  return (
    <span className="inline-block">
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}