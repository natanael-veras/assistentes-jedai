import React, { useEffect, useState } from 'react';
import { useSidebar } from "@/components/ui/sidebar";
import { ConversationHistoryProps, Conversation } from './types';
import ConversationItem from './ConversationItem';
import ConversationHeader from './ConversationHeader';
import { loadConversations, saveConversation, deleteConversation } from './ConversationUtils';
import SidebarAssistantConfig from './SidebarAssistantConfig';
import { Assistant } from '@/data/assistants';

interface ConversationHistoryExtendedProps extends ConversationHistoryProps {
  assistant: Assistant;
  onConfigUpdated?: () => void;
  onOpenConfiguration?: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryExtendedProps> = ({
  assistantId,
  onSelectConversation,
  currentMessages,
  selectedConversationId,
  onNewConversation,
  assistant,
  onConfigUpdated,
  onOpenConfiguration
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Load conversations from localStorage
  useEffect(() => {
    const conversationsData = loadConversations(assistantId);
    setConversations(conversationsData || []);
  }, [assistantId]);

  // Save current conversation when it changes
  useEffect(() => {
    if (currentMessages.length > 0) {
      // Debounce the save operation to avoid excessive writes
      const timeoutId = setTimeout(() => {
        const updatedConversations = saveConversation(assistantId, currentMessages, selectedConversationId);
        setConversations(updatedConversations);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentMessages, assistantId, selectedConversationId]);

  const handleSelectConversation = (conversation: Conversation) => {
    // Pass both conversation id and messages to parent
    onSelectConversation(conversation.id, conversation.messages);
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    const { conversations: updatedConversations, deletedCurrentConversation } = 
      deleteConversation(conversationId, assistantId);
    
    setConversations(updatedConversations);
    
    // If we deleted the current conversation, create a new one
    if (deletedCurrentConversation) {
      onNewConversation();
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
      <ConversationHeader 
        isCollapsed={isCollapsed} 
        onNewConversation={onNewConversation} 
      />
      
      <div className="flex-1 overflow-auto">
        {conversations.length === 0 ? (
          <div className={`px-4 text-sm text-muted-foreground ${isCollapsed ? "hidden" : ""}`}>
            Nenhuma conversa salva.
          </div>
        ) : (
          <div className="space-y-2 px-2">
            {conversations.map(conversation => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversationId === conversation.id}
                isCollapsed={isCollapsed}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
              />
            ))}
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <SidebarAssistantConfig 
          assistant={assistant}
          onConfigUpdated={onConfigUpdated}
          onOpenConfiguration={onOpenConfiguration}
        />
      </div>
    </div>
  );
};

export default ConversationHistory;
