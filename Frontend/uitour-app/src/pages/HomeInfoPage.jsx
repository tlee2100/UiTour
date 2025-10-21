import { useState } from "react";
import setdata from "../assets/mockdata/setdata"; // Corrected import
import './HomeInfoPage.css';
import Gallery from "./HomeInfo_component/Gallery";
import InfoHeader from "./Info_components/InfoHeader";
import Content from "./HomeInfo_component/Content";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";

// Trang HomeInfoPage hiển thị thông tin chi tiết về một chỗ ở cụ thể
export default function HomeInfoPage() {
  // Giả sử dữ liệu chỗ ở được lấy từ API hoặc props
  const images = setdata; // Corrected usage

  return ( //null
    <div className="home-info-page">
      <InfoHeader /> {/* Updated to use InfoHeader */}
      <Gallery images={images} /> {/* Updated to use images directly {/**/}
      <Content /> {/**/}
      <InfoReview rating={4.8} reviewsCount={120}
        reviewData={[
          {
            name: "Alice Nguyen",
            subtitle: "Vietnam • 2 weeks ago",
            comment: "Rất tuyệt vời, phòng sạch sẽ và chủ nhà thân thiện!"
          },
          {
            name: "John Smith",
            subtitle: "USA • 1 month ago",
            comment: "Good value for the price. The location is amazing."
          },
          {
            name: "Mai Tran",
            subtitle: "Vietnam • 3 days ago",
            comment: "View đẹp, mọi thứ đều như mô tả. Sẽ quay lại!"
          },
          {
            name: "Daniel Lee",
            subtitle: "Korea • 1 week ago",
            comment: "Comfortable bed, nice staff, and quiet area."
          },
          {
            name: "Sophie Chen",
            subtitle: "Taiwan • 5 days ago",
            comment: "Loved the design of the place, very cozy."
          },
          {
            name: "Akira Ito",
            subtitle: "Japan • 1 month ago",
            comment: "The stay was pleasant. Highly recommend!"
          }
        ]} /> {/* Example usage of InfoReview */}

        <InfoHost /> {/* Added InfoHost component */}
    </div>
  );
}