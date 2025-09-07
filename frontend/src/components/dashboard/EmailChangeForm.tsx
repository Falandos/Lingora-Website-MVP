import React, { useState } from 'react';
import { Button } from '../ui/Button';

interface EmailChangeFormProps {
  currentEmail: string;
  onSuccess?: () => void;
}

export const EmailChangeForm: React.FC<EmailChangeFormProps> = ({ 
  currentEmail, 
  onSuccess 
}) => {
  const [formData, setFormData] = useState({
    newEmail: '',
    confirmEmail: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newEmail !== formData.confirmEmail) {
      setError('Email addresses do not match');
      return;
    }

    if (formData.newEmail === currentEmail) {
      setError('New email must be different from current email');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.newEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/auth/request-email-change', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_email: formData.newEmail,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          newEmail: '',
          confirmEmail: ''
        });
        if (onSuccess) {
          onSuccess();
        }
        // Hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        setError(data.message || 'Failed to initiate email change');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="border-b border-gray-200 pb-4 mb-6">
        <h3 className="text-lg font-medium text-gray-900">Change Email Address</h3>
        <p className="mt-1 text-sm text-gray-500">
          Update your email address. You will need to verify both your current and new email addresses.
        </p>
        <div className="mt-3 bg-blue-50 border border-blue-200 rounded-md p-3">
          <p className="text-sm text-blue-700">
            <span className="font-medium">Current email:</span> {currentEmail}
          </p>
        </div>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                Email change initiated successfully
              </p>
              <p className="text-sm text-green-700 mt-1">
                Please check your current email ({currentEmail}) for verification instructions.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-2">
            New Email Address
          </label>
          <input
            id="newEmail"
            type="email"
            required
            value={formData.newEmail}
            onChange={(e) => handleInputChange('newEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your new email address"
          />
        </div>

        <div>
          <label htmlFor="confirmEmail" className="block text-sm font-medium text-gray-700 mb-2">
            Confirm New Email Address
          </label>
          <input
            id="confirmEmail"
            type="email"
            required
            value={formData.confirmEmail}
            onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Confirm your new email address"
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-800">
                Dual Verification Required
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                For security, you'll need to verify both your current email and the new email address before the change takes effect.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={loading || !formData.newEmail || !formData.confirmEmail}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {loading ? 'Processing...' : 'Request Email Change'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EmailChangeForm;