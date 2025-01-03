import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";

interface TranscriptsContentProps {
  ticker?: string;
}

interface TranscriptDate {
  date: string;
  quarter: number;
  year: number;
}

interface Transcript {
  symbol: string;
  quarter: string;
  year: string;
  date: string;
  content: string;
}

export const TranscriptsContent = ({ ticker = "AAPL" }: TranscriptsContentProps) => {
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedQuarter, setSelectedQuarter] = useState<string>("");

  const { data: transcriptDates, isLoading: isLoadingDates } = useQuery({
    queryKey: ['transcript-dates', ticker],
    queryFn: async () => {
      console.log('Fetching transcript dates for:', ticker);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'transcript-dates', symbol: ticker }
      });
      if (error) {
        console.error('Error fetching transcript dates:', error);
        throw error;
      }
      console.log('Transcript dates received:', data);
      return data as TranscriptDate[];
    },
    enabled: !!ticker
  });

  const { data: transcript, isLoading: isLoadingTranscript } = useQuery({
    queryKey: ['transcript', ticker, selectedYear, selectedQuarter],
    queryFn: async () => {
      console.log('Fetching transcript for:', { ticker, selectedYear, selectedQuarter });
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'transcript',
          symbol: ticker,
          year: selectedYear,
          quarter: selectedQuarter
        }
      });
      if (error) {
        console.error('Error fetching transcript:', error);
        throw error;
      }
      console.log('Transcript received:', data);
      return data as Transcript[];
    },
    enabled: !!ticker && !!selectedYear && !!selectedQuarter
  });

  const years = transcriptDates 
    ? [...new Set(transcriptDates.map(date => date.year))].sort((a, b) => b - a)
    : [];

  const quarters = transcriptDates && selectedYear
    ? [...new Set(transcriptDates
        .filter(date => date.year === parseInt(selectedYear))
        .map(date => date.quarter))]
        .sort((a, b) => b - a)
    : [];

  if (isLoadingDates) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <Select
              value={selectedYear}
              onValueChange={(value) => {
                setSelectedYear(value);
                setSelectedQuarter("");
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quarter
            </label>
            <Select
              value={selectedQuarter}
              onValueChange={setSelectedQuarter}
              disabled={!selectedYear}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select quarter" />
              </SelectTrigger>
              <SelectContent>
                {quarters.map((quarter) => (
                  <SelectItem key={quarter} value={quarter.toString()}>
                    Q{quarter}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoadingTranscript ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : transcript && transcript.length > 0 ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {ticker} - Q{transcript[0].quarter} {transcript[0].year} Earnings Call Transcript
              </h3>
              <span className="text-sm text-gray-500">
                {new Date(transcript[0].date).toLocaleDateString()}
              </span>
            </div>
            <ScrollArea className="h-[600px] rounded-md border p-4">
              <div className="prose max-w-none">
                {transcript[0].content.split('\n').map((paragraph, index) => (
                  <p key={index} className="mb-4">
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : selectedYear && selectedQuarter ? (
          <div className="text-center text-gray-500 py-12">
            No transcript available for the selected period.
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12">
            Select a year and quarter to view the transcript.
          </div>
        )}
      </Card>
    </div>
  );
};