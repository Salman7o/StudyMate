import { useQuery } from "@tanstack/react-query";
import { Session } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStats({ userId }: { userId: number }) {
  const { data: sessions, isLoading } = useQuery<Session[]>({
    queryKey: ["/api/sessions/student"],
  });

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="p-6">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48 mb-6" />
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-50 overflow-hidden rounded-lg shadow-sm">
                <div className="p-5">
                  <div className="flex items-center">
                    <Skeleton className="h-12 w-12 rounded-md" />
                    <div className="ml-5 w-0 flex-1">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Count sessions by status
  const activeSessions = sessions?.filter(s => s.status === "confirmed").length || 0;
  const completedSessions = sessions?.filter(s => s.status === "completed").length || 0;
  
  // Calculate average rating if we had feedback data
  const avgRating = "N/A"; // This would be calculated from actual feedback data

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Ready to continue your learning journey?</p>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div className="bg-primary-50 overflow-hidden rounded-lg shadow-sm">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary rounded-md p-3">
                  <i className="fas fa-chalkboard-teacher text-white"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Active Sessions
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{activeSessions}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-secondary-50 overflow-hidden rounded-lg shadow-sm">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-secondary rounded-md p-3">
                  <i className="fas fa-user-graduate text-white"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Completed Sessions
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{completedSessions}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-accent-50 overflow-hidden rounded-lg shadow-sm">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
                  <i className="fas fa-star text-white"></i>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Average Rating
                    </dt>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">{avgRating}</div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
