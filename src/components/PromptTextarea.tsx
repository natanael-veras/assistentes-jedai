
import React, { useRef, useEffect } from 'react';

interface PromptTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  isListening: boolean;
  interimText: string;
}

const PromptTextarea: React.FC<PromptTextareaProps> = ({
  value,
  onChange,
  onKeyDown,
  isLoading,
  isListening,
  interimText
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 200);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  const displayText = value + (interimText ? ` ${interimText}` : '');

  const getPlaceholder = () => {
    if (isListening) {
      return "O seu microfone está ativo, pode falar...";
    }
    return "Digite sua mensagem ou use o microfone...";
  };

  return (
    <textarea
      ref={textareaRef}
      value={displayText}
      onChange={(e) => {
        if (!interimText) {
          onChange(e.target.value);
        }
      }}
      onKeyDown={onKeyDown}
      placeholder={getPlaceholder()}
      rows={1}
      disabled={isLoading}
      className={`w-full resize-none bg-transparent px-3 py-2 sm:px-4 sm:py-3 text-base outline-none placeholder:text-muted-foreground/70 disabled:opacity-70 pr-20 sm:pr-24 ${
        interimText ? 'text-muted-foreground/80' : ''
      } ${isListening ? 'placeholder:text-border placeholder:font-medium' : ''}`}
    />
  );
};

export default PromptTextarea;
