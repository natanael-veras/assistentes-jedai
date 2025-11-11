
import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';

export const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'pt-BR';
      recognition.maxAlternatives = 1;
      
      if ('webkitSpeechRecognition' in window) {
        recognition.serviceURI = 'wss://www.google.com/speech-api/full-duplex/v1/up';
      }
      
      recognition.onstart = () => {
        console.log('🎤 Reconhecimento de voz iniciado');
        setIsListening(true);
        setInterimText('');
      };
      
      recognition.onresult = (event: any) => {
        console.log('📝 Resultado recebido:', event);
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          const confidence = event.results[i][0].confidence;
          
          console.log(`Resultado ${i}:`, { transcript, confidence, isFinal: event.results[i].isFinal });
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        setInterimText(interimTranscript);
        
        if (finalTranscript) {
          const cleanedText = finalTranscript.trim();
          if (cleanedText) {
            return cleanedText;
          }
        }
      };
      
      recognition.onerror = (event: any) => {
        console.error('❌ Erro no reconhecimento:', event.error, event);
        setIsListening(false);
        setInterimText('');
        
        const errorMessages: Record<string, string> = {
          'no-speech': 'Nenhuma fala detectada. Fale mais alto ou próximo ao microfone.',
          'audio-capture': 'Microfone não encontrado. Verifique se está conectado e funcionando.',
          'not-allowed': 'Permissão do microfone negada. Clique no ícone do cadeado na barra de endereços e permita o acesso ao microfone.',
          'network': 'Erro de rede. Verifique sua conexão com a internet.',
          'service-not-allowed': 'Serviço de reconhecimento não permitido. Tente recarregar a página.',
          'bad-grammar': 'Erro na gramática de reconhecimento.',
          'language-not-supported': 'Idioma não suportado.'
        };
        
        const message = errorMessages[event.error] || `Erro no reconhecimento de voz: ${event.error}`;
        toast.error(message);
      };
      
      recognition.onend = () => {
        console.log('⏹️ Reconhecimento finalizado');
        setIsListening(false);
        setInterimText('');
      };
      
      recognitionRef.current = recognition;
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = async (onTextReceived: (text: string) => void) => {
    if (!recognitionRef.current) {
      toast.error('Reconhecimento de voz não suportado neste navegador.');
      return;
    }
    
    if (isListening) {
      console.log('🛑 Parando reconhecimento...');
      recognitionRef.current.stop();
    } else {
      try {
        console.log('▶️ Iniciando reconhecimento...');
        
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            console.log('✅ Permissão do microfone OK');
          } catch (permissionError) {
            console.error('❌ Erro de permissão:', permissionError);
            toast.error('Por favor, permita o acesso ao microfone e tente novamente.');
            return;
          }
        }
        
        // Setup one-time result handler
        recognitionRef.current.onresult = (event: any) => {
          let finalTranscript = '';
          let interimTranscript = '';
          
          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            
            if (event.results[i].isFinal) {
              finalTranscript += transcript;
            } else {
              interimTranscript += transcript;
            }
          }
          
          setInterimText(interimTranscript);
          
          if (finalTranscript) {
            const cleanedText = finalTranscript.trim();
            if (cleanedText) {
              onTextReceived(cleanedText);
              setInterimText('');
            }
          }
        };
        
        recognitionRef.current.start();
      } catch (error) {
        console.error('❌ Erro ao iniciar reconhecimento:', error);
        toast.error('Erro ao iniciar o reconhecimento de voz. Tente novamente.');
        setIsListening(false);
      }
    }
  };

  const isSpeechRecognitionSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;

  return {
    isListening,
    interimText,
    toggleListening,
    isSpeechRecognitionSupported
  };
};
