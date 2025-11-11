
import { useEffect } from 'react';
import { toast } from 'sonner';
import { Message } from '@/components/ResponseDisplay';
import { trackChatInteraction } from '@/utils/analytics';
import { useChatState } from './useChatState';
import { useMessageHandlers } from './useMessageHandlers';

interface UseChatProps {
  assistantId?: string;
  initialMessages?: Message[];
  onMessagesUpdate?: (messages: Message[]) => void;
}

export function useChat({ assistantId, initialMessages = [], onMessagesUpdate }: UseChatProps) {
  const {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    abortController,
    setAbortController,
    contextConfig,
    setContextConfig
  } = useChatState({ assistantId, initialMessages, onMessagesUpdate });

  const {
    handleSubmit,
    handleRegenerateMessage,
    handleResetChat
  } = useMessageHandlers({
    assistantId,
    messages,
    setMessages,
    setIsLoading,
    setAbortController,
    contextConfig
  });

  // Handle external messages
  useEffect(() => {
    const handleExternalMessage = (event: CustomEvent<{ content: string }>) => {
      handleSubmit(event.detail.content);
    };

    window.addEventListener('add-user-message', handleExternalMessage as EventListener);

    return () => {
      window.removeEventListener('add-user-message', handleExternalMessage as EventListener);
    };
  }, [handleSubmit]);

  const handleStopGeneration = () => {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
      setAbortController(null);
      toast.info("Geração interrompida");
      trackChatInteraction('generation_stopped', assistantId);
    }
  };

  return {
    messages,
    isLoading,
    handleSubmit,
    handleStopGeneration,
    handleRegenerateMessage,
    handleResetChat,
    abortController: Boolean(abortController),
    contextConfig,
    setContextConfig
  };
}
