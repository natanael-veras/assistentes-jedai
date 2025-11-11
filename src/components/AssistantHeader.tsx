
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, HelpCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Assistant } from '@/data/assistants';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarTrigger } from '@/components/ui/sidebar';
import ThemeToggle from '@/components/ThemeToggle';
import FeedbackModal from '@/components/FeedbackModal';

interface AssistantHeaderProps {
  assistant: Assistant;
  showHelpButton?: boolean;
  onHelpClick?: () => void;
  onSystemPromptClick?: () => void;
  showSidebarTrigger?: boolean;
  hideNavigationButtons?: boolean;
}

const AssistantHeader: React.FC<AssistantHeaderProps> = ({
  assistant,
  showHelpButton = false,
  onHelpClick,
  onSystemPromptClick,
  showSidebarTrigger = false,
  hideNavigationButtons = false,
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 w-full bg-background/80 backdrop-blur-sm z-[60] border-b">
      <div className="px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {showSidebarTrigger && (
            <SidebarTrigger className="mr-2" />
          )}
          {!hideNavigationButtons && (
            <Button asChild variant="ghost" size="icon" className="mr-1">
              <Link to="/">
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Voltar</span>
              </Link>
            </Button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full flex items-center justify-center bg-primary/10 text-primary">
              <assistant.icon className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-medium tracking-tight">{assistant.title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {!hideNavigationButtons && <ThemeToggle />}
          
          {showHelpButton && onHelpClick && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onHelpClick} data-testid="help-button">
                    <HelpCircle className="h-5 w-5" />
                    <span className="sr-only">Ajuda</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ajuda</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {!hideNavigationButtons && <FeedbackModal />}
          
          {onSystemPromptClick && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={onSystemPromptClick} data-testid="system-prompt-button">
                    <FileText className="h-5 w-5" />
                    <span className="sr-only">Configurar Prompt</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Configurar Prompt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </header>
  );
};

export default AssistantHeader;
