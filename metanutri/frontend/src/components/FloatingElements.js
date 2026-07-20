import { useEffect, useState } from 'react';

export default function FloatingElements() {
  const [elements, setElements] = useState([]);

  useEffect(() => {
    const generateElements = () => {
      const newElements = [];
      for (let i = 0; i < 8; i++) {
        newElements.push({
          id: i,
          size: Math.random() * 60 + 20,
          top: Math.random() * 100,
          left: Math.random() * 100,
          delay: Math.random() * 5,
          duration: Math.random() * 10 + 10,
          shape: ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)],
          color: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4'][Math.floor(Math.random() * 4)],
          opacity: Math.random() * 0.5 + 0.1
        });
      }
      setElements(newElements);
    };

    generateElements();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute animate-float"
          style={{
            width: el.size,
            height: el.size,
            top: `${el.top}%`,
            left: `${el.left}%`,
            backgroundColor: el.color,
            borderRadius: el.shape === 'circle' ? '50%' : el.shape === 'square' ? '8px' : '0',
            opacity: el.opacity,
            animationDelay: `${el.delay}s`,
            animationDuration: `${el.duration}s`,
            clipPath: el.shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
          }}
        />
      ))}
    </div>
  );
}