import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title?: string;
}

export default function PageHeader({ title }: PageHeaderProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/", label: "Dashboard" },
    { href: "/find-tutors", label: "Find Tutors" },
    { href: "/sessions", label: "Sessions" },
    { href: "/messages", label: "Messages" },
  ];

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex">
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    location === item.href
                      ? "border-primary text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>
          <div className="hidden md:flex items-center">
            <button type="button" className="bg-white p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none">
              <span className="sr-only">View notifications</span>
              <i className="fas fa-bell"></i>
            </button>
            <div className="ml-3 relative">
              <div className="text-sm text-gray-500">
                <span className="text-xs px-2 py-1 rounded-full bg-primary-100 text-primary-800">
                  {user?.role === "tutor" ? "Tutor" : "Student"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
