import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import AppRoutes from './routes/index';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <PropertyProvider>
          <Router>
            <AppRoutes/> {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
          </Router>
        </PropertyProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
