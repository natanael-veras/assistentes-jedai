
import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Conversation } from './types';

interface ConversationItemProps {
  conversation: Conversation;
  isSelected: boolean;
  isCollapsed: boolean;
  onSelect: (conversation: Conversation) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({
  conversation,
  isSelected,
  isCollapsed,
  onSelect,
  onDelete
}) => {
  return (
    <div
      onClick={() => onSelect(conversation)}
      className={`flex items-start p-2 rounded-lg cursor-pointer group
        ${isSelected ? 'bg-muted' : 'hover:bg-muted/50'}
        ${isCollapsed ? "justify-center" : ""}`}
    >
      <div className={`${isCollapsed ? "" : "mr-3 mt-0.5"}`}>
        <MessageSquare className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
      </div>
      <div className={`flex-1 min-w-0 ${isCollapsed ? "hidden" : ""}`}>
        <div className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
          {conversation.title}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(conversation.lastUpdated), { addSuffix: true })}
        </div>
      </div>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity ${isCollapsed ? "hidden" : ""}`}
              onClick={(e) => onDelete(e, conversation.id)}
            >
              <Trash2 className="h-4 w-4" />
              <span className="sr-only">Remover conversa</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Remover conversa</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ConversationItem;
