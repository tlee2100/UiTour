import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { AppProvider } from './contexts/AppContext';
import { ExperienceProvider } from './contexts/ExperienceContext';
import ErrorBoundary from './components/ErrorBoundary';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { LanguageCurrencyModalProvider } from './contexts/LanguageCurrencyModalContext';
import AppRoutes from './routes/index';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <CurrencyProvider>
          <LanguageCurrencyModalProvider>
            <AppProvider>
              <PropertyProvider>
                <ExperienceProvider>
                  <Router>
                    <AppRoutes /> {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
                  </Router>
                </ExperienceProvider>
              </PropertyProvider>
            </AppProvider>
          </LanguageCurrencyModalProvider>
        </CurrencyProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}

export default App;
