import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { User, Users, Lock, Mail } from "lucide-react";
import supabase from "@/supabaseClient";
import { useAuth } from "@/context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
const { setToken } = useAuth();
  const role = location.pathname.includes("caretaker")
    ? "caretaker"
    : "patient";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const userToken = data.session?.access_token;
    const user = data.user;
    const userRole = user.user_metadata?.role;

    if (userRole !== role) {
      await supabase.auth.signOut();
      toast.error(
        `Access denied. This account is a "${userRole}", not a "${role}".`
      );
      setLoading(false);
      return;
    }

    toast.success("Logged in successfully!");
    if (userToken) {
  localStorage.setItem("tmm_access_token", userToken);
  setToken(userToken); // 👈 this line is critical
}

    if (userRole === "caretaker") {
      // Go to patient selector page
      navigate("/patient-selector");
    } else if (userRole === "patient") {
      // Fetch the patient ID from 'patients' table
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("id")
        .eq("email", user.email)
        .single();

      if (patientError || !patientData) {
        toast.error("Failed to fetch patient info");
      } else {
        navigate(`/patient-dashboard/${patientData.id}`);
      }
    }

    setLoading(false);
  };

  const isPatient = role === "patient";
  const roleIcon = isPatient ? User : Users;
  const roleColor = isPatient ? "cyan" : "emerald";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse animation-delay-4000"></div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animation: `float ${
                3 + Math.random() * 2
              }s ease-in-out infinite alternate`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full">
          <Card className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-400/20 transform hover:-translate-y-1">
            {/* Gradient Overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${isPatient ? 'from-cyan-500/10 via-transparent to-blue-500/10' : 'from-emerald-500/10 via-transparent to-green-500/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            
            <CardHeader className="text-center pb-6 relative z-10">
              <div className="relative mb-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${isPatient ? 'from-cyan-400 to-blue-500' : 'from-emerald-400 to-green-500'} rounded-3xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110`}>
                  {React.createElement(roleIcon, { className: "w-10 h-10 text-white" })}
                </div>
                <div className={`absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br ${isPatient ? 'from-cyan-400 to-blue-500' : 'from-emerald-400 to-green-500'} blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500`}></div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-3">
                {isPatient ? "Patient Login" : "Caretaker Login"}
              </CardTitle>
              <p className="text-slate-400 text-base">
                {isPatient ? "Access your health journey" : "Monitor and care with precision"}
              </p>
            </CardHeader>
            
            <CardContent className="relative z-10">
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder-slate-400 focus:border-cyan-400 focus:ring-cyan-400/20 transition-all duration-300"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className={`w-full bg-gradient-to-r ${isPatient ? 'from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500' : 'from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500'} text-white font-semibold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105`}
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      {React.createElement(roleIcon, { className: "w-5 h-5 mr-2" })}
                      Sign In
                    </div>
                  )}
                </Button>
              </form>
              
              <div className="mt-8 text-center">
                <p className="text-slate-400 text-sm">
                  Don't have an account?{" "}
                  <span
                    className={`${isPatient ? 'text-cyan-400 hover:text-cyan-300' : 'text-emerald-400 hover:text-emerald-300'} hover:underline cursor-pointer font-medium transition-colors duration-300`}
                    onClick={() => navigate(`/${role}-signup`)}
                  >
                    Create one here
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0% { transform: translateY(0px); }
          100% { transform: translateY(-10px); }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
};

export default Login;