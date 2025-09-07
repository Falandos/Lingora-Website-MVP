import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import { useEffect } from 'react';
import i18n from './services/i18n';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageTransitionProvider } from './contexts/LanguageTransitionContext';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Components
import { ProtectedRoute } from './components/auth';

// Pages
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import ProviderPage from './pages/ProviderPage';
import DashboardPage from './pages/DashboardPage';
import RegisterChoicePage from './pages/RegisterChoicePage';
import RegisterProviderPage from './pages/RegisterProviderPage';
import RegisterUserPage from './pages/RegisterUserPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import ConfirmCurrentEmailPage from './pages/ConfirmCurrentEmailPage';
import VerifyNewEmailPage from './pages/VerifyNewEmailPage';
import LegalPage from './pages/LegalPage';

function App() {
  // Handle RTL languages
  useEffect(() => {
    const handleLanguageChange = () => {
      const isRTL = ['ar', 'he'].includes(i18n.language);
      document.dir = isRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = i18n.language;
    };

    // Set initial direction
    handleLanguageChange();

    // Listen for language changes
    i18n.on('languageChanged', handleLanguageChange);

    return () => {
      i18n.off('languageChanged', handleLanguageChange);
    };
  }, []);

  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <LanguageTransitionProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Header />
              <main className="flex-1">
                <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/provider/:slug" element={<ProviderPage />} />
              <Route 
                path="/dashboard/*" 
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } 
              />
              <Route path="/register" element={<RegisterChoicePage />} />
              <Route path="/register-provider" element={<RegisterProviderPage />} />
              <Route path="/register-user" element={<RegisterUserPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/confirm-current-email" element={<ConfirmCurrentEmailPage />} />
              <Route path="/verify-new-email" element={<VerifyNewEmailPage />} />
              <Route path="/terms" element={<LegalPage type="terms" />} />
              <Route path="/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/cookies" element={<LegalPage type="cookies" />} />
              <Route path="/impressum" element={<LegalPage type="impressum" />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </LanguageTransitionProvider>
    </AuthProvider>
  </I18nextProvider>
  );
}

export default App;
