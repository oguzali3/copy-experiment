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

  const news = [
    {
      id: 1,
      title: `Latest Quarterly Results Show Strong Growth`,
      date: "2024-03-15",
      source: "Financial Times",
      summary: `The company reported quarterly earnings that exceeded analyst expectations, driven by strong product sales and market expansion.`,
      url: "#"
    },
    {
      id: 2,
      title: "Strategic Partnership Announcement",
      date: "2024-03-14",
      source: "Reuters",
      summary: "A new strategic partnership has been formed to enhance market presence and develop cutting-edge technologies.",
      url: "#"
    },
    {
      id: 3,
      title: "Expansion into Asian Markets",
      date: "2024-03-13",
      source: "Bloomberg",
      summary: "Plans revealed for significant expansion in key Asian markets, including new facilities and workforce growth.",
      url: "#"
    },
    {
      id: 4,
      title: "Innovation Award Recognition",
      date: "2024-03-12",
      source: "TechCrunch",
      summary: "The company received prestigious innovation awards for breakthrough technologies.",
      url: "#"
    },
    {
      id: 5,
      title: "Sustainability Initiative Launch",
      date: "2024-03-11",
      source: "WSJ",
      summary: "New sustainability program announced with ambitious environmental goals.",
      url: "#"
    },
    {
      id: 6,
      title: "Q4 Revenue Projections",
      date: "2024-03-10",
      source: "CNBC",
      summary: "Analysts update revenue projections following strong Q3 performance.",
      url: "#"
    },
    {
      id: 7,
      title: "New Product Line Announcement",
      date: "2024-03-09",
      source: "The Verge",
      summary: "Revolutionary new product line unveiled at annual showcase event.",
      url: "#"
    },
    {
      id: 8,
      title: "Executive Leadership Changes",
      date: "2024-03-08",
      source: "Fortune",
      summary: "Key executive appointments announced to strengthen leadership team.",
      url: "#"
    },
    {
      id: 9,
      title: "Market Share Growth",
      date: "2024-03-07",
      source: "MarketWatch",
      summary: "Company reports significant market share gains in key segments.",
      url: "#"
    },
    {
      id: 10,
      title: "Research & Development Investment",
      date: "2024-03-06",
      source: "Reuters",
      summary: "Major R&D investment announced for next-generation technologies.",
      url: "#"
    },
    {
      id: 11,
      title: "Global Supply Chain Updates",
      date: "2024-03-05",
      source: "Supply Chain Digital",
      summary: "Strategic improvements to global supply chain operations revealed.",
      url: "#"
    },
    {
      id: 12,
      title: "Customer Satisfaction Milestone",
      date: "2024-03-04",
      source: "Business Insider",
      summary: "Record-breaking customer satisfaction scores reported in latest survey.",
      url: "#"
    },
    {
      id: 13,
      title: "Digital Transformation Progress",
      date: "2024-03-03",
      source: "CIO Magazine",
      summary: "Major milestones achieved in company-wide digital transformation initiative.",
      url: "#"
    },
    {
      id: 14,
      title: "Regulatory Compliance Achievement",
      date: "2024-03-02",
      source: "Compliance Weekly",
      summary: "Company receives top marks in regulatory compliance assessment.",
      url: "#"
    },
    {
      id: 15,
      title: "Employee Development Program",
      date: "2024-03-01",
      source: "HR Daily",
      summary: "Launch of comprehensive employee development and training program.",
      url: "#"
    },
    {
      id: 16,
      title: "International Awards Recognition",
      date: "2024-02-29",
      source: "Global Business Review",
      summary: "Multiple international awards received for business excellence.",
      url: "#"
    },
    {
      id: 17,
      title: "Community Impact Initiative",
      date: "2024-02-28",
      source: "CSR Weekly",
      summary: "New community support programs launched in key markets.",
      url: "#"
    },
    {
      id: 18,
      title: "Technology Patent Approval",
      date: "2024-02-27",
      source: "Tech Review",
      summary: "Strategic technology patents approved for innovative solutions.",
      url: "#"
    }
  ];

  const totalPages = Math.ceil(news.length / newsPerPage);
  const currentNews = news.slice((currentPage - 1) * newsPerPage, currentPage * newsPerPage);

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Company News for {ticker}</h2>
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
