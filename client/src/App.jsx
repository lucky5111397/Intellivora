import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/home";
import Auth from "./pages/Auth";
import axios from "axios";
import InterviewPage from "./pages/InterviewPage";
import { useDispatch } from "react-redux";
import { setUserData } from "./redux/userSlice";
import Pricing from "./pages/Pricing";
import InterviewReport from "./pages/InterviewReport";
import InterviewHistory from "./pages/InterviewHistory";
import Resume from "./pages/Resume";
import Aptitude from "./pages/Aptitude";
import AptitudeDashboard from "./aptitude/pages/AptitudeDashboard";
import TopicSelection from "./aptitude/pages/TopicSelection";
import TestSetup from "./aptitude/pages/TestSetup";
import TestScreen from "./aptitude/pages/TestScreen";
import AptitudeResult from "./aptitude/pages/AptitudeResult";
import { auth } from "./utils/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const ServerUrl = import.meta.env.VITE_SERVER_URL;

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
      <Route path="/report/:id" element={<InterviewReport />} />
    </Routes>
  );
}

export default App;
