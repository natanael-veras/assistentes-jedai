
import React, { useState, useEffect } from 'react';
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Assistant, updateAssistantConfig, ModelType } from "@/data/assistants";
import ModelSelect from "@/components/conversation/ModelSelect";
import PromptHistory from "@/components/conversation/PromptHistory";
import { 
  loadPromptHistory, 
  savePromptToHistory, 
  getDefaultPromptByType,
  PromptHistoryItem
} from "@/services/promptHistoryService";

const formSchema = z.object({
  systemPrompt: z.string().min(1, { message: "O prompt do sistema não pode estar vazio" }),
  model: z.string(),
});

interface SystemPromptDialogProps {
  assistant: Assistant;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdated?: () => void;
}

const SystemPromptDialog: React.FC<SystemPromptDialogProps> = ({
  assistant,
  open,
  onOpenChange,
  onConfigUpdated,
}) => {
  const [promptHistory, setPromptHistory] = useState<PromptHistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Setup form with initial values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      systemPrompt: assistant.systemPrompt || getDefaultPromptByType(assistant.id),
      model: assistant.model || 'gpt-4o-mini',
    },
  });

  // Reset form when dialog opens or assistant changes
  useEffect(() => {
    if (open) {
      try {
        // Reset form with current assistant values
        form.reset({
          systemPrompt: assistant.systemPrompt || getDefaultPromptByType(assistant.id),
          model: assistant.model || 'gpt-4o-mini',
        });
        
        // Load history from localStorage
        const history = loadPromptHistory(assistant.id);
        setPromptHistory(history || []);
      } catch (error) {
        console.error("Error initializing SystemPromptDialog:", error);
        // Default values as fallback
        form.reset({
          systemPrompt: getDefaultPromptByType(assistant.id),
          model: 'gpt-4o-mini',
        });
        setPromptHistory([]);
      }
    }
  }, [open, assistant.id, assistant.systemPrompt, assistant.model, form]);
  
  function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      
      if (!values.systemPrompt || !values.systemPrompt.trim()) {
        toast.error("O prompt do sistema não pode estar vazio");
        setIsSubmitting(false);
        return;
      }

      // Validate model
      if (!values.model || values.model.trim() === '') {
        values.model = 'gpt-4o-mini';
      }
      
      // Update assistant config first, sem salvar mais em localStorage
      updateAssistantConfig(assistant.id, {
        systemPrompt: values.systemPrompt,
        model: values.model as ModelType,
      });
      
      // Only save to history after config updated successfully
      try {
        const updatedHistory = savePromptToHistory(
          assistant.id, 
          values.systemPrompt
        );
        setPromptHistory(updatedHistory);
      } catch (error) {
        console.error('Error saving prompt to history:', error);
        // Continue execution even if prompt history save fails
      }
      
      toast.success(`Configurações do ${assistant.title} atualizadas com sucesso!`);
      
      // Close dialog with delay to avoid UI issues
      setTimeout(() => {
        onOpenChange(false);
        // Wait a bit longer to notify parent components
        setTimeout(() => {
          if (onConfigUpdated) {
            onConfigUpdated();
          }
        }, 100);
      }, 300);
    } catch (error) {
      console.error('Error updating system prompt:', error);
      toast.error('Erro ao atualizar configurações');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Obter prompt padrão para esse tipo de assistente
  const defaultPrompt = getDefaultPromptByType(assistant.id);
  
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
  
  const resetToDefaults = () => {
    try {
      form.setValue('systemPrompt', defaultPrompt);
      form.setValue('model', assistant.id === 'developer' ? 'claude-3-7-sonnet' : 'gpt-4o-mini');
      toast.info("Configurações restauradas para o padrão");
    } catch (error) {
      console.error("Error resetting to defaults:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Configuração do Assistente</DialogTitle>
          <DialogDescription>
            Configure o comportamento e o modelo de IA para: {assistant.title}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                      />
                    )}
                  </div>
                  
                  <FormControl>
                    <Textarea 
                      placeholder={defaultPrompt}
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={resetToDefaults}
                className="mr-auto"
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
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SystemPromptDialog;
