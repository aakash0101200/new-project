import { useQuery } from "@tanstack/react-query";
import { Worker, type Booking } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useState } from "react";
import { Loader2, Calendar as CalendarIcon, Star, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import { useLocation } from "wouter";

export default function Services() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string>("");

  const { data: workers, isLoading } = useQuery<Worker[]>({
    queryKey: ["/api/workers"],
  });

  const bookService = async () => {
    if (!selectedWorker || !selectedDate || !selectedTime || !user) return;

    try {
      const [startTime] = selectedTime.split("-");
      const bookingDate = new Date(selectedDate);
      bookingDate.setHours(parseInt(startTime.split(":")[0]));

      const booking: Partial<Booking> = {
        workerId: selectedWorker.id,
        customerId: user.id,
        serviceType: selectedWorker.services[0],
        date: bookingDate,
        status: "pending",
      };

      await apiRequest("POST", "/api/bookings", booking);

      toast({
        title: "Booking successful",
        description: "Your service has been booked successfully",
      });

      setSelectedWorker(null);
      setSelectedDate(undefined);
      setSelectedTime("");
    } catch (error) {
      toast({
        title: "Booking failed",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-6xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workers?.map((worker) => (
            <Card key={worker.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle>{worker.services.join(", ")}</CardTitle>
                <CardDescription>
                  {worker.experience} years of experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>{worker.rating || "New"}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {worker.services.map((service) => (
                      <Badge key={service} variant="secondary">
                        {service}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {worker.about}
                  </p>

                  {user?.userType === "customer" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full"
                          onClick={() => setSelectedWorker(worker)}
                        >
                          Book Service
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Book Service</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Date</label>
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              onSelect={setSelectedDate}
                              className="rounded-md border"
                              disabled={(date) => {
                                const day = format(date, "EEEE");
                                return !worker.availability.days.includes(day);
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-medium">Select Time</label>
                            <Select onValueChange={setSelectedTime}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select time slot" />
                              </SelectTrigger>
                              <SelectContent>
                                {worker.availability.timeSlots.map((slot) => (
                                  <SelectItem
                                    key={`${slot.start}-${slot.end}`}
                                    value={`${slot.start}-${slot.end}`}
                                  >
                                    {slot.start} - {slot.end}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            className="w-full"
                            onClick={bookService}
                            disabled={!selectedDate || !selectedTime}
                          >
                            Confirm Booking
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
