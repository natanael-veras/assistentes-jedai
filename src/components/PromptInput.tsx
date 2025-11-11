
import React, { useState } from 'react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';
import SpeechRecognitionButton from './SpeechRecognitionButton';
import PromptTextarea from './PromptTextarea';
import SubmitButton from './SubmitButton';

interface PromptInputProps {
  onSubmit: (prompt: string) => void;
  isLoading: boolean;
  onStopGeneration?: () => void;
}

const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading, onStopGeneration }) => {
  const [prompt, setPrompt] = useState('');
  const { isListening, interimText, toggleListening, isSpeechRecognitionSupported } = useSpeechRecognition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim());
      setPrompt('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSpeechToggle = () => {
    toggleListening((text: string) => {
      setPrompt(prev => prev ? `${prev} ${text}` : text);
    });
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="relative w-full animate-fade-up px-2"
    >
      <div className="relative flex items-center rounded-lg border bg-background shadow-sm transition-all focus-within:ring-1 focus-within:ring-primary/30">
        <PromptTextarea
          value={prompt}
          onChange={setPrompt}
          onKeyDown={handleKeyDown}
          isLoading={isLoading}
          isListening={isListening}
          interimText={interimText}
        />
        
        <div className="absolute right-1 sm:right-2 flex items-center gap-1">
          <SpeechRecognitionButton
            isListening={isListening}
            isLoading={isLoading}
            onToggle={handleSpeechToggle}
            isSupported={isSpeechRecognitionSupported}
          />
          
          <SubmitButton
            isLoading={isLoading}
            hasContent={prompt.trim().length > 0}
            onStop={onStopGeneration}
          />
        </div>
      </div>
      
      {interimText && (
        <div className="text-xs text-muted-foreground mt-1 px-2">
          Ouvindo: "{interimText}"
        </div>
      )}
    </form>
  );
};

export default PromptInput;
