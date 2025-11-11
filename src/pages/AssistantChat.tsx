import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Assistant, assistants } from '@/data/assistants';
import AssistantHeader from '@/components/AssistantHeader';
import AssistantContent from '@/components/AssistantContent';
import { Message } from '@/components/ResponseDisplay';
import { ConversationHistory, ConfigurationPanel } from '@/components/conversation';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarContent, 
  SidebarInset 
} from '@/components/ui/sidebar';

export default function AssistantChat() {
  const { id } = useParams<{ id: string }>();
  const assistantId = id || 'tech-doc'; // Usa tech-doc como padrão
  const [assistant, setAssistant] = useState<Assistant | undefined>(undefined);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [configUpdateKey, setConfigUpdateKey] = useState(0);
  const [configurationOpen, setConfigurationOpen] = useState(false);

  useEffect(() => {
    const foundAssistant = assistants.find(a => a.id === assistantId);
    setAssistant(foundAssistant);
    
    // When assistant changes, check for a current conversation
    const currentConvId = localStorage.getItem(`currentConversation_${assistantId}`);
    
    console.log(`Loading conversation for assistant ${assistantId}, current conversation ID: ${currentConvId}`);
    
    if (currentConvId) {
      setSelectedConversationId(currentConvId);
      try {
        const savedConversations = localStorage.getItem('assistantConversations');
        if (savedConversations) {
          const allConversations = JSON.parse(savedConversations);
          const currentConversation = allConversations.find((conv: any) => conv.id === currentConvId);
          if (currentConversation) {
            console.log('Found current conversation:', currentConversation);
            // Parse date strings back to Date objects
            const parsedMessages = currentConversation.messages.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp)
            }));
            setCurrentMessages(parsedMessages);
          } else {
            // If conversation not found, reset the current conversation
            console.log('Conversation not found, resetting');
            localStorage.removeItem(`currentConversation_${assistantId}`);
            setSelectedConversationId(null);
            setCurrentMessages([]);
          }
        }
      } catch (error) {
        console.error('Error loading current conversation:', error);
        setCurrentMessages([]);
      }
    } else {
      // No current conversation, start with empty messages
      console.log('No current conversation, starting fresh');
      setCurrentMessages([]);
    }
  }, [assistantId]);

  const handleSelectConversation = (conversationId: string, messages: Message[]) => {
    console.log(`Selecting conversation: ${conversationId} with ${messages.length} messages`);
    
    // Set both the conversation ID and messages simultaneously to avoid flickering
    setSelectedConversationId(conversationId);
    
    // Parse date strings back to Date objects if needed
    const parsedMessages = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp)
    }));
    setCurrentMessages(parsedMessages);
    
    // Also update localStorage to remember this selection
    if (assistantId) {
      localStorage.setItem(`currentConversation_${assistantId}`, conversationId);
    }
  };

  const handleMessagesUpdate = (messages: Message[]) => {
    console.log(`Messages updated, count: ${messages.length}`);
    setCurrentMessages(messages);
  };

  const handleNewConversation = () => {
    console.log('Starting new conversation');
    // Clear current conversation ID and messages
    if (assistantId) {
      localStorage.removeItem(`currentConversation_${assistantId}`);
    }
    setSelectedConversationId(null);
    setCurrentMessages([]);
  };

  const handleConfigUpdated = () => {
    // Force re-render of AssistantContent by updating a key
    setConfigUpdateKey(prev => prev + 1);
  };

  const handleOpenConfiguration = () => {
    setConfigurationOpen(true);
  };

  const handleCloseConfiguration = () => {
    setConfigurationOpen(false);
  };

  if (!assistant) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <h2 className="mb-4 text-xl">Assistente não encontrado</h2>
      </div>
    );
  }

  const isTechDoc = assistant.id === 'tech-doc';

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex w-full min-h-screen">
        {/* Sidebar - Primeira coluna (oculta para tech-doc) */}
        {!isTechDoc && (
          <Sidebar variant="inset" collapsible="icon">
            <SidebarContent className="pt-16 md:pt-16">
              <ConversationHistory 
                assistantId={assistant.id} 
                onSelectConversation={handleSelectConversation}
                currentMessages={currentMessages}
                selectedConversationId={selectedConversationId}
                onNewConversation={handleNewConversation}
                assistant={assistant}
                onConfigUpdated={handleConfigUpdated}
                onOpenConfiguration={handleOpenConfiguration}
              />
            </SidebarContent>
          </Sidebar>
        )}

        {/* Configuration Panel - Segunda coluna (sempre aberta para tech-doc) */}
        {(configurationOpen || isTechDoc) && (
          <div className="w-96 flex-shrink-0">
            <ConfigurationPanel
              assistant={assistant}
              onClose={handleCloseConfiguration}
              onConfigUpdated={handleConfigUpdated}
              hideCloseButton={isTechDoc}
            />
          </div>
        )}
        
        {/* Main Content - Terceira coluna */}
        <SidebarInset className={`pt-20 ${configurationOpen || isTechDoc ? 'flex-1' : ''}`}>
          <AssistantHeader
            assistant={assistant}
            showHelpButton={false}
            onHelpClick={() => {}}
            showSidebarTrigger={!isTechDoc}
            hideNavigationButtons={isTechDoc}
          />
          
          <main className="flex-1 w-full max-w-screen-xl mx-auto pb-6 px-4 sm:px-6">
            <AssistantContent
              assistantId={assistant.id}
              isProductOwner={false}
              isDocumentation={false}
              isDeveloper={false}
              isTechDoc={isTechDoc}
              initialMessages={currentMessages}
              onMessagesUpdate={handleMessagesUpdate}
              key={`${selectedConversationId || 'new-conversation'}-${configUpdateKey}`}
            />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
