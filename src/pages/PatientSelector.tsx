import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";

interface Patient {
  id: string;
  email: string;
  name?: string;
}

const isPatient = false;

const PatientSelector = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase
        .from("patients")
        .select("id, email, name");

      if (error) {
        console.error("Error fetching patients:", error.message);
      } else {
        setPatients(data || []);
        setFilteredPatients((data || []).slice(0, 6));
      }

      setLoading(false);
    };

    fetchPatients();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      const searchPatients = async () => {
        if (searchQuery.trim() === "") {
          setFilteredPatients(patients.slice(0, 6));
          return;
        }

        setSearching(true);

        const localMatches = patients.filter((p) =>
          (p.name || p.email).toLowerCase().includes(searchQuery.toLowerCase())
        );

        if (localMatches.length > 0) {
          setFilteredPatients(localMatches.slice(0, 6));
          setSearching(false);
          return;
        }

        const { data, error } = await supabase
          .from("patients")
          .select("id, email, name")
          .ilike("name", `%${searchQuery}%`);

        if (error) {
          console.error("DB Search Error:", error.message);
          setFilteredPatients([]);
        } else {
          setFilteredPatients(data.slice(0, 6));
        }

        setSearching(false);
      };

      searchPatients();
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, patients]);

  const handleSelect = (id: string) => {
    navigate(`/caretaker-dashboard/${id}`);
  };

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
          <Card className="group relative overflow-hidden bg-slate-800/40 backdrop-blur-md border border-slate-700/40 hover:border-emerald-400/60 transition-all duration-500 hover:shadow-emerald-400/30 hover:shadow-xl transform hover:-translate-y-1">
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

            <CardHeader className="text-center pb-6 relative z-10">
              <div className="relative mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg transition-all duration-500 group-hover:rotate-12 group-hover:scale-110">
                  h
                </div>
                <div className="absolute inset-0 w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-emerald-400 to-green-500 blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-500"></div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-3">
                Select a Patient
              </CardTitle>
              <p className="text-slate-400 text-base">
                Monitor and care with precision
              </p>
            </CardHeader>

            <CardContent className="space-y-3 relative z-10">
              <Input
                type="text"
                placeholder="Search patient by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700 text-white placeholder:text-slate-400 border border-emerald-400/30 focus:border-emerald-500 focus:ring-emerald-500"
              />

              {loading ? (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-400 mt-2">
                    Loading patients...
                  </p>
                </div>
              ) : searching ? (
                <div className="text-center py-6">
                  <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-400" />
                  <p className="text-sm text-gray-400 mt-2">
                    Searching database...
                  </p>
                </div>
              ) : filteredPatients.length === 0 ? (
                <p className="text-center text-gray-400 mt-4">
                  No patients found for "{searchQuery}".
                </p>
              ) : (
                filteredPatients.map((patient) => (
                  <Button
                    key={patient.id}
                    className="w-full justify-start border border-emerald-500/40 text-white hover:bg-emerald-500/20 transition-all duration-300"
                    variant="ghost"
                    onClick={() => handleSelect(patient.id)}
                  >
                    {patient.name || patient.email}
                  </Button>
                ))
              )}
            </CardContent>
          </Card>
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

export default PatientSelector;
