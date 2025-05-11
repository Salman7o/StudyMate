import { useAuth } from "@/hooks/use-auth";
import MainLayout from "@/components/layout/MainLayout";
import DashboardStats from "@/components/dashboard/DashboardStats";
import UpcomingSessions from "@/components/dashboard/UpcomingSessions";
import RecentMessages from "@/components/dashboard/RecentMessages";
import RecommendedTutors from "@/components/dashboard/RecommendedTutors";

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <MainLayout title="Dashboard">
      {user && (
        <>
          <DashboardStats userId={user.id} />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <UpcomingSessions />
            <RecentMessages />
          </div>
          
          {user.role === "student" && <RecommendedTutors />}
        </>
      )}
    </MainLayout>
  );
}
