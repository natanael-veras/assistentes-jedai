
import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Settings, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Assistant, updateAssistantConfig, ModelType } from '@/data/assistants';
import ModelSelect from '@/components/conversation/ModelSelect';
import PromptHistory from '@/components/conversation/PromptHistory';
import { 
  getDefaultPromptByType,
  loadPromptHistory,
  savePromptToHistory,
  deletePromptFromHistory,
  PromptHistoryItem
} from '@/services/promptHistoryService';

interface InlineAssistantConfigProps {
  assistant: Assistant;
  onConfigUpdated?: () => void;
}

const formSchema = z.object({
  systemPrompt: z.string().min(1, { message: "O prompt do sistema não pode estar vazio" }),
  model: z.string(),
});

const InlineAssistantConfig: React.FC<InlineAssistantConfigProps> = ({
  assistant,
  onConfigUpdated,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: assistant.systemPrompt || getDefaultPromptByType(assistant.id),
      model: assistant.model || 'gpt-4o-mini',
    },
  });

  useEffect(() => {
    form.reset({
      systemPrompt: assistant.systemPrompt || getDefaultPromptByType(assistant.id),
      model: assistant.model || 'gpt-4o-mini',
    });
    
    // Load prompt history when component mounts or assistant changes
    const history = loadPromptHistory(assistant.id);
    setPromptHistory(history || []);
  }, [assistant.id, assistant.systemPrompt, assistant.model, form]);

  const currentPrompt = form.watch('systemPrompt') || getDefaultPromptByType(assistant.id);
  const previewText = currentPrompt.length > 80 ? `${currentPrompt.substring(0, 80)}...` : currentPrompt;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      
      if (!values.systemPrompt || !values.systemPrompt.trim()) {
        toast.error("O prompt do sistema não pode estar vazio");
        return;
      }

      if (!values.model || values.model.trim() === '') {
        values.model = 'gpt-4o-mini';
      }
      
      updateAssistantConfig(assistant.id, {
        systemPrompt: values.systemPrompt,
        model: values.model as ModelType,
      });

      // Save to prompt history
      const updatedHistory = savePromptToHistory(assistant.id, values.systemPrompt);
      setPromptHistory(updatedHistory);
      
      toast.success(`Configurações do ${assistant.title} atualizadas!`);
      
      if (onConfigUpdated) {
        onConfigUpdated();
      }
    } catch (error) {
      console.error('Error updating assistant config:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetToDefaults = () => {
    const defaultPrompt = getDefaultPromptByType(assistant.id);
    form.setValue('systemPrompt', defaultPrompt);
    form.setValue('model', assistant.id === 'developer' ? 'claude-3-7-sonnet' : 'gpt-4o-mini');
    toast.info("Configurações restauradas para o padrão");
  };

  const applyHistoryPrompt = (prompt: string) => {
    try {
      form.setValue('systemPrompt', prompt);
      setHistoryOpen(false);
      toast.info("Prompt aplicado do histórico");
    } catch (error) {
      console.error("Error applying prompt from history:", error);
      toast.error("Erro ao aplicar prompt do histórico");
    }
  };

  const handleDeletePrompt = (timestamp: number) => {
    try {
      const updatedHistory = deletePromptFromHistory(assistant.id, timestamp);
      setPromptHistory(updatedHistory);
    } catch (error) {
      console.error("Error deleting prompt from history:", error);
      toast.error("Erro ao deletar prompt do histórico");
    }
  };

  return (
    <div className="border rounded-lg bg-card/50 backdrop-blur-sm mb-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between p-4 h-auto text-left hover:bg-background/50"
          >
            <div className="flex items-center gap-3 flex-1">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">Configuração do Assistente</div>
                <div className="text-xs text-muted-foreground mt-1 truncate">
                  Modelo: {form.watch('model')} • Prompt: {previewText}
                </div>
              </div>
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="px-4 pb-4 border-t bg-background/20">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
                <ModelSelect control={form.control} />
                
                <FormField
                  control={form.control}
                  name="systemPrompt"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Prompt do Sistema</FormLabel>
                        
                        {promptHistory.length > 0 && (
                          <PromptHistory 
                            promptHistory={promptHistory}
                            historyOpen={historyOpen}
                            setHistoryOpen={setHistoryOpen}
                            applyHistoryPrompt={applyHistoryPrompt}
                            onDeletePrompt={handleDeletePrompt}
                          />
                        )}
                      </div>
                      <FormControl>
                        <Textarea 
                          placeholder={getDefaultPromptByType(assistant.id)}
                          className="min-h-[120px] resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-between gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetToDefaults}
                    disabled={isSubmitting}
                    size="sm"
                  >
                    Restaurar Padrão
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    size="sm"
                    className="gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSubmitting ? 'Salvando...' : 'Salvar'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default InlineAssistantConfig;
