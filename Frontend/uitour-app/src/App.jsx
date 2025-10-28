import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import { AppProvider } from './contexts/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import routes from './routes';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <PropertyProvider>
          <Router>
            <Routes>
              {routes} {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
            </Routes>
          </Router>
        </PropertyProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App;
