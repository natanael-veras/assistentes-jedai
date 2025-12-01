
/**
 * Utilitário para fazer chamadas à API personalizada
 */
import { getAssistantById } from "@/data/assistants";
import { Message } from '../components/ResponseDisplay';

interface ApiResponse {
  data: any;
  error?: string;
}

export const sendPrompt = async (
  content: string, 
  messages: Message[] = [],
  assistantId?: string, 
  signal?: AbortSignal
): Promise<ApiResponse> => {
  try {
    // Default API configuration
    let apiEndpoint = 'https://proxy.dta.totvs.ai/v1/chat/completions';
    let headers: Record<string, string> = {
      'Authorization': 'Bearer sk-XdC0Lx9Kwjrl2qGh5ZiHFA',
      'Content-Type': 'application/json',
    };
    let systemPrompt: string | undefined = "Você é uma assistente virtual";
    let model: string = "gpt-4o-mini";
    let payload: any = {};

    // If assistantId is provided, get custom configuration
    if (assistantId) {
      const assistant = getAssistantById(assistantId);
      if (assistant) {
        // Override with assistant-specific config
        if (assistant.apiEndpoint) {
          apiEndpoint = assistant.apiEndpoint;
        }
        
        if (assistant.apiHeaders) {
          headers = assistant.apiHeaders;
        }

        if (assistant.systemPrompt) {
          systemPrompt = assistant.systemPrompt;
        }

        if (assistant.model) {
          model = assistant.model;
        }

        // Use system prompt directly without modifications
        let enhancedSystemPrompt = systemPrompt;

        // Special handling for documentation assistant
        if (assistantId === 'documentation') {
          payload = {
            content: `Você é um especialista na plataforma TOTVS Fluig. Com base apenas nos documentos desta base de conhecimento, quero saber todas as formas diferentes de realizar a seguinte operação: ${content} .\n\nPrimeiramente, elabore um resumo explicativo, descrevendo de forma clara e completa o que é essa operação ou funcionalidade no contexto do Fluig: seu objetivo, onde ela se aplica e por que é usada.\n\nEm seguida, liste todas as formas de realizar essa operação, separando cada método e explicando:\n- Como cada método funciona (ex: via interface, via API, via script, etc.)\n- Diferenças entre eles\n- Qual deles é mais recomendável em cenários comuns\n\nSe algum método estiver desatualizado, descontinuado ou for inseguro, informe isso claramente.\n\nImportante: só use informações presentes nos documentos. Ignore qualquer dado externo.`
          };
        } else {
          // Default OpenAI-compatible format for other assistants
          const temperature = assistant.temperature ? parseFloat(assistant.temperature) : 0.5;
          payload = {
            model: model,
            temperature: temperature,
            messages: [
              { role: "system", content: enhancedSystemPrompt },
              ...messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
              })),
              { role: "user", content }
            ]
          };
        }
      }
    }

    console.log('Sending API request to:', apiEndpoint);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      signal,
    });

    if (!response.ok) {
      console.error('API response error:', response.status, response.statusText);
      throw new Error(`Erro na API: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('API response received:', responseData);
    
    // Extract content from response format
    if (responseData.choices && responseData.choices.length > 0) {
      console.log('Extracted response content:', responseData.choices[0].message.content);
      return { 
        data: { 
          content: responseData.choices[0].message.content 
        } 
      };
    }
    
    return { data: responseData };
  } catch (error) {
    console.error('Erro ao enviar prompt:', error);
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        data: null,
        error: 'AbortError'
      };
    }
    
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao processar sua solicitação' 
    };
  }
};
