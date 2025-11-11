
import React, { useEffect, useState } from 'react';
import { Bot, Brain, Sparkles, CircuitBoard, Cpu } from 'lucide-react';

const AIAnimation: React.FC = () => {
  const [activeIcon, setActiveIcon] = useState(0);
  const icons = [
    { component: Brain, color: 'text-blue-500' },
    { component: Bot, color: 'text-purple-500' },
    { component: Sparkles, color: 'text-indigo-500' },
    { component: CircuitBoard, color: 'text-violet-500' },
    { component: Cpu, color: 'text-blue-400' }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIcon((prev) => (prev + 1) % icons.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-16 h-16 mx-auto mb-2">
      {/* Background Circle - Increased size */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-950/30 dark:to-purple-950/30 animate-pulse" />
      
      {/* Central Icon */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icons.map((Icon, index) => (
          <div 
            key={index} 
            className={`absolute transition-all duration-500 ${
              activeIcon === index 
                ? 'opacity-100 scale-100' 
                : 'opacity-0 scale-50'
            }`}
          >
            <Icon.component className={`h-6 w-6 ${Icon.color}`} />
          </div>
        ))}
      </div>
      
      {/* Orbiting Elements */}
      <div className="absolute inset-0">
        <div className="absolute w-full h-full animate-spin-slow">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></div>
          </div>
        </div>
        
        <div className="absolute w-full h-full animate-spin-slow" style={{ animationDuration: '15s' }}>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
          </div>
        </div>
        
        <div className="absolute w-full h-full animate-spin-slow" style={{ animationDuration: '12s' }}>
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
          </div>
        </div>
        
        <div className="absolute w-full h-full animate-spin-slow" style={{ animationDuration: '18s' }}>
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
          </div>
        </div>
      </div>
      
      {/* Network Lines */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
        <line 
          x1="50" y1="50" x2="50" y2="10" 
          stroke="currentColor" 
          className="text-purple-300 dark:text-purple-700 opacity-70 stroke-[0.5]"
        />
        <line 
          x1="50" y1="50" x2="50" y2="90" 
          stroke="currentColor" 
          className="text-blue-300 dark:text-blue-700 opacity-70 stroke-[0.5]"
        />
        <line 
          x1="50" y1="50" x2="90" y2="50" 
          stroke="currentColor" 
          className="text-indigo-300 dark:text-indigo-700 opacity-70 stroke-[0.5]"
        />
        <line 
          x1="50" y1="50" x2="10" y2="50" 
          stroke="currentColor" 
          className="text-violet-300 dark:text-violet-700 opacity-70 stroke-[0.5]"
        />
      </svg>
      
      {/* Particle Effects - Reduced */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-primary rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 1}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AIAnimation;
