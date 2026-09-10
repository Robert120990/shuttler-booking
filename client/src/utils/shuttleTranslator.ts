import type { LuggageOption } from '../types';

/**
 * Common phrase mappings between English and Spanish for dynamic shuttle data.
 */
const TERM_DICTIONARY: Record<string, { en: string; es: string }> = {
  // Amenities & Included
  'air conditioning': { en: 'Air conditioning', es: 'Aire acondicionado' },
  'aire acondicionado': { en: 'Air conditioning', es: 'Aire acondicionado' },
  'a/c': { en: 'A/C', es: 'A/C' },
  'ac': { en: 'A/C', es: 'A/C' },
  'parada de servicio': { en: 'Rest Stop', es: 'Parada de Servicio' },
  'rest stop': { en: 'Rest Stop', es: 'Parada de Servicio' },
  'tv': { en: 'TV', es: 'TV' },
  'tablets': { en: 'Tablets', es: 'Tablets' },
  'tablet': { en: 'Tablets', es: 'Tablets' },
  'enchufe de carga': { en: 'Power Outlets / USB', es: 'Enchufe de Carga' },
  'power outlets': { en: 'Power Outlets / USB', es: 'Enchufe de Carga' },
  'power outlet': { en: 'Power Outlets / USB', es: 'Enchufe de Carga' },
  'asientos reclinables': { en: 'Reclining Seats', es: 'Asientos Reclinables' },
  'asientos rreclinables': { en: 'Reclining Seats', es: 'Asientos Reclinables' },
  'reclining seats': { en: 'Reclining Seats', es: 'Asientos Reclinables' },
  'alimentos y bebidas': { en: 'Snacks & Drinks', es: 'Alimentos y Bebidas' },
  'snacks & drinks': { en: 'Snacks & Drinks', es: 'Alimentos y Bebidas' },
  'snacks / botella de agua': { en: 'Snacks & Water', es: 'Snacks / botella de agua' },
  'door-to-door service': { en: 'Door-to-door service', es: 'Servicio puerta a puerta' },
  'servicio puerta a puerta': { en: 'Door-to-door service', es: 'Servicio puerta a puerta' },
  'free wifi': { en: 'Free WiFi', es: 'WiFi gratuito' },
  'wifi gratuito': { en: 'Free WiFi', es: 'WiFi gratuito' },
  'wifi': { en: 'WiFi', es: 'WiFi' },
  'azafata': { en: 'Trip Attendant', es: 'Azafata' },
  'trip attendant': { en: 'Trip Attendant', es: 'Azafata' },
  'equipaje incluido': { en: 'Luggage Included', es: 'Equipaje Incluido' },
  'luggage included': { en: 'Luggage Included', es: 'Equipaje Incluido' },
  'seguro de viajero': { en: 'Travel Insurance', es: 'Seguro de Viajero' },
  'travel insurance': { en: 'Travel Insurance', es: 'Seguro de Viajero' },
  'mascotas permitidas': { en: 'Pet Friendly', es: 'Mascotas Permitidas' },
  'pet friendly': { en: 'Pet Friendly', es: 'Mascotas Permitidas' },
  'bilingual driver': { en: 'Bilingual driver', es: 'Conductor bilingüe' },
  'conductor bilingue': { en: 'Bilingual driver', es: 'Conductor bilingüe' },
  'conductor bilingüe': { en: 'Bilingual driver', es: 'Conductor bilingüe' },
  'conductor profesional': { en: 'Professional Driver', es: 'Conductor Profesional' },
  'professional driver': { en: 'Professional Driver', es: 'Conductor Profesional' },
  'border assistance': { en: 'Border crossing assistance', es: 'Asistencia en el cruce de frontera' },
  'asistencia en frontera': { en: 'Border crossing assistance', es: 'Asistencia en el cruce de frontera' },
  'luggage assistance': { en: 'Luggage assistance', es: 'Asistencia con el equipaje' },

  // What to bring
  'water': { en: 'Water', es: 'Agua' },
  'agua': { en: 'Water', es: 'Agua' },
  'book or kindle': { en: 'Book or Kindle', es: 'Libro o lector digital' },
  'libro o kindle': { en: 'Book or Kindle', es: 'Libro o lector digital' },
  'book': { en: 'Book or Kindle', es: 'Libro de lectura' },
  'libro': { en: 'Book or Kindle', es: 'Libro de lectura' },
  'headphones': { en: 'Headphones', es: 'Audífonos' },
  'audifonos': { en: 'Headphones', es: 'Audífonos' },
  'audífonos': { en: 'Headphones', es: 'Audífonos' },
  'camera': { en: 'Camera', es: 'Cámara' },
  'camara': { en: 'Camera', es: 'Cámara' },
  'cámara': { en: 'Camera', es: 'Cámara' },
  'passport': { en: 'Passport / ID', es: 'Pasaporte / Identificación' },
  'pasaporte': { en: 'Passport / ID', es: 'Pasaporte / Identificación' },
  'passport / id': { en: 'Passport / ID', es: 'Pasaporte / Documento de identidad' },
  'pasaporte / documento de identidad': { en: 'Passport / ID', es: 'Pasaporte / Documento de identidad' },
  'pasaporte / identificacion': { en: 'Passport / ID', es: 'Pasaporte / Identificación' },
  'pasaporte / identificación': { en: 'Passport / ID', es: 'Pasaporte / Identificación' },
  'comfortable clothes': { en: 'Comfortable clothes', es: 'Ropa cómoda' },
  'ropa comoda': { en: 'Comfortable clothes', es: 'Ropa cómoda' },
  'ropa cómoda': { en: 'Comfortable clothes', es: 'Ropa cómoda' },
  'sunscreen': { en: 'Sunscreen', es: 'Protector solar' },
  'protector solar': { en: 'Sunscreen', es: 'Protector solar' },
  'snacks': { en: 'Snacks', es: 'Snacks / Bocadillos' },
  'snacks de viaje': { en: 'Travel Snacks', es: 'Snacks de Viaje' },
  'travel snacks': { en: 'Travel Snacks', es: 'Snacks de Viaje' },
  'rain jacket': { en: 'Rain jacket', es: 'Chaqueta impermeable' },
  'chaqueta impermeable': { en: 'Rain jacket', es: 'Chaqueta impermeable' },
  'chaqueta o suéter': { en: 'Jacket / Sweater', es: 'Chaqueta o Suéter' },
  'chaqueta o sueter': { en: 'Jacket / Sweater', es: 'Chaqueta o Suéter' },
  'jacket / sweater': { en: 'Jacket / Sweater', es: 'Chaqueta o Suéter' },
  'cargador de celular': { en: 'Phone Charger', es: 'Cargador de Celular' },
  'phone charger': { en: 'Phone Charger', es: 'Cargador de Celular' },
  'dinero en efectivo': { en: 'Cash', es: 'Dinero en Efectivo' },
  'cash': { en: 'Cash', es: 'Dinero en Efectivo' },
  'repelente de insectos': { en: 'Insect Repellent', es: 'Repelente de Insectos' },
  'insect repellent': { en: 'Insect Repellent', es: 'Repelente de Insectos' },
  'almohada de cuello': { en: 'Neck Pillow', es: 'Almohada de Cuello' },
  'neck pillow': { en: 'Neck Pillow', es: 'Almohada de Cuello' },
  'gafas de sol': { en: 'Sunglasses', es: 'Gafas de Sol' },
  'sunglasses': { en: 'Sunglasses', es: 'Gafas de Sol' },
  'medicamentos personales': { en: 'Personal Medication', es: 'Medicamentos Personales' },
  'personal medication': { en: 'Personal Medication', es: 'Medicamentos Personales' },
  'libro o lector digital': { en: 'Book or Kindle', es: 'Libro o Lector Digital' },
  'cámara fotográfica': { en: 'Camera', es: 'Cámara Fotográfica' },
  'camara fotografica': { en: 'Camera', es: 'Cámara Fotográfica' },

  // Luggage options
  'extra bag': { en: 'Extra Bag', es: 'Maleta adicional' },
  'maleta adicional': { en: 'Extra Bag', es: 'Maleta adicional' },
  'extra luggage': { en: 'Extra luggage', es: 'Equipaje adicional' },
  'equipaje adicional': { en: 'Extra luggage', es: 'Equipaje adicional' },
  'surfboard': { en: 'Surfboard', es: 'Tabla de surf' },
  'tabla de surf': { en: 'Surfboard', es: 'Tabla de surf' },
  'bicycle': { en: 'Bicycle', es: 'Bicicleta' },
  'bicicleta': { en: 'Bicycle', es: 'Bicicleta' },
  'box': { en: 'Extra Box', es: 'Caja adicional' },
  'caja adicional': { en: 'Extra Box', es: 'Caja adicional' },

  // Schedule & Availability
  'every day': { en: 'Every day', es: 'Todos los días' },
  'todos los dias': { en: 'Every day', es: 'Todos los días' },
  'todos los días': { en: 'Every day', es: 'Todos los días' },
  'daily': { en: 'Daily', es: 'Diario' },
  'diario': { en: 'Daily', es: 'Diario' },
  'monday to friday': { en: 'Monday to Friday', es: 'Lunes a Viernes' },
  'lunes a viernes': { en: 'Monday to Friday', es: 'Lunes a Viernes' },
  'weekends': { en: 'Weekends', es: 'Fines de semana' },
  'fines de semana': { en: 'Weekends', es: 'Fines de semana' },
  'schedule not available': { en: 'Schedule not available', es: 'Horario no disponible' },
  'horario no disponible': { en: 'Schedule not available', es: 'Horario no disponible' },

  // Service Type
  'local': { en: 'Local', es: 'Local' },
  'international': { en: 'International', es: 'Internacional' },
  'local service': { en: 'Local Service', es: 'Servicio Local' },
  'servicio local': { en: 'Local Service', es: 'Servicio Local' },
  'international service': { en: 'International Service', es: 'Servicio Internacional' },
  'servicio internacional': { en: 'International Service', es: 'Servicio Internacional' },
};

