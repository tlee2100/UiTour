import { Outlet } from "react-router-dom";
import Header from "../components/headers/Header";
import Footer from "../components/footers/Footer";
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