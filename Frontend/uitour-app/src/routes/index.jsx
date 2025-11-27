import { Route, Routes, Navigate } from "react-router-dom";


import MainLayout from "../layouts/MainLayout";
import InfoLayout from "../layouts/InfoLayout";
import HostLayout from "../layouts/HostLayout";

import ProfilePage from "../pages/ProfilePage";
import HomePage from "../pages/HomePage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ToursPage from "../pages/ToursPage";
import SearchResultsPage from "../pages/SearchResultsPage";
import ExperienceSearchResultsPage from "../pages/ExperienceSearchResultsPage";
import ExperienceInfoPage from "../pages/ExperienceInfoPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import RequireAuth from "../components/RequireAuth";
import WishlistPage from "../pages/WishlistPage";
import TripsPage from "../pages/TripsPage";
import NotificationsPage from "../pages/NotificationsPage";
import AccountSettingsPage from "../pages/AccountSettingsPage";
import SupportPage from "../pages/SupportPage";
import AdminLayout from "../layouts/AdminLayout";
import RequireAdmin from "../components/RequireAdmin";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminPosts from "../pages/admin/AdminPosts";
import AdminUsers from "../pages/admin/AdminUsers";
import AdminReports from "../pages/admin/AdminReports";
import AdminTransactions from "../pages/admin/AdminTransactions";
import AdminSettings from "../pages/admin/AdminSettings";
import HostExperienceCreateChoose from "../pages/HostExperience/HostExperienceCreateChoose";
import HostExperienceCreateYears from "../pages/HostExperience/HostExperienceCreateYears";
import HostExperienceCreateQualification from "../pages/HostExperience/HostExperienceCreateQualification";
import HostExperienceCreateLocate from "../pages/HostExperience/HostExperienceCreateLocate";
import HostExperienceCreatePhotos from "../pages/HostExperience/HostExperienceCreatePhotos";
import HostExperienceDescribeTitle from "../pages/HostExperience/HostExperienceDescribeTitle";
import HostExperienceCreateItinerary from "../pages/HostExperience/HostExperienceCreateItinerary";
import HostExperienceCreateMaxGuests from "../pages/HostExperience/HostExperienceCreateMaxGuests";
import HostExperienceCreateDiscount from "../pages/HostExperience/HostExperienceCreateDiscount";
import HostExperiencePreview from "../pages/HostExperience/HostExperiencePreview";

import HostStayCreateChoose from "../pages/HostStay/HostStayCreateChoose";
import HostStayCreateTypeOfPlace from "../pages/HostStay/HostStayCreateTypeOfPlace";
import HostStayCreateLocate from "../pages/HostStay/HostStayCreateLocate";
import HostStayCreateDetails from "../pages/HostStay/HostStayCreateDetails";
import HostStayCreateAmenities from "../pages/HostStay/HostStayCreateAmenities";
import HostStayCreatePhotos from "../pages/HostStay/HostStayCreatePhotos";
import HostStayCreateTitle from "../pages/HostStay/HostStayCreateTitle";
import HostStayCreateDescription from "../pages/HostStay/HostStayCreateDescription";
import HostStayCreateWeekdayPrice from "../pages/HostStay/HostStayCreateWeekdayPrice";
import HostStayCreateWeekendPrice from "../pages/HostStay/HostStayCreateWeekendPrice";
import HostStayCreateDiscount from "../pages/HostStay/HostStayCreateDiscount";
import HostStayCreateFees from "../pages/HostStay/HostStayCreateFees";
import HostStayCreateRulesSafety from "../pages/HostStay/HostStayCreateRulesSafety";
import HostStayPreview from "../pages/HostStay/HostStayPreview";

import BecomeHost from "../pages/BecomeHost";

import HostToday from "../pages/HostPage/HostToday";
import HostListings from "../pages/HostPage/HostListings";
import HostMessages from "../pages/HostPage/HostMessages";
import HostDashboard from "../pages/HostPage/HostDashboard";

import ProfileEditPage from "../pages/ProfileEditPage";

//import HostDemoPreview from "../pages/HostDemoPreview";
import { HostProvider } from "../contexts/HostContext";

import ResetPasswordPage from "../pages/ResetPasswordPage";
import PaymentPage from "../pages/PaymentPage";
import { useApp } from "../contexts/AppContext";

