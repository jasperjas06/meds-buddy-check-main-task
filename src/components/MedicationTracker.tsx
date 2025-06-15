// MedicationTracker.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Image, Camera, Clock, Pill } from "lucide-react";
import { format } from "date-fns";

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

interface MedicationTrackerProps {
  medications: PatientMedication[];
  date: string;
  onMarkTaken: (medicationId: string, date: string, imageFile?: File) => void;
  onMarkNotTaken: (medicationId: string, date: string) => void;
  isToday: boolean;
  isSubmitting?: boolean;
}

const MedicationTracker = ({
  medications,
  date,
  onMarkTaken,
  onMarkNotTaken,
  isToday,
  isSubmitting,
}: MedicationTrackerProps) => {
  const [selectedImages, setSelectedImages] = useState<{ [key: string]: File }>({});
  const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>, medicationId: string) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImages(prev => ({ ...prev, [medicationId]: file }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({ 
          ...prev, 
          [medicationId]: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMarkTaken = (medicationId: string) => {
    const imageFile = selectedImages[medicationId];
    onMarkTaken(medicationId, date, imageFile);
    
    // Clear the image after marking as taken
    if (imageFile) {
      setSelectedImages(prev => {
        const newState = { ...prev };
        delete newState[medicationId];
        return newState;
      });
      setImagePreviews(prev => {
        const newState = { ...prev };
        delete newState[medicationId];
        return newState;
      });
    }
  };

  const handleMarkNotTaken = (medicationId: string) => {
    onMarkNotTaken(medicationId, date);
  };

  const completedMedications = medications.filter(med => med.isTaken);
  const pendingMedications = medications.filter(med => !med.isTaken);
  const allCompleted = medications.length > 0 && completedMedications.length === medications.length;

  if (medications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Pill className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No medications scheduled for this date.</p>
      </div>
    );
  }

  // Show completed state if all medications are taken
  if (allCompleted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-center p-8 bg-green-50 rounded-xl border-2 border-green-200">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">
              All Medications Completed!
            </h3>
            <p className="text-green-600">
              Great job! You've taken all your medications for {format(new Date(date), 'MMMM d, yyyy')}.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {completedMedications.map((medication) => (
            <Card key={medication.id} className="border-green-200 bg-green-50/50">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h4 className="font-medium text-green-800">{medication.name}</h4>
                    <p className="text-sm text-green-600">Scheduled for {medication.time}</p>
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    <Clock className="w-3 h-3 mr-1" />
                    {medication.time}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show pending state with individual medication tracking
  return (
    <div className="space-y-6">
      {/* Completed Medications */}
      {completedMedications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center gap-2">
            <Check className="w-5 h-5" />
            Completed ({completedMedications.length})
          </h3>
          <div className="space-y-3">
            {completedMedications.map((medication) => (
              <Card key={medication.id} className="border-green-200 bg-green-50/50">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-green-800">{medication.name}</h4>
                      <p className="text-sm text-green-600">Scheduled for {medication.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      <Clock className="w-3 h-3 mr-1" />
                      {medication.time}
                    </Badge>
                    {isToday && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMarkNotTaken(medication.id)}
                        disabled={isSubmitting}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Undo
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Pending Medications */}
      {pendingMedications.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Pending ({pendingMedications.length})
          </h3>
          <div className="space-y-6">
            {pendingMedications.map((medication) => (
              <div key={medication.id} className="space-y-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Pill className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{medication.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Scheduled for {medication.time}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">
                      <Clock className="w-3 h-3 mr-1" />
                      {medication.time}
                    </Badge>
                  </CardContent>
                </Card>

                {/* Image Upload Section for this medication */}
                <Card className="border-dashed border-2 border-border/50">
                  <CardContent className="p-4">
                    <div className="text-center">
                      <Image className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <h4 className="font-medium mb-1 text-sm">Add Proof Photo (Optional)</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Take a photo of this medication as confirmation
                      </p>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageSelect(e, medication.id)}
                        ref={(el) => fileInputRefs.current[medication.id] = el}
                        className="hidden"
                      />

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRefs.current[medication.id]?.click()}
                        className="mb-3"
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        {selectedImages[medication.id] ? "Change Photo" : "Take Photo"}
                      </Button>

                      {imagePreviews[medication.id] && (
                        <div className="mt-3">
                          <img
                            src={imagePreviews[medication.id]}
                            alt="Medication proof"
                            className="max-w-full h-24 object-cover rounded-lg mx-auto border-2 border-border"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Photo selected: {selectedImages[medication.id]?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons for this medication */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleMarkTaken(medication.id)}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    disabled={!isToday || isSubmitting}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {isToday ? (isSubmitting ? "Marking..." : "Mark as Taken") : "Cannot mark future dates"}
                  </Button>
                  
                  {isToday && (
                    <Button
                      variant="outline"
                      onClick={() => handleMarkNotTaken(medication.id)}
                      disabled={isSubmitting}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Skip
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isToday && (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground">
            You can only update today's medication status
          </p>
        </div>
      )}
    </div>
  );
};

export default MedicationTracker;