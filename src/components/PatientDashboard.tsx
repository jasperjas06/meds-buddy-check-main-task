// PatientDashboard.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Check, Calendar as CalendarIcon, User } from "lucide-react";
import MedicationTracker from "./MedicationTracker";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import supabase from "@/supabaseClient";

interface Patient {
  id: string;
  name: string;
}

interface PatientMedication {
  id: string;
  patient_id: string;
  name: string;
  time: string;
  date: string;
  status: string;
  created_at: string;
  isTaken: boolean;
}

const PatientDashboard = () => {
  const { patientId } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [medications, setMedications] = useState<PatientMedication[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isTodaySelected = isToday(selectedDate);

  // Get taken dates for calendar (medications with status 'taken')
  const takenDates = new Set(
    medications
      .filter(med => med.status === 'taken')
      .map(med => med.date)
  );

  // Get medication status for selected date
  const selectedDateMedications = medications
    .filter(med => med.date === selectedDateStr)
    .map(med => ({
      ...med,
      isTaken: med.status === 'taken'
    }));

  useEffect(() => {
    if (!patientId) return;
    fetchData();
  }, [patientId]);

  const fetchData = async () => {
    if (!patientId) return;
    
    setLoading(true);
    try {
      // Fetch patient data
      const { data: patientData, error: patientError } = await supabase
        .from("patients")
        .select("*")
        .eq("id", patientId)
        .single();

      if (patientError) {
        console.error("Error fetching patient:", patientError);
        return;
      }
      setPatient(patientData);

      // Fetch medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from("medications")
        .select("*")
        .eq("patient_id", patientId)
        .order("date", { ascending: true })
        .order("time", { ascending: true });

      if (medicationsError) {
        console.error("Error fetching medications:", medicationsError);
        return;
      }
      
      setMedications(medicationsData || []);

    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkTaken = async (medicationId: string, date: string, imageFile?: File) => {
    if (!patientId) return;
    setIsSubmitting(true);

    try {
      // Update medication status to 'taken'
      const { error } = await supabase
        .from("medications")
        .update({ 
          status: 'taken'
        })
        .eq("id", medicationId);

      if (error) {
        console.error("Error updating medication:", error);
        return;
      }

      // Update local state
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId
            ? { ...med, status: 'taken' }
            : med
        )
      );

      console.log("Medication marked as taken");
    } catch (error) {
      console.error("Error in handleMarkTaken:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMarkNotTaken = async (medicationId: string, date: string) => {
    if (!patientId) return;
    setIsSubmitting(true);

    try {
      // Update medication status back to 'pending' or 'skipped'
      const { error } = await supabase
        .from("medications")
        .update({ 
          status: 'pending'
        })
        .eq("id", medicationId);

      if (error) {
        console.error("Error updating medication:", error);
        return;
      }

      // Update local state
      setMedications(prev => 
        prev.map(med => 
          med.id === medicationId
            ? { ...med, status: 'pending' }
            : med
        )
      );

      console.log("Medication marked as not taken");
    } catch (error) {
      console.error("Error in handleMarkNotTaken:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStreakCount = () => {
    let streak = 0;
    const currentDate = new Date(today);
    
    while (streak < 30) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const dayMedications = medications.filter(med => med.date === dateStr);
      const totalMedications = dayMedications.length;
      const takenMedications = dayMedications.filter(med => med.status === 'taken').length;
      
      // Consider day complete if all medications are taken
      if (totalMedications > 0 && takenMedications === totalMedications) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const getTodayCompletionStatus = () => {
    const todayMedications = medications.filter(med => med.date === todayStr);
    const totalMedications = todayMedications.length;
    const takenMedications = todayMedications.filter(med => med.status === 'taken').length;
    
    if (totalMedications === 0) return "No meds";
    return takenMedications === totalMedications ? "✓" : `${takenMedications}/${totalMedications}`;
  };

  const getMonthlyCompletionRate = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    let completedDays = 0;
    let totalDays = 0;
    
    const currentDate = new Date(thirtyDaysAgo);
    while (currentDate <= today) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const dayMedications = medications.filter(med => med.date === dateStr);
      const totalMedications = dayMedications.length;
      const takenMedications = dayMedications.filter(med => med.status === 'taken').length;
      
      if (totalMedications > 0) {
        totalDays++;
        if (takenMedications === totalMedications) {
          completedDays++;
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    localStorage.removeItem("tmm_access_token");
    if (!error) window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading patient dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                Hello {patient?.name || "Patient"}
              </h2>
              <p className="text-white/90 text-lg">
                Monitoring medication adherence
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout} className="text-black border-white hover:bg-white/10 transition-colors hover:text-white">
            Logout
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{getStreakCount()}</div>
            <div className="text-white/80">Day Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{getTodayCompletionStatus()}</div>
            <div className="text-white/80">Today's Status</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{getMonthlyCompletionRate()}%</div>
            <div className="text-white/80">Monthly Rate</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
                {isTodaySelected ? "Today's Medication" : `Medication for ${format(selectedDate, "MMMM d, yyyy")}`}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <MedicationTracker
                medications={selectedDateMedications}
                date={selectedDateStr}
                onMarkTaken={handleMarkTaken}
                onMarkNotTaken={handleMarkNotTaken}
                isToday={isTodaySelected}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Medication Calendar</CardTitle>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="w-full"
                modifiersClassNames={{
                  selected: "bg-blue-600 text-white hover:bg-blue-700",
                }}
                components={{
                  DayContent: ({ date }) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const dayMedications = medications.filter(med => med.date === dateStr);
                    const totalMedications = dayMedications.length;
                    const takenMedications = dayMedications.filter(med => med.status === 'taken').length;
                    const isFullyTaken = totalMedications > 0 && takenMedications === totalMedications;
                    const isPartiallyTaken = takenMedications > 0 && takenMedications < totalMedications;
                    const isPast = isBefore(date, startOfDay(today));
                    const isCurrentDay = isToday(date);

                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {isFullyTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {isPartiallyTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">{takenMedications}</span>
                          </div>
                        )}
                        {!isPartiallyTaken && !isFullyTaken && isPast && !isCurrentDay && totalMedications > 0 && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"></div>
                        )}
                      </div>
                    );
                  },
                }}
              />

              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>All medications taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Partially taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Missed medications</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Today</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;