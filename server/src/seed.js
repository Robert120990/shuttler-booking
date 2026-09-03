import { prepare } from './db.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import { generateShuttleImage } from './utils/imageUtils.js';

const getImageUrl = (category, filename) => `/images/${category}/${filename}`;

export const DEFAULT_COUNTRY_IMAGES = {
  'costa-rica': '4d71c2d3-11a8-46a4-888c-f7a4b03cab55.webp',
  'guatemala': '89018267-ca97-4fe4-baa8-449638d316d9.webp',
  'el-salvador': '6cc37ed0-3747-4048-a2a4-2847f188047f.webp',
  'nicaragua': '6b8697be-6d0d-4684-846a-47ac018a673b.webp',
  'panama': 'f8f00ad1-7c97-4b0e-a1c0-289d148df740.webp',
  'mexico': '44d2d2a3-5956-41d2-8e9f-32cdd172dddf.webp',
  'belize': 'a4ae4ec7-d24a-4016-ac1a-0a0ac14ce3d5.webp',
  'honduras': '264f72b4-e00c-4c72-a914-52f153f1fdba.webp',
};

export const DEFAULT_CITY_IMAGES = {
  // Costa Rica
  'la-fortuna': '34107515-6273-4ac1-b253-651ed7f5ffae.webp',
  'monteverde': '20fee31d-acef-45e3-95f6-9abc6a57b04f.webp',
  'san-jose': 'e721c134-70c3-47ef-bcf4-cec7adecfecf.webp',
  'tamarindo': '15a76da7-3542-46c9-a10f-92852176bad1.webp',
  'puerto-viejo': 'b3c16504-2805-4c6e-a132-0df6279e81a5.webp',
  'liberia': '26f20d73-2ef8-4c14-b1e8-1ae8696650b7.webp',
  // Guatemala
  'antigua-guatemala': '87482884-3c34-41dd-a048-fe833611d110.webp',
  'flores-peten': '5548339a-37e5-4cac-b192-70f38b7f86d6.webp',
  'panajachel': '372dc37d-b613-4ed3-944d-77bc66bf42e1.webp',
  'quetzaltenango': 'd4014625-3505-49d4-98f9-3f803e56cc9e.webp',
  'guatemala-city': '48d64f60-a1d8-4f7e-bd31-431772855d73.webp',
  // El Salvador
  'el-tunco': 'ea33d26b-81c3-4346-a173-e8649f02111a.webp',
  'santa-ana': '9b972527-384b-4567-94b0-226201b994fa.webp',
  'san-salvador': '0a45d200-8afc-468a-a572-db3f8b37fdec.webp',
  'suchitoto': '40b7bc4f-2d7f-495f-82e7-ff90f4c71d50.webp',
  // Nicaragua
  'granada': '38071664-3768-4fdb-a122-8094435b16c5.webp',
  'leon': '3b886163-05b6-43cf-8e4f-34860c0db141.webp',
  'san-juan-del-sur': 'bd9b8903-c90c-473f-bf97-429098be79fe.webp',
  'managua': '43f6119f-afdc-446e-a406-67b018c8684c.webp',
  // Panama
  'bocas-del-toro': '4fc4772a-9c6d-4c72-abfd-5c3229fdff88.webp',
  'boquete': '4fffefdc-e521-49f8-a0e2-3e6ce1adf54d.webp',
  'panama-city': '12cb407b-425d-46ee-826b-03f2a55275dc.webp',
  // Mexico
  'palenque': '74ff7732-331c-4c9c-9f6a-ab8cbcd0d34e.webp',
  'san-cristobal-de-las-casas': 'c67335c8-2c03-446c-b99c-05bd25b54176.webp',
  // Belize
  'belize-city': '7c088f7c-08f0-450f-ab22-61417ffb8294.webp',
  'san-ignacio': 'a825043e-a741-4072-98d6-9203c2248ef3.webp',
  // Honduras
  'copan-ruinas': 'f3947644-620f-42eb-af30-35315a80c4a7.webp',
  'la-ceiba': '7590f472-4121-4de9-9c5c-a41c5e8d0950.webp',
};

export const DEFAULT_SHUTTLE_IMAGES = {
  'la-fortuna-to-san-josé': '/images/shuttles/shuttle-cdd55cb1-b8bd-49c1-ae75-db8799290186.webp',
  'liberia-to-san-josé': '/images/shuttles/shuttle-ff415624-1b55-49c2-ace7-38c59cee3ca1.webp',
  'antigua-to-san-salvador': '/images/shuttles/shuttle-cbc4e609-03a8-43ca-93f5-d5578d296f61.webp',
  'el-tunco-to-antigua': '/images/shuttles/shuttle-ba19b243-3663-4db4-ab11-876295717ac0.webp',
};

