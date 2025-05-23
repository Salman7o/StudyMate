import { ReactNode, useState } from "react";
import { useLocation, Link } from "wouter";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "./mobile-nav";
import { cn } from "@/lib/utils";
import { Menu, Bell } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface MainLayoutProps {
  children: ReactNode;
  showNav?: boolean;
}

export function MainLayout({ children, showNav = true }: MainLayoutProps) {
  const [location] = useLocation();
  // Try to use auth context safely - this allows the component to work even without auth
  let user = null;
  try {
    const auth = useAuth();
    user = auth?.user;
  } catch (error) {
    console.log("Auth context not available, continuing without user data");
  }
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase();
  };

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/find-tutors", label: "Find Tutors" },
    { href: "/sessions", label: "Sessions" },
    { href: "/messages", label: "Messages" },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <Sidebar />
      
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <div className="md:pl-64 flex flex-col flex-1">
          <div className="md:hidden bg-white shadow-sm">
            <div className="flex items-center justify-between h-16 px-4">
              <div className="flex items-center">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-gray-600 focus:outline-none">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <div className="flex items-center ml-4">
                  <svg className="h-8 w-8 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-primary text-xl font-bold ml-2">StudyMate</span>
                </div>
              </div>
              <div>
                <Avatar className="h-8 w-8">
                  {user?.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user?.fullName || ""} />
                  ) : (
                    <AvatarFallback>
                      {user?.fullName ? getInitials(user.fullName) : "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
              </div>
            </div>
          </div>
          
          {showNav && (
            <div className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                  <div className="flex">
                    <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                      {navItems.map((item) => (
                        <Link key={item.href} href={item.href}>
                          <a
                            className={cn(
                              "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                              location === item.href
                                ? "border-primary text-gray-900"
                                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                            )}
                          >
                            {item.label}
                          </a>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="hidden md:flex items-center">
                    <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                      <Bell className="h-5 w-5" />
                      <span className="sr-only">View notifications</span>
                    </Button>
                    <div className="ml-3 relative">
                      <div className="text-sm text-gray-500">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800 capitalize">
                          {user?.role || "User"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 pb-8 md:pb-0">
            {children}
          </main>
          
          <MobileNav />
        </div>
      
        <SheetContent side="left" className="w-64 p-0">
          <Sidebar />
        </SheetContent>
      </Sheet>
    </div>
  );
}
