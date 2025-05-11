import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { User } from "@shared/schema";

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  fullName: string;
  email: string;
  userType: "student" | "tutor";
  profileImage?: string;
}

export function useAuth() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch current user
  const { 
    data: user, 
    isLoading, 
    error, 
    isError 
  } = useQuery<User>({ 
    queryKey: ["/api/auth/me"],
    retry: false,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (credentials: LoginCredentials) => 
      apiRequest("POST", "/api/auth/login", credentials),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Redirect based on user role
      if (data.user?.role === "tutor") {
        navigate("/tutor-dashboard");
      } else {
        navigate("/student-dashboard");
      }
      
      toast({
        title: "Welcome back!",
        description: "You've been successfully logged in.",
      });
    },
    onError: (error) => {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterData) => 
      apiRequest("POST", "/api/auth/register", data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      
      // Redirect based on user role
      if (data.user?.role === "tutor") {
        navigate("/tutor-dashboard");
      } else {
        navigate("/student-dashboard");
      }
      
      toast({
        title: "Account created!",
        description: "Your account has been successfully created.",
      });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/auth/logout", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      navigate("/");
      toast({
        title: "Logged out",
        description: "You've been successfully logged out.",
      });
    },
    onError: () => {
      toast({
        title: "Logout failed",
        description: "An error occurred while logging out",
        variant: "destructive",
      });
    },
  });

  const login = (credentials: LoginCredentials | { username: string, password: string }) => {
    loginMutation.mutate(credentials);
  };

  const register = (data: RegisterData) => {
    registerMutation.mutate(data);
  };

  const logout = () => {
    logoutMutation.mutate();
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isError,
    error,
    login,
    register,
    logout,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
