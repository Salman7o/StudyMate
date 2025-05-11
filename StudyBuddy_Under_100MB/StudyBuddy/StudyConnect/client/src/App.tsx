import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/hooks/use-theme";
import { AuthProvider } from "@/contexts/auth-context";
import { Navbar } from "@/components/layout/navbar";
import { MobileNavigation } from "@/components/layout/mobile-navigation";

import Home from "@/pages/home";
import FindTutors from "@/pages/find-tutors";
import FindStudents from "@/pages/find-students";
import MySessions from "@/pages/my-sessions";
import Messages from "@/pages/messages";
import Profile from "@/pages/profile";
import StudentDashboard from "@/pages/student-dashboard";
import TutorDashboard from "@/pages/tutor-dashboard";
import TopTutors from "@/pages/top-tutors";
import StudentProfile from "@/pages/student-profile";
import TutorProfilePage from "@/pages/tutor-profile-page";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import NotFound from "@/pages/not-found";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">
              <div className="container mx-auto p-4 pb-20 md:pb-4">
                <Switch>
                  <Route path="/" component={Home} />
                  <Route path="/find-tutors" component={FindTutors} />
                  <Route path="/find-students" component={FindStudents} />
                  <Route path="/my-sessions" component={MySessions} />
                  <Route path="/messages" component={Messages} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/student-dashboard" component={StudentDashboard} />
                  <Route path="/tutor-dashboard" component={TutorDashboard} />
<Route path="/tutor/:id" component={TutorProfilePage} />
                  <Route path="/top-tutors" component={TopTutors} />
                  <Route path="/students/:id" component={StudentProfile} />
                  <Route path="/tutors/:id" component={TutorProfilePage} />
                  <Route path="/auth/login" component={Login} />
                  <Route path="/auth/register" component={Register} />
                  <Route component={NotFound} />
                </Switch>
              </div>
            </main>
            <MobileNavigation />
          </div>
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
