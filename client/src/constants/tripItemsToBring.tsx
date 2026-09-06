import {
  FileText,
  Droplets,
  Shirt,
  Headphones,
  BatteryCharging,
  Banknote,
  Sun,
  Bug,
  Moon,
  Cookie,
  Glasses,
  Camera,
  BookOpen,
  Pill,
  CheckCircle2,
} from 'lucide-react';

export interface TripToBringItem {
  id: string;
  name: string;
  nameEn: string;
  subtitle?: string;
  subtitleEn?: string;
  iconType: string;
  aliases: string[];
  isDefaultRecommended?: boolean;
}

export const TRIP_ITEMS_TO_BRING: TripToBringItem[] = [
  {
    id: 'passport',
    name: 'Pasaporte / Identificación',
    nameEn: 'Passport / ID',
    subtitle: 'Obligatorio para verificación y fronteras',
    subtitleEn: 'Required for check-in and border crossings',
    iconType: 'passport',
    aliases: ['pasaporte', 'documento de identidad', 'passport', 'id', 'identificacion', 'identificación', 'pasaporte / id', 'documento', 'pasaporte / documento de identidad'],
    isDefaultRecommended: true,
  },
  {
    id: 'water',
    name: 'Agua',
    nameEn: 'Water Bottle',
    subtitle: 'Para mantenerte hidratado en el trayecto',
    subtitleEn: 'Stay hydrated during the journey',
    iconType: 'water',
    aliases: ['agua', 'botella de agua', 'water', 'water bottle', 'hidratacion', 'botella'],
    isDefaultRecommended: true,
  },
  {
    id: 'jacket',
    name: 'Chaqueta o Suéter',
    nameEn: 'Jacket / Sweater',
    subtitle: 'Recomendado por el aire acondicionado a bordo',
    subtitleEn: 'Recommended for the cold A/C onboard',
    iconType: 'jacket',
    aliases: ['chaqueta', 'sueter', 'suéter', 'chaqueta o suéter', 'jacket', 'sweater', 'abrigo', 'chaqueta impermeable'],
    isDefaultRecommended: true,
  },
  {
    id: 'headphones',
    name: 'Audífonos',
    nameEn: 'Headphones',
    subtitle: 'Para música, podcasts o llamadas',
    subtitleEn: 'For music, podcasts or calls',
    iconType: 'headphones',
    aliases: ['audifonos', 'audífonos', 'headphones', 'auriculares'],
    isDefaultRecommended: true,
  },
  {
    id: 'comfortable_clothes',
    name: 'Ropa Cómoda',
    nameEn: 'Comfortable Clothes',
    subtitle: 'Prendas frescas y calzado confortable',
    subtitleEn: 'Light breathable clothes & comfortable shoes',
    iconType: 'clothes',
    aliases: ['ropa comoda', 'ropa cómoda', 'comfortable clothes', 'ropa ligera', 'calzado comodo'],
    isDefaultRecommended: true,
  },
  {
    id: 'charger',
    name: 'Cargador de Celular',
    nameEn: 'Phone Charger / Powerbank',
    subtitle: 'Cable USB o batería externa',
    subtitleEn: 'USB cable or portable power bank',
    iconType: 'charger',
    aliases: ['cargador', 'cargador de celular', 'bateria portatil', 'batería portátil', 'powerbank', 'phone charger', 'cable usb'],
    isDefaultRecommended: true,
  },
  {
    id: 'cash',
    name: 'Dinero en Efectivo',
    nameEn: 'Cash (USD / Local)',
    subtitle: 'Para paradas de servicio, tasas migratorias o propinas',
    subtitleEn: 'For rest stops, migration fees or snacks',
    iconType: 'cash',
    aliases: ['dinero en efectivo', 'efectivo', 'cash', 'usd', 'moneda local', 'dinero'],
    isDefaultRecommended: true,
  },
  {
    id: 'sunscreen',
    name: 'Protector Solar',
    nameEn: 'Sunscreen',
    subtitle: 'Para paradas en ruta y tu llegada',
    subtitleEn: 'For rest stops and your arrival',
    iconType: 'sunscreen',
    aliases: ['protector solar', 'bloqueador', 'sunscreen', 'bloqueador solar'],
  },
  {
    id: 'repellent',
    name: 'Repelente de Insectos',
    nameEn: 'Insect Repellent',
    subtitle: 'Recomendado para zonas tropicales y senderos',
    subtitleEn: 'Recommended for tropical and jungle areas',
    iconType: 'repellent',
    aliases: ['repelente', 'repelente de insectos', 'insect repellent', 'repelente de mosquitos'],
  },
  {
    id: 'neck_pillow',
    name: 'Almohada de Cuello',
    nameEn: 'Neck Pillow',
    subtitle: 'Para descansar cómodamente durante el viaje',
    subtitleEn: 'For comfortable sleep on longer drives',
    iconType: 'pillow',
    aliases: ['almohada de cuello', 'almohada de viaje', 'almohada', 'neck pillow', 'travel pillow'],
  },
  {
    id: 'snacks',
    name: 'Snacks de Viaje',
    nameEn: 'Travel Snacks',
    subtitle: 'Frutos secos, barras energéticas o bocadillos',
    subtitleEn: 'Energy bars, nuts or light snacks',
    iconType: 'snacks',
    aliases: ['snacks', 'bocadillos', 'snacks de viaje', 'galletas', 'travel snacks'],
  },
  {
    id: 'sunglasses',
    name: 'Gafas de Sol',
    nameEn: 'Sunglasses',
    subtitle: 'Protección visual contra el resplandor diurno',
    subtitleEn: 'Protection from daytime sun glare',
    iconType: 'sunglasses',
    aliases: ['gafas de sol', 'lentes de sol', 'sunglasses', 'anteojos de sol'],
  },
  {
    id: 'medication',
    name: 'Medicamentos Personales',
    nameEn: 'Personal Medication',
    subtitle: 'Pastillas para el mareo o tratamientos personales',
    subtitleEn: 'Motion sickness pills & personal treatments',
    iconType: 'medication',
    aliases: ['medicamentos', 'medicamentos personales', 'pastillas para el mareo', 'motion sickness pills', 'medication', 'botiquin'],
  },
  {
    id: 'book',
    name: 'Libro o Lector Digital',
    nameEn: 'Book or Kindle',
    subtitle: 'Lectura offline para trayectos largos',
    subtitleEn: 'Offline reading for long journeys',
    iconType: 'book',
    aliases: ['libro', 'libro o lector digital', 'kindle', 'lector digital', 'book or kindle', 'book', 'libro o kindle'],
  },
  {
    id: 'camera',
    name: 'Cámara Fotográfica',
    nameEn: 'Camera',
    subtitle: 'Para capturar los paisajes panorámicos en ruta',
    subtitleEn: 'To capture scenic views along the way',
    iconType: 'camera',
    aliases: ['camara', 'cámara', 'camara fotografica', 'cámara fotográfica', 'camera'],
  },
];

