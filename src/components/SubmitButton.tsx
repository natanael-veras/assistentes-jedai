
import React from 'react';
import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface SubmitButtonProps {
  isLoading: boolean;
  hasContent: boolean;
  onSubmit?: () => void;
  onStop?: () => void;
}

const SubmitButton: React.FC<SubmitButtonProps> = ({
  isLoading,
  hasContent,
  onSubmit,
  onStop
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            type={isLoading ? "button" : "submit"} 
            size="icon" 
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full transition-all" 
            disabled={!isLoading && !hasContent}
            onClick={isLoading ? onStop : onSubmit}
          >
            {isLoading ? <Square className="h-4 w-4 sm:h-5 sm:w-5" /> : <Send className="h-4 w-4 sm:h-5 sm:w-5" />}
            <span className="sr-only">{isLoading ? "Parar" : "Enviar"}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isLoading ? "Parar Geração" : "Enviar Mensagem"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SubmitButton;
