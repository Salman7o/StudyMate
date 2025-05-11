import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import TutorCard from "@/components/tutor/TutorCard";
import TutorFilter, { TutorFilterValues } from "@/components/tutor/TutorFilter";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface TutorWithDetails {
  id: number;
  name: string;
  profileImageUrl?: string;
  profile: {
    id: number;
    hourlyRate: number;
    specialization: string;
    availableWeekdays: boolean;
    availableWeekends: boolean;
    rating: number;
    sessionsCompleted: number;
  };
  subjects: {
    id: number;
    name: string;
    category: string;
  }[];
}

export default function FindTutorsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<TutorFilterValues>({});
  
  const { data: tutors, isLoading, error } = useQuery<TutorWithDetails[]>({
    queryKey: [
      "/api/search/tutors", 
      filters.subject, 
      filters.minRate, 
      filters.maxRate, 
      filters.availability,
      filters.program,
      filters.semester
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.subject) params.append("subject", filters.subject);
      if (filters.minRate) params.append("minRate", filters.minRate.toString());
      if (filters.maxRate) params.append("maxRate", filters.maxRate.toString());
      if (filters.availability) params.append("availability", filters.availability);
      if (filters.program) params.append("program", filters.program);
      if (filters.semester) params.append("semester", filters.semester);
      
      const res = await fetch(`/api/search/tutors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch tutors");
      return res.json();
    },
  });

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleFilter = (newFilters: TutorFilterValues) => {
    setFilters(newFilters);
  };

  // Filter tutors by search query
  const filteredTutors = tutors?.filter(tutor => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      tutor.name.toLowerCase().includes(query) ||
      tutor.profile.specialization.toLowerCase().includes(query) ||
      tutor.subjects.some(subject => subject.name.toLowerCase().includes(query))
    );
  });

  return (
    <MainLayout title="Find Tutors">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Find Tutors</h1>
        <p className="text-gray-600">Connect with the perfect tutor for your academic needs</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <TutorFilter onFilter={handleFilter} />
        </div>
        
        <div className="lg:col-span-3">
          <div className="mb-6">
            <Input
              type="text"
              placeholder="Search by name, subject, or specialization..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full"
            />
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-center">
                      <Skeleton className="h-16 w-16 rounded-full" />
                      <div className="ml-4">
                        <Skeleton className="h-5 w-36 mb-2" />
                        <Skeleton className="h-4 w-28 mb-2" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <div className="flex justify-between text-sm">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="h-4 w-16" />
                      </div>
                      <div className="flex justify-between text-sm mt-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                    
                    <div className="mt-5 flex space-x-3">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              <p>Error loading tutors. Please try again later.</p>
            </div>
          ) : filteredTutors?.length === 0 ? (
            <div className="bg-gray-50 p-8 rounded-md text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tutors found</h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find more tutors.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredTutors?.map((tutor) => (
                <TutorCard
                  key={tutor.id}
                  id={tutor.id}
                  name={tutor.name}
                  profileImageUrl={tutor.profileImageUrl}
                  profile={tutor.profile}
                  subjects={tutor.subjects}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
