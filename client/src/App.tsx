import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { ThemeProvider } from "./hooks/use-theme";
import { AuthProvider } from "./contexts/auth-context";
import { Navbar } from "./components/layout/Navbar";
import { MobileNavigation } from "./components/layout/mobile-navigation";

import Home from "./pages/Home";
import FindTutors from "./pages/TutorsPage";
import MySessions from "./pages/SessionsPage";
import Messages from "./pages/MessagesPage";
import Profile from "./pages/TutorProfilePage";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import NotFound from "./pages/not-found";

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
                  <Route path="/tutors" component={FindTutors} />
                  <Route path="/sessions" component={MySessions} />
                  <Route path="/messages" component={Messages} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/tutor/:id" component={Profile} />
                  <Route path="/login" component={Login} />
                  <Route path="/register" component={Register} />
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
