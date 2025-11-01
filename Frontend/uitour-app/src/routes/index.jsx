import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import InfoLayout from "../layouts/InfoLayout";
import HomePage from "../pages/HomePage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ToursPage from "../pages/ToursPage";
import ExperienceInfoPage from "../pages/ExperienceInfoPage";
import MapDemoPage from "../pages/MapDemoPage";

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

    </Routes>
  );
};

export default AppRoutes;
