
import { useState, useEffect } from 'react';
import { Message } from '@/components/ResponseDisplay';
import { ContextConfig, getContextConfig, loadContextConfig } from '@/utils/contextConfig';

interface UseChatStateProps {
  assistantId?: string;
  initialMessages?: Message[];
  onMessagesUpdate?: (messages: Message[]) => void;
}

export function useChatState({ assistantId, initialMessages = [], onMessagesUpdate }: UseChatStateProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const [contextConfig, setContextConfig] = useState<ContextConfig>(() => {
    const userConfig = loadContextConfig();
    const assistantConfig = getContextConfig(assistantId);
    return { ...assistantConfig, ...userConfig };
  });

  // Initialize messages from initialMessages prop
  useEffect(() => {
    if (initialMessages && initialMessages.length > 0) {
      console.log('Setting initial messages:', initialMessages);
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // Notify parent component when messages change
  useEffect(() => {
    if (onMessagesUpdate) {
      console.log('Notifying parent of message update:', messages);
      onMessagesUpdate(messages);
    }
  }, [messages, onMessagesUpdate]);

  return {
    messages,
    setMessages,
    isLoading,
    setIsLoading,
    abortController,
    setAbortController,
    contextConfig,
    setContextConfig
  };
}