function RoleAwareHome() {
  const { user } = useApp();
  const role = (user?.Role || user?.role || "").toString().toUpperCase();

  if (role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <HomePage />;
}

const AppRoutes = () => {
  return (
    <Routes>

      {/* Main layout pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<RoleAwareHome />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="experiences/search" element={<ExperienceSearchResultsPage />} />
        <Route path="tours" element={<ToursPage />} />
        {/* Profile menu pages under MainLayout to include Header/Footer */}
        <Route path="wishlist" element={<RequireAuth><WishlistPage /></RequireAuth>} />
        <Route path="trips" element={<RequireAuth><TripsPage /></RequireAuth>} />
        <Route path="notifications" element={<RequireAuth><NotificationsPage /></RequireAuth>} />
        <Route path="account" element={<RequireAuth><AccountSettingsPage /></RequireAuth>} />
        <Route path="payment" element={<RequireAuth><PaymentPage /></RequireAuth>} />
        <Route
          path="profile"
          element={(
            <RequireAuth>
              <ProfilePage />
            </RequireAuth>
          )}
        />
        <Route
          path="profile/edit"
          element={(
            <RequireAuth>
              <ProfileEditPage />
            </RequireAuth>
          )}
        />
        <Route path="support" element={<SupportPage />} />
      </Route>

      {/* Admin area */}
      <Route path="/admin" element={<RequireAdmin><AdminLayout /></RequireAdmin>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="settings" element={<AdminSettings />} />
        <Route path="account" element={<AccountSettingsPage />} />
      </Route>

      {/* Info layout pages */}
      <Route path="/" element={<InfoLayout />}>
        <Route path="homeinfo" element={<HomeInfoPage />} />
        <Route path="property/:id" element={<HomeInfoPage />} />
        <Route path="experienceinfo" element={<ExperienceInfoPage />} />
        <Route path="experience/:id" element={<ExperienceInfoPage />} />
      </Route>

      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUpPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path="/host/becomehost" element={<BecomeHost />} />
      <Route path="/host/today" element={<HostToday />} />
      <Route path="/host/listings" element={<HostListings />} />
      <Route path="/host/messages" element={<HostMessages />} />
      <Route path="/host/dashboard" element={<HostDashboard />} />

      <Route
        path="/host/*"
        element={
          <HostProvider>
            <HostLayout />
          </HostProvider>
        }
      >
        {/* Các route con */}
        {/*<Route path="demo-preview" element={<HostDemoPreview />} />*/}


        {/* Flow tạo Stay */}
        <Route path="stay/create">
          <Route path="choose" element={<HostStayCreateChoose />} />
          <Route path="typeofplace" element={<HostStayCreateTypeOfPlace />} />
          <Route path="location" element={<HostStayCreateLocate />} />
          <Route path="details" element={<HostStayCreateDetails />} />
          <Route path="amenities" element={<HostStayCreateAmenities />} />
          <Route path="photos" element={<HostStayCreatePhotos />} />
          <Route path="title" element={<HostStayCreateTitle />} />
          <Route path="description" element={<HostStayCreateDescription />} />
          <Route path="fees" element={<HostStayCreateFees />} />
          <Route path="weekday-price" element={<HostStayCreateWeekdayPrice />} />
          <Route path="weekend-price" element={<HostStayCreateWeekendPrice />} />
          <Route path="discount" element={<HostStayCreateDiscount />} />
          <Route path="rules-safety" element={<HostStayCreateRulesSafety />} />
          <Route path="preview" element={<HostStayPreview />} />
        </Route>

        {/* Flow tạo Experience */}
        <Route path="experience/create">
          <Route path="choose" element={<HostExperienceCreateChoose />} />
          <Route path="years" element={<HostExperienceCreateYears />} />
          <Route path="qualification" element={<HostExperienceCreateQualification />} />
          <Route path="locate" element={<HostExperienceCreateLocate />} />
          <Route path="photos" element={<HostExperienceCreatePhotos />} />
          <Route path="describe-title" element={<HostExperienceDescribeTitle />} />
          <Route path="itinerary" element={<HostExperienceCreateItinerary />} />
          <Route path="max-guests" element={<HostExperienceCreateMaxGuests />} />
          <Route path="discount" element={<HostExperienceCreateDiscount />} />
          <Route path="preview" element={<HostExperiencePreview />} />
        </Route>
      </Route>



    </Routes>
  );
};

export default AppRoutes;
