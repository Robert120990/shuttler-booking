export interface Country {
  id: string;
  name: string;
  slug: string;
  flag?: string;
  description?: string;
  image_url?: string;
  cities?: City[];
  created_at: string;
}

export interface City {
  id: string;
  name: string;
  slug: string;
  country_id?: string;
  country?: Country;
  country_name?: string;
  country_slug?: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Hostel {
  id: string;
  name: string;
  city_id: string;
  city_name?: string;
  city_slug?: string;
  country_name?: string;
  country_slug?: string;
  address?: string;
  phone?: string;
  created_at: string;
}

export interface Shuttle {
  id: string;
  name: string;
  slug: string;
  origin_city_id: string;
  origin_name?: string;
  origin_slug?: string;
  origin_city?: City;
  destination_city_id: string;
  destination_name?: string;
  destination_slug?: string;
  destination_city?: City;
  price: number;
  duration_hours: number;
  schedule?: string;
  availability?: string;
  availability_days?: number[] | string;
  service_type: 'local' | 'international';
  description?: string;
  included?: string;
  to_bring?: string;
  luggage_policy?: string;
  luggage_options?: LuggageOption[] | string;
  pickup_info?: string;
  pets_allowed?: boolean;
  cancellation_policy?: string;
  operator?: string;
  image_url?: string;
  rating?: number;
  review_count?: number;
  created_at: string;
}

export interface LuggageOption {
  name: string;
  price: number;
}

export interface Booking {
  id: string;
  user_id?: string;
  user?: User;
  shuttle_id: string;
  shuttle?: Shuttle;
  date: string;
  pickup_person_name?: string;
  pickup_location: string;
  dropoff_location: string;
  passenger_name?: string;
  passenger_email?: string;
  passenger_phone?: string;
  seats: number;
  extra_luggage?: number;
  total_price: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded';
  payment_method?: 'pay_on_arrival' | 'wompi' | 'paypal' | string;
  payment_id?: string;
  payment_details?: string;
  boarding_status?: 'pending' | 'boarded' | 'no_show';
  created_at: string;
}

export type PaymentMethodType = 'pay_on_arrival' | 'wompi' | 'paypal';

export interface PublicSettings {
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  contact_address?: string;
  contact_hours?: string;
  social_facebook?: string;
  social_instagram?: string;
  social_tiktok?: string;
  paypal_enabled?: boolean;
  paypal_client_id?: string;
  paypal_env?: 'sandbox' | 'live';
  wompi_enabled?: boolean;
  wompi_public_key?: string;
  wompi_env?: 'sandbox' | 'production';
  pay_on_arrival_enabled?: boolean;
  pay_on_arrival_instructions?: string;
}

export interface ManifestRoute {
  shuttle_id: string;
  shuttle_name: string;
  schedule?: string;
  duration_hours?: number;
  operator?: string;
  origin_name?: string;
  destination_name?: string;
  total_passengers: number;
  total_luggage: number;
  passengers: (Booking & {
    shuttle_name?: string;
    schedule?: string;
    duration_hours?: number;
    operator?: string;
    origin_name?: string;
    destination_name?: string;
  })[];
}

export interface ManifestSummary {
  total_bookings: number;
  total_passengers: number;
  total_luggage: number;
  boarded_count: number;
  pending_count: number;
  no_show_count: number;
  routes_count: number;
}

export interface ManifestData {
  date: string;
  summary: ManifestSummary;
  routes: ManifestRoute[];
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

export interface Settings {
  id: string;
  key: string;
  value: string;
}

export interface Review {
  id: string;
  shuttle_id: string;
  shuttle_name?: string;
  shuttle_slug?: string;
  user_name: string;
  user_email?: string;
  rating: number;
  comment: string;
  status: 'approved' | 'hidden';
  created_at: string;
}

export interface ReviewStats {
  averageRating: number;
  reviewCount: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recommendedPercent: number;
}
