import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";
import PageHeader from "./PageHeader";
import ChatModal from "@/components/chat/ChatModal";

interface MainLayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
}

export default function MainLayout({
  children,
  title,
  showHeader = true,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50 text-gray-800">
      <Sidebar />
      <MobileNav />
      <ChatModal />

      <div className="md:pl-64 flex flex-col flex-1">
        {showHeader && <PageHeader title={title} />}
        <main className="flex-1 pb-16 md:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
