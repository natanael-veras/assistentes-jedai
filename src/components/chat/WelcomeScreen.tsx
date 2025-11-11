
import React from 'react';
import { Sparkles } from 'lucide-react';
import { Assistant } from '@/data/assistants';

interface WelcomeScreenProps {
  currentAssistant?: Assistant;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ 
  currentAssistant
}) => {
  return (
    <div className="flex h-[calc(100vh-16rem)] items-center justify-center p-8">
      <div className="max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-primary/10 p-3">
            {currentAssistant ? (
              <currentAssistant.icon className="h-8 w-8 text-primary" />
            ) : (
              <Sparkles className="h-8 w-8 text-primary" />
            )}
          </div>
        </div>
        <h3 className="mb-2 text-xl font-medium">
          {currentAssistant 
            ? `Bem-vindo ao ${currentAssistant.title}`
            : 'Bem-vindo ao Assistente de Produtividade'
          }
        </h3>
        <p className="text-muted-foreground">
          {currentAssistant?.description || 
            'Este assistente está pronto para responder suas dúvidas e ajudar com informações.'}
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
