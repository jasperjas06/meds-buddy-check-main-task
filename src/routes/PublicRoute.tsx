import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";

const PublicRoute = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/patient-login" element={<Login />} />
      <Route path="/caretaker-login" element={<Login />} />
      <Route path="/patient-signup" element={<Signup />} />
      <Route path="/caretaker-signup" element={<Signup />} />
    </Routes>
  )
};

export default PublicRoute;
