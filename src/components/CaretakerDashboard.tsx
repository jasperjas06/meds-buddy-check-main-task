import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Bell, Calendar as CalendarIcon, Mail, AlertTriangle, Check, Clock, Camera, Plus, Loader2 } from "lucide-react";
import { format, isToday, isBefore, startOfDay, parseISO } from "date-fns";

// Import your actual Supabase client
import supabase from "@/supabaseClient";
import { useParams } from "react-router-dom";

const CaretakerDashboard = () => {
  const {patientId} = useParams()
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingMedication, setAddingMedication] = useState(false);
  const [error, setError] = useState(null);
  
  // Form state for adding medications
  const [newMedication, setNewMedication] = useState({
    name: '',
    time: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    status: 'pending'
  });

  // Fetch patient data
  const fetchPatient = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .eq('id', patientId)
        .single();
      
      if (error) {
        console.error('Error fetching patient:', error);
        setError('Failed to load patient data');
        return;
      }
      setPatient(data);
    } catch (error) {
      console.error('Error fetching patient:', error);
      setError('Failed to load patient data');
    }
  };

  // Fetch medications
  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching medications:', error);
        setError('Failed to load medications');
        return;
      }
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
      setError('Failed to load medications');
    }
  };

  // Add new medication
  const addMedication = async (e) => {
    e.preventDefault();
    if (!newMedication.name || !newMedication.time || !newMedication.date) {
      alert('Please fill in all fields');
      return;
    }

    setAddingMedication(true);
    try {
      const { data, error } = await supabase
        .from('medications')
        .insert([{
          patient_id: patientId,
          name: newMedication.name,
          time: newMedication.time,
          date: newMedication.date,
          status: newMedication.status
        }])
        .select();

      if (error) {
        console.error('Error adding medication:', error);
        alert('Error adding medication');
        return;
      }
      
      setMedications([...data, ...medications]);
      setNewMedication({
        name: '',
        time: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        status: 'pending'
      });
      alert('Medication added successfully!');
    } catch (error) {
      console.error('Error adding medication:', error);
      alert('Error adding medication');
    } finally {
      setAddingMedication(false);
    }
  };

  // Update medication status
  const updateMedicationStatus = async (medicationId, status) => {
    try {
      const { error } = await supabase
        .from('medications')
        .update({ status })
        .eq('id', medicationId);

      if (error) {
        console.error('Error updating medication:', error);
        alert('Error updating medication status');
        return;
      }
      
      setMedications(medications.map(med => 
        med.id === medicationId ? { ...med, status } : med
      ));
    } catch (error) {
      console.error('Error updating medication:', error);
      alert('Error updating medication status');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setError('No patient ID provided');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      await Promise.all([fetchPatient(), fetchMedications()]);
      setLoading(false);
    };
    
    loadData();
  }, [patientId]);

  // Calculate statistics
