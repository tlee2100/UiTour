import React from "react";
import { useState } from "react"; // Corrected import
import './ExperienceInfoPage.css'
import InfoHeader from "./Info_components/InfoHeader";
import InfoReview from "./Info_components/InfoReview";
import InfoHost from "./Info_components/InfoHost";


export default function ExperienceInfoPage() {
    return (
        <div className="experience-info-page">
            <InfoHeader title={"Best Street Food Motorbike Tour in Ho Chi Minh City"} 
                        info={{rating: "5.0",
                                  reviews: "36 reviews"  ,
                                  hostStatus: "Superhost",
                                  location: "District 1, Ho Chi Minh city"
                        }}/> {/* Updated to use InfoHeader */}
            
            <div className="homeif-divider" />

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

            <div className="homeif-end-divider" />
        </div>
    );
}