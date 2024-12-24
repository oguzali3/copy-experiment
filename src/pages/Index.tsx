import { EmailSignup } from "@/components/EmailSignup";
import { StockChart } from "@/components/StockChart";
import { LiveStockData } from "@/components/LiveStockData";
import { Testimonials } from "@/components/Testimonials";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Header />
      {/* Hero Section */}
      <section className="container pt-32 pb-20 text-center relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Top left - Bar Chart */}
          <div className="absolute top-12 left-10 w-32 h-24 bg-gray-50/80 rounded-xl shadow-sm p-4 animate-fade-in">
            <div className="h-full flex items-end gap-1">
              {[4,6,5,7,6,8].map((height, i) => (
                <div 
                  key={i}
                  className="flex-1 bg-[#077dfa]/60 rounded-t animate-[number-counter_0.5s_ease-out_forwards] delay-100"
                  style={{ height: `${height * 8}px`, animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
          </div>
          
          {/* Top right - Line Chart */}
          <div className="absolute top-16 right-20 w-40 h-28 bg-gray-50/80 rounded-xl shadow-sm p-4 animate-fade-in delay-200">
            <svg className="w-full h-full text-[#077dfa]/60" viewBox="0 0 100 50">
              <path
                d="M0,40 C20,35 40,25 60,30 S80,20 100,10"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
                className="animate-[slide-in-right_1s_ease-out_forwards]"
                strokeDasharray="200"
                strokeDashoffset="200"
                style={{
                  animation: "slide-in-right 1s ease-out forwards, dash 2s ease-out forwards",
                }}
              />
            </svg>
          </div>
          
          {/* Middle - Pie Chart */}
          <div className="absolute top-1/3 left-24 w-36 h-36 bg-gray-50/80 rounded-xl shadow-sm p-4 animate-fade-in delay-300">
            <svg className="w-full h-full text-[#077dfa]/60" viewBox="0 0 32 32">
              <circle 
                cx="16" 
                cy="16" 
                r="12" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
                className="animate-[scale-in_1s_ease-out_forwards]"
              />
              <path 
                d="M16 4 A12 12 0 0 1 28 16" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3"
                className="animate-[scale-in_1s_ease-out_forwards] delay-200"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#111827] relative inline-block font-sans">
          Make Smarter Investment <span className="text-[#077dfa]">Decisions</span>
          <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#077dfa]/60 rounded-full transform skew-x-12"></span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-[#111827]/80 max-w-2xl mx-auto font-medium font-sans">
          Advanced stock analysis and research tools powered by real-time data and AI insights
        </p>
        <div className="flex justify-center mb-12">
          <Button size="lg" className="text-lg px-8 bg-[#111827] hover:bg-[#111827]/90 text-white font-sans">
            Get Started
          </Button>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#111827] font-sans">Real-Time Market <span className="text-[#077dfa]">Insights</span></h2>
        <LiveStockData />
        <div className="mt-8">
          <StockChart />
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#111827] font-sans">Why Choose Our <span className="text-[#077dfa]">Platform?</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-[#111827] font-sans">Advanced Analytics</h3>
            <p className="text-gray-600 font-sans">Powerful tools for deep market analysis and trend identification</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-[#111827] font-sans">Real-Time Data</h3>
            <p className="text-gray-600 font-sans">Live market data and instant updates for informed decisions</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-[#111827] font-sans">AI-Powered Insights</h3>
            <p className="text-gray-600 font-sans">Machine learning algorithms to identify market opportunities</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#111827] font-sans">What Our <span className="text-[#077dfa]">Users Say</span></h2>
        <Testimonials />
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#111827] font-sans">Ready to Transform Your <span className="text-[#077dfa]">Investment Strategy?</span></h2>
        <p className="text-xl text-gray-600 mb-8 font-sans">Join thousands of investors making data-driven decisions</p>
        <Button size="lg" className="text-lg px-8 bg-[#077dfa] hover:bg-[#077dfa]/90 text-white font-sans">
          Get Started Now
        </Button>
      </section>
    </div>
  );
};

export default Index;