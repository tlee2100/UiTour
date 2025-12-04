import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { AppProvider } from './contexts/AppContext';
import { ExperienceProvider } from './contexts/ExperienceContext';
import ErrorBoundary from './components/ErrorBoundary';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageCurrencyModalProvider } from './contexts/LanguageCurrencyModalContext';
import { GlobalLoadingProvider } from "./contexts/GlobalLoadingContext";
import GlobalLoadingOverlay from "./components/GlobalLoadingOverlay";
import AppRoutes from './routes/index';
import AiChatWidget from "./components/AiChatWidget";
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <GlobalLoadingProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <LanguageCurrencyModalProvider>
              <AppProvider>
                <PropertyProvider>
                  <ExperienceProvider>
                    <Router>
                      <GlobalLoadingOverlay />
                      <AppRoutes /> {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
                      <AiChatWidget />
                    </Router>
                  </ExperienceProvider>
                </PropertyProvider>
              </AppProvider>
            </LanguageCurrencyModalProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </GlobalLoadingProvider>
    </ErrorBoundary>
  );
}

export default App;
