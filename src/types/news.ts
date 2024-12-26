export interface NewsItem {
  id: number;
  title: string;
  date: string;
  source: string;
  summary: string;
  url: string;
}

export interface CompanyEvent extends NewsItem {
  type: 'earnings' | 'partnership' | 'expansion' | 'other';
}