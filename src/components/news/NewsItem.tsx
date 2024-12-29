import { Button } from "@/components/ui/button";

interface NewsItemProps {
  title: string;
  date: string;
  source: string;
  summary: string;
  url: string;
}

export const NewsItem = ({ title, date, source, summary, url }: NewsItemProps) => {
  const handleReadMore = (url: string) => {
    if (url && url.startsWith('http')) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-medium text-gray-900 hover:text-[#077dfa] cursor-pointer">
          {title}
        </h3>
        <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{date}</span>
      </div>
      <p className="text-gray-600 mb-2">{summary}</p>
      <div className="flex items-center text-sm">
        <span className="text-gray-500">Source: {source}</span>
        <Button 
          variant="link" 
          className="text-[#077dfa] p-0 h-auto ml-4"
          onClick={() => handleReadMore(url)}
        >
          Read More →
        </Button>
      </div>
    </div>
  );
};