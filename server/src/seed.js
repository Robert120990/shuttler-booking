import { prepare } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { generateShuttleImage } from './utils/imageUtils.js';

const getImageUrl = (category, filename) => `/images/${category}/${filename}`;
const getCityImageUrl = (filename) => `/images/cities/${filename}`;

export async function seedData() {
  const userCount = prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount && userCount.count > 0) return;

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('user123', 10);

  prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(
    uuidv4(), 'Admin User', 'admin@trailexplorer.com', adminPassword, 'admin'
  );
  prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(
    uuidv4(), 'Demo User', 'user@example.com', userPassword, 'user'
  );

  const countries = [
    { id: uuidv4(), name: 'Costa Rica', slug: 'costa-rica', description: 'Rainforests, volcanoes, beaches, wildlife and unforgettable adventures.', image: 'placeholder.png' },
    { id: uuidv4(), name: 'Guatemala', slug: 'guatemala', description: 'Volcanoes, Mayan ruins, colonial cities and lake escapes.', image: 'placeholder.png' },
    { id: uuidv4(), name: 'El Salvador', slug: 'el-salvador', description: 'Beaches, surfing, cultural towns and natural wonders.', image: 'placeholder.png' },
    { id: uuidv4(), name: 'Nicaragua', slug: 'nicaragua', description: 'Colonial cities, volcanoes, lakes and authentic culture.', image: 'placeholder.png' },
    { id: uuidv4(), name: 'Panamá', slug: 'panama', description: 'Canals, beaches, rainforests and biodiversity.', image: 'placeholder.png' },
    { id: uuidv4(), name: 'México', slug: 'mexico', description: 'Ancient ruins, beaches, colonial cities and rich culture.', image: 'placeholder.png' },
    { id: uuidv4(), name: 'Belice', slug: 'belize', description: 'Barrier reef, Mayan ruins and Caribbean charm.', image: 'placeholder.png' },
    { id: uuidv4(), name: 'Honduras', slug: 'honduras', description: 'Mayan ruins, Caribbean islands and natural parks.', image: 'placeholder.png' },
  ];

  const insertCountry = prepare(`INSERT INTO countries (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)`);
  countries.forEach(c => insertCountry.run(c.id, c.name, c.slug, c.description, getImageUrl('countries', c.image)));

  const citiesData = {
    'costa-rica': [
      { name: 'La Fortuna', slug: 'la-fortuna', description: 'Arenal Volcano, hot springs, waterfalls', image: 'placeholder.png' },
      { name: 'Monteverde', slug: 'monteverde', description: 'Cloud forests, wildlife, eco-adventures', image: 'placeholder.png' },
      { name: 'San José', slug: 'san-jose', description: 'Museums, markets, cultural experiences', image: 'placeholder.png' },
      { name: 'Tamarindo', slug: 'tamarindo', description: 'Beaches, surfing, sunsets', image: 'placeholder.png' },
      { name: 'Puerto Viejo', slug: 'puerto-viejo', description: 'Caribbean beaches, wildlife, surfing', image: 'placeholder.png' },
      { name: 'Liberia', slug: 'liberia', description: 'Colonial charm, gateway to Guanacaste beaches', image: 'placeholder.png' },
    ],
    'guatemala': [
      { name: 'Antigua Guatemala', slug: 'antigua-guatemala', description: 'Colonial streets, volcano views, ruins', image: 'placeholder.png' },
      { name: 'Flores Petén', slug: 'flores-peten', description: 'Mayan ruins, lake views, jungle adventures', image: 'placeholder.png' },
      { name: 'Panajachel', slug: 'panajachel', description: 'Lake Atitlán views, volcanic landscapes', image: 'placeholder.png' },
      { name: 'Quetzaltenango', slug: 'quetzaltenango', description: 'Highland culture, volcano hikes', image: 'placeholder.png' },
      { name: 'Guatemala City', slug: 'guatemala-city', description: 'Historic plazas, museums, markets', image: 'placeholder.png' },
    ],
    'el-salvador': [
      { name: 'El Tunco', slug: 'el-tunco', description: 'Beach surfing, sunsets, nightlife', image: 'placeholder.png' },
      { name: 'Santa Ana', slug: 'santa-ana', description: 'Volcano hikes, colonial architecture', image: 'placeholder.png' },
      { name: 'San Salvador', slug: 'san-salvador', description: 'Museums, markets, urban culture', image: 'placeholder.png' },
      { name: 'Suchitoto', slug: 'suchitoto', description: 'Artisanal town, lake views', image: 'placeholder.png' },
    ],
    'nicaragua': [
      { name: 'Granada', slug: 'granada', description: 'Colonial architecture, lake views', image: 'placeholder.png' },
      { name: 'León', slug: 'leon', description: 'Volcano hikes, colonial streets', image: 'placeholder.png' },
      { name: 'San Juan del Sur', slug: 'san-juan-del-sur', description: 'Beaches, surfing, sunsets', image: 'placeholder.png' },
      { name: 'Managua', slug: 'managua', description: 'Capital city, lakeside', image: 'placeholder.png' },
    ],
    'panama': [
      { name: 'Bocas del Toro', slug: 'bocas-del-toro', description: 'Caribbean islands, snorkeling', image: 'placeholder.png' },
      { name: 'Boquete', slug: 'boquete', description: 'Coffee farms, cloud forests', image: 'placeholder.png' },
      { name: 'Panama City', slug: 'panama-city', description: 'Modern city, Canal, historic Casco Viejo', image: 'placeholder.png' },
    ],
    'mexico': [
      { name: 'Palenque', slug: 'palenque', description: 'Mayan ruins, jungle, waterfalls', image: 'placeholder.png' },
      { name: 'San Cristóbal de las Casas', slug: 'san-cristobal-de-las-casas', description: 'Colonial city, indigenous culture', image: 'placeholder.png' },
    ],
    'belize': [
      { name: 'Belize City', slug: 'belize-city', description: 'Caribbean culture, historic sites', image: 'placeholder.png' },
      { name: 'San Ignacio', slug: 'san-ignacio', description: 'Mayan ruins, caves, adventure', image: 'placeholder.png' },
    ],
    'honduras': [
      { name: 'Copán Ruinas', slug: 'copan-ruinas', description: 'Mayan ruins, archaeological site', image: 'placeholder.png' },
      { name: 'La Ceiba', slug: 'la-ceiba', description: 'Gateway to islands, nature', image: 'placeholder.png' },
    ],
  };

  const insertCity = prepare(`INSERT INTO cities (id, name, slug, country_id, description, image_url) VALUES (?, ?, ?, ?, ?, ?)`);
  const citiesMap = {};
  
  countries.forEach(country => {
    const countryCities = citiesData[country.slug] || [];
    countryCities.forEach(city => {
      const cityId = uuidv4();
      citiesMap[city.slug] = { id: cityId, countryId: country.id };
      insertCity.run(cityId, city.name, city.slug, country.id, city.description, getImageUrl('cities', city.image));
    });
  });

  const shuttles = [
    { 
      name: 'La Fortuna to Monteverde', 
      origin: 'la-fortuna', 
      dest: 'monteverde', 
      price: 59, 
      duration: 4, 
      schedule: '8:00 AM', 
      availability: 'Every day',
      availabilityDays: [0,1,2,3,4,5,6],
      type: 'local', 
      desc: 'Easy door-to-door transportation from La Fortuna to Monteverde. Travel through the beautiful Costa Rican countryside.',
      included: 'Air conditioning, Door-to-door service, Free WiFi',
      toBring: 'Book or Kindle, Headphones, Water, Camera',
      luggagePolicy: '1 backpack and 1 carry-on per person',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 15 }]),
      pickupInfo: 'Pickup from your hotel in La Fortuna area.\nMeet your driver at the lobby 15 minutes before departure.',
      cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
      operator: 'Trail Explorer Partner',
      petsAllowed: 1,
      image: 'placeholder.png'
    },
    { 
      name: 'La Fortuna to San José', 
      origin: 'la-fortuna', 
      dest: 'san-jose', 
      price: 59, 
      duration: 4, 
      schedule: '8:00 AM, 1:00 PM', 
      availability: 'Every day',
      availabilityDays: [0,1,2,3,4,5,6],
      type: 'local', 
      desc: 'Comfortable shuttle from La Fortuna to San José. Perfect for connecting flights or city exploration.',
      included: 'Air conditioning, Door-to-door service, Free WiFi',
      toBring: 'Book or Kindle, Headphones, Water',
      luggagePolicy: '1 backpack and 1 carry-on per person',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 15 }, { name: 'Surfboard', price: 25 }]),
      pickupInfo: 'Pickup from La Fortuna hotels between 7:30-8:00 AM.\nDrop-off at Juan Santamaría Airport and San José hotels.',
      cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
      operator: 'Trail Explorer Partner',
      petsAllowed: 0,
      image: 'placeholder.png'
    },
    { 
      name: 'Liberia to San José', 
      origin: 'liberia', 
      dest: 'san-jose', 
      price: 59, 
      duration: 4.5, 
      schedule: '9:15 AM, 3:15 PM', 
      availability: 'Every day',
      availabilityDays: [0,1,2,3,4,5,6],
      type: 'local', 
      desc: 'Scenic route from Liberia to San José. Great option for airport transfers.',
      included: 'Air conditioning, Door-to-door service',
      toBring: 'Headphones, Water, Light clothing',
      luggagePolicy: '1 backpack and 1 carry-on per person',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 15 }]),
      pickupInfo: 'Pickup from Liberia International Airport and hotels.\nDrop-off at Juan Santamaría Airport and San José.',
      cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
      operator: 'Trail Explorer Partner',
      petsAllowed: 1,
      image: 'placeholder.png'
    },
    { 
      name: 'Tamarindo to Monteverde', 
      origin: 'tamarindo', 
      dest: 'monteverde', 
      price: 59, 
      duration: 4.5, 
      schedule: '7:45 AM', 
      availability: 'Every day',
      availabilityDays: [0,1,2,3,4,5,6],
      type: 'local', 
      desc: 'Beach to cloud forest shuttle. Experience the diversity of Costa Rica!',
      included: 'Air conditioning, Door-to-door service, Snacks',
      toBring: 'Book or Kindle, Layers of clothing, Camera, Water',
      luggagePolicy: '1 backpack and 1 carry-on per person',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 15 }, { name: 'Surfboard', price: 25 }, { name: 'Bicycle', price: 35 }]),
      pickupInfo: 'Beach area hotel pickup starting at 7:00 AM.\nArrival at Monteverde around 12:00 PM.',
      cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
      operator: 'Trail Explorer Partner',
      petsAllowed: 0,
      image: 'placeholder.png'
    },
    { 
      name: 'Antigua to San Salvador', 
      origin: 'antigua-guatemala', 
      dest: 'san-salvador', 
      price: 40, 
      duration: 7, 
      schedule: '9:00 AM', 
      availability: 'Every day',
      type: 'international', 
      desc: 'Cross-border shuttle from Antigua Guatemala to San Salvador. Comfortable international travel.',
      included: 'Air conditioning, Border assistance, Water',
      toBring: 'Passport, Headphones, Snacks, Layers of clothing',
      luggagePolicy: '1 backpack and 1 carry-on per person. International luggage fees may apply.',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 20 }, { name: 'Oversized Bag', price: 35 }]),
      pickupInfo: 'Hotel pickup in Antigua Guatemala.\nBorder crossing at La Hachadura.\nDrop-off at San Salvador hotels and bus terminal.',
      cancellationPolicy: 'Free cancellation up to 48 hours before departure.',
      operator: 'International Shuttle Co.',
      petsAllowed: 0,
      image: 'placeholder.png'
    },
    { 
      name: 'El Tunco to Antigua', 
      origin: 'el-tunco', 
      dest: 'antigua-guatemala', 
      price: 35, 
      duration: 5, 
      schedule: '3:00 AM', 
      availability: 'Every day',
      type: 'international', 
      desc: 'Beach to colonial city shuttle. Early morning departure for a full day in Antigua.',
      included: 'Air conditioning, Border assistance, Water',
      toBring: 'Passport, Towel, Sunscreen, Change of clothes',
      luggagePolicy: '1 backpack and 1 carry-on per person',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 20 }, { name: 'Surfboard', price: 30 }]),
      pickupInfo: 'Beach area pickup in El Tunco.\nBorder crossing at La Hachadura.\nArrival in Antigua Guatemala by 8:00 AM.',
      cancellationPolicy: 'Free cancellation up to 48 hours before departure.',
      operator: 'International Shuttle Co.',
      petsAllowed: 0,
      image: 'placeholder.png'
    },
    { 
      name: 'Monteverde to La Fortuna', 
      origin: 'monteverde', 
      dest: 'la-fortuna', 
      price: 59, 
      duration: 4, 
      schedule: '8:00 AM', 
      availability: 'Every day',
      availabilityDays: [0,1,2,3,4,5,6],
      type: 'local', 
      desc: 'Cloud forest to volcano region shuttle. See two of Costa Rica\'s highlights in one trip!',
      included: 'Air conditioning, Door-to-door service, Free WiFi',
      toBring: 'Book or Kindle, Headphones, Water, Camera',
      luggagePolicy: '1 backpack and 1 carry-on per person',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 15 }]),
      pickupInfo: 'Pickup from Monteverde hotels and hostels.\nScenic drive through the mountains.\nDrop-off at La Fortuna area accommodations.',
      cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
      operator: 'Trail Explorer Partner',
      petsAllowed: 1,
      image: 'placeholder.png'
    },
    { 
      name: 'Granada to León', 
      origin: 'granada', 
      dest: 'leon', 
      price: 25, 
      duration: 2, 
      schedule: '10:00 AM', 
      availability: 'Every day',
      availabilityDays: [0,1,2,3,4,5,6],
      type: 'local', 
      desc: 'Colonial cities shuttle. Perfect day trip between Nicaragua\'s historic cities.',
      included: 'Air conditioning, Door-to-door service',
      toBring: 'Camera, Hat, Sunscreen, Water',
      luggagePolicy: '1 backpack and 1 carry-on per person',
      luggageOptions: JSON.stringify([{ name: 'Extra Bag', price: 10 }]),
      pickupInfo: 'Hotel pickup in Granada.\nScenic route through Masaya.\nDrop-off at León hotels.',
      cancellationPolicy: 'Free cancellation up to 24 hours before departure.',
      operator: 'Nicaragua Shuttle Services',
      petsAllowed: 1,
      image: 'placeholder.png'
    },
  ];

  const insertShuttle = prepare(`
    INSERT INTO shuttles (id, name, slug, origin_city_id, destination_city_id, price, duration_hours, schedule, availability, availability_days, service_type, description, included, to_bring, luggage_policy, luggage_options, pickup_info, cancellation_policy, operator, pets_allowed, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const shuttleIds = [];
  shuttles.forEach(s => {
    const originCity = citiesMap[s.origin];
    const destCity = citiesMap[s.dest];
    if (originCity && destCity) {
      const shuttleId = uuidv4();
      shuttleIds.push({ id: shuttleId, originCity, destCity });
      insertShuttle.run(
        shuttleId, s.name, s.name.toLowerCase().replace(/\s+/g, '-'),
        originCity.id, destCity.id, s.price, s.duration, s.schedule, s.availability, 
        JSON.stringify(s.availabilityDays || [0,1,2,3,4,5,6]),
        s.type, s.desc,
        s.included, s.toBring, s.luggagePolicy, s.luggageOptions,
        s.pickupInfo, s.cancellationPolicy, s.operator, s.petsAllowed,
        null
      );
    }
  });

  for (const s of shuttleIds) {
    try {
      const imageUrl = await generateShuttleImage(
        getCityImageUrl('placeholder.png'),
        getCityImageUrl('placeholder.png')
      );
      if (imageUrl) {
        prepare('UPDATE shuttles SET image_url = ? WHERE id = ?').run(imageUrl, s.id);
      }
    } catch (err) {
      console.error('Error generating shuttle image:', err);
    }
  }

  const faqs = [
    { q: 'How can I book a service?', q_en: 'How can I book a service?', a: 'To book a service, click the "Book Now" button on our website. Select an available date, pickup time, enter your locations and number of seats, then proceed to payment.', a_en: 'To book a service, click the "Book Now" button on our website.', category: 'Booking' },
    { q: 'What payment methods are accepted?', q_en: 'What payment methods are accepted?', a: 'We accept Visa and Mastercard credit/debit cards, ApplePay, GooglePay, and PayPal.', a_en: 'We accept Visa, Mastercard, ApplePay, GooglePay, and PayPal.', category: 'Payment' },
    { q: 'Can I cancel my reservation?', q_en: 'Can I cancel my reservation?', a: 'You can cancel any service at any time. Cancellations made at least 24 hours before departure are eligible for a refund within 3-5 business days.', a_en: 'You can cancel any service at any time.', category: 'Cancellation' },
    { q: 'What is the luggage policy?', q_en: 'What is the luggage policy?', a: 'Standard luggage includes one backpack and one small carry-on bag per person. Surfboards, bicycles, or kayaks are not allowed.', a_en: 'One backpack and one carry-on bag per person.', category: 'Travel' },
    { q: 'Are pets allowed?', q_en: 'Are pets allowed?', a: 'Pets are not allowed on international shuttles. On domestic shuttles, small pets in carriers may be allowed.', a_en: 'Pets are not allowed on international shuttles.', category: 'Travel' },
  ];

  const insertFaq = prepare(`INSERT INTO faqs (id, question, question_en, answer, answer_en, category, "order") VALUES (?, ?, ?, ?, ?, ?, ?)`);
  faqs.forEach((f, i) => insertFaq.run(uuidv4(), f.q, f.q_en, f.a, f.a_en, f.category, i));

  console.log('Database seeded successfully!');
}
