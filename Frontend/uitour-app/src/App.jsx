import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { AppProvider } from './contexts/AppContext';
import { ExperienceProvider } from './contexts/ExperienceContext';
import ErrorBoundary from './components/ErrorBoundary';
import { CurrencyProvider } from './contexts/CurrencyContext';
import AppRoutes from './routes/index';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <CurrencyProvider>
        <AppProvider>
          <PropertyProvider>
            <ExperienceProvider>
              <Router>
                <AppRoutes /> {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
              </Router>
            </ExperienceProvider>
          </PropertyProvider>
        </AppProvider>
      </CurrencyProvider>
    </ErrorBoundary>
  );
}

export default App;
