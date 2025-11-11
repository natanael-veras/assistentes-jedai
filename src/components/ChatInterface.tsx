
import React from 'react';
import { getAssistantById } from '@/data/assistants';
import PromptInput from './PromptInput';
import ResponseDisplay from './ResponseDisplay';
import { useChat } from '@/hooks/useChat';
import WelcomeScreen from './chat/WelcomeScreen';

interface ChatInterfaceProps {
  assistantId?: string;
  initialMessages?: any[];
  onMessagesUpdate?: (messages: any[]) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  assistantId,
  initialMessages = [],
  onMessagesUpdate 
}) => {
  const {
    messages,
    isLoading,
    handleSubmit,
    handleStopGeneration,
    handleRegenerateMessage,
    handleResetChat,
    abortController
  } = useChat({
    assistantId,
    initialMessages,
    onMessagesUpdate
  });

  const currentAssistant = assistantId 
    ? getAssistantById(assistantId) 
    : undefined;

  // Add logging to help debug
  console.log('ChatInterface render:', { 
    messagesCount: messages.length, 
    isLoading, 
    assistantId,
    initialMessagesCount: initialMessages?.length || 0 
  });

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-hidden relative">
        <ResponseDisplay 
          messages={messages} 
          loading={isLoading} 
          welcomeComponent={messages.length === 0 ? (
            <WelcomeScreen 
              currentAssistant={currentAssistant}
            />
          ) : undefined}
          onStopGeneration={abortController ? handleStopGeneration : undefined}
          onRegenerateMessage={handleRegenerateMessage}
          onResetChat={handleResetChat}
        />
      </div>
      <div className="w-full bg-background/80 backdrop-blur-sm px-4 pt-2 pb-4 border-t">
        <div className="w-full">
          <PromptInput 
            onSubmit={handleSubmit} 
            isLoading={isLoading} 
            onStopGeneration={abortController ? handleStopGeneration : undefined}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
