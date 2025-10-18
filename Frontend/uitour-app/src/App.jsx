import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import routes from './routes';
import './App.css';


function App() {
  

  return (
  <Router>    
    <Routes>
      {routes}  {/* Chỉnh trang hiện trên web ở file index.jsx của folder routes */}
    </Routes>
  </Router>

  );
    
}

export default App
