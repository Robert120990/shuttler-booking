import {
  Building2,
  MapPin,
  Plane,
  Building,
  Home,
  Bus,
} from 'lucide-react';

export interface LocationOption {
  id: string;
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  iconType: 'hotel' | 'meeting' | 'airport' | 'office' | 'home' | 'terminal';
}

export const PICKUP_OPTIONS: LocationOption[] = [
  {
    id: 'hotel_door',
    title: 'Puerta a Puerta (Hoteles y Hostales)',
    titleEn: 'Door-to-Door (Hotels & Hostels)',
    description: 'Recogida directa en el lobby de tu hotel u hostal (estar listo 15 min antes).',
    descriptionEn: 'Direct pickup at your hotel or hostel lobby (please be ready 15 min before).',
    iconType: 'hotel',
  },
  {
    id: 'meeting_point',
    title: 'Punto de Encuentro Central',
    titleEn: 'Central Meeting Point',
    description: 'Salida desde el Parque Central / Plaza Principal o Terminal de la ciudad de origen.',
    descriptionEn: 'Departure from the Central Park / Main Plaza or City Bus Terminal.',
    iconType: 'meeting',
  },
  {
    id: 'airport',
    title: 'Aeropuerto Internacional (Llegadas)',
    titleEn: 'International Airport (Arrivals)',
    description: 'Recogida en la puerta de llegadas del aeropuerto (indicar número de vuelo).',
    descriptionEn: 'Pickup at the airport arrival gate (provide flight number).',
    iconType: 'airport',
  },
  {
    id: 'office',
    title: 'Oficina / Estación Oficial',
    titleEn: 'Official Office / Station',
    description: 'Salida desde la oficina o terminal oficial de Trail Explorer.',
    descriptionEn: 'Departure from Trail Explorer official office or bus terminal.',
    iconType: 'office',
  },
  {
    id: 'custom_address',
    title: 'Dirección Particular o Airbnb',
    titleEn: 'Private Address or Airbnb',
    description: 'Recogida en dirección privada o apartamento dentro del perímetro urbano.',
    descriptionEn: 'Pickup at private residential address or Airbnb within central city limits.',
    iconType: 'home',
  },
];

export const DROPOFF_OPTIONS: LocationOption[] = [
  {
    id: 'hotel_door',
    title: 'Entrega Puerta a Puerta (Hoteles y Hostales)',
    titleEn: 'Door-to-Door (Hotels & Hostels)',
    description: 'Desembarque directo en la puerta de tu hotel, hostal o alojamiento.',
    descriptionEn: 'Dropoff directly at your hotel, hostel or accommodation entrance.',
    iconType: 'hotel',
  },
  {
    id: 'central_point',
    title: 'Punto Céntrico / Parque Principal',
    titleEn: 'Central Dropoff / Main Plaza',
    description: 'Llegada al Parque Central / Plaza Principal de la ciudad de destino.',
    descriptionEn: 'Dropoff at the Central Park / Main Plaza in the destination town.',
    iconType: 'meeting',
  },
  {
    id: 'airport',
    title: 'Aeropuerto Internacional (Salidas)',
    titleEn: 'International Airport (Departures)',
    description: 'Desembarque directo en la terminal de salidas para tomar tu vuelo.',
    descriptionEn: 'Dropoff directly at the airport departure terminal for your flight.',
    iconType: 'airport',
  },
  {
    id: 'bus_terminal',
    title: 'Terminal de Autobuses / Enlace',
    titleEn: 'Bus Terminal / Transit Hub',
    description: 'Desembarque en la terminal de transporte para conexiones a otros destinos.',
    descriptionEn: 'Dropoff at the bus terminal for onward travel connections.',
    iconType: 'terminal',
  },
  {
    id: 'office',
    title: 'Oficina / Parada Oficial',
    titleEn: 'Official Office / Station',
    description: 'Llegada a la terminal u oficina oficial de Trail Explorer en el destino.',
    descriptionEn: 'Arrival at the Trail Explorer office or terminal in destination.',
    iconType: 'office',
  },
];

export const renderLocationIcon = (iconType: string, className = 'w-5 h-5') => {
  switch (iconType) {
    case 'hotel':
      return <Building2 className={className} />;
    case 'meeting':
      return <MapPin className={className} />;
    case 'airport':
      return <Plane className={className} />;
    case 'office':
      return <Building className={className} />;
    case 'home':
      return <Home className={className} />;
    case 'terminal':
      return <Bus className={className} />;
    default:
      return <MapPin className={className} />;
  }
};

/**
 * Builds a formatted string combining pickup, dropoff and optional custom notes.
 */
export function buildPickupDropoffString(
  pickupId: string,
  dropoffId: string,
  customNote: string = ''
): string {
  const pickup = PICKUP_OPTIONS.find((p) => p.id === pickupId) || PICKUP_OPTIONS[0];
  const dropoff = DROPOFF_OPTIONS.find((d) => d.id === dropoffId) || DROPOFF_OPTIONS[0];

  const lines: string[] = [
    `Recogida: ${pickup.title} - ${pickup.description}`,
    `Entrega: ${dropoff.title} - ${dropoff.description}`,
  ];

  if (customNote && customNote.trim()) {
    lines.push(`Nota: ${customNote.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Parses existing raw string to detect selected pickup and dropoff options.
 */
export function parsePickupDropoffString(raw: string | null | undefined): {
  pickupId: string;
  dropoffId: string;
  customNote: string;
} {
  if (!raw || !raw.trim()) {
    return {
      pickupId: 'hotel_door',
      dropoffId: 'hotel_door',
      customNote: '',
    };
  }

  const clean = raw.trim();
  const lower = clean.toLowerCase();

  // Find pickup
  let pickupId = 'hotel_door';
  if (lower.includes('aeropuerto') && (lower.includes('llegada') || lower.includes('recogida en aeropuerto'))) {
    pickupId = 'airport';
  } else if (lower.includes('oficina') && !lower.includes('destino')) {
    pickupId = 'office';
  } else if (lower.includes('punto de encuentro') || lower.includes('parque central') || lower.includes('plaza principal')) {
    pickupId = 'meeting_point';
  } else if (lower.includes('airbnb') || lower.includes('particular')) {
    pickupId = 'custom_address';
  }

  // Find dropoff
  let dropoffId = 'hotel_door';
  if (lower.includes('aeropuerto') && (lower.includes('salida') || lower.includes('terminal de salidas'))) {
    dropoffId = 'airport';
  } else if (lower.includes('terminal de autobuses') || lower.includes('enlace') || lower.includes('conexión') || lower.includes('conexion')) {
    dropoffId = 'bus_terminal';
  } else if (lower.includes('punto céntrico') || lower.includes('punto centrico') || lower.includes('destino: parque')) {
    dropoffId = 'central_point';
  } else if (lower.includes('oficina') && lower.includes('destino')) {
    dropoffId = 'office';
  }

  // Extract custom note if present
  let customNote = '';
  const noteMatch = clean.match(/Nota:\s*([^\n\r]+)/i);
  if (noteMatch) {
    customNote = noteMatch[1].trim();
  }

  return { pickupId, dropoffId, customNote };
}
