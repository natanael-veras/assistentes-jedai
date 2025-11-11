
import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CodeSnippetProps {
  code: string;
  language?: string;
  className?: string;
}

const CodeSnippet: React.FC<CodeSnippetProps> = ({ 
  code, 
  language = 'text',
  className 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        toast.success("Código copiado para a área de transferência");
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        toast.error("Falha ao copiar o código");
      });
  };

  return (
    <div className={cn("relative my-4 rounded-md bg-muted border", className)}>
      <div className="flex items-center justify-between px-4 py-2 bg-muted/80 rounded-t-md border-b">
        <div className="text-xs font-mono text-primary flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5" />
          {language}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent"
          onClick={copyToClipboard}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copiado</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copiar</span>
            </>
          )}
        </Button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm">
        <code className="font-mono text-foreground">{code}</code>
      </pre>
    </div>
  );
};

export default CodeSnippet;
