
import React from 'react';
import { MessageCircle, FileText, Search, FilePen, Github } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ChatInterface from './ChatInterface';
import RequirementsForm from './RequirementsForm';
import MarketResearchForm from './MarketResearchForm';
import DocumentationForm from './DocumentationForm';
import GitHubDocForm from './GitHubDocForm';
import { Message } from './ResponseDisplay';
import { getAssistantById } from '@/data/assistants';

interface AssistantContentProps {
  assistantId: string;
  isProductOwner: boolean;
  isDocumentation: boolean;
  isDeveloper: boolean;
  isTechDoc: boolean;
  initialMessages?: Message[];
  onMessagesUpdate?: (messages: Message[]) => void;
  key?: string;
}

const AssistantContent: React.FC<AssistantContentProps> = ({
  assistantId,
  isProductOwner,
  isDocumentation,
  isDeveloper,
  isTechDoc,
  initialMessages = [],
  onMessagesUpdate,
}) => {
  const assistant = getAssistantById(assistantId);
  const chatContainerClass = "flex flex-col h-[calc(100vh-6rem)]";
  const chatContentClass = "h-full rounded-xl border bg-card/30 backdrop-blur-sm shadow-sm";

  if (!assistant) {
    return <div>Assistente não encontrado</div>;
  }

  if (isProductOwner) {
    return (
      <div className={chatContainerClass}>
        <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
          <TabsList className="mx-auto mb-2 w-full grid grid-cols-3 p-1 rounded-t-xl border-b-0">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="truncate">Assistente</span>
            </TabsTrigger>
            <TabsTrigger value="requirements" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="truncate">Gerar Requisitos</span>
            </TabsTrigger>
            <TabsTrigger value="market" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span className="truncate">Pesquisa de Mercado</span>
            </TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="mt-0 h-full">
              <div className={chatContentClass}>
                <ChatInterface 
                  assistantId={assistantId} 
                  initialMessages={initialMessages}
                  onMessagesUpdate={onMessagesUpdate}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="requirements" className="mt-0 h-full">
              <div className={chatContentClass + " p-4 sm:p-6 overflow-y-auto h-full"}>
                <RequirementsForm assistantId={assistantId} />
              </div>
            </TabsContent>
            
            <TabsContent value="market" className="mt-0 h-full">
              <div className={chatContentClass + " p-4 sm:p-6 overflow-y-auto h-full"}>
                <MarketResearchForm assistantId={assistantId} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  if (isDocumentation) {
    return (
      <div className={chatContainerClass}>
        <Tabs defaultValue="chat" className="w-full h-full flex flex-col">
          <TabsList className="mx-auto mb-2 w-full grid grid-cols-2 p-1 rounded-t-xl border-b-0">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="truncate">Assistente</span>
            </TabsTrigger>
            <TabsTrigger value="generate-docs" className="flex items-center gap-2">
              <FilePen className="h-4 w-4" />
              <span className="truncate">Gerar Documentação</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="chat" className="mt-0 h-full">
              <div className={chatContentClass}>
                <ChatInterface 
                  assistantId={assistantId} 
                  initialMessages={initialMessages}
                  onMessagesUpdate={onMessagesUpdate}
                />
              </div>
            </TabsContent>
            <TabsContent value="generate-docs" className="mt-0 h-full">
              <div className={chatContentClass + " p-4 sm:p-6 overflow-y-auto h-full"}>
                <DocumentationForm assistantId={assistantId} />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  if (isTechDoc) {
    return (
      <div className={chatContainerClass}>
        <Tabs defaultValue="github-doc" className="w-full h-full flex flex-col">
          <TabsList className="mx-auto mb-2 w-full grid grid-cols-2 p-1 rounded-t-xl border-b-0">
            <TabsTrigger value="github-doc" className="flex items-center gap-2">
              <Github className="h-4 w-4" />
              <span className="truncate">GitHub → Documentação</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span className="truncate">Inserir trecho de código</span>
            </TabsTrigger>
          </TabsList>
          <div className="flex-1 overflow-hidden">
            <TabsContent value="github-doc" className="mt-0 h-full">
              <div className={chatContentClass + " p-4 sm:p-6 overflow-y-auto h-full"}>
                <GitHubDocForm assistantId={assistantId} />
              </div>
            </TabsContent>
            <TabsContent value="chat" className="mt-0 h-full">
              <div className={chatContentClass}>
                <ChatInterface 
                  assistantId={assistantId} 
                  initialMessages={initialMessages}
                  onMessagesUpdate={onMessagesUpdate}
                />
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    );
  }

  if (isDeveloper) {
    return (
      <div className={chatContainerClass}>
        <div className={chatContentClass}>
          <ChatInterface 
            assistantId={assistantId} 
            initialMessages={initialMessages}
            onMessagesUpdate={onMessagesUpdate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={chatContainerClass}>
      <div className={chatContentClass}>
        <ChatInterface 
          assistantId={assistantId} 
          initialMessages={initialMessages}
          onMessagesUpdate={onMessagesUpdate}
        />
      </div>
    </div>
  );
};

export default AssistantContent;
