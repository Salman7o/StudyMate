import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import TutorCard from "./TutorCard";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TutorProfile } from "@/lib/types";

interface TutorListProps {
  filters?: Record<string, string>;
}

export default function TutorList({ filters = {} }: TutorListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("recommended");
  const itemsPerPage = 6;

  // Build query string from filters
  const queryParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) queryParams.append(key, value);
  });
  
  const queryKey = `/api/tutors${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
  
  const { data: tutors, isLoading } = useQuery<TutorProfile[]>({
    queryKey: [queryKey],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <Skeleton className="h-14 w-14 rounded-full" />
                <div className="ml-4">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-16 rounded-md" />
            </div>
            <Skeleton className="h-16 w-full mb-4" />
            <div className="flex gap-2 mb-4">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
            <div className="flex justify-between items-center">
              <div>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-10 w-28 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!tutors || tutors.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-700 mb-2">No tutors found</h3>
        <p className="text-gray-500">
          Try adjusting your search filters to find more tutors.
        </p>
      </div>
    );
  }

  // Sort tutors based on selected option
  const sortedTutors = [...tutors].sort((a, b) => {
    switch (sortBy) {
      case "highestRated":
        return Number(b.averageRating) - Number(a.averageRating);
      case "lowestPrice":
        return Number(a.rate) - Number(b.rate);
      case "highestPrice":
        return Number(b.rate) - Number(a.rate);
      case "mostPopular":
        return b.reviewCount - a.reviewCount;
      default:
        // Default "recommended" - custom algorithm combining rating and review count
        return (Number(b.averageRating) * 0.7 + b.reviewCount * 0.3) - 
               (Number(a.averageRating) * 0.7 + a.reviewCount * 0.3);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedTutors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentTutors = sortedTutors.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-textColor font-inter">Available Tutors</h2>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-2">Sort by:</span>
          <Select value={sortBy} onValueChange={(value) => setSortBy(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Recommended" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recommended">Recommended</SelectItem>
              <SelectItem value="highestRated">Highest Rated</SelectItem>
              <SelectItem value="lowestPrice">Price: Low to High</SelectItem>
              <SelectItem value="highestPrice">Price: High to Low</SelectItem>
              <SelectItem value="mostPopular">Most Popular</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentTutors.map((tutor) => (
          <TutorCard key={tutor.id} tutor={tutor} />
        ))}
      </div>
      
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                isActive={currentPage !== 1}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            
            {Array.from({ length: totalPages }).map((_, index) => {
              const page = index + 1;
              // Show current page, first, last and +-1 pages around current
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <PaginationItem key={page}>
                    <PaginationLink
                      isActive={page === currentPage}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                );
              }
              
              // Show ellipsis for gaps in pagination
              if (page === 2 && currentPage > 3) {
                return (
                  <PaginationItem key="ellipsis-start">
                    <span className="px-4 py-2">...</span>
                  </PaginationItem>
                );
              }
              
              if (page === totalPages - 1 && currentPage < totalPages - 2) {
                return (
                  <PaginationItem key="ellipsis-end">
                    <span className="px-4 py-2">...</span>
                  </PaginationItem>
                );
              }
              
              return null;
            })}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                isActive={currentPage !== totalPages}
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
