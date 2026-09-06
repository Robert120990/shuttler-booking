import React from 'react';
import {
  AirVent,
  Tv,
  Tablet,
  Plug,
  Armchair,
  Utensils,
  Wifi,
  DoorOpen,
  Luggage,
  FileCheck,
  ShieldCheck,
  Award,
  Heart,
  CheckCircle2,
} from 'lucide-react';

export interface TripService {
  id: string;
  name: string;
  nameEn: string;
  subtitle?: string;
  subtitleEn?: string;
  iconType: string;
  aliases: string[];
  isDefaultRecommended?: boolean;
}

export const RestStopIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    {/* Male figure */}
    <circle cx="7" cy="4" r="2" />
    <path d="M5 8h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H8v5a1 1 0 0 1-2 0v-5H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" />
    {/* Female figure */}
    <circle cx="17" cy="4" r="2" />
    <path d="M14.5 9.5a1 1 0 0 1 1-.5h3a1 1 0 0 1 1 .5l1.5 5.5a1 1 0 0 1-.96 1.26h-1.04v4.74a1 1 0 0 1-2 0V15.76h-1.04a1 1 0 0 1-.96-1.26l1.5-5.5z" />
  </svg>
);

export const HostessBadgeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M5 20v-1a7 7 0 0 1 14 0v1" />
    <path d="M8 5.5l4-2.5 4 2.5" />
  </svg>
);

export const TRIP_SERVICES: TripService[] = [
  {
    id: 'ac',
    name: 'A/C',
    nameEn: 'A/C',
    subtitle: 'Ambiente climatizado',
    subtitleEn: 'Climate controlled',
    iconType: 'ac',
    aliases: ['a/c', 'ac', 'aire acondicionado', 'air conditioning', 'climatizado', 'clima'],
    isDefaultRecommended: true,
  },
  {
    id: 'service_stop',
    name: 'Parada de Servicio',
    nameEn: 'Rest Stop',
    subtitle: 'Descanso y sanitarios',
    subtitleEn: 'Restrooms & stretch break',
    iconType: 'service_stop',
    aliases: ['parada de servicio', 'parada de descanso', 'parada técnica', 'rest stop', 'service stop', 'paradas'],
    isDefaultRecommended: true,
  },
  {
    id: 'tv',
    name: 'TV',
    nameEn: 'TV',
    subtitle: 'Pantalla de entretenimiento',
    subtitleEn: 'Entertainment screen',
    iconType: 'tv',
    aliases: ['tv', 'television', 'televisión', 'pantalla', 'pantallas'],
  },
  {
    id: 'tablets',
    name: 'Tablets',
    nameEn: 'Tablets',
    subtitle: 'Sujeto a Disponibilidad',
    subtitleEn: 'Subject to Availability',
    iconType: 'tablet',
    aliases: ['tablets', 'tablet', 'pantallas individuales'],
  },
  {
    id: 'power_plug',
    name: 'Enchufe de Carga',
    nameEn: 'Power Outlets / USB',
    subtitle: 'Sujeto a Disponibilidad',
    subtitleEn: 'Subject to Availability',
    iconType: 'plug',
    aliases: ['enchufe de carga', 'enchufe', 'enchufes', 'cargador usb', 'usb', 'power outlet', 'cargadores'],
    isDefaultRecommended: true,
  },
  {
    id: 'reclining_seats',
    name: 'Asientos Reclinables',
    nameEn: 'Reclining Seats',
    subtitle: 'Mayor comodidad y espacio',
    subtitleEn: 'Extra comfort & legroom',
    iconType: 'reclining_seats',
    aliases: ['asientos reclinables', 'asiento reclinable', 'asientos rreclinables', 'asientos confort', 'reclining seats'],
    isDefaultRecommended: true,
  },
  {
    id: 'food_drinks',
    name: 'Alimentos y Bebidas',
    nameEn: 'Snacks & Drinks',
    subtitle: 'Snacks / botella de agua',
    subtitleEn: 'Snacks / water bottle',
    iconType: 'utensils',
    aliases: ['alimentos y bebidas', 'snacks / botella de agua', 'snacks', 'bebidas', 'agua', 'water', 'food and drinks', 'bocadillos'],
  },
  {
    id: 'wifi',
    name: 'Wifi',
    nameEn: 'WiFi',
    subtitle: 'Sujeto a Disponibilidad',
    subtitleEn: 'Subject to Availability',
    iconType: 'wifi',
    aliases: ['wifi', 'wi-fi', 'wifi gratuito', 'free wifi', 'internet'],
    isDefaultRecommended: true,
  },
  {
    id: 'azafata',
    name: 'Azafata',
    nameEn: 'Trip Attendant',
    subtitle: 'Sujeto a Disponibilidad',
    subtitleEn: 'Subject to Availability',
    iconType: 'azafata',
    aliases: ['azafata', 'asistente', 'hostess', 'asistente de viaje', 'trip attendant'],
  },
  // Servicios Adicionales Relevantes
  {
    id: 'door_to_door',
    name: 'Servicio Puerta a Puerta',
    nameEn: 'Door-to-Door Service',
    subtitle: 'Recogida en hotel o dirección',
    subtitleEn: 'Hotel or address pickup',
    iconType: 'door',
    aliases: ['servicio puerta a puerta', 'puerta a puerta', 'door-to-door', 'hotel pickup', 'recogida'],
    isDefaultRecommended: true,
  },
  {
    id: 'luggage',
    name: 'Equipaje Incluido',
    nameEn: 'Luggage Included',
    subtitle: '1 maleta + 1 bolso de mano',
    subtitleEn: '1 main luggage + 1 carry-on',
    iconType: 'luggage',
    aliases: ['equipaje incluido', 'equipaje estándar', 'maleta incluida', 'luggage included'],
    isDefaultRecommended: true,
  },
  {
    id: 'border_assistance',
    name: 'Asistencia en Frontera',
    nameEn: 'Border Assistance',
    subtitle: 'Trámite migratorio asistido',
    subtitleEn: 'Customs & immigration guidance',
    iconType: 'border',
    aliases: ['asistencia en frontera', 'asistencia en el cruce de frontera', 'border assistance', 'cruce fronterizo'],
  },
  {
    id: 'travel_insurance',
    name: 'Seguro de Viajero',
    nameEn: 'Travel Insurance',
    subtitle: 'Póliza médica en ruta',
    subtitleEn: 'Passenger route coverage',
    iconType: 'insurance',
    aliases: ['seguro de viajero', 'seguro de viaje', 'seguro', 'travel insurance'],
    isDefaultRecommended: true,
  },
  {
    id: 'professional_driver',
    name: 'Conductor Profesional',
    nameEn: 'Professional Driver',
    subtitle: 'Certificado y con experiencia',
    subtitleEn: 'Certified & experienced driver',
    iconType: 'driver',
    aliases: ['conductor profesional', 'conductor bilingüe', 'conductor bilingue', 'bilingual driver', 'professional driver', 'chofer'],
    isDefaultRecommended: true,
  },
  {
    id: 'pet_friendly',
    name: 'Mascotas Permitidas',
    nameEn: 'Pet Friendly',
    subtitle: 'Acepta mascotas a bordo',
    subtitleEn: 'Pets allowed onboard',
    iconType: 'pet',
    aliases: ['mascotas permitidas', 'pet friendly', 'pet-friendly', 'mascotas'],
  },
];

