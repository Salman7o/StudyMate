import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "../App";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { User, TutorProfile } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Calendar, DollarSign, Clock, GraduationCap, Award, User as UserIcon } from "lucide-react";
import { Redirect } from "wouter";

// Define form schemas
const userProfileSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters" }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters" }),
  email: z.string().email({ message: "Invalid email address" }),
  bio: z.string().optional(),
  program: z.string().optional(),
  semester: z.string().optional(),
});

const tutorProfileSchema = z.object({
  hourlyRate: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Hourly rate must be a positive number",
  }),
  subjects: z.string(),
  expertise: z.string(),
  education: z.string(),
  availableDays: z.string(),
  availableTimeStart: z.string(),
  availableTimeEnd: z.string(),
});

export default function MyProfile() {
  const { user, setUser } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState("profile");
  const [isTutor, setIsTutor] = useState(false);

  // Fetch user profile if authenticated
  const { data: userData, isLoading: isUserLoading } = useQuery<User>({
    queryKey: user ? [`/api/users/${user.id}`] : null,
    enabled: !!user,
  });

  // Fetch tutor profile if user is a tutor
  const { data: tutorProfile, isLoading: isTutorProfileLoading } = useQuery<TutorProfile>({
    queryKey: (user && user.userType === "tutor") ? [`/api/tutors/profile/${user.id}`] : null,
    enabled: !!user && user.userType === "tutor",
  });

  // Set up forms
  const userForm = useForm<z.infer<typeof userProfileSchema>>({
    resolver: zodResolver(userProfileSchema),
    defaultValues: {
      firstName: userData?.firstName || "",
      lastName: userData?.lastName || "",
      email: userData?.email || "",
      bio: userData?.bio || "",
      program: userData?.program || "",
      semester: userData?.semester || "",
    },
  });

  const tutorForm = useForm<z.infer<typeof tutorProfileSchema>>({
    resolver: zodResolver(tutorProfileSchema),
    defaultValues: {
      hourlyRate: tutorProfile?.hourlyRate.toString() || "",
      subjects: tutorProfile?.subjects.join(", ") || "",
      expertise: tutorProfile?.expertise.join(", ") || "",
      education: tutorProfile?.education || "",
      availableDays: tutorProfile?.availableDays.join(", ") || "",
      availableTimeStart: tutorProfile?.availableTimeStart || "",
      availableTimeEnd: tutorProfile?.availableTimeEnd || "",
    },
  });

  // Update forms when data is loaded
  useEffect(() => {
    if (userData) {
      userForm.reset({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        bio: userData.bio || "",
        program: userData.program || "",
        semester: userData.semester || "",
      });
      setIsTutor(userData.userType === "tutor");
    }
  }, [userData, userForm]);

  useEffect(() => {
    if (tutorProfile) {
      tutorForm.reset({
        hourlyRate: tutorProfile.hourlyRate.toString() || "",
        subjects: tutorProfile.subjects.join(", ") || "",
        expertise: tutorProfile.expertise.join(", ") || "",
        education: tutorProfile.education || "",
        availableDays: tutorProfile.availableDays.join(", ") || "",
        availableTimeStart: tutorProfile.availableTimeStart || "",
        availableTimeEnd: tutorProfile.availableTimeEnd || "",
      });
    }
  }, [tutorProfile, tutorForm]);

  // Mutations for updating profiles
  const updateUserMutation = useMutation({
    mutationFn: async (userData: Partial<User>) => {
      if (!user) throw new Error("Not authenticated");
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      return response.json();
    },
    onSuccess: (updatedUser) => {
      if (setUser && user) {
        setUser({ ...updatedUser, isAuthenticated: true });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const updateTutorProfileMutation = useMutation({
    mutationFn: async (profileData: any) => {
      if (!user) throw new Error("Not authenticated");
      if (!tutorProfile) {
        // Create new tutor profile
        const newProfile = {
          userId: user.id,
          ...profileData,
        };
        const response = await apiRequest("POST", `/api/tutors/profile`, newProfile);
        return response.json();
      } else {
        // Update existing profile
        const response = await apiRequest("PATCH", `/api/tutors/profile/${tutorProfile.id}`, profileData);
        return response.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/tutors/profile/${user?.id}`] });
      toast({
        title: "Tutor profile updated",
        description: "Your tutor profile has been updated successfully.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update tutor profile. Please try again.",
        variant: "destructive",
      });
    }
  });

  const becomeTutorMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, { userType: "tutor" });
      return response.json();
    },
    onSuccess: (updatedUser) => {
      if (setUser && user) {
        setUser({ ...updatedUser, isAuthenticated: true });
      }
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      setIsTutor(true);
      toast({
        title: "Success",
        description: "You are now registered as a tutor. Please complete your tutor profile.",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to register as a tutor. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Form submission handlers
  const onUserSubmit = (data: z.infer<typeof userProfileSchema>) => {
    updateUserMutation.mutate(data);
  };

  const onTutorSubmit = (data: z.infer<typeof tutorProfileSchema>) => {
    const formattedData = {
      hourlyRate: parseFloat(data.hourlyRate),
      subjects: data.subjects.split(",").map(s => s.trim()),
      expertise: data.expertise.split(",").map(e => e.trim()),
      education: data.education,
      availableDays: data.availableDays.split(",").map(d => d.trim()),
      availableTimeStart: data.availableTimeStart,
      availableTimeEnd: data.availableTimeEnd,
    };
    
    updateTutorProfileMutation.mutate(formattedData);
  };

  const handleBecomeTutor = () => {
    becomeTutorMutation.mutate();
  };

  // If not authenticated, redirect to login
  if (!user) {
    return <Redirect to="/login" />;
  }

  // Loading state
  if (isUserLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="flex justify-center">
          <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userData?.profileImage || ""} alt={userData?.username} />
                <AvatarFallback className="text-lg">{userData?.firstName?.[0]}{userData?.lastName?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl">{userData?.firstName} {userData?.lastName}</CardTitle>
                <CardDescription>{userData?.email}</CardDescription>
                {userData?.userType === "tutor" ? (
                  <Badge className="mt-1 bg-primary">Tutor</Badge>
                ) : (
                  <Badge className="mt-1 bg-muted text-muted-foreground">Student</Badge>
                )}
              </div>
            </div>
            {userData?.userType !== "tutor" && (
              <Button 
                variant="outline" 
                onClick={handleBecomeTutor}
                disabled={becomeTutorMutation.isPending}
              >
                {becomeTutorMutation.isPending ? "Processing..." : "Become a Tutor"}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={tab} onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <UserIcon className="h-4 w-4" /> Profile
              </TabsTrigger>
              <TabsTrigger 
                value="tutor-details" 
                disabled={!isTutor}
                className="flex items-center gap-2"
              >
                <GraduationCap className="h-4 w-4" /> Tutor Details
              </TabsTrigger>
            </TabsList>
            
            {/* User Profile Tab */}
            <TabsContent value="profile" className="mt-4">
              <Form {...userForm}>
                <form onSubmit={userForm.handleSubmit(onUserSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={userForm.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={userForm.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={userForm.control}
                      name="program"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Program/Degree</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>e.g., Computer Science, Engineering</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={userForm.control}
                      name="semester"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Semester</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>e.g., 3rd Semester, 2nd Year</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={userForm.control}
                    name="bio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bio</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Tell us a bit about yourself"
                            className="min-h-[120px]"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end">
                    <Button 
                      type="submit" 
                      disabled={updateUserMutation.isPending}
                    >
                      {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </Form>
            </TabsContent>
            
            {/* Tutor Profile Tab */}
            <TabsContent value="tutor-details" className="mt-4">
              {isTutor ? (
                <Form {...tutorForm}>
                  <form onSubmit={tutorForm.handleSubmit(onTutorSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={tutorForm.control}
                        name="hourlyRate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" /> Hourly Rate (₹)
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="number" min="0" step="100" />
                            </FormControl>
                            <FormDescription>Your hourly tutoring rate in Rupees</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={tutorForm.control}
                        name="education"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Award className="h-4 w-4 mr-1" /> Education
                            </FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Bachelor's in Computer Science (Current)" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={tutorForm.control}
                      name="subjects"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subjects</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Java, Python, Data Structures, Algorithms" />
                          </FormControl>
                          <FormDescription>Comma-separated list of subjects you can teach</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={tutorForm.control}
                      name="expertise"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Areas of Expertise</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Programming Fundamentals, Data Structures, Algorithms, Web Development" />
                          </FormControl>
                          <FormDescription>Comma-separated list of your areas of expertise</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={tutorForm.control}
                      name="availableDays"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" /> Available Days
                          </FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Monday, Tuesday, Thursday, Friday" />
                          </FormControl>
                          <FormDescription>Comma-separated list of days you're available</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={tutorForm.control}
                        name="availableTimeStart"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" /> Available From
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={tutorForm.control}
                        name="availableTimeEnd"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" /> Available Until
                            </FormLabel>
                            <FormControl>
                              <Input {...field} type="time" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        disabled={updateTutorProfileMutation.isPending}
                      >
                        {updateTutorProfileMutation.isPending ? "Saving..." : "Save Tutor Profile"}
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <GraduationCap className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">Become a Tutor</h3>
                  <p className="text-muted-foreground text-center max-w-md mt-2 mb-6">
                    Share your knowledge and earn by helping other students. Switch your account to tutor mode.
                  </p>
                  <Button onClick={handleBecomeTutor}>Become a Tutor</Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
