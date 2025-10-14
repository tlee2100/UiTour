import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomeInfoPage";
import HomeInfoPage from "../pages/HomeInfoPage";

const routes = (
  <Route path="/" element={<MainLayout />}>
    <Route index element={<HomeInfoPage />} />       {/* Hiện ở <Outlet /> */}
    {/*<Route path="tours" element={<HomeInfoPage />} /> {/* Cũng hiện ở <Outlet /> */}
  </Route>
);

export default routes;