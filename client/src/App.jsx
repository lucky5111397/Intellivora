import React, { useEffect, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/Auth";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import ScrollToTop from "./components/ScrollToTop";
import NotFound from "./pages/NotFound";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

const InterviewPage = lazy(() => import("./pages/InterviewPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const InterviewReport = lazy(() => import("./pages/InterviewReport"));
const InterviewHistory = lazy(() => import("./pages/InterviewHistory"));
const Progress = lazy(() => import("./pages/Progress"));
const Resume = lazy(() => import("./pages/Resume"));
const Aptitude = lazy(() => import("./pages/Aptitude"));
const AptitudeDashboard = lazy(() => import("./aptitude/pages/AptitudeDashboard"));
const TopicSelection = lazy(() => import("./aptitude/pages/TopicSelection"));
const TestSetup = lazy(() => import("./aptitude/pages/TestSetup"));
const TestScreen = lazy(() => import("./aptitude/pages/TestScreen"));
const AptitudeResult = lazy(() => import("./aptitude/pages/AptitudeResult"));
const GD = lazy(() => import("./pages/GD"));
const GDOverview = lazy(() => import("./gd/pages/GDOverview"));
const GDSetup = lazy(() => import("./gd/pages/GDSetup"));
const GDLobby = lazy(() => import("./gd/pages/GDLobby"));
const GDRoom = lazy(() => import("./gd/pages/GDRoom"));
const GDAnalysis = lazy(() => import("./gd/pages/GDAnalysis"));

// Administrative Pages
const AdminDashboard = lazy(() => import("./admin/pages/AdminDashboard"));
const AdminUsers = lazy(() => import("./admin/pages/AdminUsers"));
const AdminNewsletter = lazy(() => import("./admin/pages/AdminNewsletter"));
const AdminInterviews = lazy(() => import("./admin/pages/AdminInterviews"));
const AdminInterviewDetail = lazy(() => import("./admin/pages/AdminInterviewDetail"));
const AdminAptitude = lazy(() => import("./admin/pages/AdminAptitude"));
const AdminAptitudeDetail = lazy(() => import("./admin/pages/AdminAptitudeDetail"));
const AdminGD = lazy(() => import("./admin/pages/AdminGD"));
const AdminGDDetail = lazy(() => import("./admin/pages/AdminGDDetail"));
const AdminResume = lazy(() => import("./admin/pages/AdminResume"));
const AdminResumeDetail = lazy(() => import("./admin/pages/AdminResumeDetail"));
const AdminPayments = lazy(() => import("./admin/pages/AdminPayments"));
const AdminPaymentDetail = lazy(() => import("./admin/pages/AdminPaymentDetail"));

// Static & Informational Pages
const PrivacyPolicy = lazy(() => import("./pages/static/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/static/TermsOfService"));
const CookiePolicy = lazy(() => import("./pages/static/CookiePolicy"));
const RefundPolicy = lazy(() => import("./pages/static/RefundPolicy"));
const SecurityPage = lazy(() => import("./pages/static/SecurityPage"));
const AboutPage = lazy(() => import("./pages/static/AboutPage"));
const CareersPage = lazy(() => import("./pages/static/CareersPage"));
const BlogPage = lazy(() => import("./pages/static/BlogPage"));
const ContactPage = lazy(() => import("./pages/static/ContactPage"));
const PressPage = lazy(() => import("./pages/static/PressPage"));
const DocsPage = lazy(() => import("./pages/static/DocsPage"));
const HelpCenterPage = lazy(() => import("./pages/static/HelpCenterPage"));
const CommunityPage = lazy(() => import("./pages/static/CommunityPage"));
const FAQsPage = lazy(() => import("./pages/static/FAQsPage"));
const GuidesPage = lazy(() => import("./pages/static/GuidesPage"));

// Role-Specific Use-Case Pages
const SoftwareEngineers = lazy(() => import("./pages/use-cases/SoftwareEngineers"));
const DataAnalysts = lazy(() => import("./pages/use-cases/DataAnalysts"));
const ProductBusiness = lazy(() => import("./pages/use-cases/ProductBusiness"));
const CampusPlacements = lazy(() => import("./pages/use-cases/CampusPlacements"));
const Consultants = lazy(() => import("./pages/use-cases/Consultants"));

export const ServerUrl = import.meta.env.VITE_SERVER_URL;

const PageLoader = () => (
  <div className="min-h-screen bg-[#06080B] flex items-center justify-center">
    <div className="w-10 h-10 border-3 border-[#2563EB]/20 border-t-[#2563EB] rounded-full animate-spin" />
  </div>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    let isMounted = true;
    const getUser = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/user/current-user",
          { withCredentials: true }
        );
        if (isMounted) {
          dispatch(setUserData(result.data));
        }
      } catch {
        if (isMounted) {
          dispatch(setUserData(null));
        }
      }
    };

    getUser();

    const unsubscribe = onAuthStateChanged(auth, () => {
      getUser();
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <ErrorBoundary>
      <ScrollToTop />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Standalone Auth Screen */}
          <Route path="/auth" element={<Auth />} />

          {/* App Layout Shell for all platform pages */}
          <Route element={<AppLayout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/cookies" element={<CookiePolicy />} />
            <Route path="/refund" element={<RefundPolicy />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/careers" element={<CareersPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/press" element={<PressPage />} />
            <Route path="/docs" element={<DocsPage />} />
            <Route path="/help" element={<HelpCenterPage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/faqs" element={<FAQsPage />} />
            <Route path="/guides" element={<GuidesPage />} />

            {/* Role-Specific Use-Case Pages */}
            <Route path="/use-cases/software-engineers" element={<SoftwareEngineers />} />
            <Route path="/use-cases/data-analysts" element={<DataAnalysts />} />
            <Route path="/use-cases/product-business" element={<ProductBusiness />} />
            <Route path="/use-cases/campus-placements" element={<CampusPlacements />} />
            <Route path="/use-cases/consultants" element={<Consultants />} />

            {/* Friendly URL Aliases */}
            <Route path="/for/software-engineers" element={<SoftwareEngineers />} />
            <Route path="/for/data-analysts" element={<DataAnalysts />} />
            <Route path="/for/product-business" element={<ProductBusiness />} />
            <Route path="/for/campus-placements" element={<CampusPlacements />} />
            <Route path="/for/consultants" element={<Consultants />} />

            {/* Protected Account-Dependent Service Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/interview" element={<InterviewPage />} />
              <Route path="/history" element={<InterviewHistory />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/resume" element={<Resume />} />
              <Route path="/aptitude" element={<Aptitude />}>
                <Route index element={<AptitudeDashboard />} />
                <Route path="topics" element={<TopicSelection />} />
                <Route path="setup" element={<TestSetup />} />
                <Route path="test" element={<TestScreen />} />
                <Route path="result" element={<AptitudeResult />} />
                <Route path="result/:attemptId" element={<AptitudeResult />} />
              </Route>
              <Route path="/gd" element={<GD />}>
                <Route index element={<GDOverview />} />
                <Route path="setup" element={<GDSetup />} />
                <Route path="lobby/:id" element={<GDLobby />} />
                <Route path="room/:id" element={<GDRoom />} />
                <Route path="analysis/:id" element={<GDAnalysis />} />
              </Route>
              <Route path="/report/:id" element={<InterviewReport />} />
            </Route>

            {/* Administrative Operations */}
            <Route element={<AdminProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/newsletter" element={<AdminNewsletter />} />
              <Route path="/admin/interviews" element={<AdminInterviews />} />
              <Route path="/admin/interviews/:id" element={<AdminInterviewDetail />} />
              <Route path="/admin/aptitude" element={<AdminAptitude />} />
              <Route path="/admin/aptitude/:id" element={<AdminAptitudeDetail />} />
              <Route path="/admin/gd" element={<AdminGD />} />
              <Route path="/admin/gd/:id" element={<AdminGDDetail />} />
              <Route path="/admin/resume" element={<AdminResume />} />
              <Route path="/admin/resume/:id" element={<AdminResumeDetail />} />
              <Route path="/admin/payments" element={<AdminPayments />} />
              <Route path="/admin/payments/:id" element={<AdminPaymentDetail />} />
            </Route>

            {/* 404 Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
