import { useState } from 'react'

{/* Test header */}
import Header from "./components/Header";
import Footer from "./components/Footer";
import './App.css';


function App() {
  

  return (
    <div className='app-layout'>
      {/* Gọi component Header */}
      <Header />

      {/* Nội dung khác */}
      <main className="main-content">
        <h2>Trang Home</h2>
        <p>Nội dung thử nghiệm...</p>
        <p>Nội dung mẫu</p>
        <p>Nội dung mẫu</p>
        <p>Nội dung mẫu</p>
        <p>Nội dung mẫu</p>
        <p>Nội dung mẫu</p>
        <p>Nội dung mẫu</p>
        <p>Nội dung mẫu</p>
      </main>

      {/* Gọi component Footer */}
      <Footer/>
      {/* <Footer /> */}
    </div>

  );
    
}

export default App