export async function syncDatabaseImages() {
  try {
    // 1. Check and repair countries
    for (const [slug, imgFile] of Object.entries(DEFAULT_COUNTRY_IMAGES)) {
      const imgUrl = getImageUrl('countries', imgFile);
      await prepare(`
        UPDATE countries 
        SET image_url = ? 
        WHERE slug = ? AND (image_url IS NULL OR image_url LIKE '%placeholder%' OR image_url = '')
      `).run(imgUrl, slug);
    }

    // 2. Check and repair cities
    for (const [slug, imgFile] of Object.entries(DEFAULT_CITY_IMAGES)) {
      const imgUrl = getImageUrl('cities', imgFile);
      await prepare(`
        UPDATE cities 
        SET image_url = ? 
        WHERE slug = ? AND (image_url IS NULL OR image_url LIKE '%placeholder%' OR image_url = '')
      `).run(imgUrl, slug);
    }

    // 3. Check and repair predefined shuttles
    for (const [slug, imgUrl] of Object.entries(DEFAULT_SHUTTLE_IMAGES)) {
      await prepare(`
        UPDATE shuttles 
        SET image_url = ? 
        WHERE slug = ? AND (image_url IS NULL OR image_url LIKE '%placeholder%' OR image_url = '')
      `).run(imgUrl, slug);
    }

    // 4. Generate composite images for any remaining shuttles without valid image
    const shuttlesWithoutImage = await prepare(`
      SELECT s.id, s.slug, c1.image_url as origin_img, c2.image_url as dest_img
      FROM shuttles s
      LEFT JOIN cities c1 ON s.origin_city_id = c1.id
      LEFT JOIN cities c2 ON s.destination_city_id = c2.id
      WHERE s.image_url IS NULL OR s.image_url LIKE '%placeholder%' OR s.image_url = ''
    `).all();

    for (const s of shuttlesWithoutImage) {
      if (s.origin_img && s.dest_img) {
        try {
          const generatedUrl = await generateShuttleImage(s.origin_img, s.dest_img);
          if (generatedUrl) {
            await prepare('UPDATE shuttles SET image_url = ? WHERE id = ?').run(generatedUrl, s.id);
          }
        } catch (err) {
          console.error(`Error generating shuttle banner for ${s.slug}:`, err);
        }
      }
    }
  } catch (err) {
    console.error('Error in syncDatabaseImages:', err);
  }
}

