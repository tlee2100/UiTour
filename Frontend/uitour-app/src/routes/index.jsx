import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomeInfoPage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ExperienceInfoPage from "../pages/ExperienceInfoPage";
import MapDemoPage from "../pages/MapDemoPage";

const routes = (
  <Route path="/" element={<MainLayout />}>
    {/* Demo page để test map components */}
    <Route index element={<MapDemoPage />} />
    
    {/* Property detail page với dynamic ID */}
    <Route path="property/:id" element={<HomeInfoPage />} />
    
    {/* Other pages */}
    <Route path="homeinfo" element={<HomeInfoPage />} />
    <Route path="experienceinfo" element={<ExperienceInfoPage />} />
  </Route>
);

export default routes;