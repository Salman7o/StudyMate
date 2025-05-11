import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function CTASection() {
  const { isAuthenticated } = useAuth();
  
  return (
    <section className="py-16 bg-primary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold text-white font-inter mb-4">
              Ready to Boost Your Academic Performance?
            </h2>
            <p className="text-blue-100 mb-6 text-lg">
              Join thousands of students who have improved their grades with StudyBuddy's 
              peer tutoring platform.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/tutors">
                <Button variant="secondary" size="lg">
                  Find a Tutor Now
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
          <div className="hidden lg:block">
            <img 
              src="https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&h=500&q=80" 
              alt="Student receiving tutoring help" 
              className="rounded-lg shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
