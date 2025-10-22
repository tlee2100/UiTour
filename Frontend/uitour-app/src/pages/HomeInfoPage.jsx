import { useState } from "react";
import setdata from "../assets/mockdata/setdata"; // Corrected import
import './HomeInfoPage.css';
import Gallery from "./HomeInfo_component/Gallery";
import InfoHeader from "./Info_components/InfoHeader";
import Content from "./HomeInfo_component/Content";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";
import InfoThingsToKnow from "./HomeInfo_component/InfoThingsToKnow";

// Trang HomeInfoPage hiển thị thông tin chi tiết về một chỗ ở cụ thể
export default function HomeInfoPage() {
  // Giả sử dữ liệu chỗ ở được lấy từ API hoặc props
  const images = setdata; // Corrected usage

  return ( //null
    <div className="home-info-page">
      <InfoHeader title={"Apartment in Quận Ba Đình"} 
                        info={{rating: "5.0",
                                  reviews: "36 reviews"  ,
                                  hostStatus: "Superhost",
                                  location: "Quận Ba ĐÌnh, Ho Chi Minh city"
                        }}/> {/* Updated to use InfoHeader */}
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

        <div className="homeif-divider" />

        <InfoHost /> {/* Added InfoHost component */}

        <div className="homeif-divider" />

        <InfoThingsToKnow /> {/* Added InfoThingsToKnow component */}

        <div className="homeif-end-divider" />
    </div>
  );
}