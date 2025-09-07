import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
// Removed Card imports - using plain divs for proper styling

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  providerId: number;
  providerName: string;
}

interface ContactForm {
  sender_name: string;
  sender_email: string;
  preferred_language: string;
  subject: string;
  message: string;
  consent_given: boolean;
}

const ContactModal = ({ isOpen, onClose, providerId, providerName }: ContactModalProps) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState<ContactForm>({
    sender_name: '',
    sender_email: '',
    preferred_language: i18n.language || 'nl',
    subject: '',
    message: '',
    consent_given: false,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const languages = [
    { code: 'nl', name: 'Nederlands' },
    { code: 'en', name: 'English' },
    { code: 'de', name: 'Deutsch' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'ar', name: 'العربية' },
    { code: 'tr', name: 'Türkçe' },
    { code: 'pl', name: 'Polski' },
    { code: 'zh', name: '中文' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider_id: providerId,
          ...formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccess(true);
        setError(''); // Clear any previous errors
        // Reset form
        setFormData({
          sender_name: '',
          sender_email: '',
          preferred_language: i18n.language || 'nl',
          subject: '',
          message: '',
          consent_given: false,
        });
      } else {
        setError(result.message || 'Failed to send message');
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Contact form error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSuccess(false);
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {t('provider.contact_form')}
            </h2>
            <p className="text-gray-600 mt-1">Send a message to {providerName}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="border border-green-200 bg-green-50 rounded-lg">
              <div className="text-center p-8">
                <div className="text-green-600 text-5xl mb-4">✅</div>
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  Message Sent Successfully!
                </h3>
                <p className="text-green-700 mb-4">
                  Your message has been sent to {providerName}. They will receive it via email and should respond within 24-48 hours.
                </p>
                <Button onClick={handleClose} variant="primary">
                  Close
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="sender_name" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('provider.your_name')} *
                  </label>
                  <input
                    id="sender_name"
                    type="text"
                    required
                    value={formData.sender_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, sender_name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label htmlFor="sender_email" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('provider.your_email')} *
                  </label>
                  <input
                    id="sender_email"
                    type="email"
                    required
                    value={formData.sender_email}
                    onChange={(e) => setFormData(prev => ({ ...prev, sender_email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="preferred_language" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('provider.preferred_language')} *
                </label>
                <select
                  id="preferred_language"
                  required
                  value={formData.preferred_language}
                  onChange={(e) => setFormData(prev => ({ ...prev, preferred_language: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  id="subject"
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="What is your inquiry about?"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('provider.message')} *
                </label>
                <textarea
                  id="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Please describe what you're looking for and any specific questions you have..."
                />
              </div>

              <div className="flex items-start space-x-3">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  checked={formData.consent_given}
                  onChange={(e) => setFormData(prev => ({ ...prev, consent_given: e.target.checked }))}
                  className="mt-1 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="consent" className="text-sm text-gray-700">
                  {t('provider.consent')} *
                </label>
              </div>

              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-100">
                <Button variant="ghost" onClick={handleClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={loading}>
                  {t('provider.send_message')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactModal;