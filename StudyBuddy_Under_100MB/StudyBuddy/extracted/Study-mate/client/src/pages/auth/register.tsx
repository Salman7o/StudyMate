import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function Register() {
  const { register, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);
  // Get tab from URL query parameter if it exists
  const searchParams = new URLSearchParams(window.location.search);
  const tabParam = searchParams.get('tab');
  const initialRole = tabParam === 'tutor' ? 'tutor' : 'student';
  const [role, setRole] = useState<"student" | "tutor">(initialRole);
  
  // Common form fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState("University");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  
  // Tutor specific fields
  const [subjects, setSubjects] = useState<string[]>([]);
  const [hourlyRate, setHourlyRate] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("");
  const [subjectInput, setSubjectInput] = useState("");

  const addSubject = () => {
    if (subjectInput.trim() !== "" && !subjects.includes(subjectInput.trim())) {
      setSubjects([...subjects, subjectInput.trim()]);
      setSubjectInput("");
    }
  };

  const removeSubject = (subject: string) => {
    setSubjects(subjects.filter(s => s !== subject));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (role === "tutor" && subjects.length === 0) {
      setError("Please add at least one subject");
      return;
    }

    try {
      // Create a base userData object
      const userData: any = {
        username,
        password,
        email,
        fullName,
        role,
        program,
        semester,
        university,
        availability, // Include availability for both students and tutors
        subjects, // Include subjects for both students and tutors
      };

      // Add tutor profile data if role is tutor
      if (role === "tutor") {
        userData.tutorProfile = {
          subjects,
          hourlyRate: parseInt(hourlyRate),
          experience,
          availability,
          isAvailableNow: false,
          rating: 0,
          reviewCount: 0
        };
      }

      await register(userData);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center py-8">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Join StudyMate and start your learning journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue={initialRole} onValueChange={(value) => setRole(value as "student" | "tutor")}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="tutor">Tutor</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a username"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Input
                    id="university"
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="program">Program</Label>
                  <Select onValueChange={setProgram}>
                    <SelectTrigger id="program">
                      <SelectValue placeholder="Select program" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                      <SelectItem value="Artificial Intelligence">Artificial Intelligence</SelectItem>
                      <SelectItem value="Data Science">Data Science</SelectItem>
                      <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                      <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                      <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                      <SelectItem value="Business Administration">Business Administration</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                      <SelectItem value="Economics">Economics</SelectItem>
                      <SelectItem value="Accounting">Accounting</SelectItem>
                      <SelectItem value="Media Sciences">Media Sciences</SelectItem>
                      <SelectItem value="Social Sciences">Social Sciences</SelectItem>
                      <SelectItem value="Law">Law</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semester">Semester</Label>
                  <Select onValueChange={setSemester}>
                    <SelectTrigger id="semester">
                      <SelectValue placeholder="Select semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1st Semester</SelectItem>
                      <SelectItem value="2">2nd Semester</SelectItem>
                      <SelectItem value="3">3rd Semester</SelectItem>
                      <SelectItem value="4">4th Semester</SelectItem>
                      <SelectItem value="5">5th Semester</SelectItem>
                      <SelectItem value="6">6th Semester</SelectItem>
                      <SelectItem value="7">7th Semester</SelectItem>
                      <SelectItem value="8">8th Semester</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <TabsContent value="student" className="border rounded-md p-4 mt-4">
                <h3 className="font-medium mb-4">Student Preferences</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="student-subjects">Subjects You Need Help With</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {subjects.map((subject, index) => (
                        <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center">
                          <span className="text-primary text-sm">{subject}</span>
                          <button
                            type="button"
                            className="ml-2 text-primary/70 hover:text-primary"
                            onClick={() => removeSubject(subject)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <Select
                        onValueChange={(value) => setSubjectInput(value)}
                        value={subjectInput}
                      >
                        <SelectTrigger className="w-full rounded-r-none">
                          <SelectValue placeholder="Select a subject you need help with" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calculas">Calculas</SelectItem>
                          <SelectItem value="linear algebra">Linear Algebra</SelectItem>
                          <SelectItem value="data structures">Data Structures</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="database systems">Database Systems</SelectItem>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="web development">Web Development</SelectItem>
                          <SelectItem value="mechanics">Mechanics</SelectItem>
                          <SelectItem value="electromagnetism">Electromagnetism</SelectItem>
                          <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
                          <SelectItem value="organic chemistry">Organic Chemistry</SelectItem>
                          <SelectItem value="biochemistry">Biochemistry</SelectItem>
                          <SelectItem value="statistics">Statistics</SelectItem>
                          <SelectItem value="accounting">Accounting</SelectItem>
                          <SelectItem value="economics">Economics</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        onClick={addSubject}
                        className="rounded-l-none"
                      >
                        Add
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Add subjects you need help with to find matching tutors
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="student-availability">Availability for Tutoring</Label>
                    <Input
                      id="student-availability"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      placeholder="e.g. Mon-Fri, 2PM-8PM; Weekends, 10AM-6PM"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter times when you're available for tutoring sessions
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-hourly-rate">Hourly Rate (Rs.)</Label>
                    <Input
                      id="student-hourly-rate"
                      type="number"
                      value={hourlyRate}
                      onChange={(e) => setHourlyRate(e.target.value)}
                      placeholder="e.g. 1000"
                      min="0"
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Enter your preferred hourly rate for tutoring sessions
                    </p>
                  </div>
                </div>
              </TabsContent>
              

              
              <TabsContent value="tutor" className="border rounded-md p-4 mt-4">
                <h3 className="font-medium mb-4">Tutor Information</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subjects">Subjects</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {subjects.map((subject, index) => (
                        <div key={index} className="bg-primary/10 px-3 py-1 rounded-full flex items-center">
                          <span className="text-primary text-sm">{subject}</span>
                          <button
                            type="button"
                            className="ml-2 text-primary/70 hover:text-primary"
                            onClick={() => removeSubject(subject)}
                          >
                            <i className="fas fa-times"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex">
                      <Select
                        onValueChange={(value) => setSubjectInput(value)}
                        value={subjectInput}
                      >
                        <SelectTrigger className="w-full rounded-r-none">
                          <SelectValue placeholder="Select a subject you can teach" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="calculas">Calculas</SelectItem>
                          <SelectItem value="linear algebra">Linear Algebra</SelectItem>
                          <SelectItem value="data structures">Data Structures</SelectItem>
                          <SelectItem value="algorithms">Algorithms</SelectItem>
                          <SelectItem value="database systems">Database Systems</SelectItem>
                          <SelectItem value="programming">Programming</SelectItem>
                          <SelectItem value="web development">Web Development</SelectItem>
                          <SelectItem value="mechanics">Mechanics</SelectItem>
                          <SelectItem value="electromagnetism">Electromagnetism</SelectItem>
                          <SelectItem value="thermodynamics">Thermodynamics</SelectItem>
                          <SelectItem value="organic chemistry">Organic Chemistry</SelectItem>
                          <SelectItem value="biochemistry">Biochemistry</SelectItem>
                          <SelectItem value="statistics">Statistics</SelectItem>
                          <SelectItem value="accounting">Accounting</SelectItem>
                          <SelectItem value="economics">Economics</SelectItem>
                          <SelectItem value="finance">Finance</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        onClick={addSubject}
                        className="rounded-l-none"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Hourly Rate (Rs.)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(e.target.value)}
                        placeholder="e.g. 800"
                        min="0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experience">Experience</Label>
                      <Input
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g. 2 years"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability">Availability</Label>
                      <Input
                        id="availability"
                        value={availability}
                        onChange={(e) => setAvailability(e.target.value)}
                        placeholder="e.g. Mon-Fri, 2PM-8PM"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    Creating account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </form>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="text-sm text-center text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
