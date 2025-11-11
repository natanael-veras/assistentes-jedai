
import React from 'react';
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SpeechRecognitionButtonProps {
  isListening: boolean;
  isLoading: boolean;
  onToggle: () => void;
  isSupported: boolean;
}

const SpeechRecognitionButton: React.FC<SpeechRecognitionButtonProps> = ({
  isListening,
  isLoading,
  onToggle,
  isSupported
}) => {
  if (!isSupported) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25' 
                : 'hover:bg-accent'
            } ${isListening ? 'animate-pulse' : ''}`}
            onClick={onToggle}
            disabled={isLoading}
          >
            {isListening ? (
              <MicOff className="h-4 w-4 sm:h-5 sm:w-5" />
            ) : (
              <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
            )}
            <span className="sr-only">
              {isListening ? "Parar ditado" : "Iniciar ditado"}
            </span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isListening ? "Parar Ditado (Falando...)" : "Iniciar Ditado por Voz"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SpeechRecognitionButton;