/**
 * Translates a single term or item string based on known dictionary entries.
 */
export function translateItem(text: string, lang: string): string {
  if (!text) return '';
  const clean = text.trim();
  const lower = clean.toLowerCase();

  const found = TERM_DICTIONARY[lower];
  if (found) {
    return lang === 'es' ? found.es : found.en;
  }

  // Fallback pattern matching
  if (lang === 'es') {
    if (lower.includes('air conditioning')) return 'Aire acondicionado';
    if (lower.includes('door-to-door')) return 'Servicio puerta a puerta';
    if (lower.includes('wifi')) return 'WiFi gratuito';
    if (lower.includes('headphone')) return 'Audífonos';
    if (lower.includes('passport')) return 'Pasaporte / Identificación';
    if (lower.includes('water')) return 'Agua';
    if (lower.includes('camera')) return 'Cámara';
    if (lower.includes('surfboard')) return 'Tabla de surf';
    if (lower.includes('extra bag')) return 'Maleta adicional';
  } else {
    if (lower.includes('aire acondicionado')) return 'Air conditioning';
    if (lower.includes('puerta a puerta')) return 'Door-to-door service';
    if (lower.includes('wifi')) return 'Free WiFi';
    if (lower.includes('audifono') || lower.includes('audífono')) return 'Headphones';
    if (lower.includes('pasaporte')) return 'Passport / ID';
    if (lower.includes('agua')) return 'Water';
    if (lower.includes('camara') || lower.includes('cámara')) return 'Camera';
    if (lower.includes('surf')) return 'Surfboard';
    if (lower.includes('maleta adicional')) return 'Extra Bag';
  }

  return clean;
}

