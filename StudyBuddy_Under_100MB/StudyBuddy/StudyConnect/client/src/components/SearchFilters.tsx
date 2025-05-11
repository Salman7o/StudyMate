import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Subject } from "@shared/schema";

interface SearchFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  className?: string;
}

export interface SearchFilters {
  subject?: string;
  program?: string;
  semester?: string;
  budget?: string;
  availability?: string;
  rating?: string;
}

const SearchFilters = ({ onSearch, className }: SearchFiltersProps) => {
  const [filters, setFilters] = useState<SearchFilters>({});
  
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });
  
  // Handle filter changes
  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  // Handle search button click
  const handleSearch = () => {
    onSearch(filters);
  };
  
  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h2 className="text-2xl font-bold text-foreground mb-6 font-inter">Find Your Tutor</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="subject" className="block text-sm font-medium mb-2">Subject</Label>
          <Select 
            value={filters.subject} 
            onValueChange={(value) => handleFilterChange("subject", value)}
          >
            <SelectTrigger id="subject">
              <SelectValue placeholder="All Subjects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Subjects</SelectItem>
              {subjects?.map(subject => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="program" className="block text-sm font-medium mb-2">Program</Label>
          <Select 
            value={filters.program} 
            onValueChange={(value) => handleFilterChange("program", value)}
          >
            <SelectTrigger id="program">
              <SelectValue placeholder="All Programs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Programs</SelectItem>
              <SelectItem value="Undergraduate">Undergraduate</SelectItem>
              <SelectItem value="Graduate">Graduate</SelectItem>
              <SelectItem value="PhD">PhD</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="semester" className="block text-sm font-medium mb-2">Semester</Label>
          <Select 
            value={filters.semester} 
            onValueChange={(value) => handleFilterChange("semester", value)}
          >
            <SelectTrigger id="semester">
              <SelectValue placeholder="All Semesters" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Semesters</SelectItem>
              <SelectItem value="Semester 1">Semester 1</SelectItem>
              <SelectItem value="Semester 2">Semester 2</SelectItem>
              <SelectItem value="Semester 3">Semester 3</SelectItem>
              <SelectItem value="Semester 4">Semester 4</SelectItem>
              <SelectItem value="Semester 5">Semester 5</SelectItem>
              <SelectItem value="Semester 6">Semester 6</SelectItem>
              <SelectItem value="Semester 7">Semester 7</SelectItem>
              <SelectItem value="Semester 8">Semester 8</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <Label htmlFor="budget" className="block text-sm font-medium mb-2">Budget Range</Label>
          <Select 
            value={filters.budget} 
            onValueChange={(value) => handleFilterChange("budget", value)}
          >
            <SelectTrigger id="budget">
              <SelectValue placeholder="Any Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Budget</SelectItem>
              <SelectItem value="10-20">$10-$20/hr</SelectItem>
              <SelectItem value="20-30">$20-$30/hr</SelectItem>
              <SelectItem value="30-50">$30-$50/hr</SelectItem>
              <SelectItem value="50+">$50+/hr</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="availability" className="block text-sm font-medium mb-2">Availability</Label>
          <Select 
            value={filters.availability} 
            onValueChange={(value) => handleFilterChange("availability", value)}
          >
            <SelectTrigger id="availability">
              <SelectValue placeholder="Any Time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Time</SelectItem>
              <SelectItem value="Weekdays">Weekdays</SelectItem>
              <SelectItem value="Weekends">Weekends</SelectItem>
              <SelectItem value="Mornings">Mornings</SelectItem>
              <SelectItem value="Afternoons">Afternoons</SelectItem>
              <SelectItem value="Evenings">Evenings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="rating" className="block text-sm font-medium mb-2">Rating</Label>
          <Select 
            value={filters.rating} 
            onValueChange={(value) => handleFilterChange("rating", value)}
          >
            <SelectTrigger id="rating">
              <SelectValue placeholder="Any Rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Any Rating</SelectItem>
              <SelectItem value="4">4+ Stars</SelectItem>
              <SelectItem value="3">3+ Stars</SelectItem>
              <SelectItem value="2">2+ Stars</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="flex justify-center">
        <Button className="btn-primary px-8 py-6" onClick={handleSearch}>
          Search Tutors
        </Button>
      </div>
    </div>
  );
};

export default SearchFilters;
