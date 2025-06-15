"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Check, Calendar as CalendarIcon, User } from "lucide-react";
import MedicationTracker from "./MedicationTracker";
import { format, isToday, isBefore, startOfDay } from "date-fns";
import supabase from "@/supabaseClient";

const PatientDashboard = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [takenDates, setTakenDates] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);

  const today = new Date();
  const todayStr = format(today, 'yyyy-MM-dd');
  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const isTodaySelected = isToday(selectedDate);
  const isSelectedDateTaken = takenDates.has(selectedDateStr);

  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    fetchUser();
  }, []);

  // Fetch medication dates
  useEffect(() => {
    if (!userId) return;
    const fetchTakenDates = async () => {
      const { data, error } = await supabase
        .from("medications")
        .select("date")
        .eq("user_id", userId);

      if (data) {
        const dates = new Set(data.map((item) => item.date));
        setTakenDates(dates);
      }
    };

    fetchTakenDates();
  }, [userId]);

const handleMarkTaken = async (date: string, imageFile?: File) => {
  if (!userId) return;
  setIsSubmitting(true); // Start loading

  let imageUrl = null;

  try {
    if (imageFile) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `medication-images/${fileName}`;

      const { data: storageData, error: storageError } = await supabase.storage
        .from('medications')
        .upload(filePath, imageFile);

      if (storageError) {
        console.error("Image upload error:", storageError.message);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('medications')
        .getPublicUrl(filePath);

      imageUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from("medications")
      .insert([{ user_id: userId, date, image_url: imageUrl }]);

    if (!error) {
      setTakenDates((prev) => new Set(prev).add(date));
      console.log("Medication marked as taken for:", date);
    } else {
      if (error.code === "23505") {
        console.warn("Already marked as taken.");
      } else {
        console.error("Error marking medication:", error);
      }
    }
  } finally {
    setIsSubmitting(false); // Stop loading
  }
};

  const getStreakCount = () => {
    let streak = 0;
    const currentDate = new Date(today);

    while (takenDates.has(format(currentDate, "yyyy-MM-dd")) && streak < 30) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    }

    return streak;
  };
  const handleLogout = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Logout failed:", error.message);
  } else {
    window.location.href = "/"; // or use your app's login route
  }
};


  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl p-8 text-white">
        <div className="flex justify-between items-center">
  <div className="flex items-center gap-4 mb-4">
    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
      <User className="w-8 h-8" />
    </div>
    <div>
      <h2 className="text-3xl font-bold">
        Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}!
      </h2>
      <p className="text-white/90 text-lg">Ready to stay on track with your medication?</p>
    </div>
  </div>

  {/* Logout Button */}
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
            <div className="text-2xl font-bold">{takenDates.has(todayStr) ? "✓" : "○"}</div>
            <div className="text-white/80">Today's Status</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{Math.round((takenDates.size / 30) * 100)}%</div>
            <div className="text-white/80">Monthly Rate</div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's Medication */}
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
                date={selectedDateStr}
                isTaken={isSelectedDateTaken}
                onMarkTaken={handleMarkTaken}
                isToday={isTodaySelected}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>

        {/* Calendar */}
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
                    const isTaken = takenDates.has(dateStr);
                    const isPast = isBefore(date, startOfDay(today));
                    const isCurrentDay = isToday(date);

                    return (
                      <div className="relative w-full h-full flex items-center justify-center">
                        <span>{date.getDate()}</span>
                        {isTaken && (
                          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                            <Check className="w-2 h-2 text-white" />
                          </div>
                        )}
                        {!isTaken && isPast && !isCurrentDay && (
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
                  <span>Medication taken</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <span>Missed medication</span>
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
