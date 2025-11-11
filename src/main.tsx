
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initGoogleAnalytics, initMicrosoftClarity } from './utils/analytics.ts'

// Initialize analytics tools - replace with your actual tracking IDs
// For production use, you might want to use environment variables
const GOOGLE_ANALYTICS_ID = "G-1JSHS2Z98T"; // Replace with your actual GA measurement ID
const MICROSOFT_CLARITY_ID = "qqvw6oiwdt"; // Replace with your actual Clarity project ID

// Initialize analytics tools
initGoogleAnalytics(GOOGLE_ANALYTICS_ID);
initMicrosoftClarity(MICROSOFT_CLARITY_ID);

createRoot(document.getElementById("root")!).render(<App />);
