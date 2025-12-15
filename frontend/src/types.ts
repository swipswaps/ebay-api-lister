export interface EbayItem {
  id: string;
  title: string;
  price: number;
  currency: string;
  image: string | null;
  url: string;
  date: string;
  condition: string;
  status: 'ACTIVE' | 'SOLD';
}

export interface SearchState {
  query: string;
  type: 'active' | 'sold';
  sort: 'price_asc' | 'price_desc' | 'date_desc';
}

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  conditions: string[]; // 'New', 'Used', 'Refurbished'
  freeShipping: boolean;
  localPickup: boolean;
  minFeedbackScore: string;
}

export interface ApiResult {
  total: number;
  items: EbayItem[];
}