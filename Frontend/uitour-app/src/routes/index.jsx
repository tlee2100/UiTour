import { Route, Routes } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import InfoLayout from "../layouts/InfoLayout";
import HomePage from "../pages/HomePage";
import HomeInfoPage from "../pages/HomeInfoPage";
import ToursPage from "../pages/ToursPage";
import ExperienceInfoPage from "../pages/ExperienceInfoPage";
import MapDemoPage from "../pages/MapDemoPage";
import LoginPage from "../pages/LoginPage";
import SignUpPage from "../pages/SignUpPage";
import HostExperienceCreateChoose from "../pages/HostExperience/HostExperienceCreateChoose";
import HostExperienceCreateYears from "../pages/HostExperience/HostExperienceCreateYears";
import HostExperienceCreateQualification from "../pages/HostExperience/HostExperienceCreateQualification";
import HostExperienceCreateLocate from "../pages/HostExperience/HostExperienceCreateLocate";
import HostExperienceCreatePhotos from "../pages/HostExperience/HostExperienceCreatePhotos";
import HostExperienceDescribeTitle from "../pages/HostExperience/HostExperienceDescribeTitle";
import HostExperienceCreateItinerary from "../pages/HostExperience/HostExperienceCreateItinerary";
import HostExperienceCreateMaxGuests from "../pages/HostExperience/HostExperienceCreateMaxGuests";
import HostExperienceCreateDiscount from "../pages/HostExperience/HostExperienceCreateDiscount";

const AppRoutes = () => {
  return (
    <Routes>

      {/* Main layout pages */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="demomap" element={<MapDemoPage />} />
        <Route path="tours" element={<ToursPage />} />
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
