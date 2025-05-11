import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const HowItWorks = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);
  
  const steps = [
    {
      number: 1,
      title: "Create Profile",
      description: "Sign up and tell us what subjects you need help with and your learning goals."
    },
    {
      number: 2,
      title: "Find Tutors",
      description: "Browse tutor profiles and reviews to find your perfect match based on your criteria."
    },
    {
      number: 3,
      title: "Book Sessions",
      description: "Schedule sessions at times that work for you and make secure payments."
    },
    {
      number: 4,
      title: "Learn & Excel",
      description: "Connect with your tutor, learn effectively, and improve your academic performance."
    }
  ];
  
  return (
    <div className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 font-inter">How StudyMate Works</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our simple process gets you connected with the right tutor in no time.
          </p>
        </div>
        
        <div className="relative">
          {/* Desktop view */}
          {!isMobile && (
            <div className="hidden md:block">
              <div className="absolute top-1/2 left-0 right-0 h-1 bg-primary -translate-y-1/2"></div>
              <div className="relative grid grid-cols-4 gap-8">
                {steps.map((step) => (
                  <div key={step.number} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold relative z-10">
                        {step.number}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2 font-inter">{step.title}</h3>
                    <p className="text-gray-600 text-sm">
                      {step.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Mobile view */}
          {isMobile && (
            <div className="md:hidden">
              <div className="space-y-8">
                {steps.map((step) => (
                  <div key={step.number} className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                      {step.number}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground mb-1 font-inter">{step.title}</h3>
                      <p className="text-gray-600 text-sm">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-12 text-center">
          <Button className="btn-primary px-8 py-3" asChild>
            <Link href="/register">Get Started Today</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
