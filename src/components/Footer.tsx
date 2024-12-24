export const Footer = () => {
  return (
    <footer className="bg-black border-t border-border/10">
      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-4">
            <span className="text-2xl font-bold text-[#077dfa]">Logo</span>
            <p className="text-muted-foreground">
              Advanced stock analysis and research tools for smarter investment decisions.
            </p>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a href="#help" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#youtube" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  YouTube Channel
                </a>
              </li>
              <li>
                <a href="#blog" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#affiliate" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  Affiliate Program
                </a>
              </li>
            </ul>
          </div>

          {/* Compare */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Compare</h3>
            <ul className="space-y-2">
              <li>
                <a href="#bloomberg" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  Bloomberg
                </a>
              </li>
              <li>
                <a href="#yahoo" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  Yahoo Finance
                </a>
              </li>
              <li>
                <a href="#tradingview" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  TradingView
                </a>
              </li>
              <li>
                <a href="#ycharts" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  YCharts
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#careers" className="text-muted-foreground hover:text-[#077dfa] transition-colors">
                  Careers
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t border-border/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2024 All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="#privacy" className="text-sm text-muted-foreground hover:text-[#077dfa] transition-colors">
                Privacy Policy
              </a>
              <a href="#terms" className="text-sm text-muted-foreground hover:text-[#077dfa] transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
