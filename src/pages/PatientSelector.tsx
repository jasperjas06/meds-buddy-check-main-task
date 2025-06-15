// src/pages/PatientSelector.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "@/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Patient {
  id: string;
  email: string;
  name?: string;
}

const PatientSelector = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      const { data, error } = await supabase.from("patients").select("id, email, name");
      if (error) {
        console.error("Error fetching patients:", error.message);
      } else {
        setPatients(data || []);
      }
      setLoading(false);
    };

    fetchPatients();
  }, []);

  const handleSelect = (id: string) => {
    navigate(`/caretaker-dashboard/${id}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Select a Patient</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <div className="text-center py-6">
              <Loader2 className="animate-spin h-5 w-5 mx-auto text-gray-500" />
              <p className="text-sm text-gray-500 mt-2">Loading patients...</p>
            </div>
          ) : patients.length === 0 ? (
            <p className="text-center text-gray-500">No patients found.</p>
          ) : (
            patients.map((patient) => (
              <Button
                key={patient.id}
                className="w-full justify-start"
                variant="outline"
                onClick={() => handleSelect(patient.id)}
              >
                {patient.name || patient.email}
              </Button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PatientSelector;
