export interface Alcohol {
  id: number;
  name: string;
  type: string;
  rating: number;
  reviews: number;
  image: string;
  description: string;
  tags: string[];
}

export type AlcoholCategory = 'all' | 'wine' | 'spirits' | 'whisky' | 'cocktails';
