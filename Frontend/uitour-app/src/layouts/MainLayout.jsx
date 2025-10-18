import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import "./MainLayout.css";

export default function MainLayout() {
  return (
    <>
      <Header />
      <main className="app-layout">
        <div className="main-content">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}