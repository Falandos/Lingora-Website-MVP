import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import i18n from './services/i18n';
import { AuthProvider } from './contexts/AuthContext';

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
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import LegalPage from './pages/LegalPage';

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
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
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/terms" element={<LegalPage type="terms" />} />
              <Route path="/privacy" element={<LegalPage type="privacy" />} />
              <Route path="/cookies" element={<LegalPage type="cookies" />} />
              <Route path="/impressum" element={<LegalPage type="impressum" />} />
            </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
