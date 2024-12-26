import { Card } from "@/components/ui/card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState } from "react";
import { Button } from "./ui/button";

interface CompanyEventsContentProps {
  ticker?: string;
}

export const CompanyEventsContent = ({ ticker }: CompanyEventsContentProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 15;

  const events = [
    {
      id: 1,
      title: "Annual Shareholders Meeting",
      date: "2024-04-15",
      type: "Corporate Event",
      description: "Annual meeting to discuss company performance and future strategies.",
      location: "Virtual Event"
    },
    {
      id: 2,
      title: "Q1 2024 Earnings Call",
      date: "2024-04-20",
      type: "Earnings",
      description: "Quarterly earnings call with investors and analysts.",
      location: "Conference Call"
    },
    {
      id: 3,
      title: "Innovation Summit 2024",
      date: "2024-05-10",
      type: "Conference",
      description: "Showcase of new technologies and product roadmap.",
      location: "San Francisco, CA"
    },
    {
      id: 4,
      title: "Investor Day 2024",
      date: "2024-06-01",
      type: "Investor Relations",
      description: "Comprehensive presentation of company strategy and outlook.",
      location: "New York, NY"
    },
    {
      id: 5,
      title: "Product Launch Event",
      date: "2024-06-15",
      type: "Product Launch",
      description: "Launch of new flagship products and services.",
      location: "Cupertino, CA"
    },
    {
      id: 6,
      title: "Sustainability Conference",
      date: "2024-07-01",
      type: "ESG Event",
      description: "Discussion of environmental initiatives and goals.",
      location: "Virtual Event"
    },
    {
      id: 7,
      title: "Tech Conference Keynote",
      date: "2024-07-15",
      type: "Conference",
      description: "CEO keynote speech at major tech conference.",
      location: "Las Vegas, NV"
    },
    {
      id: 8,
      title: "Q2 2024 Earnings Call",
      date: "2024-07-20",
      type: "Earnings",
      description: "Quarterly financial results presentation.",
      location: "Conference Call"
    },
    {
      id: 9,
      title: "Developer Conference",
      date: "2024-08-05",
      type: "Conference",
      description: "Annual developer conference and workshops.",
      location: "Seattle, WA"
    },
    {
      id: 10,
      title: "Industry Leadership Forum",
      date: "2024-08-20",
      type: "Corporate Event",
      description: "Panel discussions on industry trends and innovation.",
      location: "Chicago, IL"
    },
    {
      id: 11,
      title: "Global Partner Summit",
      date: "2024-09-10",
      type: "Partnership Event",
      description: "Meeting with global partners and stakeholders.",
      location: "London, UK"
    },
    {
      id: 12,
      title: "Research Symposium",
      date: "2024-09-25",
      type: "Research Event",
      description: "Presentation of research initiatives and breakthroughs.",
      location: "Boston, MA"
    },
    {
      id: 13,
      title: "Q3 2024 Earnings Call",
      date: "2024-10-20",
      type: "Earnings",
      description: "Quarterly earnings presentation and analyst Q&A.",
      location: "Conference Call"
    },
    {
      id: 14,
      title: "Annual Innovation Awards",
      date: "2024-11-05",
      type: "Awards Ceremony",
      description: "Recognition of outstanding innovations and achievements.",
      location: "San Jose, CA"
    },
    {
      id: 15,
      title: "Winter Product Showcase",
      date: "2024-11-20",
      type: "Product Launch",
      description: "Showcase of winter product lineup and features.",
      location: "New York, NY"
    },
    {
      id: 16,
      title: "End of Year Town Hall",
      date: "2024-12-15",
      type: "Corporate Event",
      description: "Company-wide meeting to review year achievements.",
      location: "Virtual Event"
    },
    {
      id: 17,
      title: "Strategic Planning Summit",
      date: "2024-12-20",
      type: "Corporate Event",
      description: "Executive meeting for 2025 strategy planning.",
      location: "Miami, FL"
    },
    {
      id: 18,
      title: "New Year Leadership Conference",
      date: "2025-01-10",
      type: "Conference",
      description: "Leadership conference for upcoming year planning.",
      location: "Austin, TX"
    }
  ];

  const totalPages = Math.ceil(events.length / eventsPerPage);
  const currentEvents = events.slice((currentPage - 1) * eventsPerPage, currentPage * eventsPerPage);

  return (
    <Card className="p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Recent Events</h2>
      </div>
      <div className="space-y-6">
        {currentEvents.map((event) => (
          <div key={event.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-medium text-gray-900">
                {event.title}
              </h3>
              <span className="text-sm text-gray-500 whitespace-nowrap ml-4">{event.date}</span>
            </div>
            <p className="text-gray-600 mb-2">{event.description}</p>
            <div className="flex items-center text-sm">
              <span className="text-gray-500">{event.type}</span>
              <span className="mx-2">•</span>
              <span className="text-gray-500">{event.location}</span>
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