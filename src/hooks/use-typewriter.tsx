import { useState, useEffect } from 'react';

interface TypewriterOptions {
  words: string[];
  loop?: boolean;
  typeSpeed?: number;
  deleteSpeed?: number;
  delaySpeed?: number;
}

export const useTypewriter = ({
  words = [],
  loop = false,
  typeSpeed = 50,
  deleteSpeed = 30,
  delaySpeed = 1500
}: TypewriterOptions) => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const [speed, setSpeed] = useState(typeSpeed);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (words.length === 0) return;

    const handleTyping = () => {
      const currentWord = words[wordIndex];
      
      setSpeed(isDeleting ? deleteSpeed : typeSpeed);

      if (!isDeleting && text === currentWord) {
        setTimeout(() => setIsDeleting(true), delaySpeed);
        return;
      }

      if (isDeleting && text === '') {
        setIsDeleting(false);
        setWordIndex((prev) => {
          if (prev === words.length - 1) {
            return loop ? 0 : prev;
          }
          return prev + 1;
        });
        return;
      }

      setText(prev => {
        if (isDeleting) {
          return prev.substring(0, prev.length - 1);
        } else {
          return currentWord.substring(0, prev.length + 1);
        }
      });
    };

    timeout = setTimeout(handleTyping, speed);

    return () => clearTimeout(timeout);
  }, [words, text, isDeleting, wordIndex, typeSpeed, deleteSpeed, delaySpeed, loop, speed]);

  return { text, isTyping: true };
};
