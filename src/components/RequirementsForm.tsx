import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { sendPrompt } from '@/utils/api';
import { BriefcaseIcon, Target, FileText, Loader2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import ProductOwnerForms from './ProductOwnerForms';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { trackChatInteraction } from '@/utils/analytics';
import { renderSimpleMarkdown } from '@/utils/markdownUtils';

const formSchema = z.object({
  workingOn: z.string().min(5, {
    message: 'Por favor, descreva no que você está trabalhando em pelo menos 5 caracteres.',
  }),
  goal: z.string().min(10, {
    message: 'Por favor, descreva seu objetivo em pelo menos 10 caracteres.',
  }),
  context: z.string().min(10, {
    message: 'Por favor, forneça um contexto em pelo menos 10 caracteres.',
  }),
  // Removido campo de documento
});

type FormValues = z.infer<typeof formSchema>;

interface RequirementsFormProps {
  assistantId: string;
}

const RequirementsForm: React.FC<RequirementsFormProps> = ({ assistantId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      workingOn: '',
      goal: '',
      context: '',
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);

    // Track form submission
    trackChatInteraction('requirements_form_submitted', assistantId);

    try {
      // Construir o prompt para a API
      let prompt = `
        Preciso que você atue como um Product Owner experiente e me ajude a criar requisitos para o meu projeto.

        No que estou trabalhando: ${data.workingOn}

        O que estou tentando alcançar: ${data.goal}

        Contexto estratégico e de comportamento: ${data.context}
      `;

      // Removida lógica relacionada ao campo 'document'

      prompt += `
        Por favor, gere requisitos detalhados para este projeto, incluindo:
        1. Histórias de usuário bem formatadas
        2. Critérios de aceitação claros
        3. Priorização sugerida
        4. Possíveis dependências
        5. Estimativas de esforço relativo
      `;

      const response = await sendPrompt(
        prompt,
        [],
        assistantId
      );

      if (response.error) {
        toast.error(response.error);
        return;
      }

      // Extrair o conteúdo da resposta
      let responseContent = '';

      if (response.data && response.data.content) {
        responseContent = response.data.content;
      } else if (response.data && response.data.result && response.data.result.content) {
        responseContent = response.data.result.content;
      } else {
        responseContent = JSON.stringify(response.data, null, 2);
      }

      setResult(responseContent);

      // Track successful response
      trackChatInteraction('requirements_generated', assistantId);
    } catch (error) {
      console.error("Erro ao gerar requisitos:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Removido handleFileChange, handleRemoveFile

  const handleFeedback = (feedback: 'like' | 'dislike') => {
    toast.success(`Feedback ${feedback === 'like' ? 'positivo' : 'negativo'} registrado!`);
  };

  const handleRegenerate = async () => {
    if (!result) return;

    const values = form.getValues();
    await handleSubmit(values);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileText className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Gerador de Requisitos</h2>
        <p className="text-muted-foreground mt-2">
          Preencha os campos abaixo para gerar requisitos para seu projeto
        </p>
      </div>

      {result ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h3 className="text-xl font-medium mb-4">Requisitos Gerados</h3>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {renderSimpleMarkdown(result)}
              </div>
            </ScrollArea>

            {/* Feedback buttons */}
            <div className="flex items-center justify-end gap-1 mt-4 border-t pt-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(result)
                          .then(() => toast.success("Requisitos copiados para a área de transferência"))
                          .catch(() => toast.error("Falha ao copiar os requisitos"));
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                      </svg>
                      <span className="sr-only">Copiar</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copiar Requisitos</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFeedback('like')}
                    >
                      <ThumbsUp className="h-4 w-4" />
                      <span className="sr-only">Curtir</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Curtir Resultado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => handleFeedback('dislike')}
                    >
                      <ThumbsDown className="h-4 w-4" />
                      <span className="sr-only">Não curtir</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Não Curtir Resultado</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex justify-start">
            <Button
              variant="outline"
              onClick={() => setResult(null)}
            >
              Voltar ao Formulário
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="workingOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center gap-2">
                    <BriefcaseIcon className="h-5 w-5 text-primary" />
                    No que você está trabalhando?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Por exemplo, integração de um aplicativo a um banco móvel"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva o projeto ou a funcionalidade que você está desenvolvendo.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="goal"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center gap-2">
                    <Target className="h-5 w-5 text-primary" />
                    O que você está tentando alcançar? Por que isso importa?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Por exemplo, simplificar as tarefas financeiras de jovens empreendedores para que eles possam se concentrar em seus negócios. 20% de adoção em 3 meses."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Descreva os objetivos e o impacto esperado deste projeto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    Contexto estratégico e de comportamento
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Por exemplo, pesquisa de mercado, análise de concorrentes, resumo de entrevistas, insights de clientes, base de dados, comportamentos esperados"
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Forneça informações contextuais relevantes para fundamentar os requisitos.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo de upload de arquivo removido */}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando Requisitos...
                </>
              ) : (
                'Gerar Requisitos'
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default RequirementsForm;
