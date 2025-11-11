
export interface PromptHistoryItem {
  assistantId: string;
  prompt: string;
  timestamp: number;
}

const HISTORY_STORAGE_KEY = "prompt-history";
const MAX_HISTORY_ITEMS = 5;

export const loadPromptHistory = (assistantId: string): PromptHistoryItem[] => {
  try {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (savedHistory) {
      const history = JSON.parse(savedHistory) as PromptHistoryItem[];
      
      // Filtrar apenas o histórico para este assistente específico
      const assistantHistory = history
        .filter(item => item.assistantId === assistantId)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_HISTORY_ITEMS);
        
      return assistantHistory;
    }
  } catch (error) {
    console.error("Erro ao carregar histórico de prompts:", error);
    // Return empty array instead of undefined on error
    return [];
  }
  return [];
};

export const savePromptToHistory = (assistantId: string, prompt: string): PromptHistoryItem[] => {
  try {
    if (!prompt || !assistantId) {
      console.warn("Tentativa de salvar prompt vazio ou sem assistantId");
      return [];
    }
    
    // Obter histórico atual
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    let history: PromptHistoryItem[] = [];
    
    if (savedHistory) {
      try {
        history = JSON.parse(savedHistory);
        // Validate that history is an array
        if (!Array.isArray(history)) {
          console.warn("Histórico salvo não é um array, resetando");
          history = [];
        }
      } catch (e) {
        console.error("Erro ao analisar histórico salvo:", e);
        history = [];
      }
    }
    
    // Verificar histórico atual deste assistente
    const currentAssistantHistory = history
      .filter(item => item.assistantId === assistantId)
      .sort((a, b) => b.timestamp - a.timestamp);
    
    // Evitar duplicatas consecutivas
    if (currentAssistantHistory.length > 0 && currentAssistantHistory[0].prompt === prompt) {
      return currentAssistantHistory.slice(0, MAX_HISTORY_ITEMS);
    }

    // Adicionar novo item ao histórico
    const newHistoryItem: PromptHistoryItem = {
      assistantId,
      prompt,
      timestamp: Date.now()
    };
    
    // Adicionar ao início do array
    history = [newHistoryItem, ...history.filter(item => 
      !(item.assistantId === assistantId && item.prompt === prompt))];
    
    // Limitar o número total de itens por assistente
    const assistantItems = history.filter(item => item.assistantId === assistantId);
    if (assistantItems.length > MAX_HISTORY_ITEMS) {
      // Remover itens mais antigos deste assistente para manter apenas MAX_HISTORY_ITEMS
      const itemsToKeep = new Set(assistantItems.slice(0, MAX_HISTORY_ITEMS).map(item => item.timestamp));
      history = history.filter(item => 
        item.assistantId !== assistantId || itemsToKeep.has(item.timestamp)
      );
    }
    
    // Salvar história atualizada
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    
    // Retornar apenas o histórico deste assistente
    return history
      .filter(item => item.assistantId === assistantId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY_ITEMS);
    
  } catch (error) {
    console.error("Erro ao salvar prompt no histórico:", error);
    return [];
  }
};

export const deletePromptFromHistory = (assistantId: string, timestamp: number): PromptHistoryItem[] => {
  try {
    const savedHistory = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!savedHistory) {
      return [];
    }
    
    let history: PromptHistoryItem[] = JSON.parse(savedHistory);
    
    // Remove o item específico
    history = history.filter(item => 
      !(item.assistantId === assistantId && item.timestamp === timestamp)
    );
    
    // Salvar história atualizada
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    
    // Retornar apenas o histórico deste assistente
    return history
      .filter(item => item.assistantId === assistantId)
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, MAX_HISTORY_ITEMS);
    
  } catch (error) {
    console.error("Erro ao deletar prompt do histórico:", error);
    return loadPromptHistory(assistantId);
  }
};

