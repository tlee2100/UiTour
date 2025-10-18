import { useState } from "react";
import setdata from "../assets/mockdata/setdata"; // Corrected import
import './HomeInfoPage.css';
import Gallery from "./HomeInfo_component/Gallery";
import InfoHeader from "./Info_components/InfoHeader";
import Content from "./HomeInfo_component/Content";

// Trang HomeInfoPage hiển thị thông tin chi tiết về một chỗ ở cụ thể
export default function HomeInfoPage() {
  // Giả sử dữ liệu chỗ ở được lấy từ API hoặc props
  const images = setdata; // Corrected usage

  return ( //null
    <div className="home-info-page">
      <InfoHeader /> {/* Updated to use InfoHeader */}
      <Gallery images={images} /> {/* Updated to use images directly {/**/}
      <Content/> {/**/}
    </div>
  );
}