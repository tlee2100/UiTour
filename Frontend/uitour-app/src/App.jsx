import { useState } from 'react'

{/* Test header */}
import Header from "./components/Header";


function App() {
  

  return (
    <div>
      {/* Gọi component Header */}
      <Header />

      {/* Nội dung khác */}
      <main>
        <h2>Trang Home</h2>
        <p>Nội dung thử nghiệm...</p>
      </main>
    </div>

  );
    
}

export default App
