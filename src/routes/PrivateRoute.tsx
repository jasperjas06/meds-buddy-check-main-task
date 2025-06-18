import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import PatientDashboard from "@/components/PatientDashboard";
import CaretakerDashboard from "@/components/CaretakerDashboard";
import PatientSelector from "@/pages/PatientSelector";
import AddMedication from "@/components/AddMedication";
import NotFound from "@/pages/NotFound";

const PrivateRoute = () => {
  return (
    <Routes>
      <Route path="/patient-dashboard/:patientId" element={<PatientDashboard />} />
      <Route path="/caretaker-dashboard/:patientId" element={<CaretakerDashboard />} />
      <Route path="/patient-selector" element={<PatientSelector />} />
      <Route path="/add-medication/:patientId" element={<AddMedication />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
};

export default PrivateRoute;