/**
 * Translates comma-separated list of items (e.g. included services or what to bring).
 */
export function translateList(raw: string | null | undefined, lang: string): string[] {
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => translateItem(item, lang))
    .filter(Boolean);
}

/**
 * Translates a route name:
 * "La Fortuna to Monteverde" -> "La Fortuna a Monteverde" (ES)
 * "La Fortuna a Monteverde" -> "La Fortuna to Monteverde" (EN)
 */
export function translateRouteName(name: string, lang: string): string {
  if (!name) return '';
  if (lang === 'es') {
    return name.replace(/\s+to\s+/gi, ' a ');
  } else {
    return name.replace(/\s+a\s+/gi, ' to ');
  }
}

/**
 * Translates standard luggage policies.
 */
export function translateLuggagePolicy(policy: string | null | undefined, lang: string): string {
  if (!policy) {
    return lang === 'es'
      ? '1 mochila o maleta principal y 1 bolso de mano por persona'
      : '1 backpack or main bag and 1 carry-on per person';
  }

  const lower = policy.toLowerCase();
  if (
    lower.includes('1 mochila') ||
    lower.includes('1 backpack') ||
    lower.includes('carry-on') ||
    lower.includes('bolso de mano')
  ) {
    return lang === 'es'
      ? '1 mochila o maleta principal y 1 bolso de mano por persona'
      : '1 main backpack or suitcase and 1 carry-on per person';
  }

  return policy;
}

/**
 * Translates pickup information strings.
 */
