import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ErrorBoundary from './components/ErrorBoundary';
import { AppProvider } from './contexts/AppContext';
import routes from './routes';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>    
          <Routes>
            {routes}  {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
          </Routes>
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
}

export default App
