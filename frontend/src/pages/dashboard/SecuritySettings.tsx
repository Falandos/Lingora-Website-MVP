import React from 'react';
import PasswordChangeForm from '../../components/dashboard/PasswordChangeForm';

export const SecuritySettings: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account security and password settings
        </p>
      </div>

      <PasswordChangeForm />
      
      {/* Future security features can be added here */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Two-Factor Authentication</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add an extra layer of security to your account (Coming Soon)
          </p>
        </div>
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 3.18L19 6.3V11C19 15.5 16.18 19.68 12 20.82C7.82 19.68 5 15.5 5 11V6.3L12 3.18Z"/>
          </svg>
          <p className="text-sm">Two-factor authentication will be available in a future update</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="border-b border-gray-200 pb-4 mb-6">
          <h3 className="text-lg font-medium text-gray-900">Login Activity</h3>
          <p className="mt-1 text-sm text-gray-500">
            Monitor recent login activity on your account (Coming Soon)
          </p>
        </div>
        <div className="text-center py-8 text-gray-400">
          <svg className="w-12 h-12 mx-auto mb-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,15C12.81,15 13.5,14.7 14.11,14.11C14.7,13.5 15,12.81 15,12C15,11.19 14.7,10.5 14.11,9.89C13.5,9.3 12.81,9 12,9C11.19,9 10.5,9.3 9.89,9.89C9.3,10.5 9,11.19 9,12C9,12.81 9.3,13.5 9.89,14.11C10.5,14.7 11.19,15 12,15M12,2C14.75,2 17.1,3 19.05,4.95C21,6.9 22,9.25 22,12V13.45C22,14.45 21.65,15.3 21,16C20.3,16.67 19.5,17 18.5,17C17.3,17 16.31,16.5 15.56,15.5C14.56,16.5 13.38,17 12,17C10.63,17 9.45,16.5 8.46,15.54C7.5,14.55 7,13.38 7,12C7,10.63 7.5,9.45 8.46,8.46C9.45,7.5 10.63,7 12,7C13.38,7 14.55,7.5 15.54,8.46C16.5,9.45 17,10.63 17,12V13.45C17,13.86 17.16,14.22 17.46,14.53C17.76,14.84 18.11,15 18.5,15C18.92,15 19.27,14.84 19.57,14.53C19.87,14.22 20,13.86 20,13.45V12C20,9.81 19.23,7.93 17.65,6.35C16.07,4.77 14.19,4 12,4C9.81,4 7.93,4.77 6.35,6.35C4.77,7.93 4,9.81 4,12C4,14.19 4.77,16.07 6.35,17.65C7.93,19.23 9.81,20 12,20H16V22H12C9.25,22 6.9,21 4.95,19.05C3,17.1 2,14.75 2,12C2,9.25 3,6.9 4.95,4.95C6.9,3 9.25,2 12,2Z"/>
          </svg>
          <p className="text-sm">Login activity tracking will be available in a future update</p>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;