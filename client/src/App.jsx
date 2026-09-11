import React, { useEffect, Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/Auth";
import axios from "axios";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

const InterviewPage = lazy(() => import("./pages/InterviewPage"));
const Pricing = lazy(() => import("./pages/Pricing"));
const InterviewReport = lazy(() => import("./pages/InterviewReport"));
const InterviewHistory = lazy(() => import("./pages/InterviewHistory"));
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

export const ServerUrl = import.meta.env.VITE_SERVER_URL;

const PageLoader = () => (
  <div className="min-h-screen bg-[#070b14] flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
  </div>
);

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/user/current-user",
          { withCredentials: true }
        );
        dispatch(setUserData(result.data));
      } catch (error) {
        if ([400, 401, 403].includes(error.response?.status)) {
          dispatch(setUserData(null));
        }
      }
    };

    const unsubscribe = onAuthStateChanged(auth, () => {
      getUser();
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/interview" element={<InterviewPage />} />
        <Route path="/history" element={<InterviewHistory />} />
        <Route path="/pricing" element={<Pricing />} />
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
      </Routes>
    </Suspense>
  );
}

export default App;
