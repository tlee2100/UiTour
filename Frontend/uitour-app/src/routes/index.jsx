import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import InfoLayout from "../layouts/InfoLayout";
import HomePage from "../pages/HomePage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ToursPage from "../pages/ToursPage";
import ExperienceInfoPage from "../pages/ExperienceInfoPage";
import MapDemoPage from "../pages/MapDemoPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Main layout pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="demomap" element={<MapDemoPage />} />
        <Route path="tours" element={<ToursPage />} />
      </Route>

      {/* Info layout pages */}
      <Route path="/" element={<InfoLayout />}>
        <Route path="homeinfo" element={<HomeInfoPage />} />
        <Route path="property/:id" element={<HomeInfoPage />} />
        <Route path="experienceinfo" element={<ExperienceInfoPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} /> 

    </Routes>
  );
};

export default AppRoutes;
