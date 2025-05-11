import { 
  GraduationCap, 
  CalendarCheck, 
  MessageSquare, 
  ShieldCheck, 
  Star, 
  TrendingUp 
} from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      icon: <GraduationCap className="text-xl" />,
      title: "Peer-to-Peer Learning",
      description: "Connect with tutors who have aced the same courses you're taking. They understand the course material and your university's specific requirements."
    },
    {
      icon: <CalendarCheck className="text-xl" />,
      title: "Flexible Scheduling",
      description: "Book sessions that fit your schedule. Study when it's convenient for you with our easy-to-use booking system."
    },
    {
      icon: <MessageSquare className="text-xl" />,
      title: "Direct Communication",
      description: "Chat directly with tutors to discuss your needs, share materials, and prepare for your sessions."
    },
    {
      icon: <ShieldCheck className="text-xl" />,
      title: "Secure Payments",
      description: "Pay securely through our integrated payment system. No need to worry about cash or direct transfers."
    },
    {
      icon: <Star className="text-xl" />,
      title: "Verified Reviews",
      description: "Read authentic reviews from other students who have worked with the tutors to make informed decisions."
    },
    {
      icon: <TrendingUp className="text-xl" />,
      title: "Track Progress",
      description: "Monitor your academic improvement with session summaries and progress tracking tools."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-textColor font-inter mb-4">
            Why Choose StudyBuddy?
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our platform connects you with qualified peer tutors from your university who 
            understand your curriculum and can help you excel.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-background rounded-lg p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-primary mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-textColor font-inter mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
