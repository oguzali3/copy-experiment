import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from "lucide-react";
import type { Transcript } from "@/hooks/useTranscript";

interface TranscriptViewerProps {
  transcript: Transcript[] | undefined;
  isLoading: boolean;
  selectedYear: string;
  selectedQuarter: string;
}

export const TranscriptViewer = ({
  transcript,
  isLoading,
  selectedYear,
  selectedQuarter
}: TranscriptViewerProps) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!transcript && selectedYear && selectedQuarter) {
    return (
      <div className="text-center text-gray-500 py-12">
        No transcript available for the selected period.
      </div>
    );
  }

  if (!selectedYear || !selectedQuarter) {
    return (
      <div className="text-center text-gray-500 py-12">
        Select a year and quarter to view the transcript.
      </div>
    );
  }

  return transcript && transcript.length > 0 ? (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {transcript[0].symbol} - Q{transcript[0].quarter} {transcript[0].year} Earnings Call Transcript
        </h3>
        <span className="text-sm text-gray-500">
          {new Date(transcript[0].date).toLocaleDateString()}
        </span>
      </div>
      <ScrollArea className="h-[600px] rounded-md border p-4">
        <div className="prose max-w-none dark:prose-invert">
          {transcript[0].content && typeof transcript[0].content === 'string' 
            ? transcript[0].content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))
            : <p>No content available</p>
          }
        </div>
      </ScrollArea>
    </div>
  ) : null;
};