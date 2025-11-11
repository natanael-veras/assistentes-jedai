
import React from 'react';
import { Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PromptHistoryItem } from "@/services/promptHistoryService";
import { toast } from "sonner";

interface PromptHistoryProps {
  promptHistory: PromptHistoryItem[];
  historyOpen: boolean;
  setHistoryOpen: (open: boolean) => void;
  applyHistoryPrompt: (prompt: string) => void;
  onDeletePrompt?: (timestamp: number) => void;
}

const PromptHistory: React.FC<PromptHistoryProps> = ({ 
  promptHistory, 
  historyOpen, 
  setHistoryOpen, 
  applyHistoryPrompt,
  onDeletePrompt 
}) => {
  const formatDate = (timestamp: number) => {
    try {
      return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(timestamp));
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Data inválida";
    }
  };

  const handleDelete = (e: React.MouseEvent, timestamp: number) => {
    e.stopPropagation();
    if (onDeletePrompt) {
      onDeletePrompt(timestamp);
      toast.success("Prompt removido do histórico");
    }
  };

  // Safety check to prevent rendering issues
  if (!Array.isArray(promptHistory) || promptHistory.length === 0) {
    return null;
  }

  return (
    <Popover open={historyOpen} onOpenChange={setHistoryOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 gap-1.5 text-xs"
        >
          <Clock className="w-3.5 h-3.5" />
          Histórico
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="px-4 py-2 border-b">
          <h4 className="text-sm font-medium">Prompts Recentes</h4>
          <p className="text-xs text-muted-foreground">
            Selecione um prompt para reutilizar
          </p>
        </div>
        <ScrollArea className="max-h-[300px]">
          <div className="py-2">
            {promptHistory.map((item, index) => (
              <div
                key={index}
                className="group flex items-start gap-2 px-4 py-2 hover:bg-secondary border-b border-border/50 last:border-0"
              >
                <button
                  className="flex-1 text-left flex flex-col gap-1"
                  onClick={() => applyHistoryPrompt(item.prompt)}
                  type="button"
                >
                  <div className="text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </div>
                  <div className="text-sm line-clamp-2">{item.prompt}</div>
                </button>
                {onDeletePrompt && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-destructive hover:text-destructive"
                    onClick={(e) => handleDelete(e, item.timestamp)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default PromptHistory;
