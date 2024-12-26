import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewsItem } from "@/types/news";

interface CompanyNewsCardProps {
  news: NewsItem;
}

export const CompanyNewsCard = ({ news }: CompanyNewsCardProps) => {
  return (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
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
  );
};