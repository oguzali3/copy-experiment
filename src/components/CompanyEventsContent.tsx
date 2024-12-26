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

  // Mock events data - in a real app, this would come from an API
  const events = [
    {
      id: 1,
      title: "Annual Shareholders Meeting",
      date: "2024-04-15",
      type: "Corporate Event",
      description: "Annual meeting to discuss company performance and future strategies.",
      location: "Virtual Event"
    },
    // ... more events would be added here
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