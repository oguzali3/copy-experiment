import { EmailSignup } from "@/components/EmailSignup";
import { StockChart } from "@/components/StockChart";
import { LiveStockData } from "@/components/LiveStockData";
import { Testimonials } from "@/components/Testimonials";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 text-[#111827] relative inline-block">
          Make Smarter Investment <span className="text-[#0EA5E9]">Decisions</span>
          <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-[#0EA5E9]/60 rounded-full transform skew-x-12"></span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-[#111827]/80 max-w-2xl mx-auto font-medium">
          Advanced stock analysis and research tools powered by real-time data and AI insights
        </p>
        <div className="flex justify-center mb-12">
          <div className="bg-[#111827] backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <EmailSignup />
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#111827]">Real-Time Market <span className="text-[#0EA5E9]">Insights</span></h2>
        <LiveStockData />
        <div className="mt-8">
          <StockChart />
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#111827]">Why Choose Our <span className="text-[#0EA5E9]">Platform?</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-[#111827]">Advanced Analytics</h3>
            <p className="text-gray-600">Powerful tools for deep market analysis and trend identification</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-[#111827]">Real-Time Data</h3>
            <p className="text-gray-600">Live market data and instant updates for informed decisions</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-[#111827]">AI-Powered Insights</h3>
            <p className="text-gray-600">Machine learning algorithms to identify market opportunities</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#111827]">What Our <span className="text-[#0EA5E9]">Users Say</span></h2>
        <Testimonials />
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 text-[#111827]">Ready to Transform Your <span className="text-[#0EA5E9]">Investment Strategy?</span></h2>
        <p className="text-xl text-gray-600 mb-8">Join thousands of investors making data-driven decisions</p>
        <Button size="lg" className="text-lg px-8 bg-[#0EA5E9] hover:bg-[#0EA5E9]/90 text-white">
          Get Started Now
        </Button>
      </section>
    </div>
  );
};

export default Index;
