import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import InfoLayout from "../layouts/InfoLayout";
import HomePage from "../pages/HomePage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ToursPage from "../pages/ToursPage";
import SearchResultsPage from "../pages/SearchResultsPage";
import ExperienceSearchResultsPage from "../pages/ExperienceSearchResultsPage";
import ExperienceInfoPage from "../pages/ExperienceInfoPage";
import MapDemoPage from "../pages/MapDemoPage";
import ProfilePage from "../pages/ProfilePage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import RequireAuth from "../components/RequireAuth";

import HostExperienceCreateChoose from "../pages/HostExperience/HostExperienceCreateChoose";
import HostExperienceCreateYears from "../pages/HostExperience/HostExperienceCreateYears";
import HostExperienceCreateQualification from "../pages/HostExperience/HostExperienceCreateQualification";
import HostExperienceCreateLocate from "../pages/HostExperience/HostExperienceCreateLocate";
import HostExperienceCreatePhotos from "../pages/HostExperience/HostExperienceCreatePhotos";
import HostExperienceDescribeTitle from "../pages/HostExperience/HostExperienceDescribeTitle";
import HostExperienceCreateItinerary from "../pages/HostExperience/HostExperienceCreateItinerary";
import HostExperienceCreateMaxGuests from "../pages/HostExperience/HostExperienceCreateMaxGuests";
import HostExperienceCreateDiscount from "../pages/HostExperience/HostExperienceCreateDiscount";

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

import BecomeHost from "../pages/BecomeHost";

import HostToday from "../pages/HostPage/HostToday";
import HostListings from "../pages/HostPage/HostListings";
import ProfileEditPage from "../pages/ProfileEditPage";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Main layout pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="search" element={<SearchResultsPage />} />
        <Route path="experiences/search" element={<ExperienceSearchResultsPage />} />
        <Route path="demomap" element={<MapDemoPage />} />
        <Route path="tours" element={<ToursPage />} />
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

      <Route path="/host/becomehost" element={<BecomeHost />} />

      <Route path="/host/today" element={<HostToday />} />
      <Route path="/host/listings" element={<HostListings />} />

      {/* Host Stay Creation (no shared site layout) */}
      <Route path="/host/stay/create/choose" element={<HostStayCreateChoose />} />
      <Route path="/host/stay/create/typeofplace" element={<HostStayCreateTypeOfPlace />} />
      <Route path="/host/stay/create/location" element={<HostStayCreateLocate />} />
      <Route path="/host/stay/create/details" element={<HostStayCreateDetails />} />
      <Route path="/host/stay/create/amenities" element={<HostStayCreateAmenities />} />
      <Route path="/host/stay/create/photos" element={<HostStayCreatePhotos />} />
      <Route path="/host/stay/create/title" element={<HostStayCreateTitle />} />
      <Route path="/host/stay/create/description" element={<HostStayCreateDescription />} />
      <Route path="/host/stay/create/weekday-price" element={<HostStayCreateWeekdayPrice />} />
      <Route path="/host/stay/create/weekend-price" element={<HostStayCreateWeekendPrice />} />
      <Route path="/host/stay/create/discount" element={<HostStayCreateDiscount />} />

      {/* Host Experience Creation (no shared site layout) */}
      <Route path="/host/experience/create/choose" element={<HostExperienceCreateChoose />} />
      <Route path="/host/experience/create/years" element={<HostExperienceCreateYears />} />
      <Route path="/host/experience/create/qualification" element={<HostExperienceCreateQualification />} />
      <Route path="/host/experience/create/locate" element={<HostExperienceCreateLocate />} />
      <Route path="/host/experience/create/photos" element={<HostExperienceCreatePhotos />} />
      <Route path="/host/experience/create/describe-title" element={<HostExperienceDescribeTitle />} />
      <Route path="/host/experience/create/itinerary" element={<HostExperienceCreateItinerary />} />
      <Route path="/host/experience/create/max-guests" element={<HostExperienceCreateMaxGuests />} />
      <Route path="/host/experience/create/discount" element={<HostExperienceCreateDiscount />} />

    </Routes>
  );
};

export default AppRoutes;
