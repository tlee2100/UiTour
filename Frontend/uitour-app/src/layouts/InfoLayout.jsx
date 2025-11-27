import { Outlet } from "react-router-dom";
import HeaderInfo from "../components/headers/HeaderInfo";
import Footer from "../components/footers/Footer";
import "./InfoLayout.css";

export default function MainLayout() {
  return (
    <>
      <HeaderInfo />
      <main className="app-layout">
        <div className="main-content">
          <Outlet />
        </div>
      </main>
      <Footer />
    </>
  );
}