export const renderToBringIcon = (iconType: string, className = 'w-5 h-5') => {
  switch (iconType) {
    case 'passport':
      return <FileText className={className} />;
    case 'water':
      return <Droplets className={className} />;
    case 'jacket':
    case 'clothes':
      return <Shirt className={className} />;
    case 'headphones':
      return <Headphones className={className} />;
    case 'charger':
      return <BatteryCharging className={className} />;
    case 'cash':
      return <Banknote className={className} />;
    case 'sunscreen':
      return <Sun className={className} />;
    case 'repellent':
      return <Bug className={className} />;
    case 'pillow':
      return <Moon className={className} />;
    case 'snacks':
      return <Cookie className={className} />;
    case 'sunglasses':
      return <Glasses className={className} />;
    case 'medication':
      return <Pill className={className} />;
    case 'book':
      return <BookOpen className={className} />;
    case 'camera':
      return <Camera className={className} />;
    default:
      return <CheckCircle2 className={className} />;
  }
};

/**
 * Normalizes text to lowercase without accents or special characters.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/**
 * Finds a matching item definition for any raw item text.
 */
export function matchToBringItem(rawText: string): TripToBringItem | null {
  if (!rawText) return null;
  const normalized = normalizeText(rawText);

  for (const item of TRIP_ITEMS_TO_BRING) {
    if (normalizeText(item.name) === normalized || normalizeText(item.nameEn) === normalized) {
      return item;
    }
    for (const alias of item.aliases) {
      const normAlias = normalizeText(alias);
      if (normalized === normAlias || normalized.includes(normAlias) || normAlias.includes(normalized)) {
        return item;
      }
    }
  }

  return null;
}

/**
 * Parses a comma-separated string into matched IDs and any custom un-matched items.
 */
export function parseToBringString(rawString: string | null | undefined): {
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
    const matched = matchToBringItem(part);
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
 * Serializes selected item IDs and custom items back into a comma-separated string.
 */
export function buildToBringString(selectedIds: string[], customItems: string[] = []): string {
  const result: string[] = [];

  for (const id of selectedIds) {
    const item = TRIP_ITEMS_TO_BRING.find((i) => i.id === id);
    if (item && !result.includes(item.name)) {
      result.push(item.name);
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
