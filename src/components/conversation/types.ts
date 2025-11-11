
import { Message } from '@/components/ResponseDisplay';
import { Assistant } from '@/data/assistants';

export interface Conversation {
  id: string;
  assistantId: string;
  messages: Message[];
  title: string;
  lastUpdated: string;
}

export interface ConversationHistoryProps {
  assistantId: string;
  onSelectConversation: (conversationId: string, messages: Message[]) => void;
  currentMessages: Message[];
  selectedConversationId: string | null;
  onNewConversation: () => void;
  assistant?: Assistant;
  onConfigUpdated?: () => void;
  onOpenConfiguration?: () => void;
}
