
import React from 'react';
import { Info } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const modelGroups = {
  "OpenAI GPT": [
    "gpt-3.5-turbo",
    "gpt-4",
    "gpt-4.5-preview",
    "gpt-4o",
    "gpt-4o-2024-05-13",
    "gpt-4o-2024-08-06",
    "gpt-4o-mini",
  ],
  "Anthropic Claude": [
    "claude-3-5-haiku",
    "claude-3-5-sonnet",
    "claude-3-7-sonnet",
    "claude-3-opus",
  ],
  "Google Gemini": [
    "gemini-1.0-pro",
    "gemini-1.5-flash",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-lite",
  ],
  "Meta Llama": [
    "llama3.1",
    "llama3.2",
  ],
  "Anthropic O-Series": [
    "o1-mini",
    "o1-preview",
    "o3-mini",
  ],
};

interface ModelSelectProps {
  control: any;
}

const ModelSelect: React.FC<ModelSelectProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="model"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="flex items-center gap-2">
            Modelo de IA
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Selecione o modelo de IA que será usado por este assistente</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </FormLabel>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um modelo" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {Object.entries(modelGroups).map(([group, models]) => (
                <React.Fragment key={group}>
                  <SelectItem value={group} disabled className="font-semibold">
                    {group}
                  </SelectItem>
                  {models.map((model) => (
                    <SelectItem key={model} value={model} className="pl-6">
                      {model}
                    </SelectItem>
                  ))}
                </React.Fragment>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default ModelSelect;
