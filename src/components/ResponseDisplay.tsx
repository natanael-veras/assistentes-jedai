import React, { useRef, useEffect, useState } from 'react';
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, RefreshCw, Plus, Volume2, VolumeX, Download } from "lucide-react";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import TypingLoader from './TypingLoader';
import CodeSnippet from './CodeSnippet';
import AIDataTable from './AIDataTable';
import { useSpeechSynthesis } from '@/hooks';
import { renderSimpleMarkdown } from '@/utils/markdownUtils';
import jsPDF from 'jspdf';

export interface Message {
  id: string;
  role: 'user' | 'system';
  content: string;
  timestamp: Date;
  liked?: boolean;
  disliked?: boolean;
}

interface ResponseDisplayProps {
  messages: Message[];
  loading: boolean;
  welcomeComponent?: React.ReactNode;
  onStopGeneration?: () => void;
  onRegenerateMessage?: (messageId: string) => void;
  actionBelowMessages?: React.ReactNode;
  onResetChat?: () => void;
}

// Regex to detect code blocks
const codeBlockRegex = /```(\w*)\n([\s\S]*?)```/g;

// Regex to detect markdown tables
const tableRegex = /\|.*\|[\r\n]+\|[-\s:|]+\|[\r\n]+((?:\|.*\|[\r\n]*)+)/g;

function processMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let elementIndex = 0;

  // Reset regex
  codeBlockRegex.lastIndex = 0;
  tableRegex.lastIndex = 0;

  // Find all code blocks and tables with their positions
  const elements: Array<{ start: number; end: number; type: 'code' | 'table'; content: any }> = [];

  // Find code blocks
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
      // Parse table headers
      const headers = lines[0]
        .split('|')
        .slice(1, -1)
        .map(header => header.trim())
        .filter(header => header.length > 0);
      
      // Parse table rows (skip separator line)
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
    // Add text before the element
    if (element.start > lastIndex) {
      const textBefore = text.substring(lastIndex, element.start);
      if (textBefore.trim()) {
        const processedText = renderSimpleMarkdown(textBefore);
        parts.push(processedText);
      }
    }

    // Add the element
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

  // Add any remaining text after the last element
  if (lastIndex < text.length) {
    const remainingText = text.substring(lastIndex);
    if (remainingText.trim()) {
      const processedText = renderSimpleMarkdown(remainingText);
      parts.push(processedText);
    }
  }

  return parts;
}

