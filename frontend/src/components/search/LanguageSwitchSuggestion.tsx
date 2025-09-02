import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitchSuggestionProps {
  detectedLanguage: string;
  currentUILanguage: string;
  onAccept: () => void;
  onDismiss: () => void;
}

// Multilingual suggestion messages
const SUGGESTIONS = {
  'en': {
    message: 'Would you like to switch to English?',
    yes: 'Yes',
    no: 'No, thanks'
  },
  'nl': {
    message: 'Wil je overschakelen naar het Nederlands?',
    yes: 'Ja',
    no: 'Nee, bedankt'
  },
  'pl': {
    message: 'Czy chcesz przełączyć na polski?',
    yes: 'Tak',
    no: 'Nie, dziękuję'
  },
  'de': {
    message: 'Möchten Sie zu Deutsch wechseln?',
    yes: 'Ja',
    no: 'Nein, danke'
  },
  'ar': {
    message: 'هل تريد التبديل إلى العربية؟',
    yes: 'نعم',
    no: 'لا، شكراً'
  },
  'tr': {
    message: 'Türkçeye geçmek ister misiniz?',
    yes: 'Evet',
    no: 'Hayır, teşekkürler'
  },
  'es': {
    message: '¿Quieres cambiar al español?',
    yes: 'Sí',
    no: 'No, gracias'
  },
  'fr': {
    message: 'Voulez-vous passer au français ?',
    yes: 'Oui',
    no: 'Non, merci'
  },
  'it': {
    message: 'Vuoi passare all\'italiano?',
    yes: 'Sì',
    no: 'No, grazie'
  },
  'ru': {
    message: 'Хотите переключиться на русский?',
    yes: 'Да',
    no: 'Нет, спасибо'
  },
  'uk': {
    message: 'Хочете перейти на українську?',
    yes: 'Так',
    no: 'Ні, дякую'
  },
  'hi': {
    message: 'क्या आप हिंदी में बदलना चाहते हैं?',
    yes: 'हाँ',
    no: 'नहीं, धन्यवाद'
  },
  'zh-Hans': {
    message: '您想切换到中文吗？',
    yes: '是',
    no: '不，谢谢'
  },
  'zh': {
    message: '您想切换到中文吗？',
    yes: '是',
    no: '不，谢谢'
  }
} as const;

const LanguageSwitchSuggestion: React.FC<LanguageSwitchSuggestionProps> = ({
  detectedLanguage,
  currentUILanguage,
  onAccept,
  onDismiss
}) => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);

  // Get the suggestion text in the detected language
  const suggestion = SUGGESTIONS[detectedLanguage as keyof typeof SUGGESTIONS];

  // Hide if we don't have a suggestion for this language
  if (!suggestion || !isVisible) {
    return null;
  }

  // Don't show if user is already using the detected language
  if (detectedLanguage === currentUILanguage) {
    return null;
  }

  const handleAccept = () => {
    setIsVisible(false);
    onAccept();
  };

  const handleDismiss = () => {
    setIsVisible(false);
    onDismiss();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-in-up md:bottom-8 md:right-8">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
        <div className="flex items-start space-x-3">
          {/* Language Icon */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </div>
          </div>
          
          {/* Content */}
          <div className="flex-1">
            <p className="text-sm text-gray-800 mb-3">
              {suggestion.message}
            </p>
            
            <div className="flex space-x-2">
              {/* Accept Button */}
              <button
                onClick={handleAccept}
                className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {suggestion.yes}
              </button>
              
              {/* Dismiss Button */}
              <button
                onClick={handleDismiss}
                className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                {suggestion.no}
              </button>
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitchSuggestion;