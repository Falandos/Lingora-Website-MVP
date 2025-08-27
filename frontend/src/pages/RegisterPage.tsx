import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthService } from '../services/authService';

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    business_name: '',
    kvk_number: '',
    btw_number: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await AuthService.register(formData);

      if (result.success) {
        navigate('/login', { state: { message: result.data?.message || 'Registration successful! Please login.' } });
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {t('auth.register_title')}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-500">
              {t('header.login')}
            </Link>
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="business_name" className="label">
              {t('auth.business_name')} *
            </label>
            <input
              id="business_name"
              type="text"
              required
              value={formData.business_name}
              onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="email" className="label">
              {t('auth.email')} *
            </label>
            <input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="input-field"
            />
          </div>

          <div>
            <label htmlFor="password" className="label">
              {t('auth.password')} *
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="input-field"
            />
            <p className="mt-1 text-xs text-gray-500">
              Minimum 8 characters
            </p>
          </div>

          <div>
            <label htmlFor="kvk_number" className="label">
              {t('auth.kvk_number')} *
            </label>
            <input
              id="kvk_number"
              type="text"
              required
              value={formData.kvk_number}
              onChange={(e) => setFormData(prev => ({ ...prev, kvk_number: e.target.value }))}
              className="input-field"
              placeholder="12345678"
            />
          </div>

          <div>
            <label htmlFor="btw_number" className="label">
              {t('auth.btw_number')} *
            </label>
            <input
              id="btw_number"
              type="text"
              required
              value={formData.btw_number}
              onChange={(e) => setFormData(prev => ({ ...prev, btw_number: e.target.value }))}
              className="input-field"
              placeholder="NL123456789B01"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? t('common.loading') : t('auth.register_button')}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          By registering, you agree to our{' '}
          <Link to="/terms" className="text-primary-600 hover:text-primary-500">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="text-primary-600 hover:text-primary-500">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;