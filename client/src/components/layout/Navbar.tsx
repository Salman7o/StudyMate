import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/context/AuthContext";
import { 
  Bell, 
  Menu, 
  X,
  LogOut,
  User as UserIcon,
  Settings 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    if (!firstName && !lastName) return "U";
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`;
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <a className="text-primary text-2xl font-bold font-inter">StudyBuddy</a>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/tutors">
                <a className={`${
                  location === "/tutors" ? "border-primary text-textColor" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                  Find Tutors
                </a>
              </Link>
              {isAuthenticated && (
                <>
                  <Link href="/sessions">
                    <a className={`${
                      location === "/sessions" ? "border-primary text-textColor" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      My Sessions
                    </a>
                  </Link>
                  <Link href="/messages">
                    <a className={`${
                      location === "/messages" ? "border-primary text-textColor" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      Messages
                    </a>
                  </Link>
                </>
              )}
            </div>
          </div>
          
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {isAuthenticated ? (
              <>
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-500">
                  <Bell className="h-5 w-5" />
                  <span className="sr-only">Notifications</span>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-3 relative rounded-full">
                      <span className="sr-only">Open user menu</span>
                      <Avatar className="h-8 w-8">
                        <AvatarImage 
                          src={user?.profileImageUrl} 
                          alt={`${user?.firstName} ${user?.lastName}`} 
                        />
                        <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        <a className="flex items-center cursor-pointer">
                          <UserIcon className="mr-2 h-4 w-4" />
                          Your Profile
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings">
                        <a className="flex items-center cursor-pointer">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </a>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex space-x-4">
                <Link href="/login">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100">
                    Log in
                  </a>
                </Link>
                <Link href="/register">
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
                    Sign up
                  </a>
                </Link>
              </div>
            )}
          </div>
          
          <div className="-mr-2 flex items-center sm:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleMobileMenu} 
              aria-expanded={isMobileMenuOpen}
              aria-label="Open main menu"
              className="inline-flex items-center justify-center"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`} id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          <Link href="/tutors">
            <a 
              className={`${
                location === "/tutors" 
                  ? "bg-primary text-white" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              } block pl-3 pr-4 py-2 text-base font-medium`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Find Tutors
            </a>
          </Link>
          {isAuthenticated && (
            <>
              <Link href="/sessions">
                <a 
                  className={`${
                    location === "/sessions" 
                      ? "bg-primary text-white" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } block pl-3 pr-4 py-2 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Sessions
                </a>
              </Link>
              <Link href="/messages">
                <a 
                  className={`${
                    location === "/messages" 
                      ? "bg-primary text-white" 
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } block pl-3 pr-4 py-2 text-base font-medium`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Messages
                </a>
              </Link>
            </>
          )}
        </div>
        
        {isAuthenticated ? (
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={user?.profileImageUrl} 
                    alt={`${user?.firstName} ${user?.lastName}`} 
                  />
                  <AvatarFallback>{getInitials(user?.firstName, user?.lastName)}</AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-gray-800">{user?.firstName} {user?.lastName}</div>
                <div className="text-sm font-medium text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <Link href="/dashboard">
                <a 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Your Profile
                </a>
              </Link>
              <Link href="/settings">
                <a 
                  className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Settings
                </a>
              </Link>
              <a 
                className="block px-4 py-2 text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Sign out
              </a>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-gray-200 px-4 flex flex-col space-y-2">
            <Link href="/login">
              <a 
                className="block w-full px-4 py-2 text-center text-base font-medium text-gray-500 hover:text-gray-800 hover:bg-gray-100 border border-gray-300 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Log in
              </a>
            </Link>
            <Link href="/register">
              <a 
                className="block w-full px-4 py-2 text-center text-base font-medium text-white bg-primary hover:bg-primary/90 rounded-md"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign up
              </a>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
