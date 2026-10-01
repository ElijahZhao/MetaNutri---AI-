'use client';
import { useEffect, useState } from 'react';

export default function TypeWriter({
  texts,
  speed = 80,
  delay = 2500,
}: {
  texts: string[];
  speed?: number;
  delay?: number;
}) {
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
    <span className="relative inline-block whitespace-nowrap">
      {/* 不可见的撑宽容器：把全部文案叠放在同一格，容器宽度即最宽文案的真实宽度，
          避免用 em 估算导致中英混排抖动，也不依赖字体加载时机。 */}
      <span aria-hidden="true" className="invisible grid">
        {texts.map((text, index) => (
          <span key={index} className="col-start-1 row-start-1">
            {text}
          </span>
        ))}
      </span>
      <span className="absolute inset-0">
        {displayText}
        <span className="opacity-70 animate-pulse">|</span>
      </span>
    </span>
  );
}
