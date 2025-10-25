import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomePage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ToursPage from "../pages/ToursPage";

const routes = (
  <Route path="/" element={<MainLayout />}>
    {/* Trang chủ */}
    <Route index element={<HomePage />} />
    
    {/* Trang tours */}
    <Route path="tours" element={<ToursPage />} />
    
    {/* Trang chi tiết phòng/tour */}
    <Route path="property/:id" element={<HomeInfoPage />} />
    
    {/* Các route khác có thể thêm sau */}
    {/* <Route path="about" element={<AboutPage />} /> */}
  </Route>
);

export default routes;