import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ToursPage from "../pages/ToursPage";
import ExperienceInfoPage from "../pages/ExperienceInfoPage";
import MapDemoPage from "../pages/MapDemoPage";

const routes = (
  <Route path="/" element={<MainLayout />}>
    {/* Demo page để test map components */}
    <Route index element={<HomePage />} />
    <Route path="demomap" element={<MapDemoPage />} />
    <Route path="tours" element={<ToursPage />} />
    
    {/* Property detail page với dynamic ID */}
    <Route path="property/:id" element={<HomeInfoPage />} />
    
    {/* Other pages */}
    <Route path="homeinfo" element={<HomeInfoPage />} />
    <Route path="experienceinfo" element={<ExperienceInfoPage />} />
  </Route>
);

export default routes;