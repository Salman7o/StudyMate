import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const isAuthenticated = !!user;

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("/api/auth/me", {
          credentials: "include",
        });

        if (res.ok) {
          const data = await res.json();
          console.log("Current user data:", data);

          // Extract user data from the response
          const userData = data.user || data;
          setUser(userData);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setLoading(true);
      const res = await apiRequest("POST", "/api/auth/login", { username, password });
      const data = await res.json();

      console.log("Login response:", data);

      // Extract user data from the response
      const userData = data.user || data;
      // Set user first
      setUser(userData);

      // Then handle redirection
      const dashboardPath = userData.role === "tutor" ? "/tutor-dashboard" : "/student-dashboard";
      console.log(`Redirecting ${userData.role} to ${dashboardPath}`);

      // Use setTimeout to ensure state is updated before redirect
      setTimeout(() => {
        setLocation(dashboardPath);

        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.fullName || userData.username}!`,
        });
      }, 0);
    } catch (error) {
      console.error("Login failed:", error);
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Please check your credentials and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      const res = await apiRequest("POST", "/api/auth/register", userData);
      const data = await res.json();

      console.log("Registration response:", data);

      // Extract user data from the response
      const newUser = data.user || data;

      // Set user in state
      setUser(newUser);

      // Determine dashboard path
      const dashboardPath = newUser.role === "tutor" ? "/tutor-dashboard" : "/student-dashboard";
      console.log(`Redirecting ${newUser.role} to ${dashboardPath}`);

      // Use setTimeout to ensure state updates before redirect
      setTimeout(() => {
        setLocation(dashboardPath);
        toast({
          title: "Registration successful",
          description: `Welcome, ${newUser.fullName || newUser.username}!`,
        });
      }, 0);

    } catch (error) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Please check your information and try again",
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
      toast({
        title: "Logged out successfully",
      });
      setLocation("/");
    } catch (error) {
      console.error("Logout failed:", error);
      toast({
        title: "Logout failed",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}