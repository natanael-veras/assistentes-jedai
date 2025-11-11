
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
import ModelSelect from './ModelSelect';
import PromptHistory from './PromptHistory';
import { useSidebar } from "@/components/ui/sidebar";
import { 
  getDefaultPromptByType,
  loadPromptHistory,
  savePromptToHistory,
  deletePromptFromHistory,
  PromptHistoryItem
} from '@/services/promptHistoryService';

interface SidebarAssistantConfigProps {
  assistant: Assistant;
  onConfigUpdated?: () => void;
  onOpenConfiguration?: () => void;
}

const formSchema = z.object({
  systemPrompt: z.string().min(1, { message: "O prompt do sistema não pode estar vazio" }),
  model: z.string(),
});

const SidebarAssistantConfig: React.FC<SidebarAssistantConfigProps> = ({
  assistant,
  onConfigUpdated,
  onOpenConfiguration,
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

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
  }, [assistant.id, assistant.systemPrompt, assistant.model, form]);

  const currentPrompt = form.watch('systemPrompt') || getDefaultPromptByType(assistant.id);
  const previewText = currentPrompt.length > 40 ? `${currentPrompt.substring(0, 40)}...` : currentPrompt;

  const handleOpenConfiguration = () => {
    if (onOpenConfiguration) {
      onOpenConfiguration();
    }
  };

  if (isCollapsed) {
    return null;
  }

  return (
    <div className="border-t bg-card/30 backdrop-blur-sm">
      <Button
        variant="ghost"
        className="w-full justify-between p-3 h-auto text-left hover:bg-background/30"
        onClick={handleOpenConfiguration}
      >
        <div className="flex items-center gap-2 flex-1">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm">Configuração</div>
            <div className="text-xs text-muted-foreground mt-0.5 truncate">
              {form.watch('model')} • {previewText}
            </div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </Button>
    </div>
  );
};

export default SidebarAssistantConfig;
