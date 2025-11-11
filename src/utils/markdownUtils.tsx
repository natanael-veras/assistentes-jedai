
import React, { ReactNode } from 'react';

export function processItalic(fragment: string): ReactNode[] {
  const elements: (string | ReactNode)[] = [];
  let last = 0;
  const italicRegex = /(_([^_]+)_|\*([^*]+)\*)/g;
  let m: RegExpExecArray | null;

  while ((m = italicRegex.exec(fragment)) !== null) {
    if (m.index > last) {
      elements.push(fragment.slice(last, m.index));
    }
    elements.push(
      <em key={`em-${m.index}`}>{m[2] || m[3]}</em>
    );
    last = m.index + m[0].length;
  }

  if (last < fragment.length) {
    elements.push(fragment.slice(last));
  }

  return elements;
}

export function renderSimpleMarkdown(text: string): React.ReactNode {
  // Split text by lines to process headers and horizontal rules first
  const lines = text.split('\n');
  const processedLines: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for horizontal rules (--- or more)
    if (line.trim().match(/^-{3,}$/)) {
      processedLines.push(
        <hr key={`hr-${i}`} className="my-4 border-border" />
      );
      continue;
    }
    
    // Check for headers
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const headerText = headerMatch[2];
      
      // Create header element based on level
      const HeaderTag = `h${Math.min(level, 6)}` as keyof JSX.IntrinsicElements;
      processedLines.push(
        <HeaderTag key={`header-${i}`} className={`font-semibold ${
          level === 1 ? 'text-2xl mt-6 mb-4' :
          level === 2 ? 'text-xl mt-5 mb-3' : 
          level === 3 ? 'text-lg mt-4 mb-2' :
          level === 4 ? 'text-base mt-3 mb-2' :
          level === 5 ? 'text-sm mt-2 mb-1' :
          'text-xs mt-2 mb-1'
        }`}>
          {headerText}
        </HeaderTag>
      );
      continue;
    }

    // Process regular text with bold and italic
    if (line.trim() === '') {
      processedLines.push(<br key={`br-${i}`} />);
      continue;
    }

    // Process bold text
    let parts: (string | React.ReactNode)[] = [];
    let lastIdx = 0;
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match: RegExpExecArray | null;
    
    while ((match = boldRegex.exec(line)) !== null) {
      if (match.index > lastIdx) {
        parts.push(line.slice(lastIdx, match.index));
      }
      parts.push(<strong key={`${i}-${match.index}`}>{match[1]}</strong>);
      lastIdx = match.index + match[0].length;
    }
    
    if (lastIdx < line.length) {
      parts.push(line.slice(lastIdx));
    }

    // Process italic text in each part
    const processedParts = parts.map((part, partIndex) => {
      if (typeof part === 'string') {
        const italicResult = processItalic(part);
        return italicResult.length === 1 ? italicResult[0] : italicResult;
      }
      return part;
    });

    processedLines.push(
      <div key={`line-${i}`}>
        {processedParts}
      </div>
    );
  }

  return processedLines.length === 1 ? processedLines[0] : processedLines;
}
