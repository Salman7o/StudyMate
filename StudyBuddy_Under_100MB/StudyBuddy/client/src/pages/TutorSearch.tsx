import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import SearchFilters, { SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import TutorCard from "@/components/TutorCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { TutorWithProfile } from "@shared/schema";

const TutorSearch = () => {
  const [location] = useLocation();
  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams(location.split("?")[1]));
  const [sortBy, setSortBy] = useState("recommended");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState<SearchFiltersType>({});
  const itemsPerPage = 6;

  // Initialize filters from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.split("?")[1]);
    
    const initialFilters: SearchFiltersType = {};
    if (params.has("subject")) initialFilters.subject = params.get("subject") || undefined;
    if (params.has("program")) initialFilters.program = params.get("program") || undefined;
    if (params.has("semester")) initialFilters.semester = params.get("semester") || undefined;
    if (params.has("budget")) initialFilters.budget = params.get("budget") || undefined;
    if (params.has("availability")) initialFilters.availability = params.get("availability") || undefined;
    if (params.has("rating")) initialFilters.rating = params.get("rating") || undefined;
    
    setFilters(initialFilters);
    setSearchParams(params);
  }, [location]);

  // Prepare query parameters for API call
  const prepareQueryParams = () => {
    const queryParams: Record<string, string | number> = {};
    
    if (filters.subject) queryParams.subject = filters.subject;
    if (filters.program) queryParams.university = filters.program; // Map to university field in API
    
    if (filters.budget) {
      const [min, max] = filters.budget.split("-");
      if (min) queryParams.minRate = parseFloat(min);
      if (max) queryParams.maxRate = parseFloat(max);
    }
    
    if (filters.rating) {
      queryParams.minRating = parseFloat(filters.rating);
    }
    
    if (filters.availability) {
      queryParams.availability = filters.availability;
    }
    
    return queryParams;
  };

  const { data: tutors = [], isLoading, error } = useQuery<TutorWithProfile[]>({
    queryKey: ["/api/tutors", prepareQueryParams()],
  });

  // Sort tutors based on selected option
  const sortTutors = (tutorsList: TutorWithProfile[]) => {
    switch (sortBy) {
      case "highest-rated":
        return [...tutorsList].sort((a, b) => b.avgRating - a.avgRating);
      case "lowest-price":
        return [...tutorsList].sort((a, b) => a.profile.hourlyRate - b.profile.hourlyRate);
      case "highest-price":
        return [...tutorsList].sort((a, b) => b.profile.hourlyRate - a.profile.hourlyRate);
      case "most-experience":
        return [...tutorsList].sort((a, b) => b.profile.yearsOfExperience - a.profile.yearsOfExperience);
      default:
        return tutorsList;
    }
  };

  const handleSearch = (newFilters: SearchFiltersType) => {
    setFilters(newFilters);
    setCurrentPage(1);
    
    // Update URL with new search parameters
    const params = new URLSearchParams();
    
    if (newFilters.subject) params.append("subject", newFilters.subject);
    if (newFilters.program) params.append("program", newFilters.program);
    if (newFilters.semester) params.append("semester", newFilters.semester);
    if (newFilters.budget) params.append("budget", newFilters.budget);
    if (newFilters.availability) params.append("availability", newFilters.availability);
    if (newFilters.rating) params.append("rating", newFilters.rating);
    
    setSearchParams(params);
    window.history.pushState({}, "", `/tutors?${params.toString()}`);
  };

  // Pagination calculations
  const sortedTutors = sortTutors(tutors);
  const totalPages = Math.ceil(sortedTutors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTutors = sortedTutors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8 font-inter">Find Your Perfect Tutor</h1>
      
      <SearchFilters 
        onSearch={handleSearch} 
        className="mb-8"
      />
      
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground font-inter">
          {isLoading ? "Searching tutors..." : 
            error ? "Error finding tutors" : 
            `Found ${tutors.length} tutors`}
        </h2>
        <div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Sort by: Recommended" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Sort by: Recommended</SelectItem>
              <SelectItem value="highest-rated">Highest Rated</SelectItem>
              <SelectItem value="lowest-price">Lowest Price</SelectItem>
              <SelectItem value="highest-price">Highest Price</SelectItem>
              <SelectItem value="most-experience">Most Experience</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex space-x-2 mb-3">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="h-16 bg-gray-200 rounded mb-4"></div>
                <div className="flex justify-between items-center">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">Failed to load tutors. Please try again later.</p>
          <Button onClick={() => window.location.reload()} variant="outline">Retry</Button>
        </div>
      ) : tutors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <h3 className="text-xl font-bold mb-2">No tutors found</h3>
          <p className="text-gray-600 mb-6">
            We couldn't find any tutors matching your search criteria.
            Try adjusting your filters or search for a different subject.
          </p>
          <Button 
            className="btn-primary"
            onClick={() => handleSearch({})}
          >
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {paginatedTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage > 1) setCurrentPage(currentPage - 1);
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {[...Array(totalPages)].map((_, i) => {
                  const page = i + 1;
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 || 
                    page === totalPages || 
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(page);
                          }}
                          isActive={page === currentPage}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }
                  
                  // Show ellipsis for gaps
                  if (page === 2 && currentPage > 3) {
                    return (
                      <PaginationItem key="ellipsis-start">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  if (page === totalPages - 1 && currentPage < totalPages - 2) {
                    return (
                      <PaginationItem key="ellipsis-end">
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  return null;
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default TutorSearch;
