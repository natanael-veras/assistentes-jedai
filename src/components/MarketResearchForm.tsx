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
import { Search, Filter, Loader2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { trackChatInteraction } from '@/utils/analytics';
import { renderSimpleMarkdown } from '@/utils/markdownUtils';

const formSchema = z.object({
  company: z.string().min(3, {
    message: 'Por favor, informe a empresa ou produto com pelo menos 3 caracteres.',
  }),
  focus: z.string().min(5, {
    message: 'Por favor, descreva o foco da pesquisa em pelo menos 5 caracteres.',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface MarketResearchFormProps {
  assistantId: string;
}

const MarketResearchForm: React.FC<MarketResearchFormProps> = ({ assistantId }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      company: '',
      focus: '',
    },
  });
  
  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    setIsLoading(true);
    
    // Track form submission
    trackChatInteraction('market_research_form_submitted', assistantId);
    
    try {
      // Construir o prompt para a API
      let prompt = `
        Preciso que você atue como um analista de mercado experiente e me ajude a pesquisar informações sobre uma empresa ou produto.
        
        Empresa ou produto: ${data.company}
        
        Foco específico da pesquisa: ${data.focus}
      `;
      
      prompt += `
        Por favor, faça uma análise detalhada incluindo:
        1. Visão geral da empresa/produto
        2. Posicionamento no mercado
        3. Principais concorrentes
        4. Pontos fortes e fracos
        5. Tendências relevantes
        6. Oportunidades potenciais
        
        Organize as informações em seções claras e forneça insights acionáveis.
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
      trackChatInteraction('market_research_generated', assistantId);
    } catch (error) {
      console.error("Erro ao realizar pesquisa de mercado:", error);
      toast.error("Ocorreu um erro ao processar sua solicitação");
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Search className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Pesquisa de Mercado</h2>
        <p className="text-muted-foreground mt-2">
          Preencha os campos abaixo para gerar uma análise de mercado
        </p>
      </div>
      
      {result ? (
        <div className="space-y-4">
          <div className="rounded-lg border bg-card p-4 sm:p-6">
            <h3 className="text-xl font-medium mb-4">Análise de Mercado</h3>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <div className="prose prose-sm max-w-none dark:prose-invert">
                {renderSimpleMarkdown(result)}
              </div>
            </ScrollArea>
          </div>
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <Button 
              variant="outline" 
              onClick={() => setResult(null)}
            >
              Voltar ao Formulário
            </Button>
            <Button 
              onClick={() => {
                navigator.clipboard.writeText(result)
                  .then(() => toast.success("Análise copiada para a área de transferência"))
                  .catch(() => toast.error("Falha ao copiar a análise"));
              }}
            >
              Copiar Análise
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center gap-2">
                    <Search className="h-5 w-5 text-primary" />
                    Qual empresa ou produto você deseja pesquisar?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Exemplo: Amazon ou Google Drive. Inclua um site ou descrição para produtos menos conhecidos."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Forneça detalhes suficientes para identificar precisamente a empresa ou produto.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="focus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center gap-2">
                    <Filter className="h-5 w-5 text-primary" />
                    Há algo específico em que você queira se concentrar?
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Exemplo: Concorrentes específicos, dados financeiros, tendências de MAU/DAU, escuta social, cobertura da imprensa"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Especifique aspectos particulares que você gostaria de ver analisados.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Realizando Pesquisa...
                </>
              ) : (
                'Gerar Pesquisa de Mercado'
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  );
};

export default MarketResearchForm;
