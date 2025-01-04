export interface Filing {
  symbol: string;
  type: string;
  link: string;
  finalLink: string;
  acceptedDate: string;
  fillingDate: string;
}

export interface FilingData {
  [key: string]: Filing[];
}