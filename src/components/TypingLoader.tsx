
import React from "react";

const TypingLoader: React.FC = () => {
  return (
    <div
      className="flex items-center gap-2 text-sm text-muted-foreground"
      aria-label="Aguardando resposta do assistente"
      role="status"
    >
      <span className="flex space-x-0.5">
        <span className="block w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce-fast" style={{ animationDelay: "0s" }} />
        <span className="block w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce-fast" style={{ animationDelay: "0.1s" }} />
        <span className="block w-1.5 h-1.5 rounded-full bg-muted-foreground animate-bounce-fast" style={{ animationDelay: "0.2s" }} />
      </span>
      <style>
        {`
        @keyframes bounce-fast {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-8px);}
        }
        .animate-bounce-fast { animation: bounce-fast 1s infinite; }
        `}
      </style>
    </div>
  );
};

export default TypingLoader;
