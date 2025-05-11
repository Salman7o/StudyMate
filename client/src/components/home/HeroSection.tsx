import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function HeroSection() {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white font-inter mb-4">
              Find the Perfect Tutor for Your Academic Journey
            </h2>
            <p className="text-blue-100 text-lg mb-6">
              Connect with experienced tutors from your university who understand your 
              curriculum and can help you excel in your studies.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tutors">
                <Button variant="secondary" size="lg">
                  Find Tutors
                </Button>
              </Link>
              {!isAuthenticated ? (
                <Link href="/register?type=tutor">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700">
                    Become a Tutor
                  </Button>
                </Link>
              ) : (
                <Link href="/become-tutor">
                  <Button variant="outline" size="lg" className="border-white text-white hover:bg-blue-700">
                    Become a Tutor
                  </Button>
                </Link>
              )}
            </div>
          </div>
          <div className="hidden md:block">
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80" 
              alt="University students collaborating on studies" 
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
