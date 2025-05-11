import { Helmet } from "react-helmet";
import HeroSection from "@/components/home/HeroSection";
import SearchSection from "@/components/home/SearchSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import CTASection from "@/components/home/CTASection";

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>StudyBuddy - Find Your Perfect Tutor</title>
        <meta 
          name="description" 
          content="Connect with qualified peer tutors from your university who understand your curriculum and can help you excel in your studies." 
        />
      </Helmet>
      
      <HeroSection />
      <SearchSection />
      <FeaturesSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}
