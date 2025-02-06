import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { insertWorkerSchema, type Worker, serviceCategories, availableDays, timeSlots } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function WorkerProfile() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: worker, isLoading } = useQuery<Worker>({
    queryKey: ["/api/workers/profile"],
    queryFn: async () => {
      const res = await fetch("/api/workers/profile");
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch worker profile");
      }
      return res.json();
    },
  });

  const form = useForm({
    resolver: zodResolver(insertWorkerSchema),
    defaultValues: {
      userId: user?.id,
      workingStatus: "employed",
      location: "",
      services: [],
      experience: 0,
      availability: {
        days: [],
        timeSlots: [],
      },
      about: "",
      certifications: [],
    },
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/workers", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/workers/profile"] });
      toast({
        title: "Profile created",
        description: "Your worker profile has been created successfully",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="container mx-auto max-w-4xl">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => setLocation("/")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Worker Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createProfileMutation.mutate(data))}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="workingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Working Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="employed">Employed</SelectItem>
                          <SelectItem value="unemployed">Unemployed</SelectItem>
                          <SelectItem value="student">Student</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your work location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="services"
                  render={() => (
                    <FormItem>
                      <FormLabel>Services Offered</FormLabel>
                      <div className="grid grid-cols-2 gap-4">
                        {serviceCategories.map((service) => (
                          <FormField
                            key={service}
                            control={form.control}
                            name="services"
                            render={({ field }) => (
                              <FormItem className="flex items-center space-x-2">
                                <FormControl>
                                  <Checkbox
                                    checked={field.value?.includes(service)}
                                    onCheckedChange={(checked) => {
                                      const current = field.value || [];
                                      const updated = checked
                                        ? [...current, service]
                                        : current.filter((val) => val !== service);
                                      field.onChange(updated);
                                    }}
                                  />
                                </FormControl>
                                <span>{service}</span>
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <FormLabel>Availability</FormLabel>
                  <FormField
                    control={form.control}
                    name="availability.days"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Available Days</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          {availableDays.map((day) => (
                            <FormItem key={day} className="flex items-center space-x-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(day)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    const updated = checked
                                      ? [...current, day]
                                      : current.filter((val) => val !== day);
                                    field.onChange(updated);
                                  }}
                                />
                              </FormControl>
                              <span>{day}</span>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="availability.timeSlots"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time Slots</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          {timeSlots.map((slot) => (
                            <FormItem
                              key={`${slot.start}-${slot.end}`}
                              className="flex items-center space-x-2"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.some(
                                    (val) =>
                                      val.start === slot.start && val.end === slot.end
                                  )}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    const updated = checked
                                      ? [...current, slot]
                                      : current.filter(
                                          (val) =>
                                            val.start !== slot.start ||
                                            val.end !== slot.end
                                        );
                                    field.onChange(updated);
                                  }}
                                />
                              </FormControl>
                              <span>
                                {slot.start} - {slot.end}
                              </span>
                            </FormItem>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="about"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>About</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Tell us about yourself and your experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createProfileMutation.isPending}
                >
                  {createProfileMutation.isPending && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  Save Profile
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
