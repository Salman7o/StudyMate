import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import SearchFilters, { SearchFilters as SearchFiltersType } from "@/components/SearchFilters";
import FeaturedTutors from "@/components/FeaturedTutors";
import WhyChooseUs from "@/components/WhyChooseUs";
import HowItWorks from "@/components/HowItWorks";
import Testimonials from "@/components/Testimonials";
import CTASection from "@/components/CTASection";
import { useAuth } from "@/hooks/useAuth";

const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  const handleSearch = (filters: SearchFiltersType) => {
    const params = new URLSearchParams();
    
    // Add filter parameters
    if (filters.subject) params.append("subject", filters.subject);
    if (filters.program) params.append("program", filters.program);
    if (filters.semester) params.append("semester", filters.semester);
    if (filters.budget) params.append("budget", filters.budget);
    if (filters.availability) params.append("availability", filters.availability);
    if (filters.rating) params.append("rating", filters.rating);
    
    setSearchParams(params);
    window.location.href = `/tutors?${params.toString()}`;
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <div className="bg-primary">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
          <div className="text-center md:text-left md:w-1/2">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl font-inter">
              Connect with the <span className="text-accent">perfect tutor</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto md:mx-0 text-lg text-white sm:text-xl md:mt-5 font-sourceSans">
              Find qualified tutors from your university who can help you excel in your courses.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4">
              <Button className="btn-accent rounded-md px-8 py-3 text-base font-medium shadow-sm" asChild>
                <Link href="/tutors">Find a Tutor</Link>
              </Button>
              <Button className="bg-white text-primary hover:bg-gray-50 rounded-md px-8 py-3 text-base font-medium shadow-sm" asChild>
                <Link href={`/register${!user ? "?type=tutor" : ""}`}>
                  {user ? "Dashboard" : "Become a Tutor"}
                </Link>
              </Button>
            </div>
          </div>
          
          <div className="mt-12 md:mt-0 md:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
              alt="University students studying together" 
              className="rounded-lg shadow-xl"
            />
          </div>
        </div>
      </div>

      {/* Search Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        <SearchFilters onSearch={handleSearch} className="relative z-10" />
      </div>

      {/* Featured Tutors */}
      <FeaturedTutors />

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />

      {/* CTA Section */}
      <CTASection />
    </div>
  );
};

export default Home;
