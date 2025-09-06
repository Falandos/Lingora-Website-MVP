import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../components/ui/Button';
import { useTranslation } from 'react-i18next';

interface SettingsData {
  id?: number;
  provider_id?: number;
  // Notification Settings
  email_notifications: boolean;
  sms_notifications: boolean;
  newsletter_subscription: boolean;
  
  // Display Preferences
  language: string;
  timezone: string;
  date_format: string;
  currency: string;
  
  // Dashboard Preferences
  dashboard_layout: string;
  items_per_page: number;
  show_analytics: boolean;
  compact_view: boolean;
  
  // Privacy Settings
  profile_visibility: 'public' | 'unlisted' | 'private';
  show_contact_info: boolean;
  allow_messages: boolean;
}

const defaultSettings: SettingsData = {
  email_notifications: true,
  sms_notifications: false,
  newsletter_subscription: true,
  language: 'en',
  timezone: 'Europe/Amsterdam',
  date_format: 'DD/MM/YYYY',
  currency: 'EUR',
  dashboard_layout: 'grid',
  items_per_page: 20,
  show_analytics: true,
  compact_view: false,
  profile_visibility: 'public',
  show_contact_info: true,
  allow_messages: true,
};

export const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [settings, setSettings] = useState<SettingsData>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  // Save settings with debounce
  const debouncedSave = useCallback(
    debounce(async (settingsToSave: SettingsData) => {
      if (saveStatus === 'saving') return; // Prevent multiple saves
      
      setSaving(true);
      setSaveStatus('saving');
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/providers/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(settingsToSave),
        });

        if (!response.ok) {
          throw new Error('Failed to save settings');
        }

        setSaveStatus('saved');
        setError(null);
        
        // Hide saved status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        console.error('Error saving settings:', err);
        setSaveStatus('error');
        setError('Failed to save settings. Please try again.');
        setTimeout(() => setSaveStatus('idle'), 3000);
      } finally {
        setSaving(false);
      }
    }, 1000),
    [saveStatus]
  );

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/providers/settings', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        } else {
          console.error('Failed to load settings');
          setError('Failed to load settings');
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        setError('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Handle setting changes
  const handleChange = useCallback((field: keyof SettingsData, value: any) => {
    const updatedSettings = { ...settings, [field]: value };
    setSettings(updatedSettings);
    debouncedSave(updatedSettings);
  }, [settings, debouncedSave]);

  // Reset settings to defaults
  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all settings to defaults?')) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/providers/settings/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        throw new Error('Failed to reset settings');
      }
    } catch (err) {
      console.error('Error resetting settings:', err);
      setError('Failed to reset settings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-6">
              {[...Array(6)].map((_, i) => (
                <div key={i}>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow">
        {/* Header */}
        <div className="px-8 py-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            
            {/* Save Status Indicator */}
            {saveStatus !== 'idle' && (
              <div className="flex items-center space-x-2">
                {saveStatus === 'saving' && (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                    <span className="text-sm text-blue-600">Saving...</span>
                  </>
                )}
                {saveStatus === 'saved' && (
                  <span className="text-sm text-green-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Saved
                  </span>
                )}
                {saveStatus === 'error' && (
                  <span className="text-sm text-red-600">Failed to save</span>
                )}
              </div>
            )}
          </div>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>

        <div className="p-8 space-y-8">
          {/* Notification Settings */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h2>
            <div className="space-y-4">
              <ToggleField
                label="Email Notifications"
                description="Receive notifications via email"
                checked={settings.email_notifications}
                onChange={(value) => handleChange('email_notifications', value)}
              />
              <ToggleField
                label="SMS Notifications"
                description="Receive notifications via SMS"
                checked={settings.sms_notifications}
                onChange={(value) => handleChange('sms_notifications', value)}
              />
              <ToggleField
                label="Newsletter Subscription"
                description="Receive our newsletter and updates"
                checked={settings.newsletter_subscription}
                onChange={(value) => handleChange('newsletter_subscription', value)}
              />
            </div>
          </section>

          {/* Display Preferences */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Display Preferences</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="Language"
                value={settings.language}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'nl', label: 'Nederlands' },
                  { value: 'de', label: 'Deutsch' },
                  { value: 'fr', label: 'Français' },
                  { value: 'es', label: 'Español' },
                ]}
                onChange={(value) => handleChange('language', value)}
              />
              <SelectField
                label="Timezone"
                value={settings.timezone}
                options={[
                  { value: 'Europe/Amsterdam', label: 'Europe/Amsterdam' },
                  { value: 'Europe/London', label: 'Europe/London' },
                  { value: 'Europe/Berlin', label: 'Europe/Berlin' },
                  { value: 'Europe/Paris', label: 'Europe/Paris' },
                ]}
                onChange={(value) => handleChange('timezone', value)}
              />
              <SelectField
                label="Date Format"
                value={settings.date_format}
                options={[
                  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
                  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                ]}
                onChange={(value) => handleChange('date_format', value)}
              />
              <SelectField
                label="Currency"
                value={settings.currency}
                options={[
                  { value: 'EUR', label: 'EUR (€)' },
                  { value: 'USD', label: 'USD ($)' },
                  { value: 'GBP', label: 'GBP (£)' },
                ]}
                onChange={(value) => handleChange('currency', value)}
              />
            </div>
          </section>

          {/* Dashboard Preferences */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Dashboard Preferences</h2>
            <div className="space-y-4">
              <SelectField
                label="Dashboard Layout"
                value={settings.dashboard_layout}
                options={[
                  { value: 'grid', label: 'Grid View' },
                  { value: 'list', label: 'List View' },
                  { value: 'compact', label: 'Compact View' },
                ]}
                onChange={(value) => handleChange('dashboard_layout', value)}
              />
              <NumberField
                label="Items per Page"
                value={settings.items_per_page}
                min={5}
                max={100}
                onChange={(value) => handleChange('items_per_page', value)}
              />
              <ToggleField
                label="Show Analytics"
                description="Display analytics widget on dashboard"
                checked={settings.show_analytics}
                onChange={(value) => handleChange('show_analytics', value)}
              />
              <ToggleField
                label="Compact View"
                description="Use compact layout for better space utilization"
                checked={settings.compact_view}
                onChange={(value) => handleChange('compact_view', value)}
              />
            </div>
          </section>

          {/* Privacy Settings */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Privacy Settings</h2>
            <div className="space-y-4">
              <RadioField
                label="Profile Visibility"
                value={settings.profile_visibility}
                options={[
                  { value: 'public', label: 'Public', description: 'Visible to everyone' },
                  { value: 'unlisted', label: 'Unlisted', description: 'Not shown in search, but accessible via direct link' },
                  { value: 'private', label: 'Private', description: 'Only visible to you' },
                ]}
                onChange={(value) => handleChange('profile_visibility', value)}
              />
              <ToggleField
                label="Show Contact Information"
                description="Display contact details on your public profile"
                checked={settings.show_contact_info}
                onChange={(value) => handleChange('show_contact_info', value)}
              />
              <ToggleField
                label="Allow Messages"
                description="Allow clients to send you messages"
                checked={settings.allow_messages}
                onChange={(value) => handleChange('allow_messages', value)}
              />
            </div>
          </section>

          {/* Reset Settings */}
          <section className="border-t border-gray-200 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Reset Settings</h2>
                <p className="text-sm text-gray-500">Reset all settings to their default values</p>
              </div>
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={loading}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Reset to Defaults
              </Button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

// Helper Components
interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleField: React.FC<ToggleFieldProps> = ({ label, description, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div>
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {description && <p className="text-sm text-gray-500">{description}</p>}
    </div>
    <button
      type="button"
      className={`${
        checked ? 'bg-blue-600' : 'bg-gray-200'
      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`${
          checked ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  </div>
);

interface SelectFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}

const SelectField: React.FC<SelectFieldProps> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

interface NumberFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
}

const NumberField: React.FC<NumberFieldProps> = ({ label, value, min, max, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value) || 0)}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
    />
  </div>
);

interface RadioFieldProps {
  label: string;
  value: string;
  options: { value: string; label: string; description?: string }[];
  onChange: (value: string) => void;
}

const RadioField: React.FC<RadioFieldProps> = ({ label, value, options, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-3">{label}</label>
    <div className="space-y-3">
      {options.map((option) => (
        <div key={option.value} className="flex items-start">
          <input
            id={option.value}
            type="radio"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <div className="ml-3">
            <label htmlFor={option.value} className="text-sm font-medium text-gray-700">
              {option.label}
            </label>
            {option.description && (
              <p className="text-sm text-gray-500">{option.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Debounce utility
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): T {
  let timeout: NodeJS.Timeout | null = null;
  return ((...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
}

export default Settings;