export function translatePickupInfo(info: string | null | undefined, lang: string): string {
  if (!info) return '';
  const lower = info.toLowerCase();

  if (
    lower.includes('recogida directa') ||
    lower.includes('hotel pickup') ||
    lower.includes('lobby') ||
    lower.includes('15 minutos') ||
    lower.includes('15 minutes')
  ) {
    return lang === 'es'
      ? 'Recogida directa en el lobby de tu hotel u hostal. Por favor estar listo 15 minutos antes de la hora indicada.'
      : 'Direct pickup at your hotel or hostel lobby. Please be ready 15 minutes before departure time.';
  }

  return info;
}

/**
 * Translates cancellation policy strings.
 */
export function translateCancellationPolicy(policy: string | null | undefined, lang: string): string {
  if (!policy) return '';
  const lower = policy.toLowerCase();

  if (
    lower.includes('cancelacion gratuita') ||
    lower.includes('cancelación gratuita') ||
    lower.includes('free cancellation') ||
    lower.includes('24 horas') ||
    lower.includes('24 hours')
  ) {
    return lang === 'es'
      ? 'Cancelación gratuita hasta 24 horas antes de la salida.'
      : 'Free cancellation up to 24 hours before departure.';
  }

  return policy;
}

/**
 * Translates route description strings with sensible fallbacks.
 */
export function translateDescription(desc: string | null | undefined, routeName: string, lang: string): string {
  if (!desc) {
    return lang === 'es'
      ? `Transporte compartido cómodo y seguro para ${translateRouteName(routeName, 'es')}. Servicio puerta a puerta entre hostales y hoteles con aire acondicionado.`
      : `Comfortable and reliable shared transportation for ${translateRouteName(routeName, 'en')}. Door-to-door service between hostels and hotels with air conditioning.`;
  }

  const lower = desc.toLowerCase();
  if (lower.includes('door-to-door') || lower.includes('puerta a puerta') || lower.includes('transporte compartido')) {
    return lang === 'es'
      ? `Transporte compartido cómodo y seguro para ${translateRouteName(routeName, 'es')}. Servicio puerta a puerta entre hostales y hoteles con aire acondicionado.`
      : `Comfortable and reliable shared transportation for ${translateRouteName(routeName, 'en')}. Door-to-door service between hostels and hotels with air conditioning.`;
  }

  return desc;
}

/**
 * Translates extra luggage options JSON / array.
 */
export function translateLuggageOptions(
  options: LuggageOption[] | string | null | undefined,
  lang: string
): LuggageOption[] {
  let list: LuggageOption[] = [];
  if (typeof options === 'string') {
    try {
      list = JSON.parse(options);
    } catch {
      list = [];
    }
  } else if (Array.isArray(options)) {
    list = options;
  }

  return list.map((opt) => ({
    name: translateItem(opt.name, lang),
    price: opt.price,
  }));
}

/**
 * Generates localized departure dates for the booking calendars.
 */
export function generateLocalizedDates(
  availabilityDays: number[],
  lang: string
): { value: string; label: string }[] {
  const dates: { value: string; label: string }[] = [];
  const today = new Date();
  const locale = lang === 'es' ? 'es-ES' : 'en-US';

  for (let i = 1; i < 90; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayOfWeek = date.getDay();
    if (availabilityDays.includes(dayOfWeek)) {
      dates.push({
        value: date.toISOString().split('T')[0],
        label: date.toLocaleDateString(locale, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        }),
      });
    }
  }
  return dates;
}

/**
 * Translates availability summary text.
 */
export function translateAvailability(rawAvailability: string | null | undefined, lang: string): string {
  if (!rawAvailability) {
    return lang === 'es' ? 'Todos los días' : 'Every day';
  }
  const clean = rawAvailability.trim();
  const lower = clean.toLowerCase();

  if (lower.includes('every day') || lower.includes('todos los dias') || lower.includes('todos los días')) {
    return lang === 'es' ? 'Todos los días' : 'Every day';
  }
  if (lower.includes('monday to friday') || lower.includes('lunes a viernes')) {
    return lang === 'es' ? 'Lunes a Viernes' : 'Monday to Friday';
  }
  if (lower.includes('weekend') || lower.includes('fines de semana')) {
    return lang === 'es' ? 'Fines de semana' : 'Weekends';
  }
  if (lower.includes('daily') || lower.includes('diario')) {
    return lang === 'es' ? 'Diario' : 'Daily';
  }

  return clean;
}

