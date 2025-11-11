
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Add a custom CSS class for the typing cursor animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = `
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    .typing-cursor {
      display: inline-block;
      width: 2px;
      animation: blink 1s infinite;
      margin-left: 2px;
    }
  `;
  document.head.appendChild(style);
}
