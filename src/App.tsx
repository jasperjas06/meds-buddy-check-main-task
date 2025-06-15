import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";        
import Signup from "./pages/Signup";      
import { AuthProvider } from "./context/AuthContext";
import PatientDashboard from "./components/PatientDashboard";
import CaretakerDashboard from "./components/CaretakerDashboard";
import PatientSelector from "./pages/PatientSelector";
import AddMedication from "./components/AddMedication";
// import Dashboard from "./pages/Dashboard"; 

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/patient-login" element={<Login />} />
            <Route path="/caretaker-login" element={<Login />} />
            <Route path="/patient-signup" element={<Signup />} />
            <Route path="/caretaker-signup" element={<Signup />} />
            <Route path="/patient-dashboard/:patientId" element={<PatientDashboard />} />
            <Route path="/caretaker-dashboard/:patientId" element={<CaretakerDashboard />} />
            <Route path="/patient-selector" element={<PatientSelector />} />
            <Route path="/add-medication/:patientId" element={<AddMedication />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
