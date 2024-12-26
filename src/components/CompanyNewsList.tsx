import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CompanyNewsCard } from "@/components/CompanyNewsCard";
import { useNavigate } from "react-router-dom";
import { NewsItem } from "@/types/news";

interface CompanyNewsListProps {
  newsData: NewsItem[];
}

export const CompanyNewsList = ({ newsData }: CompanyNewsListProps) => {
  const navigate = useNavigate();

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent News</h2>
        <Button 
          variant="ghost" 
          className="text-[#077dfa]"
          onClick={() => navigate('/news')}
        >
          View All
        </Button>
      </div>
      <div className="space-y-6">
        {newsData.map((news) => (
          <CompanyNewsCard key={news.id} news={news} />
        ))}
      </div>
    </Card>
  );
};