import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import StarRating from "@/components/ui/star-rating";

const testimonials = [
  {
    id: 1,
    name: "Ali Hassan",
    role: "Computer Science, 3rd Year",
    image: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    rating: 5,
    text: "I was struggling with my Data Structures course until I found Sarah on StudyMate. Her explanations made complex concepts easy to understand. My grades improved from a C to an A-!"
  },
  {
    id: 2,
    name: "Ayesha Khan",
    role: "Information Technology, 2nd Year",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    rating: 5,
    text: "David helped me learn JavaScript from scratch for my web development project. He was patient and provided excellent resources. I ended up with the highest grade in my class!"
  },
  {
    id: 3,
    name: "Usman Ahmed",
    role: "Software Engineering, 4th Year",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
    rating: 4.5,
    text: "I needed help with database design for my project. Michael not only helped me understand SQL better but also guided me through practical implementation. The booking process was seamless!"
  }
];

const Testimonials = () => {
  return (
    <div className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4 font-inter">What Students Say</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Hear from students who have improved their grades and confidence with StudyMate.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="mb-4">
                <StarRating rating={testimonial.rating} size="md" />
              </div>
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <Avatar className="h-10 w-10 mr-3">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