const adherenceStats = () => {
  if (medications.length === 0) {
    return { adherenceRate: 0, currentStreak: 0, missedDoses: 0, completedMeds: 0 };
  }

  const today = new Date();
  const todayStr = format(today, "yyyy-MM-dd");

  const completedMeds = medications.filter(med => med.status === 'taken').length;
  const totalMeds = medications.length;
  const adherenceRate = Math.round((completedMeds / totalMeds) * 100);

  // Missed doses are past dates that are still 'pending'
  const missedDoses = medications.filter(med => {
    return med.status === 'pending' && new Date(med.date) < new Date(todayStr);
  }).length;

  // Calculate current streak
  const takenDates = new Set(
    medications
      .filter(med => med.status === 'taken')
      .map(med => format(new Date(med.date), 'yyyy-MM-dd'))
  );

  let currentStreak = 0;
  const current = new Date(todayStr);

  while (takenDates.has(format(current, "yyyy-MM-dd"))) {
    currentStreak++;
    current.setDate(current.getDate() - 1);
  }

  return {
    adherenceRate,
    currentStreak,
    missedDoses,
    completedMeds
  };
};


  // Get today's medications
  const getTodaysMedications = () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    return medications.filter(med => med.date === today);
  };

  // Get recent activity
  const getRecentActivity = () => {
    return medications
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10)
      .map(med => ({
        id: med.id,
        date: med.date,
        name: med.name,
        taken: med.status === 'completed',
        time: med.status === 'completed' && med.time ? format(parseISO(`2000-01-01T${med.time}`), 'h:mm a') : null,
        status: med.status
      }));
  };

  // Get medications for selected date
  const getMedicationsForDate = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return medications.filter(med => med.date === dateStr);
  };

  const handleSendReminderEmail = () => {
    if (patient?.email) {
      // Implement your email sending logic here
      alert(`Reminder email sent to ${patient.name} at ${patient.email}`);
    } else {
      alert('No email address found for patient');
    }
  };

  const handleConfigureNotifications = () => {
    setActiveTab("notifications");
  };

  const handleViewCalendar = () => {
    setActiveTab("calendar");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Dashboard</h2>
        <p className="text-muted-foreground">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Patient Not Found</h2>
        <p className="text-muted-foreground">Could not load patient data for ID: {patientId}</p>
      </div>
    );
  }

  const stats = adherenceStats();
  const todaysMeds = getTodaysMedications();
  const recentActivity = getRecentActivity();

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
      {/* Header Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between gap-4 mb-6">
  {/* Left Side: Icon + Text */}
  <div className="flex items-center gap-4">
    <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
      <Users className="w-8 h-8" />
    </div>
    <div>
      <h2 className="text-3xl font-bold">Caretaker Dashboard</h2>
      <p className="text-white/90 text-lg">
        Monitoring {patient.name}'s medication adherence
      </p>
    </div>
  </div>

  {/* Right Side: Logout Button */}
  <Button
    variant="outline"
    onClick={handleLogout}
    className="text-black border-white hover:bg-white/10 transition-colors hover:text-white"
  >
    Logout
  </Button>