export const renderServiceIcon = (iconType: string, className = 'w-5 h-5') => {
  switch (iconType) {
    case 'ac':
      return <AirVent className={className} />;
    case 'service_stop':
      return <RestStopIcon className={className} />;
    case 'tv':
      return <Tv className={className} />;
    case 'tablet':
      return <Tablet className={className} />;
    case 'plug':
      return <Plug className={className} />;
    case 'reclining_seats':
      return <Armchair className={className} />;
    case 'utensils':
      return <Utensils className={className} />;
    case 'wifi':
      return <Wifi className={className} />;
    case 'azafata':
      return <HostessBadgeIcon className={className} />;
    case 'door':
      return <DoorOpen className={className} />;
    case 'luggage':
      return <Luggage className={className} />;
    case 'border':
      return <FileCheck className={className} />;
    case 'insurance':
      return <ShieldCheck className={className} />;
    case 'driver':
      return <Award className={className} />;
    case 'pet':
      return <Heart className={className} />;
    default:
      return <CheckCircle2 className={className} />;
  }
};

/**
 * Normalizes text to lowercase without accents or punctuation.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Finds a matching service definition for any raw item text.
 */
export function matchService(rawText: string): TripService | null {
  if (!rawText) return null;
  const normalized = normalizeText(rawText);

  for (const service of TRIP_SERVICES) {
    if (normalizeText(service.name) === normalized || normalizeText(service.nameEn) === normalized) {
      return service;
    }
    for (const alias of service.aliases) {
      const normAlias = normalizeText(alias);
      if (normalized === normAlias || normalized.includes(normAlias) || normAlias.includes(normalized)) {
        return service;
      }
    }
  }

  return null;
}

/**
 * Parses a comma-separated string of services into matched IDs and any custom un-matched items.
 */
export function parseServicesString(rawString: string | null | undefined): {
  selectedIds: string[];
  customItems: string[];
} {
  if (!rawString) {
    return { selectedIds: [], customItems: [] };
  }

  const parts = rawString
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);

  const selectedIds: string[] = [];
  const customItems: string[] = [];

  for (const part of parts) {
    const matched = matchService(part);
    if (matched) {
      if (!selectedIds.includes(matched.id)) {
        selectedIds.push(matched.id);
      }
    } else {
      if (!customItems.includes(part)) {
        customItems.push(part);
      }
    }
  }

  return { selectedIds, customItems };
}

/**
 * Serializes selected service IDs and custom items back into a comma-separated string.
 */
export function buildServicesString(selectedIds: string[], customItems: string[] = []): string {
  const result: string[] = [];

  for (const id of selectedIds) {
    const service = TRIP_SERVICES.find((s) => s.id === id);
    if (service && !result.includes(service.name)) {
      result.push(service.name);
    }
  }

  for (const item of customItems) {
    const trimmed = item.trim();
    if (trimmed && !result.includes(trimmed)) {
      result.push(trimmed);
    }
  }

  return result.join(', ');
}