const ResponseDisplay: React.FC<ResponseDisplayProps> = ({ 
  messages, 
  loading,
  welcomeComponent,
  onStopGeneration,
  onRegenerateMessage,
  actionBelowMessages,
  onResetChat
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [typingIndex, setTypingIndex] = useState(-1);
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [fullText, setFullText] = useState('');
  const typingSpeed = 10;
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const maxTypingWords = 20; // Changed from 10 to 20 as requested

  // Add speech synthesis
  const { isSpeaking, currentText, toggle: toggleSpeech, isSupported } = useSpeechSynthesis();

  // Update the scrollToBottom state whenever there are new messages or typed text
  useEffect(() => {
    setShouldScrollToBottom(true);
  }, [messages, displayedText]);
  
  // Handle the typing effect for system messages
  useEffect(() => {
    if (messages.length === 0) return;
    
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'system') {
      setTypingIndex(messages.length - 1);
      setFullText(lastMessage.content);
      setDisplayedText('');
      setIsTyping(true);
      setShouldScrollToBottom(true);
    }
  }, [messages.length]);

  // Modified typing effect to handle the first 20 words only (previously 10)
  useEffect(() => {
    if (!isTyping || typingIndex === -1) return;
    
    if (displayedText.length < fullText.length) {
      // Count words in current displayed text
      const currentWordCount = displayedText.trim().split(/\s+/).length;
      
      // If we haven't reached 20 words yet, continue character by character
      if (currentWordCount < maxTypingWords) {
        const timeout = setTimeout(() => {
          setDisplayedText(fullText.substring(0, displayedText.length + 1));
          setShouldScrollToBottom(true);
        }, typingSpeed);
        
        return () => clearTimeout(timeout);
      } else {
        // If we've reached 20 words, display the full text immediately
        setDisplayedText(fullText);
        setIsTyping(false);
        setTypingIndex(-1);
      }
    } else {
      setIsTyping(false);
      setTypingIndex(-1);
    }
  }, [displayedText, fullText, isTyping, typingIndex, maxTypingWords]);
  
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => toast.success("Mensagem copiada para a área de transferência"))
      .catch(() => toast.error("Falha ao copiar a mensagem"));
  };

  const handleFeedback = (messageId: string, feedback: 'like' | 'dislike') => {
    const updatedMessages = messages.map(msg => {
      if (msg.id === messageId) {
        if (feedback === 'like') {
          return { 
            ...msg, 
            liked: !msg.liked, 
            disliked: false 
          };
        } else {
          return { 
            ...msg, 
            disliked: !msg.disliked, 
            liked: false 
          };
        }
      }
      return msg;
    });
    
    toast.success(`Feedback ${feedback === 'like' ? 'positivo' : 'negativo'} registrado!`);
  };

  const handleSpeech = (messageContent: string, messageId: string) => {
    toggleSpeech(messageContent);
  };

  const handleDownloadPDF = (messageContent: string) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;
      
      // Clean markdown from content
      const cleanText = messageContent
        .replace(/```[\s\S]*?```/g, '[Código omitido]')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .replace(/\*(.*?)\*/g, '$1')
        .replace(/_(.*?)_/g, '$1')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/^#{1,6}\s+/gm, '');
      
      // Add title
      doc.setFontSize(16);
      doc.text('Resposta do Assistente IA', margin, margin);
      
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
      doc.save(`resposta-assistente-${Date.now()}.pdf`);
      toast.success("PDF baixado com sucesso!");
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast.error("Erro ao gerar PDF");
    }
  };

  const isSpeakingMessage = (messageContent: string): boolean => {
    if (!isSpeaking || !currentText) return false;
    const cleanContent = messageContent
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      .replace(/_(.*?)_/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\n\s*\n/g, '. ')
      .replace(/\n/g, ' ')
      .trim();
    return cleanContent === currentText;
  };

  const shouldShowNewChatButton = !!onResetChat
    && messages.length > 0
    && messages[messages.length - 1].role === 'system'
    && (!isTyping || typingIndex !== messages.length - 1);

  const hasMessages = messages.length > 0;

  const renderMessageContent = (message: Message, isTyping: boolean, displayedText: string) => {
    if (message.role === 'user') {
      return message.content;
    }
    
    const contentToRender = isTyping ? displayedText : message.content;
    
    // Process the message content to render code blocks and tables
    return processMarkdown(contentToRender);
  };

  // Add debugging logs to track messages and states
  console.log('Messages in ResponseDisplay:', messages);
  console.log('Is typing:', isTyping, 'Typing index:', typingIndex);
  console.log('Displayed text length:', displayedText.length);
  console.log('Full text length:', fullText.length);

  return (
    <ScrollArea 
      className={cn(
        "h-full w-full flex flex-col", 
        !hasMessages && "overflow-hidden"
      )}
      scrollToBottom={shouldScrollToBottom}
    >
      <div className="py-4 px-3 flex-grow flex flex-col">
        <div className="space-y-6 flex-grow">
          {messages.length === 0 ? (
            welcomeComponent || (
              <div className="flex h-[calc(100vh-16rem)] items-center justify-center p-8">
                <div className="max-w-md text-center">
                  <h3 className="mb-2 text-xl font-medium">Bem-vindo</h3>
                  <p className="text-muted-foreground">
                    Digite uma mensagem para começar a conversa.
                  </p>
                </div>
              </div>
            )
          ) : (
            <div className="flex flex-col min-h-full justify-end">
              {messages.map((message, index) => {
                const isLastSystem =
                  messages.length - 1 === index &&
                  message.role === 'system';

                const isCurrentlySpeaking = isSpeakingMessage(message.content);

                return (
                  <div 
                    key={message.id}
                    className={cn(
                      "flex w-full animate-fade-up items-end mb-4",
                      message.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%]",
                        message.role === 'user' 
                          ? "bg-primary text-primary-foreground user-message" 
                          : "bg-secondary text-secondary-foreground system-message"
                      )}
                    >
                      <div className="mb-1 text-sm leading-relaxed whitespace-pre-wrap select-text">
                        {message.role === 'system' && index === typingIndex && isTyping
                          ? renderMessageContent(message, true, displayedText)
                          : renderMessageContent(message, false, message.content)}
                        {message.role === 'system' && index === typingIndex && isTyping && (
                          <span className="typing-cursor">|</span>
                        )}
                      </div>
                      
                      {message.role === 'system' && (
                        <div className="mt-3 flex items-center justify-between gap-1 border-t pt-2 border-secondary-foreground/10">
                          {isLastSystem && shouldShowNewChatButton && (
                            <button
                              type="button"
                              className={cn(
                                "flex items-center gap-1 pl-0 pr-5 py-0 text-muted-foreground hover:text-primary transition-colors font-medium bg-transparent border-none shadow-none outline-none",
                                "ml-0"
                              )}
                              style={{ background: 'none', boxShadow: 'none', border: 'none' }}
                              onClick={() => onResetChat && onResetChat()}
                              data-testid="new-chat-btn"
                            >
                              <Plus className="w-4 h-4" />
                              <span className="text-sm font-medium">Nova conversa</span>
                            </button>
                          )}
                          <div className="flex items-center gap-1 ml-auto">
                          {(!isTyping || index !== typingIndex) && isSupported && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn(
                                      "h-8 w-8 p-0",
                                      isCurrentlySpeaking && "text-blue-500"
                                    )}
                                    onClick={() => handleSpeech(message.content, message.id)}
                                  >
                                    {isCurrentlySpeaking ? (
                                      <VolumeX className="h-4 w-4" />
                                    ) : (
                                      <Volume2 className="h-4 w-4" />
                                    )}
                                    <span className="sr-only">
                                      {isCurrentlySpeaking ? 'Parar áudio' : 'Ouvir resposta'}
                                    </span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{isCurrentlySpeaking ? 'Parar Áudio' : 'Ouvir Resposta'}</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(!isTyping || index !== typingIndex) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0" 
                                    onClick={() => copyToClipboard(message.content)}
                                  >
                                    <Copy className="h-4 w-4" />
                                    <span className="sr-only">Copiar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copiar Mensagem</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(!isTyping || index !== typingIndex) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn("h-8 w-8 p-0", message.liked && "text-green-500")} 
                                    onClick={() => handleFeedback(message.id, 'like')}
                                  >
                                    <ThumbsUp className="h-4 w-4" />
                                    <span className="sr-only">Curtir</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Curtir Resposta</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(!isTyping || index !== typingIndex) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn("h-8 w-8 p-0", message.disliked && "text-red-500")}
                                    onClick={() => handleFeedback(message.id, 'dislike')}
                                  >
                                    <ThumbsDown className="h-4 w-4" />
                                    <span className="sr-only">Não curtir</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Não Curtir Resposta</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(!isTyping || index !== typingIndex) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0" 
                                    onClick={() => onRegenerateMessage && onRegenerateMessage(message.id)}
                                  >
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Regenerar</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Regenerar Resposta</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          {(!isTyping || index !== typingIndex) && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 w-8 p-0" 
                                    onClick={() => handleDownloadPDF(message.content)}
                                  >
                                    <Download className="h-4 w-4" />
                                    <span className="sr-only">Baixar PDF</span>
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Baixar PDF</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {loading && (
                <div className="flex w-full animate-fade-up items-end justify-start mb-4">
                  <div className="max-w-[85%] rounded-2xl px-4 py-3 shadow-sm sm:max-w-[75%] bg-secondary text-secondary-foreground">
                    <TypingLoader />
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
          {actionBelowMessages}
        </div>
      </div>
    </ScrollArea>
  );
};

export default ResponseDisplay;
