// UI Language Constants - Matches LanguageCarouselV2 order and languages
// These are the languages available for the user interface translation

export interface UILanguage {
  code: string;
  name: string;
  countryCode: string;
}

// UI Languages in same order as LanguageCarouselV2 (NL › EN › TR › AR › etc.)
export const UI_LANGUAGES: UILanguage[] = [
  { code: 'nl', name: 'Nederlands', countryCode: 'NL' },         // Dutch - primary
  { code: 'en', name: 'English', countryCode: 'GB' },           // English - international
  { code: 'tr', name: 'Türkçe', countryCode: 'TR' },            // Turkish - large community
  { code: 'ar', name: 'العربية', countryCode: 'SA' },           // Arabic - large community
  { code: 'de', name: 'Deutsch', countryCode: 'DE' },           // German - neighboring country
  { code: 'fr', name: 'Français', countryCode: 'FR' },          // French - common in NL
  { code: 'es', name: 'Español', countryCode: 'ES' },           // Spanish - growing community
  { code: 'pl', name: 'Polski', countryCode: 'PL' },            // Polish - large EU migration
  { code: 'it', name: 'Italiano', countryCode: 'IT' },          // Italian - established community
  { code: 'pt', name: 'Português', countryCode: 'PT' },         // Portuguese - growing
  { code: 'ru', name: 'Русский', countryCode: 'RU' },           // Russian - Eastern European
  { code: 'uk', name: 'Українська', countryCode: 'UA' },        // Ukrainian - recent refugees
  { code: 'zh', name: '中文', countryCode: 'CN' },               // Chinese - business/horeca community
  { code: 'hi', name: 'हिन्दी', countryCode: 'IN' },             // Hindi - Indian community
  { code: 'ur', name: 'اردو', countryCode: 'PK' },              // Urdu - Pakistani community
  { code: 'so', name: 'Soomaali', countryCode: 'SO' },          // Somali - significant community
  { code: 'ro', name: 'Română', countryCode: 'RO' },            // Romanian - EU migration
  { code: 'bg', name: 'Български', countryCode: 'BG' }           // Bulgarian - EU community
];

// Get flag URL for language code
export const getFlagUrl = (langCode: string, size: '16x12' | '24x18' = '24x18') => {
  const countryCodeMap: Record<string, string> = {
    'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
    'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'zh-Hans': 'cn', 'yue': 'hk', 
    'es': 'es', 'hi': 'in', 'tr': 'tr', 'fr': 'fr', 'ti': 'er', 
    'so': 'so', 'pt': 'pt', 'it': 'it', 'ru': 'ru', 'ur': 'pk',
    'ro': 'ro', 'bg': 'bg'
  };
  const countryCode = countryCodeMap[langCode] || 'un';
  return `https://flagcdn.com/${size}/${countryCode}.png`;
};