import { Star, StarHalf } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "I was struggling with Calculus II and about to drop the class until I found Michael on StudyBuddy. After just three sessions, I started to understand the concepts and eventually got an A- in the course!",
      name: "Emily Johnson",
      role: "Engineering Student",
      image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      rating: 5
    },
    {
      quote: "Priya is an excellent tutor! She helped me prepare for my Economics final and explained complex theories in a way that was easy to understand. The booking process was smooth and the price was very reasonable.",
      name: "Jason Kim",
      role: "Business Student",
      image: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      rating: 5
    },
    {
      quote: "Finding a good Computer Science tutor was challenging until I discovered StudyBuddy. David helped me with my programming assignments and explained the concepts behind the code, which improved my understanding dramatically.",
      name: "Aisha Mohammed",
      role: "Computer Science Student",
      image: "https://images.unsplash.com/photo-1534751516642-a1af1ef26a56?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      rating: 4.5
    }
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }
    
    return stars;
  };

  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-textColor font-inter mb-4">
            What Students Are Saying
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Hear from students who have improved their academic performance with the help of StudyBuddy tutors.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-4">
                <div className="text-yellow-400 flex">
                  {renderStars(testimonial.rating)}
                </div>
              </div>
              <p className="text-gray-700 italic mb-6">"{testimonial.quote}"</p>
              <div className="flex items-center">
                <img 
                  className="h-10 w-10 rounded-full object-cover mr-3" 
                  src={testimonial.image} 
                  alt={`${testimonial.name} testimonial`}
                />
                <div>
                  <p className="font-medium text-textColor">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
