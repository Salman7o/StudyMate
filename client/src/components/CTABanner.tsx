import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function CTABanner() {
  return (
    <div className="bg-primary">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
          <span className="block">Ready to boost your academic performance?</span>
          <span className="block text-blue-100">Join StudyConnect today.</span>
        </h2>
        <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0 flex-wrap gap-4">
          <div className="inline-flex rounded-md shadow">
            <Link href="/register">
              <Button variant="secondary" size="lg" className="bg-white text-primary hover:bg-gray-50">
                Sign Up Now
              </Button>
            </Link>
          </div>
          <div className="inline-flex rounded-md shadow">
            <Link href="/find-tutors">
              <Button size="lg" className="bg-blue-600 text-white hover:bg-blue-700">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
