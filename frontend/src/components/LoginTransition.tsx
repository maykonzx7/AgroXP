import React, { useEffect, useState } from 'react';
import { Leaf } from 'lucide-react';

interface LoginTransitionProps {
  onComplete: () => void;
}

const LoginTransition: React.FC<LoginTransitionProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'logo' | 'text' | 'complete'>('logo');

  useEffect(() => {
    // Sequência de animações
    const timer1 = setTimeout(() => setPhase('text'), 1000);
    const timer2 = setTimeout(() => setPhase('complete'), 2500);
    const timer3 = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-primary/20 via-background to-background">
      <div className="text-center">
        {/* Logo animado */}
        <div 
          className={`inline-flex items-center justify-center w-24 h-24 bg-primary rounded-2xl mb-6 shadow-2xl transition-all duration-1000 ${
            phase === 'logo' 
              ? 'scale-100 rotate-0 opacity-100' 
              : phase === 'text'
              ? 'scale-110 rotate-12 opacity-90'
              : 'scale-150 rotate-0 opacity-0'
          }`}
        >
          <Leaf className="h-12 w-12 text-primary-foreground" />
        </div>
        
        {/* Nome do sistema */}
        <h1 
          className={`text-4xl font-bold text-foreground transition-all duration-1000 ${
            phase === 'text' || phase === 'complete'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          AgroXP
        </h1>
        
        <p 
          className={`text-muted-foreground mt-2 transition-all duration-1000 delay-300 ${
            phase === 'text' || phase === 'complete'
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4'
          }`}
        >
          Sistema de Gestão Agropecuária
        </p>
      </div>
    </div>
  );
};

export default LoginTransition;

