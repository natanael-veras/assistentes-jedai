
/**
 * Utility functions for analytics tracking with Google Analytics and Microsoft Clarity
 */

// Initialize Google Analytics
export const initGoogleAnalytics = (measurementId: string): void => {
  if (!measurementId) return;
  
  // Add Google Analytics script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.appendChild(script);
  
  // Initialize dataLayer and gtag function
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', measurementId);
  
  // Make gtag available globally
  window.gtag = gtag;
};

// Initialize Microsoft Clarity
export const initMicrosoftClarity = (clarityId: string): void => {
  if (!clarityId) return;
  
  // Add Microsoft Clarity script
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", clarityId);
};

// Track page views
export const trackPageView = (pagePath: string, pageTitle?: string): void => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      page_location: window.location.href
    });
  }
};

// Track chat interactions
export const trackChatInteraction = (action: string, assistantId?: string): void => {
  if (window.gtag) {
    window.gtag('event', 'chat_interaction', {
      action: action,
      assistant_id: assistantId || 'generic'
    });
  }
};

// Track assistant selection
export const trackAssistantSelection = (assistantId: string, assistantName: string): void => {
  if (window.gtag) {
    window.gtag('event', 'assistant_selected', {
      assistant_id: assistantId,
      assistant_name: assistantName
    });
  }
};

// Track API errors
export const trackApiError = (endpoint: string, errorMessage: string): void => {
  if (window.gtag) {
    window.gtag('event', 'api_error', {
      endpoint: endpoint,
      error_message: errorMessage
    });
  }
};

// Declare global gtag function type
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    clarity: (method: string, ...args: any[]) => void;
  }
}
