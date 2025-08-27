import React from 'react';

interface Staff {
  id: number;
  name: string;
  role_title?: string;
  role?: string;
  languages: Array<{
    language_code: string;
    cefr_level?: string;
    name_en?: string;
    name_native?: string;
  }> | string[];
  email_public?: string;
  phone_public?: string;
  email?: string;
  phone?: string;
}

interface StaffDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Staff | null;
}

const StaffDetailModal: React.FC<StaffDetailModalProps> = ({
  isOpen,
  onClose,
  staff
}) => {
  if (!isOpen || !staff) return null;

  const getFlagUrl = (langCode: string) => {
    const countryCodeMap: Record<string, string> = {
      'nl': 'nl', 'en': 'gb', 'de': 'de', 'ar': 'sa', 'zgh': 'ma',
      'uk': 'ua', 'pl': 'pl', 'zh': 'cn', 'zh-cn': 'cn', 'zh-Hans': 'cn', 
      'yue': 'hk', 'es': 'es', 'hi': 'in', 'tr': 'tr', 'fr': 'fr', 
      'ti': 'er', 'so': 'so', 'pt': 'pt', 'ru': 'ru', 'ber': 'ma'
    };
    const countryCode = countryCodeMap[langCode] || 'un';
    return `https://flagcdn.com/24x18/${countryCode}.png`;
  };

  const getLanguageCodes = (languages: Staff['languages']): string[] => {
    if (Array.isArray(languages)) {
      if (languages.length > 0 && typeof languages[0] === 'string') {
        return languages as string[];
      }
      return languages.map((lang: any) => lang.language_code);
    }
    return [];
  };

  const getRoleTitle = (member: Staff): string => {
    return member.role_title || member.role || 'Staff Member';
  };

  const getEmail = (member: Staff): string => {
    return member.email_public || member.email || '';
  };

  const getPhone = (member: Staff): string => {
    return member.phone_public || member.phone || '';
  };

  const getLanguageName = (langCode: string): string => {
    const languageNames: Record<string, string> = {
      'nl': 'Dutch', 'en': 'English', 'de': 'German', 'ar': 'Arabic',
      'zgh': 'Berber', 'uk': 'Ukrainian', 'pl': 'Polish', 'zh': 'Chinese',
      'zh-cn': 'Chinese (Mandarin)', 'yue': 'Chinese (Cantonese)', 
      'es': 'Spanish', 'hi': 'Hindi', 'tr': 'Turkish', 'fr': 'French',
      'ti': 'Tigrinya', 'so': 'Somali', 'pt': 'Portuguese', 'ru': 'Russian',
      'ber': 'Berber'
    };
    return languageNames[langCode] || langCode.toUpperCase();
  };

  const email = getEmail(staff);
  const phone = getPhone(staff);
  const languageCodes = getLanguageCodes(staff.languages);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden animate-modal-scale">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 px-6 py-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
                {staff.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{staff.name}</h2>
                <p className="text-primary-100 text-sm">{getRoleTitle(staff)}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-primary-100 transition-colors p-1 hover:bg-white hover:bg-opacity-20 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Contact Information
            </h3>
            
            {/* Email */}
            {email && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{email}</p>
                    <p className="text-xs text-gray-500">Email Address</p>
                  </div>
                </div>
                <a
                  href={`mailto:${email}`}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700 transition-colors flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  Send Email
                </a>
              </div>
            )}

            {/* Phone */}
            {phone && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{phone}</p>
                    <p className="text-xs text-gray-500">Phone Number</p>
                  </div>
                </div>
                <a
                  href={`tel:${phone}`}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700 transition-colors flex items-center"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Now
                </a>
              </div>
            )}

            {/* No contact info message */}
            {!email && !phone && (
              <div className="text-center py-4 text-gray-500">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
                <p className="text-sm">Contact information not available</p>
              </div>
            )}
          </div>

          {/* Languages */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <svg className="w-5 h-5 text-secondary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
              Languages Spoken
            </h3>
            
            {languageCodes.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {languageCodes.map((langCode) => (
                  <div key={langCode} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <img
                      src={getFlagUrl(langCode)}
                      alt={`${langCode} flag`}
                      className="w-6 h-4 object-cover rounded-sm shadow-sm"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{getLanguageName(langCode)}</p>
                      <p className="text-xs text-gray-500 uppercase">{langCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <p className="text-sm">No languages specified</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default StaffDetailModal;