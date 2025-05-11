import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TutorCard from "@/components/TutorCard";
import { TutorWithProfile } from "@shared/schema";

const FeaturedTutors = () => {
  const [sort, setSort] = useState("recommended");
  
  const { data: tutors = [], isLoading, error } = useQuery<TutorWithProfile[]>({
    queryKey: ["/api/tutors/featured"],
  });
  
  const sortTutors = (tutors: TutorWithProfile[]) => {
    switch (sort) {
      case "highest-rated":
        return [...tutors].sort((a, b) => b.avgRating - a.avgRating);
      case "lowest-price":
        return [...tutors].sort((a, b) => a.profile.hourlyRate - b.profile.hourlyRate);
      case "highest-price":
        return [...tutors].sort((a, b) => b.profile.hourlyRate - a.profile.hourlyRate);
      case "most-experience":
        return [...tutors].sort((a, b) => b.profile.yearsOfExperience - a.profile.yearsOfExperience);
      default:
        return tutors;
    }
  };
  
  const sortedTutors = sortTutors(tutors);
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground font-inter">Top Tutors</h2>
        <div>
          <Select value={sort} onValueChange={setSort}>
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
        <div className="text-center py-8">
          <p className="text-red-500">Failed to load tutors. Please try again later.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sortedTutors.map(tutor => (
              <TutorCard key={tutor.id} tutor={tutor} />
            ))}
          </div>
          
          <div className="flex justify-center">
            <Button className="btn-primary px-8 py-3" asChild>
              <Link href="/tutors">View All Tutors</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};

export default FeaturedTutors;
