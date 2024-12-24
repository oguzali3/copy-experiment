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
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-black to-[#1EAEDB] text-transparent bg-clip-text relative inline-block">
          Make Smarter Investment Decisions
          <span className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-gradient-to-r from-black/60 to-[#1EAEDB]/60 rounded-full transform skew-x-12"></span>
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto font-medium">
          Advanced stock analysis and research tools powered by real-time data and AI insights
        </p>
        <div className="flex justify-center mb-12">
          <div className="bg-black/95 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all">
            <EmailSignup />
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-black to-[#1EAEDB] text-transparent bg-clip-text">Real-Time Market Insights</h2>
        <LiveStockData />
        <div className="mt-8">
          <StockChart />
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-black to-[#1EAEDB] text-transparent bg-clip-text">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Advanced Analytics</h3>
            <p className="text-gray-600">Powerful tools for deep market analysis and trend identification</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">Real-Time Data</h3>
            <p className="text-gray-600">Live market data and instant updates for informed decisions</p>
          </div>
          <div className="text-center p-6 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900">AI-Powered Insights</h3>
            <p className="text-gray-600">Machine learning algorithms to identify market opportunities</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16 bg-gray-50 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-black to-[#1EAEDB] text-transparent bg-clip-text">What Our Users Say</h2>
        <Testimonials />
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-black to-[#1EAEDB] text-transparent bg-clip-text">Ready to Transform Your Investment Strategy?</h2>
        <p className="text-xl text-gray-600 mb-8">Join thousands of investors making data-driven decisions</p>
        <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-black to-[#1EAEDB] hover:from-black/90 hover:to-[#1EAEDB]/90 text-white">
          Get Started Now
        </Button>
      </section>
    </div>
  );
};

export default Index;