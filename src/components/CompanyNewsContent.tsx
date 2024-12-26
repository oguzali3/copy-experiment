import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";

interface CompanyNewsContentProps {
  ticker?: string;
}

export const CompanyNewsContent = ({ ticker }: CompanyNewsContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const newsPerPage = 15;

  // Mock news data - in a real app, this would come from an API
  const news = [
    {
      id: 1,
      title: `Latest Quarterly Results Show Strong Growth`,
      date: "2024-03-15",
      source: "Financial Times",
      summary: `The company reported quarterly earnings that exceeded analyst expectations, driven by strong product sales and market expansion.`,
      url: "#"
    },
    // ... more news items would be added here
  ];

  const totalPages = Math.ceil(news.length / newsPerPage);
  const currentNews = news.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage);

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Company News</h2>
      </div>
      <div className="space-y-6">
        {currentNews.map((item) => (
          <div key={item.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900 hover:text-[#077dfa] cursor-pointer">
                {item.title}
              </h3>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{item.date}</span>
            </div>
            <p className="text-gray-600 mb-2">{item.summary}</p>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">Source: {item.source}</span>
              <Button variant="link" className="text-[#077dfa] p-0 h-auto ml-4">
                Read More →
              </Button>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => setCurrentPage(page)}
                  isActive={currentPage === page}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </Card>
  );
};