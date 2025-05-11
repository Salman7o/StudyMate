import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  className?: string;
  iconClassName?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  className = "bg-primary-50", 
  iconClassName = "bg-primary" 
}: StatsCardProps) {
  return (
    <div className={cn("overflow-hidden rounded-lg shadow-sm", className)}>
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconClassName)}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
