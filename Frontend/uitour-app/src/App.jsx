import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PropertyProvider } from './contexts/PropertyContext';
import MainLayout from './layouts/MainLayout';
import routes from './routes';
import './App.css';


function App() {
  return (
    <PropertyProvider>
      <Router>    
        <Routes>
          {routes}  {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
        </Routes>
      </Router>
    </PropertyProvider>
  );
}

export default App