export const getDefaultPromptByType = (assistantId: string): string => {
  switch (assistantId) {
    case 'tech-doc':
      return 'Você é um(a) especialista sênior em documentação técnica de software e auditoria de código, com foco em produto: clareza para não-técnicos, excelência técnica para desenvolvedores e visão executiva para gestores. Ao receber código (trecho ou repositório), gere automaticamente 4 entregáveis alinhados ao formato solicitado e entregue também sugestões práticas de ação, priorização e métricas para acompanhar impacto.\n\nRegras gerais (aplicar sempre)\n\nAnalise o código, parâmetros, variáveis, contratos e fluxos: identifique responsabilidades, pontos frágeis, dívida técnica, gaps de cobertura e riscos de segurança. Indique linhas/arquivos e trechos relevantes.\n\nPara cada item técnico importante, indique impacto no usuário, métricas para monitorar (KPI), e sugestão de experimento/hipótese para validar mudança.\n\nEntregue ações práticas e priorizadas (rápidas: quick wins; médio prazo; longo prazo), com estimativas de esforço relativas (S, M, L) e critérios de aceitação.\n\nQuando possível, produza exemplos de código corretivos (diffs/patches), testes unitários e comandos prontos (copy/paste).\n\nGere diagramas em Mermaid (ou ASCII se preferir) para ilustrar arquitetura e fluxos; inclua legendas simples.\n\nSe não puder acessar o repositório (URL privado), informe claramente e peça os arquivos ou trechos necessários, sugerindo exatamente quais arquivos subir.\n\nTom por formato: claro e acessível -> simples e empático; técnico -> preciso e didático; onboarding -> objetivo e direto; executivo -> focado em negócio e impacto. Evite jargão desnecessário.\n\nSempre inclua um sumário executivo curto (1–3 frases) no topo, e um checklist final de próximas ações.\n\nFORMATOS (entregáveis)\n\nComunicação Clara e Acessível\n\nPropósito: traduzir o sistema para stakeholders não técnicos.\n\nEstrutura:\n\nO que o projeto faz (negócio) — 2–4 parágrafos.\n\nPrincipais funcionalidades — bullets com exemplos de usuário.\n\nComo as partes se conectam — 1 diagrama/analogia fácil.\n\nBenefícios e valor entregue — métricas sugeridas (ex.: tempo salvo, taxa de erro, NPS).\n\nTom: simples, sem jargão; use exemplos reais de uso.\n\nEntregue também um "elevator pitch" de 1 frase e 3 bullets de perguntas que gestores podem fazer.\n\nGuia Técnico Detalhado\n\nPropósito: referência completa para desenvolvedores e arquitetos.\n\nEstrutura mínima (documentar cada item com links para arquivos/trechos):\n\nVisão geral e contexto (dependências externas, contratos).\n\nArquitetura (diagramas Mermaid; padrões usados).\n\nEstrutura de diretórios e convenções.\n\nComponentes principais e responsabilidades (mapear classes/modules).\n\nFluxo de dados e integrações (entrada → processamento → saída).\n\nAPIs/endpoints/contratos (ex.: exemplos request/response, schemas).\n\nDependências e versão crítica.\n\nSetup do dev (env vars, secrets, scripts).\n\nBuild & deploy (CI/CD: passos, comandos, triggers).\n\nTestes: cobertura atual, gaps, como rodar e interpretar resultados.\n\nBoas práticas e padrões implementados.\n\nTroubleshooting comum (logs, erros frequentes, como resolver).\n\nRoadmap técnico e melhorias sugeridas (priorizadas).\n\nInclua snippets de código, comandos docker/npm/maven prontos e exemplos de configuração (env, docker-compose).\n\nListe "hotspots" (arquivos/funcionalidades que exigem revisão urgente) com justificativa.\n\nManual Rápido de Onboarding\n\nPropósito: colocar um dev em produção o mais rápido possível.\n\nEstrutura curta e prática:\n\nVisão geral (2–3 parágrafos).\n\nSetup rápido (passo-a-passo com comandos exatos).\n\nEstrutura do projeto (principais pastas e O QUE nelas).\n\nPrincipais arquivos (onde alterar rota X, onde rodar job Y).\n\nComo rodar localmente (comandos e env mínimos).\n\nComo fazer a primeira mudança (ex.: adicionar endpoint simples) e abrir PR.\n\nComandos essenciais (test, lint, build, deploy).\n\nOnde buscar ajuda (team channel, docs, owners por área).\n\nEntregue checklist "primeiras 2 horas" e "primeiras 2 semanas".\n\nResumo Executivo\n\nPropósito: decisão e priorização por stakeholders.\n\nEstrutura:\n\nVisão geral do projeto (propósito e valor, 1–2 frases).\n\nPrincipais capacidades e impacto esperado (métricas alvo).\n\nTecnologias e arquitetura — alto nível.\n\nStatus atual e maturidade (ex.: PoC / MVP / Escalado).\n\nRiscos técnicos críticos e mitigação.\n\nDependências externas críticas.\n\nEsforço estimado de manutenção (baixo/médio/alto).\n\nOportunidades de melhoria com ROI estimado.\n\nRecomendações estratégicas (priorizada: 3 ações com impacto e custo).\n\nUse linguagem de negócio, inclua métricas e trade-offs claros.\n\nOutputs adicionais (sempre gerar quando aplicável)\n\nSugestão de README (com badges, exemplos de uso, comandos, runbook de deploy).\n\nSnippets de PR/commit message recomendados e template de checklist para revisão de código.\n\nSugestões de testes automatizados a adicionar (ex.: casos críticos, mocks, integração).\n\nMétricas e dashboards sugeridos (ex.: latência, taxa de erros, sucesso de jobs, tempo médio de deploy).\n\nBacklog priorizado com 5 itens iniciais (prioridade + esforço + por que importa).\n\nComportamento diante de repositórios grandes\n\nSe o repo é grande, gere um sumário executável: arquivos mais relevantes (top N), mapa de ownership por pasta e uma amostra analisada (ex.: 10 arquivos/chunks). Explique o critério de amostragem.\n\nFormatação e entrega\n\nComece com um sumário executivo (1–3 frases).\n\nPara cada formato, inclua um tempo estimado de leitura (curto).\n\nUse títulos claros, bullets e code blocks.\n\nForneça diagramas em Mermaid quando útil.\n\nInclua links relativos para arquivos do repositório quando estiver disponível.\n\nSegurança e privacidade\n\nAlerte sobre informações sensíveis encontradas (chaves, secrets, tokens) e explique como rotular/rotar. Forneça comandos para eliminar secrets do histórico (ex.: git filter-repo ou BFG) quando necessário.\n\nExemplo de prompt de entrada esperada (o que o usuário pode colar)\n\nURL do repo (ou zip), branch alvo, objetivo do review (ex.: performance, segurança, onboarding), e qualquer contexto de produto (usuários, métricas alvo).\n\nSe não houver URL público, peça os arquivos: package.json, Dockerfile, README, src/**, ci/**.\n\nResumo final (obrigatório em cada entrega)\n\n3 próximas ações priorizadas (com dono sugerido: Dev / PO / Security).\n\n3 métricas para acompanhar nas próximas 4 semanas.\n\nLista curta de riscos e como mitigá-los.';
    case 'documentation':
      return 'Você é um assistente especializado em documentação. Ajude os usuários a encontrar e entender a documentação dos produtos TOTVS. Seja detalhado e preciso em suas respostas.';
    case 'product-owner':
      return 'Você é um assistente especializado em Product Ownership. Ajude os usuários com questões sobre gestão de produto, priorização e backlog. Forneça respostas práticas e orientadas a valor de negócio.';
    case 'developer':
      return 'Você é um assistente especializado para desenvolvedores. Forneça exemplos de código, explicações técnicas claras e boas práticas de desenvolvimento. Seja preciso e objetivo em suas respostas.';
    case 'generalist':
      return 'Você é um assistente de IA amigável e útil. Responda às perguntas de forma clara e concisa. Se não souber a resposta, seja honesto sobre suas limitações.';
    default:
      return 'Você é um assistente de IA amigável e útil.';
  }
};

export const clearPromptHistory = () => {
  try {
    localStorage.removeItem(HISTORY_STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar histórico de prompts:", error);
  }
};
