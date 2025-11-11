
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ConversationHeaderProps {
  isCollapsed: boolean;
  onNewConversation: () => void;
}

const ConversationHeader: React.FC<ConversationHeaderProps> = ({ isCollapsed, onNewConversation }) => {
  return (
    <div className={`flex justify-between items-center px-4 mb-4 ${isCollapsed ? "flex-col" : ""}`}>
      <h3 className={`text-md font-medium ${isCollapsed ? "hidden" : ""}`}>Histórico de Conversas</h3>
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 w-8 p-0"
        onClick={onNewConversation}
      >
        <Plus className="h-5 w-5" />
        <span className="sr-only">Nova conversa</span>
      </Button>
    </div>
  );
};

export default ConversationHeader;
