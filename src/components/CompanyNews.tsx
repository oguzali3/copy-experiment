import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

interface NewsItem {
  id: number;
  title: string;
  date: string;
  source: string;
  summary: string;
  url: string;
}

interface CompanyNewsProps {
  companyData: {
    ticker: string;
  };
  newsData: NewsItem[];
}

export const CompanyNews = ({ companyData, newsData }: CompanyNewsProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent News</h2>
        <Button 
          variant="ghost" 
          className="text-[#077dfa]"
          onClick={() => navigate(`/company/${companyData.ticker}/news`)}
        >
          View All
        </Button>
      </div>
      <div className="space-y-6">
        {newsData.map((news) => (
          <div key={news.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900 hover:text-[#077dfa] cursor-pointer">
                {news.title}
              </h3>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{news.date}</span>
            </div>
            <p className="text-gray-600 mb-2">{news.summary}</p>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">Source: {news.source}</span>
              <Button variant="link" className="text-[#077dfa] p-0 h-auto ml-4">
                Read More →
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};