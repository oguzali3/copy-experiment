import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";
import { Card } from "@/components/ui/card";
import { CompanyNewsCard } from "@/components/CompanyNewsCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { NewsItem, CompanyEvent } from "@/types/news";

const News = () => {
  const [currentNewsPage, setCurrentNewsPage] = useState(1);
  const [currentEventsPage, setCurrentEventsPage] = useState(1);
  const itemsPerPage = 15;

  // Simulated data - in a real app, this would come from an API
  const allNews: NewsItem[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Company News Item ${i + 1}`,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    source: ['Bloomberg', 'Reuters', 'Financial Times'][i % 3],
    summary: `This is a summary of news item ${i + 1}. It contains important information about the company's latest developments.`,
    url: '#'
  }));

  const allEvents: CompanyEvent[] = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1,
    title: `Company Event ${i + 1}`,
    date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    source: 'Company Calendar',
    summary: `This is a description of event ${i + 1}. It details important company milestones and announcements.`,
    url: '#',
    type: ['earnings', 'partnership', 'expansion', 'other'][i % 4] as CompanyEvent['type']
  }));

  const paginateItems = (items: NewsItem[] | CompanyEvent[], page: number) => {
    const start = (page - 1) * itemsPerPage;
    return items.slice(start, start + itemsPerPage);
  };

  const currentNews = paginateItems(allNews, currentNewsPage);
  const currentEvents = paginateItems(allEvents, currentEventsPage);
  const totalNewsPages = Math.ceil(allNews.length / itemsPerPage);
  const totalEventsPages = Math.ceil(allEvents.length / itemsPerPage);

  return (
    <AuthenticatedLayout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* News Section */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Latest News</h2>
          <div className="space-y-6">
            {currentNews.map((news) => (
              <CompanyNewsCard key={news.id} news={news} />
            ))}
          </div>
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentNewsPage(p => Math.max(1, p - 1))}
                  className={currentNewsPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalNewsPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentNewsPage(page)}
                    isActive={currentNewsPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentNewsPage(p => Math.min(totalNewsPages, p + 1))}
                  className={currentNewsPage === totalNewsPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Card>

        {/* Events Section */}
        <Card className="p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Recent Events</h2>
          <div className="space-y-6">
            {currentEvents.map((event) => (
              <CompanyNewsCard key={event.id} news={event} />
            ))}
          </div>
          <Pagination className="mt-6">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  onClick={() => setCurrentEventsPage(p => Math.max(1, p - 1))}
                  className={currentEventsPage === 1 ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
              {Array.from({ length: totalEventsPages }, (_, i) => i + 1).map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    onClick={() => setCurrentEventsPage(page)}
                    isActive={currentEventsPage === page}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext 
                  onClick={() => setCurrentEventsPage(p => Math.min(totalEventsPages, p + 1))}
                  className={currentEventsPage === totalEventsPages ? 'pointer-events-none opacity-50' : ''}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
};

export default News;
