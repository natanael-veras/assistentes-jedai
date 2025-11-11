
import { Conversation } from './types';
import { Message } from '../ResponseDisplay';

export const loadConversations = (assistantId: string): Conversation[] => {
  try {
    const savedConversations = localStorage.getItem('assistantConversations');
    if (savedConversations) {
      const parsedConversations: Conversation[] = JSON.parse(savedConversations);
      // Filter conversations for this assistant and sort by lastUpdated (newest first)
      return parsedConversations
        .filter(conv => conv.assistantId === assistantId)
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        .slice(0, 5); // Get only the 5 most recent
    }
  } catch (error) {
    console.error('Error loading conversations from localStorage:', error);
  }
  return [];
};

export const saveConversation = (
  assistantId: string, 
  currentMessages: Message[], 
  selectedConversationId: string | null
): Conversation[] => {
  try {
    if (currentMessages.length === 0) return [];

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
    
    // Return filtered conversations for this assistant
    return allConversations
      .filter(conv => conv.assistantId === assistantId)
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
      .slice(0, 5);
  } catch (error) {
    console.error('Error saving conversation to localStorage:', error);
    return [];
  }
};

export const deleteConversation = (
  conversationId: string,
  assistantId: string
): { conversations: Conversation[], deletedCurrentConversation: boolean } => {
  try {
    // Get all conversations
    const savedConversations = localStorage.getItem('assistantConversations');
    if (!savedConversations) {
      return { conversations: [], deletedCurrentConversation: false };
    }
    
    let allConversations: Conversation[] = JSON.parse(savedConversations);
    
    // Remove the conversation
    allConversations = allConversations.filter(conv => conv.id !== conversationId);
    
    // Save back to localStorage
    localStorage.setItem('assistantConversations', JSON.stringify(allConversations));
    
    // Check if we deleted the current conversation
    const currentConvId = localStorage.getItem(`currentConversation_${assistantId}`);
    const deletedCurrentConversation = currentConvId === conversationId;
    
    // Return filtered conversations for this assistant
    return {
      conversations: allConversations
        .filter(conv => conv.assistantId === assistantId)
        .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
        .slice(0, 5),
      deletedCurrentConversation
    };
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return { conversations: [], deletedCurrentConversation: false };
  }
};
