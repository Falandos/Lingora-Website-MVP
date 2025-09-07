import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export const ConfirmCurrentEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenProcessed, setTokenProcessed] = useState(false);
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (token && !tokenProcessed) {
      handleConfirmCurrentEmail();
    } else if (!token) {
      setError('Invalid verification link. No token provided.');
    }
  }, [token, tokenProcessed]);

  const handleConfirmCurrentEmail = async () => {
    if (!token) {
      setError('Invalid verification link.');
      return;
    }

    setLoading(true);
    setError(null);
    setTokenProcessed(true);

    try {
      const response = await fetch('/api/auth/confirm-email-change-current', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Failed to confirm current email');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard/settings', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Change Verification
            </h1>
            <p className="text-sm text-gray-600">
              Confirming ownership of your current email address
            </p>
          </div>

          {loading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-sm text-gray-600">
                Verifying your current email...
              </p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">
                    Current Email Verified Successfully
                  </h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p className="mb-3">
                      Great! We've confirmed ownership of your current email address.
                    </p>
                    <p className="mb-3">
                      <strong>Next step:</strong> Check your new email address for a verification message to complete the email change process.
                    </p>
                    <p className="text-xs text-green-600">
                      The verification link will expire in 1 hour for security.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Verification Failed
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                    {error.includes('expired') && (
                      <p className="mt-2 text-xs">
                        You can start a new email change request from your dashboard.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={handleReturnToDashboard}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              Return to Dashboard
            </Button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-xs text-gray-500">
              Having trouble? Contact support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmCurrentEmailPage;