// src/layouts/HostPageLayout.jsx
import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import HostHHeader from "../components/headers/HostHHeader";

export default function HostPageLayout() {
    const location = useLocation();
    
    // Optional: chỉ hiện header nếu đang ở vùng /host
    const showHeader = location.pathname.startsWith("/host");

    return (
        <div className="host-layout-container">
            {showHeader && <HostHHeader />}   {/* ⭐ Mount đúng 1 lần */}
            
            <div className="host-layout-content">
                <Outlet />                   {/* ⭐ Trang con đổi ở đây */}
            </div>
        </div>
    );
}
