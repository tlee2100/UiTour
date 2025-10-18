import { Route } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import HomePage from "../pages/HomeInfoPage";
import HomeInfoPage from "../pages/HomeInfoPage";

const routes = (
  <Route path="/" element={<MainLayout />}>

    {/* Thay trang HomeInfoPage thành trang cần hiện trên web chính */}
    {/* Ví dụ: <Route index element={<HomePage />} /> */}
    <Route index element={<HomeInfoPage />} />       {/* Hiện ở <Outlet /> */}
    {/* Nếu test xong nhớ chỉnh lại để ko bị conflict */}


    {/*<Route path="tours" element={<HomeInfoPage />} /> {/* Cũng hiện ở <Outlet /> */}
  </Route>
);

export default routes;