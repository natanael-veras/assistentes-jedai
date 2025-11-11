
import { Message } from '@/components/ResponseDisplay';
import { ContextConfig } from '@/utils/contextConfig';

function truncateMessage(content: string, maxChars: number): string {
  if (content.length <= maxChars) return content;
  
  return content.substring(0, maxChars - 3) + '...';
}

export function useContextOptimizer() {
  const selectContextMessages = (messages: Message[], config: ContextConfig): Message[] => {
    if (messages.length === 0 || !config.enableOptimization) return messages;
    
    // Sempre manter as mensagens mais recentes
    const recentMessages = messages.slice(-config.preserveRecentMessages);
    
    // Se temos poucas mensagens, retorna todas (truncadas se necessário)
    if (messages.length <= config.maxMessages) {
      return recentMessages.map(msg => ({
        ...msg,
        content: truncateMessage(msg.content, config.maxCharsPerMessage)
      }));
    }
    
    // Para históricos grandes, usar estratégia de amostragem
    const selectedMessages: Message[] = [];
    let totalChars = 0;
    
    // Adicionar mensagens recentes primeiro
    for (let i = recentMessages.length - 1; i >= 0; i--) {
      const msg = recentMessages[i];
      const truncatedContent = truncateMessage(msg.content, config.maxCharsPerMessage);
      const messageChars = truncatedContent.length;
      
      if (totalChars + messageChars <= config.maxTotalChars) {
        selectedMessages.unshift({
          ...msg,
          content: truncatedContent
        });
        totalChars += messageChars;
      } else {
        break;
      }
    }
    
    // Se ainda temos espaço, adicionar algumas mensagens mais antigas (estratégicamente)
    if (selectedMessages.length < config.maxMessages && totalChars < config.maxTotalChars) {
      const remainingMessages = messages.slice(0, -config.preserveRecentMessages);
      
      // Selecionar mensagens antigas em intervalos (cada 3ª mensagem, por exemplo)
      for (let i = remainingMessages.length - 1; i >= 0; i -= 3) {
        const msg = remainingMessages[i];
        const truncatedContent = truncateMessage(msg.content, config.maxCharsPerMessage / 2);
        const messageChars = truncatedContent.length;
        
        if (totalChars + messageChars <= config.maxTotalChars && selectedMessages.length < config.maxMessages) {
          selectedMessages.unshift({
            ...msg,
            content: truncatedContent
          });
          totalChars += messageChars;
        } else {
          break;
        }
      }
    }
    
    console.log(`Context optimization: ${messages.length} messages → ${selectedMessages.length} messages, ~${totalChars} chars`);
    
    return selectedMessages;
  };

  return { selectContextMessages };
}
