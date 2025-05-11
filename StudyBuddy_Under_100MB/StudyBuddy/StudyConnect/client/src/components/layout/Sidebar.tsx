import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

type NavItem = {
  name: string;
  href: string;
  icon: string;
};

export default function Sidebar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const navItems: NavItem[] = [
    { name: "Dashboard", href: "/", icon: "fa-home" },
    { name: "Find Tutors", href: "/find-tutors", icon: "fa-user-graduate" },
    { name: "Sessions", href: "/sessions", icon: "fa-calendar-alt" },
    { name: "Messages", href: "/messages", icon: "fa-comment-alt" },
    { name: "Payments", href: "/payments", icon: "fa-credit-card" },
    { name: "Settings", href: "/settings", icon: "fa-cog" },
  ];

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
      <div className="flex flex-col flex-grow bg-white shadow-lg overflow-y-auto">
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
            {navItems.map((item) => (
              <a 
                key={item.name}
                href={item.href}
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
        
        <div className="p-4 mt-auto">
          <a 
            href="#" 
            onClick={(e) => { 
              e.preventDefault(); 
              handleLogout();
            }}
            className="flex items-center px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-500 rounded-md group"
          >
            <i className="fas fa-sign-out-alt mr-3 text-gray-400 group-hover:text-red-500" />
            Logout
          </a>
        </div>
      </div>
    </div>
  );
}
