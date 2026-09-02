import { create } from 'zustand';
import type { Shuttle } from '../types';

interface ExtraLuggageItem {
  typeIndex: number;
  quantity: number;
}

interface BookingState {
  currentShuttle: Shuttle | null;
  bookingData: {
    date: string;
    passengers: number;
    pickup_person_name: string;
    pickup_location: string;
    dropoff_location: string;
    passenger_name: string;
    passenger_email: string;
    passenger_phone: string;
    extra_luggage: ExtraLuggageItem[];
  };
  setCurrentShuttle: (shuttle: Shuttle | null) => void;
  setBookingData: (data: Partial<BookingState['bookingData']>) => void;
  clearBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  currentShuttle: null,
  bookingData: {
    date: '',
    passengers: 1,
    pickup_person_name: '',
    pickup_location: '',
    dropoff_location: '',
    passenger_name: '',
    passenger_email: '',
    passenger_phone: '',
    extra_luggage: [],
  },
  setCurrentShuttle: (shuttle) => set({ currentShuttle: shuttle }),
  setBookingData: (data) =>
    set((state) => ({
      bookingData: { ...state.bookingData, ...data },
    })),
  clearBooking: () =>
    set({
      currentShuttle: null,
      bookingData: {
        date: '',
        passengers: 1,
        pickup_person_name: '',
        pickup_location: '',
        dropoff_location: '',
        passenger_name: '',
        passenger_email: '',
        passenger_phone: '',
        extra_luggage: [],
      },
    }),
}));
