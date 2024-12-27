export interface Transcript {
  id: string;
  event: string;
  date: string;
  fullText?: string;
}

export interface TranscriptData {
  [key: string]: Transcript[];
}