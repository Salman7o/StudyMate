import { useState } from "react";
import { useLocation } from "wouter";
import { Search } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TutorSearchFilters } from "@/lib/types";

export default function SearchSection() {
  const [, setLocation] = useLocation();
  const [filters, setFilters] = useState<TutorSearchFilters>({
    subject: undefined,
    academicLevel: undefined,
    priceRange: undefined,
    availability: undefined,
    rating: undefined,
  });

  const handleFilterChange = (key: keyof TutorSearchFilters, value: string | undefined) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Build query string from filters
    const queryParams = new URLSearchParams();
    
    if (filters.subject) queryParams.append('subject', filters.subject);
    if (filters.academicLevel) queryParams.append('academicLevel', filters.academicLevel);
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-");
      if (min) queryParams.append('minRate', min.replace(/\D/g, ''));
      if (max) queryParams.append('maxRate', max.replace(/\D/g, ''));
    }
    if (filters.availability) queryParams.append('availability', filters.availability);
    if (filters.rating) {
      const minRating = filters.rating.split(" ")[0];
      queryParams.append('minRating', minRating);
    }
    
    const queryString = queryParams.toString();
    setLocation(`/tutors${queryString ? `?${queryString}` : ''}`);
  };

  return (
    <section id="find-tutors" className="py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-textColor font-inter mb-2">
            Find Your Perfect Study Match
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Filter tutors based on your specific needs and academic requirements
          </p>
        </div>
        
        <div className="bg-background p-6 rounded-lg shadow-sm mb-8">
          <form onSubmit={handleSearch}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <Select
                  value={filters.subject}
                  onValueChange={(value) => handleFilterChange('subject', value)}
                >
                  <SelectTrigger id="subject" className="w-full">
                    <SelectValue placeholder="All Subjects" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All Subjects</SelectItem>
                      <SelectItem value="Computer Science">Computer Science</SelectItem>
                      <SelectItem value="Mathematics">Mathematics</SelectItem>
                      <SelectItem value="Physics">Physics</SelectItem>
                      <SelectItem value="Chemistry">Chemistry</SelectItem>
                      <SelectItem value="Business Studies">Business Studies</SelectItem>
                      <SelectItem value="Economics">Economics</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                  Academic Level
                </label>
                <Select
                  value={filters.academicLevel}
                  onValueChange={(value) => handleFilterChange('academicLevel', value)}
                >
                  <SelectTrigger id="level" className="w-full">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">All Levels</SelectItem>
                      <SelectItem value="First Year">First Year</SelectItem>
                      <SelectItem value="Second Year">Second Year</SelectItem>
                      <SelectItem value="Third Year">Third Year</SelectItem>
                      <SelectItem value="Fourth Year">Fourth Year</SelectItem>
                      <SelectItem value="Graduate">Graduate</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price Range
                </label>
                <Select
                  value={filters.priceRange}
                  onValueChange={(value) => handleFilterChange('priceRange', value)}
                >
                  <SelectTrigger id="price" className="w-full">
                    <SelectValue placeholder="Any Price" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">Any Price</SelectItem>
                      <SelectItem value="0-20">Under $20/hr</SelectItem>
                      <SelectItem value="20-30">$20-30/hr</SelectItem>
                      <SelectItem value="30-40">$30-40/hr</SelectItem>
                      <SelectItem value="40-50">$40-50/hr</SelectItem>
                      <SelectItem value="50-1000">$50+/hr</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                  Availability
                </label>
                <Select
                  value={filters.availability}
                  onValueChange={(value) => handleFilterChange('availability', value)}
                >
                  <SelectTrigger id="availability" className="w-full">
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">Any Time</SelectItem>
                      <SelectItem value="weekdays">Weekdays</SelectItem>
                      <SelectItem value="weekends">Weekends</SelectItem>
                      <SelectItem value="evenings">Evenings</SelectItem>
                      <SelectItem value="mornings">Mornings</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <Select
                  value={filters.rating}
                  onValueChange={(value) => handleFilterChange('rating', value)}
                >
                  <SelectTrigger id="rating" className="w-full">
                    <SelectValue placeholder="Any Rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="">Any Rating</SelectItem>
                      <SelectItem value="4.5">4.5 & up</SelectItem>
                      <SelectItem value="4.0">4.0 & up</SelectItem>
                      <SelectItem value="3.5">3.5 & up</SelectItem>
                      <SelectItem value="3.0">3.0 & up</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="mt-6 flex justify-center">
              <Button type="submit" className="px-6 py-3 h-auto">
                <Search className="h-4 w-4 mr-2" /> Search Tutors
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
