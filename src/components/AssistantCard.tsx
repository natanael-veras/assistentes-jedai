import React, { useState } from 'react';
import { Info, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Assistant } from '@/data/assistants';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { useNavigate, useLocation } from 'react-router-dom';
import SystemPromptDialog from './SystemPromptDialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AssistantCardProps {
  assistant: Assistant;
  onConfigUpdate?: () => void;
  featured?: boolean;
}

const AssistantCard: React.FC<AssistantCardProps> = ({ assistant, onConfigUpdate, featured = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { icon: Icon } = assistant;
  const [systemPromptOpen, setSystemPromptOpen] = useState(false);
  
  const formatDate = (date: Date) => {
    return format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };
  
  const isHomePage = location.pathname === '/';
  
  return (
    <Card className={`h-full overflow-hidden transition-all hover:shadow-md flex flex-col ${featured ? 'md:col-span-3' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold">{assistant.title}</h3>
          </div>
          <div className="flex gap-1">
            <TooltipProvider>
              {!isHomePage && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSystemPromptOpen(true)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span className="sr-only">Prompt do Sistema</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Configurar Prompt do Sistema</p>
                  </TooltipContent>
                </Tooltip>
              )}
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <HoverCard>
                    <HoverCardTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Info className="h-4 w-4" />
                        <span className="sr-only">Informações</span>
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <div className="text-xs text-muted-foreground">
                          <p><strong>Criado por:</strong> {assistant.createdBy}</p>
                          <p><strong>Data de Criação:</strong> {formatDate(assistant.createdAt)}</p>
                          {assistant.systemPrompt && (
                            <p><strong>Prompt do Sistema:</strong> Configurado</p>
                          )}
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Informações do Assistente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-4">{assistant.description}</p>
        
        {featured ? (
          <div className="flex space-x-2">
            <Button 
              onClick={() => navigate(`/assistant/${assistant.id}`)}
            >
              Selecionar
            </Button>
            
            {!isHomePage && (
              <Button 
                variant="outline"
                onClick={() => setSystemPromptOpen(true)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Configurar Prompt
              </Button>
            )}
          </div>
        ) : null}
      </CardContent>
      
      {!featured && (
        <CardFooter className="pt-2 flex justify-start">
          <Button 
            onClick={() => navigate(`/assistant/${assistant.id}`)}
          >
            Selecionar
          </Button>
        </CardFooter>
      )}

      {!isHomePage && (
        <SystemPromptDialog
          assistant={assistant}
          open={systemPromptOpen}
          onOpenChange={setSystemPromptOpen}
          onConfigUpdated={onConfigUpdate}
        />
      )}
    </Card>
  );
};

export default AssistantCard;
