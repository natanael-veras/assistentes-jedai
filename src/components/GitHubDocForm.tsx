import React, { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Loader2, 
  Github, 
  FolderGit2,
  FileCode,
  Download
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trackChatInteraction } from "@/utils/analytics";
import CodeSnippet from "@/components/CodeSnippet";
import AIDataTable from "@/components/AIDataTable";
import { renderSimpleMarkdown } from "@/utils/markdownUtils";
import jsPDF from "jspdf";

const schema = z.object({
  githubToken: z.string().min(1, "Token do GitHub é obrigatório"),
  repoUrl: z.string().min(1, "URL do repositório é obrigatória").url("URL inválida"),
  filePaths: z.string().min(1, "Especifique ao menos um arquivo ou diretório"),
  docFormat: z.enum(["accessible", "technical", "onboarding", "executive"], {
    required_error: "Selecione um formato de documentação",
  }),
  additionalContext: z.string().optional(),
});

type GitHubDocFormType = z.infer<typeof schema>;

interface GitHubDocFormProps {
  assistantId: string;
}

const GitHubDocForm: React.FC<GitHubDocFormProps> = ({ assistantId }) => {
  const [result, setResult] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCode, setIsFetchingCode] = useState(false);

  const form = useForm<GitHubDocFormType>({
    resolver: zodResolver(schema),
    defaultValues: {
      githubToken: "",
      repoUrl: "",
      filePaths: "",
      docFormat: "technical",
      additionalContext: "",
    },
  });

  const fetchGitHubCode = async (token: string, repoUrl: string, paths: string) => {
    try {
      // Extrair owner e repo da URL
      let cleanUrl = repoUrl.replace('https://github.com/', '').replace('http://github.com/', '');
      // Remover .git do final se existir
      cleanUrl = cleanUrl.replace(/\.git$/, '');
      
      const urlParts = cleanUrl.split('/');
      const owner = urlParts[0];
      const repo = urlParts[1];

      if (!owner || !repo) {
        throw new Error("URL do repositório inválida. Use o formato: https://github.com/usuario/repositorio");
      }

      const pathList = paths.split(',').map(p => p.trim());
      let codeContent = '';

      for (const path of pathList) {
        const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${path}`;
        
        const response = await fetch(apiUrl, {
          headers: {
            'Authorization': `token ${token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`Erro ao buscar ${path}: ${errorData.message || response.statusText}. Verifique se o caminho existe no repositório.`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
          // É um diretório
          for (const item of data) {
            if (item.type === 'file') {
              const fileResponse = await fetch(item.url, {
                headers: {
                  'Authorization': `token ${token}`,
                  'Accept': 'application/vnd.github.v3.raw',
                },
              });
              const fileContent = await fileResponse.text();
              codeContent += `\n\n--- ${item.path} ---\n${fileContent}`;
            }
          }
        } else if (data.type === 'file') {
          // É um arquivo
          const fileResponse = await fetch(data.url, {
            headers: {
              'Authorization': `token ${token}`,
              'Accept': 'application/vnd.github.v3.raw',
            },
          });
          const fileContent = await fileResponse.text();
          codeContent += `\n\n--- ${data.path} ---\n${fileContent}`;
        }
      }

      return codeContent;
    } catch (error) {
      throw error;
    }
  };

  const handleDownloadPDF = () => {
    if (!result) return;
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Clean markdown from content
      const cleanText = result
        .replace(/```[\s\S]*?```/g, '[Código omitido]')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '');
      
      // Add title
      doc.setFontSize(16);
      doc.text('Documentação Técnica do GitHub', margin, margin);
      
      // Add date
      doc.setFontSize(10);
      doc.text(new Date().toLocaleString('pt-BR'), margin, margin + 10);
      
      // Add content
      doc.setFontSize(12);
      const lines = doc.splitTextToSize(cleanText, maxWidth);
      let yPosition = margin + 20;
      
      lines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(line, margin, yPosition);
        yPosition += 7;
      });
      
      // Save PDF
      doc.save(`documentacao-github-${Date.now()}.pdf`);
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const processMarkdown = (text: string): React.ReactNode[] => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let elementIndex = 0;

    const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;
    const tableRegex = /\|.*\|[\r\n]+\|[-\s:|]+\|[\r\n]+((?:\|.*\|[\r\n]*)+)/g;

    const elements: Array<{ start: number; end: number; type: 'code' | 'table'; content: any }> = [];

    // Find code blocks
    let match;
    while ((match = codeBlockRegex.exec(text)) !== null) {
      elements.push({
        start: match.index,
        end: match.index + match[0].length,
        type: 'code',
        content: { language: match[1] || 'text', code: match[2] }
      });
    }

    // Find tables
    while ((match = tableRegex.exec(text)) !== null) {
      const tableText = match[0];
      const lines = tableText.trim().split('\n').filter(line => line.trim());
      
      if (lines.length >= 3) {
        const headers = lines[0]
          .split('|')
          .slice(1, -1)
          .map(header => header.trim())
          .filter(header => header.length > 0);
        
        const dataLines = lines.slice(2);
        const rows = dataLines.map(line => 
          line.split('|')
            .slice(1, -1)
            .map(cell => cell.trim())
            .filter((_, index) => index < headers.length)
        ).filter(row => row.length > 0);

        if (headers.length > 0 && rows.length > 0) {
          elements.push({
            start: match.index,
            end: match.index + match[0].length,
            type: 'table',
            content: { headers, rows }
          });
        }
      }
    }

    // Sort elements by position
    elements.sort((a, b) => a.start - b.start);

    // Process text and elements in order
    for (const element of elements) {
      if (element.start > lastIndex) {
        const textBefore = text.substring(lastIndex, element.start);
        if (textBefore.trim()) {
          parts.push(renderSimpleMarkdown(textBefore));
        }
      }

      if (element.type === 'code') {
        parts.push(
          <CodeSnippet
            key={`code-${elementIndex++}`}
            code={element.content.code}
            language={element.content.language}
          />
        );
      } else if (element.type === 'table') {
        parts.push(
          <AIDataTable
            key={`table-${elementIndex++}`}
            data={element.content}
          />
        );
      }

      lastIndex = element.end;
    }

    if (lastIndex < text.length) {
      const remainingText = text.substring(lastIndex);
      if (remainingText.trim()) {
        parts.push(renderSimpleMarkdown(remainingText));
      }
    }

    return parts;
  };

  const onSubmit = async (data: GitHubDocFormType) => {
    setIsSubmitting(true);
    setIsFetchingCode(true);
    setResult(null);

    trackChatInteraction('github_doc_form_submitted', assistantId);

    try {
      // Buscar código do GitHub
      toast.info("Extraindo código do GitHub...");
      const codeContent = await fetchGitHubCode(data.githubToken, data.repoUrl, data.filePaths);
      
      setIsFetchingCode(false);
      toast.success("Código extraído com sucesso!");

      // Mapear formato para instruções específicas
      const formatInstructions = {
        accessible: "FORMATO: Comunicação Clara e Acessível",
        technical: "FORMATO: Guia Técnico Detalhado",
        onboarding: "FORMATO: Manual Rápido de Onboarding",
        executive: "FORMATO: Resumo Executivo"
      };

      // Construir prompt com o código
      const prompt = `
${formatInstructions[data.docFormat]}

Analise o código a seguir e gere a documentação no formato solicitado:

CÓDIGO EXTRAÍDO:
${codeContent}

${data.additionalContext ? `CONTEXTO ADICIONAL:\n${data.additionalContext}` : ''}

Por favor, gere a documentação seguindo exatamente o formato e estrutura especificados.
      `;

      toast.info("Gerando documentação...");
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
      toast.success("Documentação gerada com sucesso!");

      trackChatInteraction('github_doc_generated', assistantId);

    } catch (err: any) {
      toast.error(err.message || "Erro ao gerar a documentação.");
    } finally {
      setIsSubmitting(false);
      setIsFetchingCode(false);
    }
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border bg-card p-4 sm:p-6">
          <h3 className="text-xl font-medium mb-4">Documentação Técnica Gerada</h3>
          <ScrollArea className="h-[500px] rounded-md border p-4">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div className="space-y-4">
                {processMarkdown(result)}
              </div>
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
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
            >
              <Download className="mr-2 h-4 w-4" />
              Baixar PDF
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <FileCode className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Gerar Documentação Técnica do GitHub</h2>
        <p className="text-muted-foreground mt-2">
          Conecte seu repositório GitHub e extraia código para gerar documentação técnica automaticamente.
        </p>
      </div>

      <div className="bg-muted/50 border rounded-lg p-4 space-y-2">
        <h3 className="font-medium flex items-center gap-2">
          <Github className="h-4 w-4" />
          Como obter um Token do GitHub
        </h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Acesse GitHub → Settings → Developer settings</li>
          <li>Clique em "Personal access tokens" → "Tokens (classic)"</li>
          <li>Gere um novo token com permissão "repo"</li>
          <li>Cole o token no campo abaixo</li>
        </ol>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="githubToken"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Github className="h-5 w-5 text-primary" />
                  <FormLabel>Token de Acesso do GitHub</FormLabel>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Token pessoal com permissão de leitura de repositórios
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="repoUrl"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FolderGit2 className="h-5 w-5 text-primary" />
                  <FormLabel>URL do Repositório</FormLabel>
                </div>
                <FormControl>
                  <Input
                    placeholder="https://github.com/usuario/repositorio"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  URL completa do repositório GitHub
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="filePaths"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  <FormLabel>Arquivos ou Diretórios</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="src/main.ts, src/components, README.md"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Caminhos separados por vírgula (ex: src/app.ts, src/components)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="docFormat"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <FileCode className="h-5 w-5 text-primary" />
                  <FormLabel>Formato da Documentação</FormLabel>
                </div>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o formato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="accessible">
                      <div className="flex flex-col">
                        <span className="font-medium">Comunicação Clara e Acessível</span>
                        <span className="text-xs text-muted-foreground">Para não-técnicos</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="technical">
                      <div className="flex flex-col">
                        <span className="font-medium">Guia Técnico Detalhado</span>
                        <span className="text-xs text-muted-foreground">Para desenvolvedores</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="onboarding">
                      <div className="flex flex-col">
                        <span className="font-medium">Manual Rápido de Onboarding</span>
                        <span className="text-xs text-muted-foreground">Para novos membros da equipe</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="executive">
                      <div className="flex flex-col">
                        <span className="font-medium">Resumo Executivo</span>
                        <span className="text-xs text-muted-foreground">Para gestores e stakeholders</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Escolha o tipo de documentação mais adequado para sua audiência
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="additionalContext"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center space-x-2">
                  <Download className="h-5 w-5 text-primary" />
                  <FormLabel>Contexto Adicional (Opcional)</FormLabel>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Informações adicionais sobre o projeto, decisões de arquitetura, etc."
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Forneça contexto extra para melhorar a documentação
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
            {isFetchingCode ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Extraindo código do GitHub...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando Documentação...
              </>
            ) : (
              <>
                <Github className="mr-2 h-4 w-4" />
                Gerar Documentação
              </>
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default GitHubDocForm;
