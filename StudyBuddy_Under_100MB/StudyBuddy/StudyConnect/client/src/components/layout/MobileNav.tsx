import { useState } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger 
} from "@/components/ui/sheet";

type NavItem = {
  name: string;
  href: string;
  icon: string;
};

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const { user } = useAuth();

  const navItems: NavItem[] = [
    { name: "Home", href: "/", icon: "fa-home" },
    { name: "Tutors", href: "/find-tutors", icon: "fa-user-graduate" },
    { name: "Sessions", href: "/sessions", icon: "fa-calendar-alt" },
    { name: "Messages", href: "/messages", icon: "fa-comment-alt" },
    { name: "Profile", href: "/settings", icon: "fa-user" },
  ];

  const handleNavigation = (href: string) => {
    setLocation(href);
    setIsOpen(false);
  };

  // Mobile header
  const MobileHeader = () => (
    <div className="md:hidden bg-white shadow-sm">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <button type="button" className="text-gray-600 focus:outline-none">
                <i className="fas fa-bars"></i>
              </button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 bg-primary">
                  <div className="flex items-center space-x-2">
                    <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 4L4 8L12 12L20 8L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 12L12 16L20 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M4 16L12 20L20 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-white text-xl font-bold">StudyMate</span>
                  </div>
                </div>
                
                <div className="px-4 py-6">
                  <div className="flex items-center justify-center mb-6">
                    <div className="relative">
                      <img 
                        className="h-16 w-16 rounded-full border-2 border-primary" 
                        src={user?.profileImageUrl || "https://via.placeholder.com/160?text=User"} 
                        alt="User profile" 
                      />
                      <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-secondary"></span>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <h2 className="text-lg font-medium">{user?.name || "User"}</h2>
                    <p className="text-sm text-gray-500">{user?.role === "tutor" ? "Tutor" : "Student"}</p>
                  </div>
                  
                  <nav className="space-y-1 mt-8">
                    {[
                      { name: "Dashboard", href: "/", icon: "fa-home" },
                      { name: "Find Tutors", href: "/find-tutors", icon: "fa-user-graduate" },
                      { name: "Sessions", href: "/sessions", icon: "fa-calendar-alt" },
                      { name: "Messages", href: "/messages", icon: "fa-comment-alt" },
                      { name: "Payments", href: "/payments", icon: "fa-credit-card" },
                      { name: "Settings", href: "/settings", icon: "fa-cog" },
                    ].map((item) => (
                      <a 
                        key={item.name}
                        href={item.href}
                        onClick={(e) => { 
                          e.preventDefault();
                          handleNavigation(item.href);
                        }}
                        className={cn(
                          "flex items-center px-4 py-3 text-sm font-medium rounded-md group",
                          location === item.href
                            ? "text-primary bg-primary-50"
                            : "text-gray-600 hover:bg-gray-50 hover:text-primary"
                        )}
                      >
                        <i className={cn(
                          "fas", 
                          item.icon, 
                          "mr-3",
                          location === item.href
                            ? "text-primary"
                            : "text-gray-400 group-hover:text-primary"
                        )} />
                        {item.name}
                      </a>
                    ))}
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>
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
          <button type="button" className="flex items-center focus:outline-none" onClick={() => handleNavigation("/settings")}>
            <img 
              className="h-8 w-8 rounded-full" 
              src={user?.profileImageUrl || "https://via.placeholder.com/160?text=User"} 
              alt="User profile" 
            />
          </button>
        </div>
      </div>
    </div>
  );

  // Mobile bottom navigation
  const MobileBottomNav = () => (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <a 
            key={item.name}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              handleNavigation(item.href);
            }}
            className={cn(
              "flex flex-col items-center py-3",
              location === item.href ? "text-primary" : "text-gray-500"
            )}
          >
            <i className={`fas ${item.icon} text-lg`}></i>
            <span className="text-xs mt-1">{item.name}</span>
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <MobileHeader />
      <MobileBottomNav />
    </>
  );
}
