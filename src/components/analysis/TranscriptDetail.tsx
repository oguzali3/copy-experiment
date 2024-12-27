import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TranscriptDetailProps {
  transcript: {
    event: string;
    date: string;
    fullText?: string;
  };
  onBack: () => void;
}

export const TranscriptDetail = ({ transcript, onBack }: TranscriptDetailProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">{transcript.event}</h2>
          <p className="text-sm text-gray-500">{transcript.date}</p>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] rounded-md border p-6">
        {transcript.fullText ? (
          <div className="prose max-w-none">
            {transcript.fullText.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph}</p>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Transcript content is not available for this event.</p>
        )}
      </ScrollArea>
    </div>
  );
};