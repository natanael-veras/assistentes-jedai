
export interface ContextConfig {
  maxMessages: number;
  maxCharsPerMessage: number;
  maxTotalChars: number;
  preserveRecentMessages: number;
  enableOptimization: boolean;
}

export const DEFAULT_CONTEXT_CONFIG: ContextConfig = {
  maxMessages: 20,
  maxCharsPerMessage: 2000,
  maxTotalChars: 8000,
  preserveRecentMessages: 6,
  enableOptimization: true
};

// Configurações por tipo de assistente
export const ASSISTANT_CONTEXT_CONFIGS: Record<string, Partial<ContextConfig>> = {
  'documentation': {
    maxMessages: 15, // Documentação pode precisar de menos contexto
    maxTotalChars: 6000,
    preserveRecentMessages: 4
  },
  'developer': {
    maxMessages: 25, // Desenvolvimento pode precisar de mais contexto
    maxTotalChars: 10000,
    preserveRecentMessages: 8
  },
  'product-owner': {
    maxMessages: 20,
    maxTotalChars: 8000,
    preserveRecentMessages: 6
  },
  'generalist': {
    maxMessages: 18,
    maxTotalChars: 7000,
    preserveRecentMessages: 5
  }
};

export function getContextConfig(assistantId?: string): ContextConfig {
  const baseConfig = DEFAULT_CONTEXT_CONFIG;
  
  if (assistantId && ASSISTANT_CONTEXT_CONFIGS[assistantId]) {
    return {
      ...baseConfig,
      ...ASSISTANT_CONTEXT_CONFIGS[assistantId]
    };
  }
  
  return baseConfig;
}

export function saveContextConfig(config: ContextConfig): void {
  localStorage.setItem('contextConfig', JSON.stringify(config));
}

export function loadContextConfig(): ContextConfig {
  try {
    const saved = localStorage.getItem('contextConfig');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_CONTEXT_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Error loading context config:', error);
  }
  
  return DEFAULT_CONTEXT_CONFIG;
}
