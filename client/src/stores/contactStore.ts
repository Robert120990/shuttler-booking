import { create } from 'zustand';
import { settingsApi } from '../api/endpoints';

export interface ContactInfo {
  contact_email: string;
  contact_phone: string;
  contact_whatsapp: string;
  contact_address: string;
  contact_hours: string;
  social_facebook: string;
  social_instagram: string;
  social_tiktok: string;
}

interface ContactState extends ContactInfo {
  loading: boolean;
  initialized: boolean;
  fetchContactInfo: () => Promise<void>;
  updateContactState: (info: Partial<ContactInfo>) => void;
}

const DEFAULT_CONTACT: ContactInfo = {
  contact_email: 'info@trailexplorer.com',
  contact_phone: '+503 1234 5678',
  contact_whatsapp: '+503 1234 5678',
  contact_address: 'San Salvador, El Salvador',
  contact_hours: 'Lunes a Domingo: 24/7',
  social_facebook: '',
  social_instagram: '',
  social_tiktok: '',
};

export const useContactStore = create<ContactState>((set, get) => ({
  ...DEFAULT_CONTACT,
  loading: false,
  initialized: false,
  fetchContactInfo: async () => {
    if (get().loading) return;
    try {
      set({ loading: true });
      const res = await settingsApi.getPublic();
      if (res.data) {
        set({
          contact_email: res.data.contact_email || DEFAULT_CONTACT.contact_email,
          contact_phone: res.data.contact_phone || DEFAULT_CONTACT.contact_phone,
          contact_whatsapp: res.data.contact_whatsapp || DEFAULT_CONTACT.contact_whatsapp,
          contact_address: res.data.contact_address || DEFAULT_CONTACT.contact_address,
          contact_hours: res.data.contact_hours || DEFAULT_CONTACT.contact_hours,
          social_facebook: res.data.social_facebook || '',
          social_instagram: res.data.social_instagram || '',
          social_tiktok: res.data.social_tiktok || '',
          initialized: true,
        });
      }
    } catch (err) {
      console.error('Error loading public contact info:', err);
      set({ initialized: true });
    } finally {
      set({ loading: false });
    }
  },
  updateContactState: (info) => {
    set((state) => ({
      ...state,
      ...info,
    }));
  },
}));
