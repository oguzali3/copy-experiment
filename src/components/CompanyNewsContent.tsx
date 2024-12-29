import { Card } from "@/components/ui/card";
import { NewsItem } from "@/components/news/NewsItem";
import { NewsPagination } from "@/components/news/NewsPagination";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface CompanyNewsContentProps {
  ticker?: string;
  limit?: number;
}

interface NewsItem {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
}

export const CompanyNewsContent = ({ ticker, limit }: CompanyNewsContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = limit || 15;

  const { data: news = [], isLoading } = useQuery({
    queryKey: ['company-news', ticker, currentPage],
    queryFn: async () => {
      if (!ticker) return [];
      
      const today = new Date();
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(today.getMonth() - 3);

      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'company-news',
          symbol: ticker,
          from: format(threeMonthsAgo, 'yyyy-MM-dd'),
          to: format(today, 'yyyy-MM-dd'),
          page: currentPage
        }
      });

      if (error) throw error;
      return data || [];
    },
    enabled: !!ticker
  });

  const totalPages = Math.ceil(news.length / newsPerPage);
  const currentNews = limit ? news.slice(0, limit) : news.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage);

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Company News for {ticker}</h2>
      </div>
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4">Loading news...</div>
        ) : currentNews.length > 0 ? (
          currentNews.map((item: NewsItem) => (
            <NewsItem
              key={`${item.symbol}-${item.publishedDate}-${item.title}`}
              title={item.title}
              date={format(new Date(item.publishedDate), 'yyyy-MM-dd')}
              source={item.site}
              summary={item.text}
              url={item.url}
            />
          ))
        ) : (
          <div className="text-center py-4">No news available for {ticker}</div>
        )}
      </div>
      {!limit && news.length > newsPerPage && (
        <div className="mt-6">
          <NewsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </Card>
  );
};