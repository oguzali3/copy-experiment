import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Investment Analyst",
    content: "This platform has revolutionized how I analyze stocks. The real-time data and intuitive interface save me hours every day.",
    avatar: "SJ"
  },
  {
    name: "Michael Chen",
    role: "Day Trader",
    content: "The advanced analytics tools have given me an edge in the market. Best investment research platform I've used.",
    avatar: "MC"
  },
  {
    name: "Emily Rodriguez",
    role: "Portfolio Manager",
    content: "Incredible depth of analysis combined with an easy-to-use interface. It's become an essential part of my daily workflow.",
    avatar: "ER"
  }
];

export const Testimonials = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {testimonials.map((testimonial) => (
        <Card 
          key={testimonial.name} 
          className="p-6 bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 transform"
        >
          <div className="flex items-start space-x-4">
            <Avatar>
              <AvatarFallback className="bg-gradient-to-r from-[#1EAEDB] to-[#33C3F0] text-white">
                {testimonial.avatar}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
              <p className="text-sm text-gray-600">{testimonial.role}</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-700">{testimonial.content}</p>
        </Card>
      ))}
    </div>
  );
};