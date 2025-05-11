import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Helmet } from "react-helmet";
import TutorList from "@/components/tutors/TutorList";
import SearchSection from "@/components/home/SearchSection";

export default function TutorsPage() {
  const [, setLocation] = useLocation();
  const [location] = useLocation();
  const [filters, setFilters] = useState<Record<string, string>>({});
  
  // Parse query params from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.split('?')[1]);
    const newFilters: Record<string, string> = {};
    
    // Extract filters from query params
    if (queryParams.has('subject')) newFilters.subject = queryParams.get('subject')!;
    if (queryParams.has('academicLevel')) newFilters.academicLevel = queryParams.get('academicLevel')!;
    if (queryParams.has('minRate')) newFilters.minRate = queryParams.get('minRate')!;
    if (queryParams.has('maxRate')) newFilters.maxRate = queryParams.get('maxRate')!;
    if (queryParams.has('availability')) newFilters.availability = queryParams.get('availability')!;
    if (queryParams.has('minRating')) newFilters.minRating = queryParams.get('minRating')!;
    
    setFilters(newFilters);
  }, [location]);
  
  return (
    <>
      <Helmet>
        <title>Find Tutors | StudyBuddy</title>
        <meta 
          name="description" 
          content="Browse and connect with qualified peer tutors from your university. Filter by subject, academic level, pricing, and availability." 
        />
      </Helmet>
      
      <SearchSection />
      
      <section className="py-12 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TutorList filters={filters} />
        </div>
      </section>
    </>
  );
}
