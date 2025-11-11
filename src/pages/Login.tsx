import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Code, Zap } from 'lucide-react';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const handleAccess = () => {
    navigate('/assistant/tech-doc');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 px-4">
      <div className="w-full max-w-md">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Login Card */}
        <div className="relative bg-card border border-border rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
              <div className="relative bg-primary/10 p-4 rounded-full">
                <FileText className="h-12 w-12 text-primary" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Documentação Técnica
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Assistente especializado em gerar documentações profissionais
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8">
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Geração inteligente de documentos</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Code className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Múltiplos formatos e estilos</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <div className="bg-primary/10 p-2 rounded-lg">
                <Zap className="h-4 w-4 text-primary" />
              </div>
              <span className="text-foreground">Resultados em segundos</span>
            </div>
          </div>

          {/* Access Button */}
          <Button 
            onClick={handleAccess}
            size="lg"
            className="w-full text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Acessar Agora
          </Button>

          {/* Footer text */}
          <p className="text-center text-xs text-muted-foreground mt-6">
            Transforme código em documentação clara e profissional
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
