import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { TutorWithProfile } from "@shared/schema";
import SearchFilters from "@/components/SearchFilters";
import TutorCard from "@/components/TutorCard";
import TutorProfileModal from "@/components/TutorProfileModal";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

export default function FindTutors() {
  const [location] = useLocation();
  const [selectedTutor, setSelectedTutor] = useState<TutorWithProfile | null>(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    subject: "All Subjects",
    semester: "Any Semester",
    program: "All Programs",
    priceRange: "Any Price",
    availability: "Any Time",
  });

  // Parse URL parameters for initial filters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const initialFilters = { ...filters };
    let hasFilters = false;

    if (params.has('subject')) {
      initialFilters.subject = params.get('subject') || "All Subjects";
      hasFilters = true;
    }
    if (params.has('semester')) {
      initialFilters.semester = params.get('semester') || "Any Semester";
      hasFilters = true;
    }
    if (params.has('program')) {
      initialFilters.program = params.get('program') || "All Programs";
      hasFilters = true;
    }
    if (params.has('priceRange')) {
      initialFilters.priceRange = params.get('priceRange') || "Any Price";
      hasFilters = true;
    }
    if (params.has('availability')) {
      initialFilters.availability = params.get('availability') || "Any Time";
      hasFilters = true;
    }

    if (hasFilters) {
      setFilters(initialFilters);
    }
  }, [location]);

  // Construct query parameters for API call
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value && value !== 'All Subjects' && value !== 'Any Semester' && 
        value !== 'All Programs' && value !== 'Any Price' && value !== 'Any Time') {
      queryParams.append(key, value);
    }
  }
  queryParams.append('page', currentPage.toString());

  // Fetch tutors with filters
  const {
    data: tutorsData,
    isLoading,
    error,
  } = useQuery<{ tutors: TutorWithProfile[], totalPages: number }>({
    queryKey: [`/api/tutors?${queryParams.toString()}`],
  });

  const handleSearch = (newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL without full page reload
    const searchParams = new URLSearchParams();
    for (const [key, value] of Object.entries(newFilters)) {
      if (value && value !== 'All Subjects' && value !== 'Any Semester' && 
          value !== 'All Programs' && value !== 'Any Price' && value !== 'Any Time') {
        searchParams.append(key, value as string);
      }
    }
    
    window.history.pushState(
      {}, 
      '', 
      `${window.location.pathname}?${searchParams.toString()}`
    );
  };

  const handleOpenProfile = (tutor: TutorWithProfile) => {
    setSelectedTutor(tutor);
    setIsProfileModalOpen(true);
  };

  // Fallback for API structure
  const tutors = tutorsData?.tutors || tutorsData as unknown as TutorWithProfile[] || [];
  const totalPages = tutorsData?.totalPages || 1;

  return (
    <div className="bg-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Find the Perfect Tutor
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-muted-foreground lg:mx-auto">
            Connect with qualified tutors from your university who can help you excel in your studies.
          </p>
        </div>

        {/* Search Filters */}
        <div className="mb-10">
          <SearchFilters onSearch={handleSearch} initialValues={filters} />
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[400px] bg-gray-100 animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">Failed to load tutors. Please try again later.</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </div>
        ) : tutors.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow">
            <h3 className="text-lg font-medium text-foreground mb-2">No tutors found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters to find more tutors.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.isArray(tutors) && tutors.map(tutor => (
                <div key={tutor.id} onClick={() => handleOpenProfile(tutor)}>
                  <TutorCard tutor={tutor} />
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination className="mt-8">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(currentPage - 1)}>
                        Previous
                      </PaginationLink>
                    </PaginationItem>
                  )}
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <PaginationItem key={page}>
                      <PaginationLink 
                        isActive={page === currentPage}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink onClick={() => setCurrentPage(currentPage + 1)}>
                        Next
                      </PaginationLink>
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>

      {/* Tutor Profile Modal */}
      <TutorProfileModal 
        tutor={selectedTutor} 
        open={isProfileModalOpen} 
        onOpenChange={setIsProfileModalOpen} 
      />
    </div>
  );
}
