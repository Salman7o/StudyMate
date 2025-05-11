import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const CTASection = () => {
  return (
    <div className="bg-primary py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl font-bold text-white mb-6 font-inter">Ready to Boost Your Grades?</h2>
        <p className="text-xl text-white mb-8 max-w-3xl mx-auto">
          Join thousands of students who are excelling in their courses with the help of qualified tutors.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="btn-accent rounded-md px-8 py-3 text-base font-medium shadow-sm" asChild>
            <Link href="/tutors">Find a Tutor Now</Link>
          </Button>
          <Button className="bg-white text-primary hover:bg-gray-50 rounded-md px-8 py-3 text-base font-medium shadow-sm" asChild>
            <Link href="/register?type=tutor">Become a Tutor</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
