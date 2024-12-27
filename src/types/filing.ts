export interface Filing {
  id: string;
  type: string;
  title: string;
  date: string;
  form: string;
  description: string;
  url: string;
}

export interface FilingData {
  [key: string]: Filing[];
}