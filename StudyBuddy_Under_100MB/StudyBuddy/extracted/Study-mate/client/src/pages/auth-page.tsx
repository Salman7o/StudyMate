import { useState, useEffect } from "react";
import { useAuth, registerSchema, loginSchema } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (data: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(data);
  };

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "student",
      university: "",
      program: "",
      semester: "",
    },
  });

  const onRegisterSubmit = (data: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(data);
  };

  // Dynamic tutor fields based on role selection
  const watchRole = registerForm.watch("role");

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <div className="md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as "login" | "register")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Welcome Back</CardTitle>
                  <CardDescription>
                    Login to continue your learning journey
                  </CardDescription>
                </CardHeader>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        type="text" 
                        {...loginForm.register("username")} 
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        {...loginForm.register("password")} 
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-sm text-red-500">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                    {loginMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {loginMutation.error.message || "Invalid username or password"}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                      {loginMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Logging in...
                        </>
                      ) : (
                        "Login"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Create an Account</CardTitle>
                  <CardDescription>
                    Join StudyMate and connect with tutors or students
                  </CardDescription>
                </CardHeader>
                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="register-username">Username</Label>
                      <Input 
                        id="register-username" 
                        type="text" 
                        {...registerForm.register("username")} 
                      />
                      {registerForm.formState.errors.username && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        type="text" 
                        {...registerForm.register("name")} 
                      />
                      {registerForm.formState.errors.name && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        {...registerForm.register("email")} 
                      />
                      {registerForm.formState.errors.email && (
                        <p className="text-sm text-red-500">{registerForm.formState.errors.email.message}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input 
                          id="register-password" 
                          type="password" 
                          {...registerForm.register("password")} 
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.password.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input 
                          id="confirmPassword" 
                          type="password" 
                          {...registerForm.register("confirmPassword")} 
                        />
                        {registerForm.formState.errors.confirmPassword && (
                          <p className="text-sm text-red-500">{registerForm.formState.errors.confirmPassword.message}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role">I am a</Label>
                      <Select 
                        onValueChange={(value) => registerForm.setValue("role", value)} 
                        defaultValue="student"
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="tutor">Tutor</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="university">University</Label>
                      <Input 
                        id="university" 
                        type="text" 
                        {...registerForm.register("university")} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="program">Program/Major</Label>
                        <Input 
                          id="program" 
                          type="text" 
                          {...registerForm.register("program")} 
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Input 
                          id="semester" 
                          type="text" 
                          {...registerForm.register("semester")} 
                        />
                      </div>
                    </div>
                    
                    {watchRole === "tutor" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="specialization">Specialization</Label>
                          <Input 
                            id="specialization" 
                            type="text" 
                            {...registerForm.register("tutorProfile.specialization")} 
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                          <Input 
                            id="hourlyRate" 
                            type="number" 
                            min="1"
                            {...registerForm.register("tutorProfile.hourlyRate", { 
                              valueAsNumber: true 
                            })} 
                          />
                        </div>
                        <div className="space-y-3">
                          <Label>Availability</Label>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="weekdays" 
                              {...registerForm.register("tutorProfile.availableWeekdays")} 
                              defaultChecked
                            />
                            <Label htmlFor="weekdays" className="font-normal">Available on weekdays</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id="weekends" 
                              {...registerForm.register("tutorProfile.availableWeekends")} 
                              defaultChecked
                            />
                            <Label htmlFor="weekends" className="font-normal">Available on weekends</Label>
                          </div>
                        </div>
                      </>
                    )}

                    {registerMutation.error && (
                      <Alert variant="destructive">
                        <AlertDescription>
                          {registerMutation.error.message || "Registration failed. Please try again."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                      {registerMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      <div className="md:w-1/2 bg-primary text-white p-8 flex items-center justify-center">
        <div className="max-w-md">
          <div className="mb-8 flex items-center justify-center">
            <svg className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4 text-center">StudyMate</h2>
          <h3 className="text-xl font-semibold mb-4 text-center">Connect, Learn, Succeed</h3>
          <p className="text-lg mb-6 text-center opacity-90">
            Find the perfect tutor to help you excel in your academic journey. Or become a tutor and share your knowledge with others.
          </p>
          <div className="space-y-3 opacity-80">
            <div className="flex items-center">
              <div className="mr-3 bg-white bg-opacity-20 p-2 rounded-full">
                <i className="fas fa-user-graduate text-white"></i>
              </div>
              <p>Connect with qualified tutors from your university</p>
            </div>
            <div className="flex items-center">
              <div className="mr-3 bg-white bg-opacity-20 p-2 rounded-full">
                <i className="fas fa-calendar-alt text-white"></i>
              </div>
              <p>Schedule sessions at times that work for you</p>
            </div>
            <div className="flex items-center">
              <div className="mr-3 bg-white bg-opacity-20 p-2 rounded-full">
                <i className="fas fa-comment-alt text-white"></i>
              </div>
              <p>Communicate directly within the platform</p>
            </div>
            <div className="flex items-center">
              <div className="mr-3 bg-white bg-opacity-20 p-2 rounded-full">
                <i className="fas fa-star text-white"></i>
              </div>
              <p>Rate and review your tutors after sessions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
