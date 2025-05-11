import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";
import { Bell, Menu, MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

const Navbar = () => {
  const [location, navigate] = useLocation();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
      navigate("/");
    } catch (error) {
      toast({
        title: "Error logging out",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const isActive = (path: string) => {
    return location === path;
  };

  const NavLink = ({ path, label }: { path: string; label: string }) => (
    <Link href={path}>
      <a className={`
        inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium
        ${isActive(path) 
          ? "border-primary text-foreground" 
          : "border-transparent text-gray-500 hover:border-gray-300 hover:text-foreground"
        }
      `}>
        {label}
      </a>
    </Link>
  );

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-primary font-inter text-2xl font-bold">StudyMate</a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <NavLink path="/" label="Home" />
              <NavLink path="/tutors" label="Find Tutors" />
              {user && <NavLink path="/messages" label="Messages" />}
              {user && <NavLink path="/dashboard" label="Dashboard" />}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="mr-4" asChild>
                  <Link href="/messages">
                    <MessageSquare className="h-5 w-5" />
                  </Link>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profileImage} alt={user.fullName} />
                        <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button className="btn-primary" asChild>
                  <Link href="/register">Sign up</Link>
                </Button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <div className="flex flex-col space-y-4 mt-6">
                  <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                    <a className="text-foreground font-medium">Home</a>
                  </Link>
                  <Link href="/tutors" onClick={() => setMobileMenuOpen(false)}>
                    <a className="text-foreground font-medium">Find Tutors</a>
                  </Link>
                  {user && (
                    <>
                      <Link href="/messages" onClick={() => setMobileMenuOpen(false)}>
                        <a className="text-foreground font-medium">Messages</a>
                      </Link>
                      <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                        <a className="text-foreground font-medium">Dashboard</a>
                      </Link>
                    </>
                  )}
                  <div className="pt-4 border-t border-gray-200">
                    {user ? (
                      <>
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImage} alt={user.fullName} />
                            <AvatarFallback>{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-foreground font-medium">{user.fullName}</p>
                            <p className="text-sm text-gray-500">{user.email}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full" onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}>
                          Log out
                        </Button>
                      </>
                    ) : (
                      <div className="flex flex-col space-y-3">
                        <Button asChild>
                          <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                            Log in
                          </Link>
                        </Button>
                        <Button className="btn-primary" asChild>
                          <Link href="/register" onClick={() => setMobileMenuOpen(false)}>
                            Sign up
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
