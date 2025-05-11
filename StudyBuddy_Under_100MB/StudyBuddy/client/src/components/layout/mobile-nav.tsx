import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  Home, 
  UserPlus, 
  Calendar, 
  MessageSquare, 
  User 
} from "lucide-react";

export function MobileNav() {
  const [location] = useLocation();

  const navItems = [
    {
      title: "Home",
      href: "/",
      icon: <Home className="text-lg" />,
    },
    {
      title: "Tutors",
      href: "/find-tutors",
      icon: <UserPlus className="text-lg" />,
    },
    {
      title: "Sessions",
      href: "/sessions",
      icon: <Calendar className="text-lg" />,
    },
    {
      title: "Messages",
      href: "/messages",
      icon: <MessageSquare className="text-lg" />,
    },
    {
      title: "Profile",
      href: "/settings",
      icon: <User className="text-lg" />,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <a
              className={cn(
                "flex flex-col items-center py-3",
                location === item.href
                  ? "text-primary"
                  : "text-gray-500"
              )}
            >
              {item.icon}
              <span className="text-xs mt-1">{item.title}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
