import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Assistant, updateAssistantConfig, ModelType, TemperatureType } from '@/data/assistants';
import ModelSelect from './ModelSelect';
import TemperatureSelect from './TemperatureSelect';
import PromptHistory from './PromptHistory';
import { 
  getDefaultPromptByType,
  loadPromptHistory,
  savePromptToHistory,
  deletePromptFromHistory,
  PromptHistoryItem
} from '@/services/promptHistoryService';

interface ConfigurationPanelProps {
  assistant: Assistant;
  onClose: () => void;
  onConfigUpdated?: () => void;
  hideCloseButton?: boolean;
}

const formSchema = z.object({
  systemPrompt: z.string().min(1, { message: "O prompt do sistema não pode estar vazio" }),
  model: z.string(),
  temperature: z.string(),
});

const ConfigurationPanel: React.FC<ConfigurationPanelProps> = ({
  assistant,
  onClose,
  onConfigUpdated,
  hideCloseButton = false,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: assistant.systemPrompt || getDefaultPromptByType(assistant.id),
      model: assistant.model || 'gpt-4o-mini',
      temperature: assistant.temperature || '0.5',
    },
  });

  useEffect(() => {
    form.reset({
      systemPrompt: assistant.systemPrompt || getDefaultPromptByType(assistant.id),
      model: assistant.model || 'gpt-4o-mini',
      temperature: assistant.temperature || '0.5',
    });
    
    const history = loadPromptHistory(assistant.id);
    setPromptHistory(history || []);
  }, [assistant.id, assistant.systemPrompt, assistant.model, assistant.temperature, form]);

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

      if (!values.temperature || values.temperature.trim() === '') {
        values.temperature = '0.5';
      }
      
      updateAssistantConfig(assistant.id, {
        systemPrompt: values.systemPrompt,
        model: values.model as ModelType,
        temperature: values.temperature as TemperatureType,
      });

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
    form.setValue('temperature', '0.5');
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
    <div className="h-full flex flex-col bg-background border-r border-l relative z-50 pt-16">
      {/* Header */}
      <div className="sticky top-16 z-50 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div>
            <h2 className="text-lg font-semibold">Configuração do Assistente</h2>
            <p className="text-sm text-muted-foreground">{assistant.title}</p>
          </div>
          {!hideCloseButton && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <ModelSelect control={form.control} />
            
            <TemperatureSelect control={form.control} />
            
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
                      className="min-h-[300px] resize-y"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-between gap-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetToDefaults}
                disabled={isSubmitting}
              >
                Restaurar Padrão
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default ConfigurationPanel;