/**
 * Translates country names between English and Spanish.
 */
export function translateCountryName(name: string, lang: string): string {
  if (!name) return '';
  const map: Record<string, { en: string; es: string }> = {
    'méxico': { en: 'Mexico', es: 'México' },
    'mexico': { en: 'Mexico', es: 'México' },
    'belice': { en: 'Belize', es: 'Belice' },
    'belize': { en: 'Belize', es: 'Belice' },
    'guatemala': { en: 'Guatemala', es: 'Guatemala' },
    'el salvador': { en: 'El Salvador', es: 'El Salvador' },
    'honduras': { en: 'Honduras', es: 'Honduras' },
    'nicaragua': { en: 'Nicaragua', es: 'Nicaragua' },
    'costa rica': { en: 'Costa Rica', es: 'Costa Rica' },
    'panamá': { en: 'Panama', es: 'Panamá' },
    'panama': { en: 'Panama', es: 'Panamá' },
  };
  const key = name.trim().toLowerCase();
  if (map[key]) {
    return lang === 'es' ? map[key].es : map[key].en;
  }
  return name;
}

/**
 * Translates country descriptions between English and Spanish.
 */
export function translateCountryDescription(desc: string | null | undefined, countryName: string, lang: string): string {
  if (!desc) {
    return lang === 'es'
      ? `Descubre los mejores destinos turísticos, traslados y rutas de shuttles disponibles en ${translateCountryName(countryName, 'es')}.`
      : `Discover the best tourist destinations, transfers, and shuttle routes available in ${translateCountryName(countryName, 'en')}.`;
  }
  const clean = desc.trim();
  const lower = clean.toLowerCase();

  const DESCRIPTIONS: Record<string, { en: string; es: string }> = {
    'barrier reef, mayan ruins and caribbean charm.': {
      en: 'Barrier reef, Mayan ruins and Caribbean charm.',
      es: 'Arrecife de coral, ruinas mayas y encanto caribeño.',
    },
    'mayan ruins, caribbean islands and natural parks.': {
      en: 'Mayan ruins, Caribbean islands and natural parks.',
      es: 'Ruinas mayas, islas caribeñas y parques naturales.',
    },
    'beaches, rainforests, biodiversity and adventures.': {
      en: 'Beaches, rainforests, biodiversity and adventures.',
      es: 'Playas, selvas tropicales, biodiversidad y aventuras.',
    },
    'volcanoes, colonial history and lake atitlán.': {
      en: 'Volcanoes, colonial history and Lake Atitlán.',
      es: 'Volcanes, historia colonial y el Lago Atitlán.',
    },
    'surfing, volcanoes and vibrant coffee culture.': {
      en: 'Surfing, volcanoes and vibrant coffee culture.',
      es: 'Surf, volcanes y vibrante cultura cafetalera.',
    },
    'lakes, volcanoes and rich colonial architecture.': {
      en: 'Lakes, volcanoes and rich colonial architecture.',
      es: 'Lagos, volcanes y rica arquitectura colonial.',
    },
    'canal, tropical beaches and rainforests.': {
      en: 'Canal, tropical beaches and rainforests.',
      es: 'Canal, playas tropicales y selvas exuberantes.',
    },
    'ancient ruins, vibrant cities and rich culture.': {
      en: 'Ancient ruins, vibrant cities and rich culture.',
      es: 'Ruinas ancestrales, ciudades vibrantes y rica cultura.',
    },
  };

  if (DESCRIPTIONS[lower]) {
    return lang === 'es' ? DESCRIPTIONS[lower].es : DESCRIPTIONS[lower].en;
  }
  return clean;
}

/**
 * Translates city descriptions between English and Spanish.
 */
