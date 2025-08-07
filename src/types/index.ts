export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  stock: number;
  buyPrice: number;
  retailPrice: number;
  resellerPrice: number;
  barcode: string;
  imageUrl: string;
  entryDate: string;
  supplierId: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  user_profiles: {
    full_name: string;
    avatar_url: string;
  } | null;
}

export interface Advertisement {
  id: string;
  image_url: string;
  alt_text: string;
  link_url: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  placement: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  image_url: string;
  slug: string;
  status: 'draft' | 'published';
  published_at: string;
  author_id: string;
  author?: {
    full_name: string;
  };
}