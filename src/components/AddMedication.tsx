import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import supabase from "@/supabaseClient";

const AddMedication = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("pending");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!patientId) {
      toast.error("Invalid patient ID.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("medications").insert([
      {
        patient_id: patientId,
        name,
        time,
        date,
        status,
      },
    ]);

    if (error) {
      toast.error("Failed to add medication.");
      console.error(error);
    } else {
      toast.success("Medication added successfully!");
      navigate(`/caretaker-dashboard/${patientId}`);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-xl text-center">Add Medication</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Medication Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              type="time"
              placeholder="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              required
            />
            <Input
              type="date"
              placeholder="Date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding..." : "Add Medication"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddMedication;
