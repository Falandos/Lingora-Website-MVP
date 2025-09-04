import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { useLanguageTransition } from '../hooks/useLanguageTransition';

interface LanguageTransitionContextType {
  triggerLanguageChange: (language: string, changeCallback: () => void) => void;
  isTransitioning: boolean;
}

const LanguageTransitionContext = createContext<LanguageTransitionContextType | undefined>(undefined);

interface LanguageTransitionProviderProps {
  children: ReactNode;
}

export const LanguageTransitionProvider: React.FC<LanguageTransitionProviderProps> = ({ children }) => {
  const { triggerTransition, isTransitioning } = useLanguageTransition();

  const triggerLanguageChange = useCallback((language: string, changeCallback: () => void) => {
    triggerTransition(language, changeCallback);
  }, [triggerTransition]);

  return (
    <LanguageTransitionContext.Provider value={{ triggerLanguageChange, isTransitioning }}>
      {children}
    </LanguageTransitionContext.Provider>
  );
};

export const useLanguageTransitionContext = (): LanguageTransitionContextType => {
  const context = useContext(LanguageTransitionContext);
  if (context === undefined) {
    throw new Error('useLanguageTransitionContext must be used within a LanguageTransitionProvider');
  }
  return context;
};