import { EmailSignup } from "@/components/EmailSignup";
import { StockChart } from "@/components/StockChart";
import { LiveStockData } from "@/components/LiveStockData";
import { Testimonials } from "@/components/Testimonials";
import { Button } from "@/components/ui/button";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#1A1F2C] text-white">
      {/* Hero Section */}
      <section className="container py-20 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-300 text-transparent bg-clip-text">
          Make Smarter Investment Decisions
        </h1>
        <p className="text-xl md:text-2xl mb-8 text-gray-300 max-w-2xl mx-auto">
          Advanced stock analysis and research tools powered by real-time data and AI insights
        </p>
        <div className="flex justify-center mb-12">
          <EmailSignup />
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="container py-16 bg-white/5 rounded-lg backdrop-blur-sm">
        <h2 className="text-3xl font-bold text-center mb-8">Real-Time Market Insights</h2>
        <LiveStockData />
        <div className="mt-8">
          <StockChart />
        </div>
      </section>

      {/* Features */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Our Platform?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
            <p className="text-gray-300">Powerful tools for deep market analysis and trend identification</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Data</h3>
            <p className="text-gray-300">Live market data and instant updates for informed decisions</p>
          </div>
          <div className="text-center p-6">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-gray-300">Machine learning algorithms to identify market opportunities</p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container py-16">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <Testimonials />
      </section>

      {/* CTA */}
      <section className="container py-20 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Investment Strategy?</h2>
        <p className="text-xl text-gray-300 mb-8">Join thousands of investors making data-driven decisions</p>
        <Button size="lg" className="text-lg px-8">
          Get Started Now
        </Button>
      </section>
    </div>
  );
};

export default Index;