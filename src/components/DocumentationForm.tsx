import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { sendPrompt } from "@/utils/api";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Loader2, 
  FilePen, 
  FileText, 
  ListOrdered, 
  Book, 
  ListTodo, 
  Lightbulb, 
  HelpCircle, 
  Bug 
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trackChatInteraction } from "@/utils/analytics";

const schema = z.object({
  overview: z.string().min(10, "Preencha a visão geral do produto."),
  features: z.string().min(10, "Descreva as principais funcionalidades."),
  usecases: z.string().min(10, "Informe ao menos um caso de uso."),
  steps: z.string().min(10, "Explique o passo a passo para começar a usar."),
  tips: z.string().min(5, "Inclua pelo menos uma dica."),
  faq: z.string().min(5, "Preencha alguma pergunta/FAQ."),
  errors: z.string().min(5, "Cite possíveis erros ou deixe um exemplo."),
});

type DocFormType = z.infer<typeof schema>;

interface DocumentationFormProps {
  assistantId: string;
}

const DocumentationForm: React.FC<DocumentationFormProps> = ({ assistantId }) => {
  const [result, setResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<DocFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      overview: "",
      features: "",
      usecases: "",
      steps: "",
      tips: "",
      faq: "",
      errors: "",
    },
  });

  const onSubmit = async (data: DocFormType) => {
    setIsSubmitting(true);
    setResult(null);

    trackChatInteraction('documentation_form_submitted', assistantId);

    const prompt = `
Gere uma documentação clara e objetiva para meu produto seguindo este roteiro:

Visão Geral: ${data.overview}

Principais Funcionalidades: ${data.features}

Casos de Uso: ${data.usecases}

Passo a Passo: ${data.steps}

Dicas e Boas Práticas: ${data.tips}

FAQ: ${data.faq}

Erros Comuns e Soluções: ${data.errors}

Organize e destaque cada seção, usando listas, parágrafos claros e exemplos quando possível. Seja direto e útil.
    `;

    try {
      const response = await sendPrompt(prompt, [], assistantId);
      if (response.error) {
        toast.error(response.error);
        return;
      }
      let responseContent = "";
      
      if (response.data && response.data.content) {
        responseContent = response.data.content;
      } else if (response.data && response.data.result && response.data.result.content) {
        responseContent = response.data.result.content;
      } else {
        responseContent = JSON.stringify(response.data, null, 2);
      }
      setResult(responseContent);

      trackChatInteraction('documentation_generated', assistantId);

    } catch (err) {
      toast.error("Erro ao gerar a documentação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-xl font-medium mb-4">Documentação Gerada</h3>
          <ScrollArea className="h-[400px] rounded-md border p-4">
            <div className="whitespace-pre-wrap">{result}</div>
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
                .then(() => toast.success("Documentação copiada para a área de transferência"))
                .catch(() => toast.error("Falha ao copiar a documentação"));
            }}
          >
            Copiar Documentação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FilePen className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Gerar Documentação do Produto</h2>
        <p className="text-muted-foreground mt-2">
          Preencha os campos abaixo para gerar uma documentação técnica, clara e direta para seu produto.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="overview"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <FormLabel>Visão Geral</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Explique o que o produto faz, para quem é e que problema resolve."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Explicação simples e direta.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="features"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <ListOrdered className="h-5 w-5 text-primary" />
                  <FormLabel>Principais Funcionalidades</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Descreva as features principais, exemplos práticos de uso, etc."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Liste claramente as funcionalidades principais.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="usecases"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Book className="h-5 w-5 text-primary" />
                  <FormLabel>Casos de Uso</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Explique como os usuários aplicam o recurso no dia a dia."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Exemplos reais ou fictícios de uso.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="steps"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <ListTodo className="h-5 w-5 text-primary" />
                  <FormLabel>Passo a Passo</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Guia rápido para começar a usar, incluindo fluxo básico e telas."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Guia rápido de início.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tips"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  <FormLabel>Dicas e Boas Práticas</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Sugestões para aproveitar melhor o produto."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Dicas, recomendações práticas e melhores práticas.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="faq"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  <FormLabel>FAQ</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Perguntas comuns com respostas diretas."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Perguntas frequentes, dúvidas e respostas úteis.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="errors"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Bug className="h-5 w-5 text-primary" />
                  <FormLabel>Erros Comuns e Soluções</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Liste problemas comuns e como solucioná-los."
                    className="min-h-[60px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Dificuldades frequentes e suas soluções.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Documentação...
              </>
            ) : (
              "Gerar Documentação"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default DocumentationForm;
