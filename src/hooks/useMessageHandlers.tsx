
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { Message } from '@/components/ResponseDisplay';
import { sendPrompt } from '@/utils/api';
import { trackChatInteraction, trackApiError } from '@/utils/analytics';
import { ContextConfig } from '@/utils/contextConfig';
import { useContextOptimizer } from './useContextOptimizer';

interface UseMessageHandlersProps {
  assistantId?: string;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  setIsLoading: (loading: boolean) => void;
  setAbortController: (controller: AbortController | null) => void;
  contextConfig: ContextConfig;
}

export function useMessageHandlers({
  assistantId,
  messages,
  setMessages,
  setIsLoading,
  setAbortController,
  contextConfig
}: UseMessageHandlersProps) {
  const { selectContextMessages } = useContextOptimizer();

  const handleSubmit = async (prompt: string) => {
    trackChatInteraction('message_sent', assistantId);
    
    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      // Otimizar o contexto antes de enviar
      const allMessages = [...messages, userMessage];
      const optimizedContext = selectContextMessages(allMessages, contextConfig);
      
      console.log(`Sending optimized context: ${optimizedContext.length}/${allMessages.length} messages`);
      
      const contextualizedPrompt = assistantId 
        ? `[Assistente: ${assistantId}] ${prompt}`
        : prompt;
        
      const response = await sendPrompt(
        contextualizedPrompt, 
        optimizedContext,
        assistantId, 
        controller.signal
      );
      
      if (response.error) {
        if (response.error !== 'AbortError') {
          toast.error(response.error);
          trackApiError('sendPrompt', response.error);
        }
        return;
      }
      
      let responseContent = '';
      
      if (response.data && response.data.content) {
        responseContent = response.data.content;
      } else if (response.data && response.data.result && response.data.result.content) {
        responseContent = response.data.result.content;
      } else {
        responseContent = JSON.stringify(response.data, null, 2);
        console.log('Resposta completa da API:', response.data);
      }
      
      trackChatInteraction('response_received', assistantId);
      
      const systemMessage: Message = {
        id: uuidv4(),
        role: 'system',
        content: responseContent,
        timestamp: new Date()
      };

      console.log('Adding system message:', systemMessage);
      
      setMessages(prev => [...prev, systemMessage]);
    } catch (error) {
      console.error("Erro ao processar resposta:", error);
      if (error instanceof Error && error.name !== 'AbortError') {
        toast.error("Ocorreu um erro ao processar sua solicitação");
        trackApiError('sendPrompt', error.message);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  };

  const handleRegenerateMessage = (messageId: string) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1 || messages[messageIndex].role !== 'system') return;
    
    const userMessageIndex = messageIndex - 1;
    if (userMessageIndex < 0 || messages[userMessageIndex].role !== 'user') return;
    
    const updatedMessages = [...messages];
    updatedMessages.splice(messageIndex);
    setMessages(updatedMessages);
    
    handleSubmit(messages[userMessageIndex].content);
  };

  const handleResetChat = () => {
    setMessages([]);
    setIsLoading(false);
    setAbortController(null);
    toast.success("Chat limpo! Nova conversa iniciada.");
    trackChatInteraction('chat_reset', assistantId);
    
    // Clear the current conversation ID in localStorage
    if (assistantId) {
      localStorage.removeItem(`currentConversation_${assistantId}`);
    }
  };

  return {
    handleSubmit,
    handleRegenerateMessage,
    handleResetChat
  };
}
