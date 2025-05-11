import { GraduationCap, Calendar, Shield } from "lucide-react";

const WhyChooseUs = () => {
  return (
    <div className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 font-inter">Why Choose StudyMate?</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            We connect university students with experienced tutors for personalized learning that fits your schedule and budget.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-primary text-4xl mb-4 flex justify-center">
              <GraduationCap className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 font-inter">Verified University Tutors</h3>
            <p className="text-gray-600">
              All our tutors are verified students or graduates from top universities with proven expertise in their subjects.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-primary text-4xl mb-4 flex justify-center">
              <Calendar className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 font-inter">Flexible Scheduling</h3>
            <p className="text-gray-600">
              Book sessions when it's convenient for you. Our platform handles all scheduling and reminders.
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md text-center">
            <div className="text-primary text-4xl mb-4 flex justify-center">
              <Shield className="h-12 w-12" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3 font-inter">Secure Payments</h3>
            <p className="text-gray-600">
              Pay safely through our platform using JazzCash or EasyPaisa with full payment protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhyChooseUs;
