import { useState } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import routes from './routes';
{/* Test header */}
import Header from "./components/Header";
import Footer from "./components/Footer";
import './App.css';


function App() {
  

  return (
  <Router>    
    <Routes>
      {routes}
    </Routes>
  </Router>

  );
    
}

export default App
