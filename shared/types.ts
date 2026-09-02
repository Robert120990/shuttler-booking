export interface Country {
  id: string;
  name: string;
  slug: string;
  flag?: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  country_id: string;
  country_name?: string;
  country_slug?: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Shuttle {
  id: string;
  name: string;
  slug: string;
  origin_city_id: string;
  origin_name?: string;
  origin_slug?: string;
  destination_city_id: string;
  destination_name?: string;
  destination_slug?: string;
  price: number;
  duration_hours: number;
  schedule?: string;
  availability?: string;
  service_type: 'local' | 'international';
  description?: string;
  included?: string;
  to_bring?: string;
  luggage_policy?: string;
  extra_luggage_fee?: number;
  pets_allowed?: boolean;
  cancellation_policy?: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  created_at: string;
}

export interface Booking {
  id: string;
  user_id?: string;
  shuttle_id: string;
  shuttle_name?: string;
  date: string;
  pickup_location: string;
  dropoff_location: string;
  passenger_name?: string;
  passenger_email?: string;
  passenger_phone?: string;
  seats: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  question_en?: string;
  answer: string;
  answer_en?: string;
  category?: string;
  order?: number;
  created_at: string;
}
