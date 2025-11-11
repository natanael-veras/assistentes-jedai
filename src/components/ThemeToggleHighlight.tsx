
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ThemeToggleHighlight: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já viu o highlight
    const hasSeenThemeHighlight = localStorage.getItem('hasSeenThemeHighlight');
    
    if (!hasSeenThemeHighlight) {
      // Mostra o popup após 2 segundos
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    localStorage.setItem('hasSeenThemeHighlight', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed top-20 right-8 z-50 bg-primary text-primary-foreground px-4 py-3 rounded-lg shadow-lg max-w-xs animate-fade-in">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">✨ Novidade!</p>
          <p className="text-sm">
            Prefere tema escuro ou claro? Altere clicando aqui
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="h-6 w-6 p-0 text-primary-foreground hover:bg-primary-foreground/20"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="absolute -top-2 left-14 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-primary"></div>
    </div>
  );
};

export default ThemeToggleHighlight;