export function translateCityDescription(desc: string | null | undefined, lang: string): string {
  if (!desc) return '';
  const clean = desc.trim();
  const lower = clean.toLowerCase();
  const MAP: Record<string, { en: string; es: string }> = {
    'arenal volcano, hot springs, waterfalls': {
      en: 'Arenal Volcano, hot springs, waterfalls',
      es: 'Volcán Arenal, aguas termales, cascadas',
    },
    'cloud forests, wildlife, eco-adventures': {
      en: 'Cloud forests, wildlife, eco-adventures',
      es: 'Bosques nubosos, vida silvestre, eco-aventuras',
    },
    'museums, markets, cultural experiences': {
      en: 'Museums, markets, cultural experiences',
      es: 'Museos, mercados, experiencias culturales',
    },
    'beaches, surfing, sunsets': {
      en: 'Beaches, surfing, sunsets',
      es: 'Playas, surf, atardeceres',
    },
    'caribbean beaches, wildlife, surfing': {
      en: 'Caribbean beaches, wildlife, surfing',
      es: 'Playas caribeñas, vida silvestre, surf',
    },
    'colonial charm, gateway to guanacaste beaches': {
      en: 'Colonial charm, gateway to Guanacaste beaches',
      es: 'Encanto colonial, entrada a las playas de Guanacaste',
    },
    'colonial streets, volcano views, ruins': {
      en: 'Colonial streets, volcano views, ruins',
      es: 'Calles coloniales, vistas al volcán, ruinas',
    },
    'mayan ruins, lake views, jungle adventures': {
      en: 'Mayan ruins, lake views, jungle adventures',
      es: 'Ruinas mayas, vistas al lago, aventuras en la selva',
    },
    'lake atitlán views, volcanic landscapes': {
      en: 'Lake Atitlán views, volcanic landscapes',
      es: 'Vistas al Lago Atitlán, paisajes volcánicos',
    },
    'lake atitlan views, volcanic landscapes': {
      en: 'Lake Atitlán views, volcanic landscapes',
      es: 'Vistas al Lago Atitlán, paisajes volcánicos',
    },
    'highland culture, volcano hikes': {
      en: 'Highland culture, volcano hikes',
      es: 'Cultura del altiplano, caminatas a volcanes',
    },
    'historic plazas, museums, markets': {
      en: 'Historic plazas, museums, markets',
      es: 'Plazas históricas, museos, mercados',
    },
    'beach surfing, sunsets, nightlife': {
      en: 'Beach surfing, sunsets, nightlife',
      es: 'Surf en la playa, atardeceres, vida nocturna',
    },
    'volcano hikes, colonial architecture': {
      en: 'Volcano hikes, colonial architecture',
      es: 'Caminatas a volcanes, arquitectura colonial',
    },
    'museums, markets, urban culture': {
      en: 'Museums, markets, urban culture',
      es: 'Museos, mercados, cultura urbana',
    },
    'artisanal town, lake views': {
      en: 'Artisanal town, lake views',
      es: 'Pueblo artesanal, vistas al lago',
    },
    'colonial architecture, lake views': {
      en: 'Colonial architecture, lake views',
      es: 'Arquitectura colonial, vistas al lago',
    },
    'volcano hikes, colonial streets': {
      en: 'Volcano hikes, colonial streets',
      es: 'Caminatas a volcanes, calles coloniales',
    },
    'capital city, lakeside': {
      en: 'Capital city, lakeside',
      es: 'Ciudad capital, frente al lago',
    },
    'caribbean islands, snorkeling': {
      en: 'Caribbean islands, snorkeling',
      es: 'Islas caribeñas, snorkel',
    },
    'coffee farms, cloud forests': {
      en: 'Coffee farms, cloud forests',
      es: 'Fincas de café, bosques nubosos',
    },
    'modern city, canal, historic casco viejo': {
      en: 'Modern city, Canal, historic Casco Viejo',
      es: 'Ciudad moderna, Canal, Casco Viejo histórico',
    },
    'mayan ruins, jungle, waterfalls': {
      en: 'Mayan ruins, jungle, waterfalls',
      es: 'Ruinas mayas, selva, cascadas',
    },
    'colonial city, indigenous culture': {
      en: 'Colonial city, indigenous culture',
      es: 'Ciudad colonial, cultura indígena',
    },
    'caribbean culture, historic sites': {
      en: 'Caribbean culture, historic sites',
      es: 'Cultura caribeña, sitios históricos',
    },
    'mayan ruins, caves, adventure': {
      en: 'Mayan ruins, caves, adventure',
      es: 'Ruinas mayas, cuevas, aventura',
    },
  };

  if (MAP[lower]) {
    return lang === 'es' ? MAP[lower].es : MAP[lower].en;
  }
  return clean;
}

/**
 * Detects if a country is marked as unavailable in its description.
 */
export function isCountryUnavailable(desc: string | null | undefined): boolean {
  if (!desc) return false;
  const lower = desc.toLowerCase();
  return (
    lower.includes('no disponible') ||
    lower.includes('no se encuentra disponible') ||
    lower.includes('not available') ||
    lower.includes('unavailable') ||
    lower.includes('no habilitado')
  );
}

