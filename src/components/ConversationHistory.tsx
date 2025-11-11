
import React, { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Trash2, Plus } from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { Button } from '@/components/ui/button';
import { Message } from './ResponseDisplay';
import { useSidebar } from "@/components/ui/sidebar";

export interface Conversation {
  id: string;
  assistantId: string;
  messages: Message[];
  title: string;
  lastUpdated: string;
}

interface ConversationHistoryProps {
  assistantId: string;
  onSelectConversation: (conversationId: string, messages: Message[]) => void;
  currentMessages: Message[];
  selectedConversationId: string | null;
  onNewConversation: () => void;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  assistantId,
  onSelectConversation,
  currentMessages,
  selectedConversationId,
  onNewConversation
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  // Load conversations from localStorage
  useEffect(() => {
    const loadConversations = () => {
      try {
        const savedConversations = localStorage.getItem('assistantConversations');
        if (savedConversations) {
          const parsedConversations: Conversation[] = JSON.parse(savedConversations);
          // Filter conversations for this assistant and sort by lastUpdated (newest first)
          const filteredConversations = parsedConversations
            .filter(conv => conv.assistantId === assistantId)
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
            .slice(0, 5); // Get only the 5 most recent
          
          setConversations(filteredConversations);
        }
      } catch (error) {
        console.error('Error loading conversations from localStorage:', error);
      }
    };

    loadConversations();
  }, [assistantId]);

  // Save current conversation when it changes
  useEffect(() => {
    if (currentMessages.length > 0) {
      const saveCurrentConversation = () => {
        try {
          // Get existing conversations
          const savedConversations = localStorage.getItem('assistantConversations');
          let allConversations: Conversation[] = savedConversations 
            ? JSON.parse(savedConversations) 
            : [];
          
          // Generate a title based on the first user message
          const firstUserMessage = currentMessages.find(m => m.role === 'user');
          const title = firstUserMessage 
            ? firstUserMessage.content.slice(0, 30) + (firstUserMessage.content.length > 30 ? '...' : '')
            : 'Nova conversa';
          
          // Check if we have a current conversation ID in localStorage for this assistant
          const currentConvId = selectedConversationId || localStorage.getItem(`currentConversation_${assistantId}`);
          
          if (currentConvId) {
            // Update existing conversation
            const existingIndex = allConversations.findIndex(conv => conv.id === currentConvId);
            
            if (existingIndex !== -1) {
              allConversations[existingIndex] = {
                ...allConversations[existingIndex],
                messages: currentMessages,
                lastUpdated: new Date().toISOString(),
                title
              };
            } else {
              // If conversation ID exists in localStorage but not in the array, create new
              const newConvId = Date.now().toString();
              localStorage.setItem(`currentConversation_${assistantId}`, newConvId);
              
              allConversations.push({
                id: newConvId,
                assistantId,
                messages: currentMessages,
                title,
                lastUpdated: new Date().toISOString()
              });
            }
          } else {
            // Create new conversation
            const newConvId = Date.now().toString();
            localStorage.setItem(`currentConversation_${assistantId}`, newConvId);
            
            allConversations.push({
              id: newConvId,
              assistantId,
              messages: currentMessages,
              title,
              lastUpdated: new Date().toISOString()
            });
          }
          
          // Save all conversations
          localStorage.setItem('assistantConversations', JSON.stringify(allConversations));
          
          // Update state with filtered conversations
          const filteredConversations = allConversations
            .filter(conv => conv.assistantId === assistantId)
            .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
            .slice(0, 5);
          
          setConversations(filteredConversations);
        } catch (error) {
          console.error('Error saving conversation to localStorage:', error);
        }
      };
      
      // Debounce the save operation to avoid excessive writes
      const timeoutId = setTimeout(saveCurrentConversation, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [currentMessages, assistantId, selectedConversationId]);

  const handleSelectConversation = (conversation: Conversation) => {
    // Pass both conversation id and messages to parent
    onSelectConversation(conversation.id, conversation.messages);
  };

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    
    try {
      // Get all conversations
      const savedConversations = localStorage.getItem('assistantConversations');
      if (savedConversations) {
        let allConversations: Conversation[] = JSON.parse(savedConversations);
        
        // Remove the conversation
        allConversations = allConversations.filter(conv => conv.id !== conversationId);
        
        // Save back to localStorage
        localStorage.setItem('assistantConversations', JSON.stringify(allConversations));
        
        // If we deleted the current conversation, create a new one
        const currentConvId = localStorage.getItem(`currentConversation_${assistantId}`);
        if (currentConvId === conversationId) {
          // Signal to the parent that we need a new conversation
          onNewConversation();
        }
        
        // Update state
        const filteredConversations = allConversations
          .filter(conv => conv.assistantId === assistantId)
          .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
          .slice(0, 5);
        
        setConversations(filteredConversations);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };

  return (
    <div className="flex flex-col w-full h-full">
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
      
      {conversations.length === 0 ? (
        <div className={`px-4 text-sm text-muted-foreground ${isCollapsed ? "hidden" : ""}`}>
          Nenhuma conversa salva.
        </div>
      ) : (
        <div className="space-y-2 px-2">
          {conversations.map(conversation => (
            <div
              key={conversation.id}
              onClick={() => handleSelectConversation(conversation)}
              className={`flex items-start p-2 rounded-lg cursor-pointer group
                ${selectedConversationId === conversation.id ? 'bg-muted' : 'hover:bg-muted/50'}
                ${isCollapsed ? "justify-center" : ""}`}
            >
              <div className={`${isCollapsed ? "" : "mr-3 mt-0.5"}`}>
                <MessageSquare className={`h-5 w-5 ${selectedConversationId === conversation.id ? 'text-primary' : 'text-muted-foreground'}`} />
              </div>
              <div className={`flex-1 min-w-0 ${isCollapsed ? "hidden" : ""}`}>
                <div className={`text-sm font-medium truncate ${selectedConversationId === conversation.id ? 'text-primary' : ''}`}>
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
                      onClick={(e) => handleDeleteConversation(e, conversation.id)}
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
          ))}
        </div>
      )}
    </div>
  );
};

export default ConversationHistory;
