// TEST FILE - BRIGHT YELLOW PLACEHOLDER
import { useState } from 'react';
import useLanguageRotation from '../../hooks/useLanguageRotation';

export const TestHeroSearchBar = () => {
  const { currentLanguage, isVisible, currentIndex } = useLanguageRotation(4500);
  
  return (
    <div style={{ 
      backgroundColor: 'yellow', 
      border: '5px solid red', 
      padding: '20px',
      margin: '20px',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      🔥 TEST COMPONENT ACTIVE! 🔥
      <br />
      Language: {currentLanguage.code} ({currentIndex + 1}/15)
      <br />
      Visible: {isVisible ? 'YES' : 'NO'}
      <br />
      <div style={{ 
        backgroundColor: 'lime',
        padding: '10px',
        border: '2px solid blue'
      }}>
        • {currentLanguage.native} •
      </div>
    </div>
  );
};

export default TestHeroSearchBar;