</div>

        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats.adherenceRate}%</div>
            <div className="text-white/80">Adherence Rate</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <div className="text-white/80">Current Streak</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats.missedDoses}</div>
            <div className="text-white/80">Missed Total</div>
          </div>
          <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
            <div className="text-2xl font-bold">{stats.completedMeds}</div>
            <div className="text-white/80">Completed Total</div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Today's Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-blue-600" />
                  Today's Medications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
  {todaysMeds.length > 0 ? (
    todaysMeds.map((med) => (
      <div key={med.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
        <div>
          <h4 className="font-medium">{med.name}</h4>
          <p className="text-sm text-muted-foreground">
            {med.time ? format(parseISO(`2000-01-01T${med.time}`), 'h:mm a') : 'No time set'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge
  className={
    med.status === "pending"
      ? "bg-red-500 text-white"
      : med.status === "taken"
      ? "bg-green-500 text-white"
      : "bg-gray-300 text-gray-800"
  }
>
  {med.status === "pending"
    ? "Pending"
    : med.status === "taken"
    ? "Taken"
    : "Missed"}
          </Badge>


          {/* Show button only if status is pending */}
          {med.status === "pending" && (
            <Button
              size="sm"
              onClick={() => updateMedicationStatus(med.id, "taken")}
            >
              Mark as Taken
            </Button>
          )}
        </div>
      </div>
    ))
  ) : (
    <p className="text-muted-foreground">No medications scheduled for today</p>
  )}
</div>

              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleSendReminderEmail}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Send Reminder Email
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleConfigureNotifications}
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Configure Notifications
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={handleViewCalendar}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  View Full Calendar
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Adherence Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Adherence Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{stats.adherenceRate}%</span>
                </div>
                <Progress value={stats.adherenceRate} className="h-3" />
                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-medium text-green-600">{stats.completedMeds}</div>
                    <div className="text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-600">{stats.missedDoses}</div>
                    <div className="text-muted-foreground">Missed</div>
                  </div>
                  <div>
                    <div className="font-medium text-blue-600">{medications.filter(m => m.status === 'pending').length}</div>
                    <div className="text-muted-foreground">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Medication Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          activity.taken ? 'bg-green-100' : 
                          activity.status === 'pending' ? 'bg-red-100' : 'bg-yellow-100'
                        }`}>
                          {activity.taken ? (
                            <Check className="w-5 h-5 text-green-600" />
                          ) : activity.status === 'pending' ? (
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                          ) : (
                            <Clock className="w-5 h-5 text-yellow-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{activity.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(activity.date), 'EEEE, MMMM d')} - 
                            {activity.taken ? ` Taken at ${activity.time}` : 
                             activity.status === 'pending' ? ' Medication missed | Pending' : ' Taken'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={activity.taken ? "secondary" : 
                                      activity.status === 'pending' ? "destructive" : "outline"}>
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </Badge>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No medication activity recorded</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          {/* Add Medication Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Add New Medication
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="med-name">Medication Name</Label>
                  <Input
                    id="med-name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({...newMedication, name: e.target.value})}
                    placeholder="e.g., Morning Vitamins"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="med-time">Time</Label>
                  <Input
                    id="med-time"
                    type="time"
                    value={newMedication.time}
                    onChange={(e) => setNewMedication({...newMedication, time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="med-date">Date</Label>
                  <Input
                    id="med-date"
                    type="date"
                    value={newMedication.date}
                    onChange={(e) => setNewMedication({...newMedication, date: e.target.value})}
                    required
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={addMedication} 
                    disabled={addingMedication} 
                    className="w-full"
                  >
                    {addingMedication ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Add Medication
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Calendar View */}
          <Card>
            <CardHeader>
              <CardTitle>Medication Calendar Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid lg:grid-cols-2 gap-6">
                <div>
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
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const dayMeds = medications.filter(med => med.date === dateStr);
                        const hasCompleted = dayMeds.some(med => med.status === 'completed');
                        const hasMissed = dayMeds.some(med => med.status === 'missed');
                        const hasPending = dayMeds.some(med => med.status === 'pending');
                        const isCurrentDay = isToday(date);
                        
                        return (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <span>{date.getDate()}</span>
                            {hasCompleted && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {hasMissed && !hasCompleted && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full"></div>
                            )}
                            {hasPending && isCurrentDay && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full"></div>
                            )}
                          </div>
                        );
                      }
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
                      <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                      <span>Pending today</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span>Selected date</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-4">
                    Medications for {format(selectedDate, 'MMMM d, yyyy')}
                  </h4>
                  
                  <div className="space-y-4">
                    {getMedicationsForDate(selectedDate).map((med) => (
                      <div key={med.id} className={`p-4 rounded-lg border ${
                        med.status === 'completed' ? 'bg-green-50 border-green-200' :
                        med.status === 'missed' ? 'bg-red-50 border-red-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {med.status === 'completed' ? (
                              <Check className="w-5 h-5 text-green-600" />
                            ) : med.status === 'missed' ? (
                              <AlertTriangle className="w-5 h-5 text-red-600" />
                            ) : (
                              <Clock className="w-5 h-5 text-yellow-600" />
                            )}
                            <span className="font-medium">{med.name}</span>
                          </div>
                          <Badge variant={
                            med.status === 'completed' ? 'secondary' :
                            med.status === 'missed' ? 'destructive' : 'outline'
                          }>
                            {med.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Scheduled for {med.time ? format(parseISO(`2000-01-01T${med.time}`), 'h:mm a') : 'No time set'}
                        </p>
                        {med.status === 'pending' && isToday(selectedDate) && (
                          <div className="mt-3 flex gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => updateMedicationStatus(med.id, 'completed')}
                            >
                              Mark Complete
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateMedicationStatus(med.id, 'missed')}
                            >
                              Mark Missed
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {getMedicationsForDate(selectedDate).length === 0 && (
                      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="flex items-center gap-2 mb-2">
                          <CalendarIcon className="w-5 h-5 text-gray-600" />
                          <span className="font-medium text-gray-800">No Medications</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          No medications scheduled for this date.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Email Notifications</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receive email alerts when {patient.name} misses medications or needs reminders.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline">Configure Email Settings</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">SMS Notifications</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get instant text alerts for medication events.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline">Setup SMS Alerts</Button>
                  </div>
                </div>
                
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Push Notifications</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Receive browser notifications for medication reminders.
                  </p>
                  <div className="flex items-center gap-4">
                    <Button variant="outline">Enable Push Notifications</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CaretakerDashboard;