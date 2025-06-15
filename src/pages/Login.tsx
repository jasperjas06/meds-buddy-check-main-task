import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import supabase from "@/supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.pathname.includes("caretaker") ? "caretaker" : "patient";
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

  const user = data.user;
  const userRole = user.user_metadata?.role;

  if (userRole !== role) {
    await supabase.auth.signOut();
    toast.error(`Access denied. This account is a "${userRole}", not a "${role}".`);
    setLoading(false);
    return;
  }

  toast.success("Logged in successfully!");

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



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            Log In as {role === "patient" ? "Patient" : "Caretaker"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              required
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Logging in..." : "Login"}
            </Button>
          </form>
          <p className="text-sm text-center text-muted-foreground mt-4">
            Don't have an account?{" "}
            <span
              className="text-blue-600 hover:underline cursor-pointer"
              onClick={() => navigate(`/${role}-signup`)}
            >
              Sign up
            </span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
