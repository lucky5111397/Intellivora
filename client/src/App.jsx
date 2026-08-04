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

// NEW
export const ServerUrl = import.meta.env.VITE_SERVER_URL ||
function App() {

  const dispatch = useDispatch()


  useEffect(() => {
    const getUser = async () => {
      try {
        const result = await axios.get(
          ServerUrl + "/api/user/current-user",
          { withCredentials: true }
        );
        dispatch(setUserData(result.data))
      } catch (error) {
        console.log(error)
        dispatch(setUserData(null))
      }
    }
    getUser()
  }, [dispatch])
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/interview" element={<InterviewPage />} />
      <Route path="/history" element={<InterviewHistory />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/resume" element={<Resume />} />
      <Route path="/report/:id" element={<InterviewReport />} />

    </Routes>
  );
}

export default App;
