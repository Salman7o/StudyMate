import { Link, useLocation } from "wouter";
import { useAuth } from "../App";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Bell, Menu, LogOut, User, MessageSquare, Calendar, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, setUser } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Get unread message count if user is logged in
  const { data: unreadCount } = useQuery({
    queryKey: user ? [`/api/users/${user.id}/unread-count`] : null,
    enabled: !!user
  });

  // Navigation links
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Find Tutors", path: "/find-tutors" },
    { name: "My Sessions", path: "/my-sessions" },
    { name: "Messages", path: "/messages" }
  ];

  const handleLogout = () => {
    setUser(null);
    window.location.href = "/";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/find-tutors?search=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Desktop Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <Link href="/">
                  <span className="text-2xl font-bold text-primary cursor-pointer">StudyConnect</span>
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navLinks.map((link) => (
                  <Link key={link.path} href={link.path}>
                    <a className={`${
                      location === link.path 
                        ? "border-primary text-foreground" 
                        : "border-transparent text-muted-foreground hover:border-muted hover:text-foreground"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                      {link.name}
                    </a>
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <form onSubmit={handleSearch} className="relative">
                <Input
                  type="text"
                  placeholder="Search for tutors, subjects..."
                  className="bg-background border border-muted rounded-full py-2 px-4 text-sm w-64 pr-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button 
                  type="submit"
                  variant="ghost" 
                  size="icon" 
                  className="absolute right-0 top-0 h-full rounded-full"
                >
                  <Search className="h-4 w-4 text-muted-foreground" />
                </Button>
              </form>
              
              <Button variant="ghost" size="icon" className="ml-3 text-muted-foreground">
                <Bell className="h-5 w-5" />
              </Button>
              
              {user ? (
                <div className="ml-3 relative">
                  <Link href="/my-profile">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage src={user.profileImage || ""} alt={user.username} />
                      <AvatarFallback>{`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`}</AvatarFallback>
                    </Avatar>
                  </Link>
                </div>
              ) : (
                <div className="ml-3 flex space-x-2">
                  <Link href="/login">
                    <Button variant="ghost" className="text-muted-foreground">Log in</Button>
                  </Link>
                  <Link href="/register">
                    <Button>Sign up</Button>
                  </Link>
                </div>
              )}
            </div>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[270px] sm:w-[385px]">
                  <div className="flex flex-col h-full">
                    <div className="py-4">
                      <div className="px-2 mb-6">
                        <Link href="/" onClick={() => setIsMobileMenuOpen(false)}>
                          <span className="text-xl font-bold text-primary">StudyConnect</span>
                        </Link>
                      </div>
                      
                      {user ? (
                        <div className="flex items-center px-2 mb-6">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={user.profileImage || ""} alt={user.username} />
                            <AvatarFallback>{`${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`}</AvatarFallback>
                          </Avatar>
                          <div className="ml-3">
                            <div className="text-base font-medium text-foreground">{`${user.firstName} ${user.lastName}`}</div>
                            <div className="text-sm font-medium text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col px-2 space-y-2 mb-6">
                          <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button variant="outline" className="w-full">Log in</Button>
                          </Link>
                          <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                            <Button className="w-full">Sign up</Button>
                          </Link>
                        </div>
                      )}
                      
                      <Separator className="mb-4" />
                      
                      <nav className="flex flex-col space-y-1">
                        {navLinks.map((link) => (
                          <Link key={link.path} href={link.path} onClick={() => setIsMobileMenuOpen(false)}>
                            <a className={`${
                              location === link.path
                                ? "bg-primary/10 text-primary"
                                : "text-foreground hover:bg-muted/50"
                            } px-2 py-2 rounded-md text-base font-medium`}>
                              {link.name}
                            </a>
                          </Link>
                        ))}
                      </nav>
                    </div>
                    
                    {user && (
                      <div className="mt-auto px-2 pb-4">
                        <Separator className="mb-4" />
                        <Button 
                          variant="ghost" 
                          className="w-full justify-start text-destructive" 
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Log out
                        </Button>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Mobile search - shown below nav on small screens */}
        <div className="sm:hidden px-4 pb-3">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="text"
              placeholder="Search for tutors, subjects..."
              className="bg-background border border-muted rounded-full py-2 px-4 text-sm w-full pr-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button 
              type="submit"
              variant="ghost" 
              size="icon" 
              className="absolute right-0 top-0 h-full rounded-full"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </Button>
          </form>
        </div>
      </nav>

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-foreground text-white">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Platform</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">How it Works</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Find Tutors</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Become a Tutor</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Support</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Help Center</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Contact Us</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Safety Center</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Company</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">About Us</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Careers</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Blog</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Press</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white tracking-wider uppercase">Legal</h3>
              <ul className="mt-4 space-y-4">
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-base text-gray-300 hover:text-white">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-gray-700 pt-8 md:flex md:items-center md:justify-between">
            <div className="flex space-x-6 md:order-2">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">LinkedIn</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            </div>
            <p className="mt-8 text-base text-gray-400 md:mt-0 md:order-1">
              &copy; 2023 StudyConnect. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
