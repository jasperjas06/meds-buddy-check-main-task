import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, User, Heart, Sparkles, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Footer from "./Footer";

interface OnboardingProps {
  onComplete: (userType: "patient" | "caretaker") => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

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
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite alternate`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-6xl w-full">
          {/* Header Section */}
          <div className="text-center mb-16">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl transform hover:rotate-12 transition-all duration-500 hover:scale-110">
                <Heart className="w-12 h-12 text-white animate-pulse" />
                <div className="absolute -top-2 -right-2">
                  <Sparkles className="w-6 h-6 text-yellow-300 animate-spin" />
                </div>
              </div>
              <div className="absolute inset-0 w-24 h-24 mx-auto rounded-2xl bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 blur-lg opacity-30 animate-pulse"></div>
            </div>
            
            <h1 className="text-6xl font-black bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent mb-6 tracking-tight">
              TrackMyMeds
            </h1>
            <div className="relative">
              <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
                Revolutionary medication management reimagined for the digital age
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"></div>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Patient Card */}
            <Card 
              className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-400/20 transform hover:-translate-y-2"
              onMouseEnter={() => setHoveredCard('patient')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 ${hoveredCard === 'patient' ? 'rotate-12 scale-110' : ''}`}>
                    <User className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-cyan-400 to-blue-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-3">I'm a Patient</CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Take control of your health journey with intelligent tracking
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4 mb-8">
                  {[
                    { icon: "💊", text: "Smart medication reminders" },
                    { icon: "📸", text: "AI-powered photo verification" },
                    { icon: "📅", text: "Interactive health calendar" },
                    { icon: "🎯", text: "Personalized insights" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-slate-300 hover:text-white transition-colors duration-300">
                      <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg group-hover:bg-cyan-500/20 transition-colors duration-300">
                        <span className="text-sm">{item.icon}</span>
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/patient-login")}
                >
                  <User className="w-5 h-5 mr-2" />
                  Continue as Patient
                </Button>
              </CardContent>
            </Card>

            {/* Caretaker Card */}
            <Card 
              className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 hover:border-emerald-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-400/20 transform hover:-translate-y-2"
              onMouseEnter={() => setHoveredCard('caretaker')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <CardHeader className="text-center pb-6 relative z-10">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 ${hoveredCard === 'caretaker' ? 'rotate-12 scale-110' : ''}`}>
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
                </div>
                <CardTitle className="text-2xl font-bold text-white mb-3">I'm a Caretaker</CardTitle>
                <CardDescription className="text-slate-400 text-base">
                  Provide compassionate care with advanced monitoring tools
                </CardDescription>
              </CardHeader>
              
              <CardContent className="relative z-10">
                <div className="space-y-4 mb-8">
                  {[
                    { icon: "📊", text: "Real-time compliance monitoring" },
                    { icon: "🔔", text: "Intelligent alert system" },
                    { icon: "📈", text: "Comprehensive health reports" },
                    { icon: "🛡️", text: "24/7 care coordination" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-slate-300 hover:text-white transition-colors duration-300">
                      <div className="w-8 h-8 flex items-center justify-center bg-slate-700 rounded-lg group-hover:bg-emerald-500/20 transition-colors duration-300">
                        <span className="text-sm">{item.icon}</span>
                      </div>
                      <span className="text-sm font-medium">{item.text}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-semibold py-4 rounded-xl text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => navigate("/caretaker-login")}
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Continue as Caretaker
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Trust Indicators */}
          {/* <div className="mt-16 text-center">
            <div className="flex justify-center items-center gap-8 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>Trusted by 50k+ Families</span>
              </div>
              <div className="w-1 h-1 bg-slate-600 rounded-full"></div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>AI-Powered</span>
              </div>
            </div>
          </div> */}
        </div>
      </div>

      <Footer />

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

export default Onboarding;