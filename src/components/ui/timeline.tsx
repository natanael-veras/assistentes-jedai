
import React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Wrench, Bug } from 'lucide-react';

export interface TimelineItem {
  id: string;
  version: string;
  date: string;
  type: 'feature' | 'improvement' | 'bugfix';
  title: string;
  description: string;
  changes: string[];
}

interface TimelineProps {
  items: TimelineItem[];
  className?: string;
}

const getTypeConfig = (type: TimelineItem['type']) => {
  switch (type) {
    case 'feature':
      return {
        icon: Sparkles,
        color: 'bg-blue-500',
        badgeVariant: 'default' as const,
        label: 'Nova Funcionalidade'
      };
    case 'improvement':
      return {
        icon: Wrench,
        color: 'bg-green-500',
        badgeVariant: 'secondary' as const,
        label: 'Melhoria'
      };
    case 'bugfix':
      return {
        icon: Bug,
        color: 'bg-red-500',
        badgeVariant: 'destructive' as const,
        label: 'Correção'
      };
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const Timeline: React.FC<TimelineProps> = ({ items, className }) => {
  return (
    <div className={cn("relative", className)}>
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
      
      <div className="space-y-8">
        {items.map((item, index) => {
          const typeConfig = getTypeConfig(item.type);
          const IconComponent = typeConfig.icon;
          
          return (
            <div key={item.id} className="relative flex items-start gap-6">
              {/* Timeline dot */}
              <div className="hidden md:flex relative z-10 flex-shrink-0">
                <div className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center shadow-lg",
                  typeConfig.color
                )}>
                  <IconComponent className="w-8 h-8 text-white" />
                </div>
              </div>
              
              {/* Content card */}
              <Card className="flex-1 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={typeConfig.badgeVariant} className="w-fit">
                        <IconComponent className="w-3 h-3 mr-1 md:hidden" />
                        {typeConfig.label}
                      </Badge>
                      <Badge variant="outline" className="w-fit">
                        Tribe APPs
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      Versão {item.version} • {formatDate(item.date)}
                    </span>
                  </div>
                  <CardTitle className="text-xl">{item.title}</CardTitle>
                  <CardDescription className="text-base">
                    {item.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Principais mudanças:
                    </h4>
                    <ul className="space-y-1">
                      {item.changes.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start gap-2 text-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                          {change}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timeline;
