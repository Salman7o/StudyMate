import { useState } from "react";
import { format, addDays, startOfWeek, isToday, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailabilitySlot } from "@shared/schema";

interface BookingCalendarProps {
  availabilitySlots: AvailabilitySlot[];
  onSelectTimeSlot: (date: Date, startTime: string, endTime: string) => void;
}

interface TimeSlot {
  startTime: string;
  endTime: string;
}

const BookingCalendar = ({ availabilitySlots, onSelectTimeSlot }: BookingCalendarProps) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  
  // Get day of week name from date
  const getDayOfWeek = (date: Date): string => {
    return format(date, "EEEE");
  };
  
  // Filter availability slots for the selected day
  const getAvailabilityForDay = (day: string): AvailabilitySlot[] => {
    return availabilitySlots.filter(slot => slot.day.toLowerCase() === day.toLowerCase());
  };
  
  // Generate time slots for the selected day
  const getTimeSlots = (): TimeSlot[] => {
    const day = getDayOfWeek(selectedDate);
    const availableSlots = getAvailabilityForDay(day);
    
    // Convert availability slots to time slots
    return availableSlots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime
    }));
  };
  
  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    onSelectTimeSlot(selectedDate, timeSlot.startTime, timeSlot.endTime);
  };
  
  // Generate the next 7 days for the day picker tabs
  const generateDays = () => {
    const today = new Date();
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const date = addDays(today, i);
      days.push(date);
    }
    
    return days;
  };
  
  const days = generateDays();
  const timeSlots = getTimeSlots();
  
  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        <Card className="flex-1">
          <CardContent className="p-4">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              disabled={(date) => date < new Date()}
              className="rounded-md border"
            />
          </CardContent>
        </Card>
        
        <Card className="flex-1">
          <CardContent className="p-4">
            <h3 className="text-lg font-bold mb-4">Available Time Slots</h3>
            
            <Tabs defaultValue={format(days[0], "yyyy-MM-dd")}>
              <TabsList className="grid grid-cols-7 mb-4">
                {days.map((day) => (
                  <TabsTrigger
                    key={format(day, "yyyy-MM-dd")}
                    value={format(day, "yyyy-MM-dd")}
                    onClick={() => setSelectedDate(day)}
                    className="flex flex-col items-center"
                  >
                    <span className="text-xs">{format(day, "EEE")}</span>
                    <span className={`text-sm ${isToday(day) ? "font-bold" : ""}`}>
                      {format(day, "d")}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {days.map((day) => (
                <TabsContent key={format(day, "yyyy-MM-dd")} value={format(day, "yyyy-MM-dd")}>
                  {timeSlots.length === 0 ? (
                    <p className="text-center text-gray-500">No availability on this day</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {timeSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant={selectedTimeSlot && selectedTimeSlot.startTime === slot.startTime && isSameDay(selectedDate, day) ? "default" : "outline"}
                          onClick={() => handleTimeSlotSelect(slot)}
                          className="text-sm"
                        >
                          {slot.startTime} - {slot.endTime}
                        </Button>
                      ))}
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BookingCalendar;