export async function seedSampleBookings() {
  try {
    // Fix any legacy booking pointing to invalid shuttle_id 's1'
    const invalidBookings = await prepare("SELECT id FROM bookings WHERE shuttle_id = 's1'").all();
    if (invalidBookings.length > 0) {
      const firstShuttle = await prepare('SELECT id FROM shuttles LIMIT 1').get();
      if (firstShuttle) {
        await prepare("UPDATE bookings SET shuttle_id = ? WHERE shuttle_id = 's1'").run(firstShuttle.id);
      }
    }

    const bookingCount = await prepare('SELECT COUNT(*) as count FROM bookings').get();
    if (bookingCount && Number(bookingCount.count) > 1) {
      return;
    }

    const shuttles = await prepare('SELECT id, name, price FROM shuttles').all();
    if (!shuttles || shuttles.length === 0) return;

    const insertBooking = prepare(`
      INSERT INTO bookings (
        id, user_id, shuttle_id, date, pickup_location, dropoff_location,
        passenger_name, passenger_email, passenger_phone, seats,
        extra_luggage, total_price, status, payment_status, pickup_person_name
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const sampleBookings = [
      {
        shuttleIndex: 0,
        date: '2026-09-10',
        pickup_location: 'Hotel Real InterContinental San José',
        dropoff_location: 'Tabacón Thermal Resort, La Fortuna',
        passenger_name: 'Carlos Mendoza',
        passenger_email: 'carlos.mendoza@gmail.com',
        passenger_phone: '+506 8834-5678',
        pickup_person_name: 'Carlos Mendoza',
        seats: 2,
        extra_luggage: 1,
        priceMultiplier: 2,
        extraFee: 15,
        status: 'confirmed',
        payment_status: 'paid'
      },
      {
        shuttleIndex: 1 % shuttles.length,
        date: '2026-09-12',
        pickup_location: 'Hotel Hilton Garden Inn Liberia Airport',
        dropoff_location: 'Hotel Presidente, San José',
        passenger_name: 'Emma Watson',
        passenger_email: 'emma.traveler@outlook.com',
        passenger_phone: '+1 415 555 2671',
        pickup_person_name: 'Emma Watson',
        seats: 1,
        extra_luggage: 0,
        priceMultiplier: 1,
        extraFee: 0,
        status: 'pending',
        payment_status: 'pending'
      },
      {
        shuttleIndex: 2 % shuttles.length,
        date: '2026-09-15',
        pickup_location: 'Hotel Casa Santo Domingo, Antigua Guatemala',
        dropoff_location: 'Hotel Barceló San Salvador',
        passenger_name: 'Alejandro Ramos',
        passenger_email: 'a.ramos@empresa.com',
        passenger_phone: '+503 7234-8901',
        pickup_person_name: 'Alejandro Ramos',
        seats: 3,
        extra_luggage: 2,
        priceMultiplier: 3,
        extraFee: 30,
        status: 'confirmed',
        payment_status: 'paid'
      },
      {
        shuttleIndex: 3 % shuttles.length,
        date: '2026-09-08',
        pickup_location: 'Boca Olas Resort Villas, El Tunco',
        dropoff_location: 'Hotel Los Pasos, Antigua Guatemala',
        passenger_name: 'Sophia Martinez',
        passenger_email: 'sophia.m@yahoo.com',
        passenger_phone: '+1 305 555 7890',
        pickup_person_name: 'Sophia Martinez',
        seats: 2,
        extra_luggage: 1,
        priceMultiplier: 2,
        extraFee: 20,
        status: 'completed',
        payment_status: 'paid'
      },
      {
        shuttleIndex: 0,
        date: '2026-09-20',
        pickup_location: 'Selina Hostel La Fortuna',
        dropoff_location: 'Aeropuerto Internacional Juan Santamaría (SJO)',
        passenger_name: 'David Schmidt',
        passenger_email: 'schmidt.david@posteo.de',
        passenger_phone: '+49 170 1234567',
        pickup_person_name: 'David Schmidt',
        seats: 1,
        extra_luggage: 0,
        priceMultiplier: 1,
        extraFee: 0,
        status: 'cancelled',
        payment_status: 'refunded'
      }
    ];

    for (const b of sampleBookings) {
      const shuttle = shuttles[b.shuttleIndex] || shuttles[0];
      const total = (shuttle.price * b.priceMultiplier) + b.extraFee;
      await insertBooking.run(
        uuidv4(),
        null,
        shuttle.id,
        b.date,
        b.pickup_location,
        b.dropoff_location,
        b.passenger_name,
        b.passenger_email,
        b.passenger_phone,
        b.seats,
        b.extra_luggage,
        total,
        b.status,
        b.payment_status,
        b.pickup_person_name
      );
    }
  } catch (err) {
    console.error('Error seeding sample bookings:', err);
  }
}

export async function seedData() {
  const userCount = await prepare('SELECT COUNT(*) as count FROM users').get();
  if (userCount && Number(userCount.count) > 0) {
    await syncDatabaseImages();
    await seedSampleBookings();
    return;
  }

  const adminPassword = bcrypt.hashSync('admin123', 10);
  const userPassword = bcrypt.hashSync('user123', 10);

  await prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(
    uuidv4(), 'Admin User', 'admin@trailexplorer.com', adminPassword, 'admin'
  );
  await prepare(`INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)`).run(
    uuidv4(), 'Demo User', 'user@example.com', userPassword, 'user'
  );

  const countries = [
    { id: uuidv4(), name: 'Costa Rica', slug: 'costa-rica', description: 'Rainforests, volcanoes, beaches, wildlife and unforgettable adventures.', image: DEFAULT_COUNTRY_IMAGES['costa-rica'] },
    { id: uuidv4(), name: 'Guatemala', slug: 'guatemala', description: 'Volcanoes, Mayan ruins, colonial cities and lake escapes.', image: DEFAULT_COUNTRY_IMAGES['guatemala'] },
    { id: uuidv4(), name: 'El Salvador', slug: 'el-salvador', description: 'Beaches, surfing, cultural towns and natural wonders.', image: DEFAULT_COUNTRY_IMAGES['el-salvador'] },
    { id: uuidv4(), name: 'Nicaragua', slug: 'nicaragua', description: 'Colonial cities, volcanoes, lakes and authentic culture.', image: DEFAULT_COUNTRY_IMAGES['nicaragua'] },
    { id: uuidv4(), name: 'Panamá', slug: 'panama', description: 'Canals, beaches, rainforests and biodiversity.', image: DEFAULT_COUNTRY_IMAGES['panama'] },
    { id: uuidv4(), name: 'México', slug: 'mexico', description: 'Ancient ruins, beaches, colonial cities and rich culture.', image: DEFAULT_COUNTRY_IMAGES['mexico'] },
    { id: uuidv4(), name: 'Belice', slug: 'belize', description: 'Barrier reef, Mayan ruins and Caribbean charm.', image: DEFAULT_COUNTRY_IMAGES['belize'] },
    { id: uuidv4(), name: 'Honduras', slug: 'honduras', description: 'Mayan ruins, Caribbean islands and natural parks.', image: DEFAULT_COUNTRY_IMAGES['honduras'] },
  ];

  const insertCountry = prepare(`INSERT INTO countries (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)`);
  for (const c of countries) {
    await insertCountry.run(c.id, c.name, c.slug, c.description, getImageUrl('countries', c.image));
  }

  const citiesData = {
    'costa-rica': [
      { name: 'La Fortuna', slug: 'la-fortuna', description: 'Arenal Volcano, hot springs, waterfalls', image: DEFAULT_CITY_IMAGES['la-fortuna'] },
      { name: 'Monteverde', slug: 'monteverde', description: 'Cloud forests, wildlife, eco-adventures', image: DEFAULT_CITY_IMAGES['monteverde'] },
      { name: 'San José', slug: 'san-jose', description: 'Museums, markets, cultural experiences', image: DEFAULT_CITY_IMAGES['san-jose'] },
      { name: 'Tamarindo', slug: 'tamarindo', description: 'Beaches, surfing, sunsets', image: DEFAULT_CITY_IMAGES['tamarindo'] },
      { name: 'Puerto Viejo', slug: 'puerto-viejo', description: 'Caribbean beaches, wildlife, surfing', image: DEFAULT_CITY_IMAGES['puerto-viejo'] },
      { name: 'Liberia', slug: 'liberia', description: 'Colonial charm, gateway to Guanacaste beaches', image: DEFAULT_CITY_IMAGES['liberia'] },
    ],
    'guatemala': [
      { name: 'Antigua Guatemala', slug: 'antigua-guatemala', description: 'Colonial streets, volcano views, ruins', image: DEFAULT_CITY_IMAGES['antigua-guatemala'] },
      { name: 'Flores Petén', slug: 'flores-peten', description: 'Mayan ruins, lake views, jungle adventures', image: DEFAULT_CITY_IMAGES['flores-peten'] },
      { name: 'Panajachel', slug: 'panajachel', description: 'Lake Atitlán views, volcanic landscapes', image: DEFAULT_CITY_IMAGES['panajachel'] },
      { name: 'Quetzaltenango', slug: 'quetzaltenango', description: 'Highland culture, volcano hikes', image: DEFAULT_CITY_IMAGES['quetzaltenango'] },
      { name: 'Guatemala City', slug: 'guatemala-city', description: 'Historic plazas, museums, markets', image: DEFAULT_CITY_IMAGES['guatemala-city'] },
    ],
    'el-salvador': [
      { name: 'El Tunco', slug: 'el-tunco', description: 'Beach surfing, sunsets, nightlife', image: DEFAULT_CITY_IMAGES['el-tunco'] },
      { name: 'Santa Ana', slug: 'santa-ana', description: 'Volcano hikes, colonial architecture', image: DEFAULT_CITY_IMAGES['santa-ana'] },
      { name: 'San Salvador', slug: 'san-salvador', description: 'Museums, markets, urban culture', image: DEFAULT_CITY_IMAGES['san-salvador'] },
      { name: 'Suchitoto', slug: 'suchitoto', description: 'Artisanal town, lake views', image: DEFAULT_CITY_IMAGES['suchitoto'] },
    ],
    'nicaragua': [
      { name: 'Granada', slug: 'granada', description: 'Colonial architecture, lake views', image: DEFAULT_CITY_IMAGES['granada'] },
      { name: 'León', slug: 'leon', description: 'Volcano hikes, colonial streets', image: DEFAULT_CITY_IMAGES['leon'] },
      { name: 'San Juan del Sur', slug: 'san-juan-del-sur', description: 'Beaches, surfing, sunsets', image: DEFAULT_CITY_IMAGES['san-juan-del-sur'] },
      { name: 'Managua', slug: 'managua', description: 'Capital city, lakeside', image: DEFAULT_CITY_IMAGES['managua'] },
    ],
    'panama': [
      { name: 'Bocas del Toro', slug: 'bocas-del-toro', description: 'Caribbean islands, snorkeling', image: DEFAULT_CITY_IMAGES['bocas-del-toro'] },
      { name: 'Boquete', slug: 'boquete', description: 'Coffee farms, cloud forests', image: DEFAULT_CITY_IMAGES['boquete'] },
      { name: 'Panama City', slug: 'panama-city', description: 'Modern city, Canal, historic Casco Viejo', image: DEFAULT_CITY_IMAGES['panama-city'] },
    ],
    'mexico': [
      { name: 'Palenque', slug: 'palenque', description: 'Mayan ruins, jungle, waterfalls', image: DEFAULT_CITY_IMAGES['palenque'] },
      { name: 'San Cristóbal de las Casas', slug: 'san-cristobal-de-las-casas', description: 'Colonial city, indigenous culture', image: DEFAULT_CITY_IMAGES['san-cristobal-de-las-casas'] },
    ],
    'belize': [
      { name: 'Belize City', slug: 'belize-city', description: 'Caribbean culture, historic sites', image: DEFAULT_CITY_IMAGES['belize-city'] },
      { name: 'San Ignacio', slug: 'san-ignacio', description: 'Mayan ruins, caves, adventure', image: DEFAULT_CITY_IMAGES['san-ignacio'] },
    ],
    'honduras': [
      { name: 'Copán Ruinas', slug: 'copan-ruinas', description: 'Mayan ruins, archaeological site', image: DEFAULT_CITY_IMAGES['copan-ruinas'] },
      { name: 'La Ceiba', slug: 'la-ceiba', description: 'Gateway to islands, nature', image: DEFAULT_CITY_IMAGES['la-ceiba'] },
    ],
  };

  const insertCity = prepare(`INSERT INTO cities (id, name, slug, country_id, description, image_url) VALUES (?, ?, ?, ?, ?, ?)`);
  const citiesMap = {};

  for (const country of countries) {
    const countryCities = citiesData[country.slug] || [];
    for (const city of countryCities) {
      const cityId = uuidv4();
      const imgUrl = getImageUrl('cities', city.image);
      citiesMap[city.slug] = { id: cityId, countryId: country.id, imageUrl: imgUrl };
      await insertCity.run(cityId, city.name, city.slug, country.id, city.description, imgUrl);
    }
  }

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
      image: null
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
      image: DEFAULT_SHUTTLE_IMAGES['la-fortuna-to-san-josé']
    },
    { 
      name: 'Liberia to San José', 
      origin: 'liberia', 
      dest: 'san-jose', 
      price: 54, 
      duration: 4, 
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
      image: DEFAULT_SHUTTLE_IMAGES['liberia-to-san-josé']
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
      image: null
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
      image: DEFAULT_SHUTTLE_IMAGES['antigua-to-san-salvador']
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
      image: DEFAULT_SHUTTLE_IMAGES['el-tunco-to-antigua']
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
      image: null
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
      image: null
    },
  ];

  const insertShuttle = prepare(`
    INSERT INTO shuttles (id, name, slug, origin_city_id, destination_city_id, price, duration_hours, schedule, availability, availability_days, service_type, description, included, to_bring, luggage_policy, luggage_options, pickup_info, cancellation_policy, operator, pets_allowed, image_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const s of shuttles) {
    const originCity = citiesMap[s.origin];
    const destCity = citiesMap[s.dest];
    if (originCity && destCity) {
      const shuttleId = uuidv4();
      let shuttleImage = s.image;
      
      if (!shuttleImage && originCity.imageUrl && destCity.imageUrl) {
        try {
          shuttleImage = await generateShuttleImage(originCity.imageUrl, destCity.imageUrl);
        } catch (err) {
          console.error(`Error generating composite shuttle image for ${s.name}:`, err);
        }
      }

      await insertShuttle.run(
        shuttleId, s.name, s.name.toLowerCase().replace(/\s+/g, '-'),
        originCity.id, destCity.id, s.price, s.duration, s.schedule, s.availability, 
        JSON.stringify(s.availabilityDays || [0,1,2,3,4,5,6]),
        s.type, s.desc,
        s.included, s.toBring, s.luggagePolicy, s.luggageOptions,
        s.pickupInfo, s.cancellationPolicy, s.operator, s.petsAllowed,
        shuttleImage || null
      );
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
  for (const f of faqs) {
    await insertFaq.run(uuidv4(), f.q, f.q_en, f.a, f.a_en, f.category, 0);
  }

  await syncDatabaseImages();
  await seedSampleBookings();

  console.log('Database seeded and images synchronized successfully!');
}


