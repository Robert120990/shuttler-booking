# Trail Explorer - Gekko Trails Clone

## Descripción
Clon de Gekko Trails Explorer - plataforma de reservas de shuttles/transporte para Centroamérica.

## Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: SQLite (sql.js)
- **Auth**: JWT
- **i18n**: react-i18next (EN/ES)
- **State**: Zustand
- **Images**: sharp (optimización WebP)

## Estructura del Proyecto

```
reservas/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── api/
│   │   │   ├── client.ts      # Axios + getImageUrl()
│   │   │   └── endpoints.ts   # API calls
│   │   ├── components/
│   │   │   ├── admin/        # AdminShuttles, AdminBookings, AdminDashboard, etc.
│   │   │   ├── public/       # ShuttlePage, BookingModal, HomePage, CityPage
│   │   │   └── ui/           # Button, Card, Input, Select, Badge, ImageUploader
│   │   ├── pages/            # LoginPage, RegisterPage
│   │   ├── stores/           # authStore, bookingStore, themeStore
│   │   ├── i18n.ts           # Configuración i18n
│   │   └── types/index.ts    # TypeScript interfaces
│   └── package.json
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── index.js          # Express app (puerto 3001)
│   │   ├── db.js             # SQLite setup con sql.js
│   │   ├── seed.js           # Datos de demostración
│   │   ├── routes/
│   │   │   ├── shuttles.js   # CRUD + generación de imágenes
│   │   │   ├── bookings.js   # CRUD reservas
│   │   │   ├── upload.js     # Subida de imágenes
│   │   │   ├── countries.js  # CRUD países
│   │   │   ├── cities.js     # CRUD ciudades
│   │   │   ├── faqs.js       # CRUD FAQs
│   │   │   └── auth.js       # Login/Register
│   │   └── utils/
│   │       └── imageUtils.js # sharp: resize, compress, combine shuttle images
│   ├── public/images/        # Imágenes locales (categories: countries, cities, shuttles)
│   └── database.sqlite       # Base de datos SQLite
│
└── shared/                    # Código compartido (futuro)
```

## Modelo de Datos

### Tablas Principales
- **users**: id, name, email, password_hash, role (admin/user)
- **countries**: id, name, slug, flag, description, image_url
- **cities**: id, name, slug, country_id, description, image_url
- **shuttles**: id, name, slug, origin_city_id, destination_city_id, price, duration_hours, schedule, availability, availability_days, service_type, description, included, to_bring, luggage_policy, luggage_options (JSON), pickup_info, cancellation_policy, operator, pets_allowed, image_url, rating
- **bookings**: id, user_id, shuttle_id, date, pickup_person_name, pickup_location, dropoff_location, passenger_name, passenger_email, passenger_phone, seats, extra_luggage, total_price, status, payment_status, created_at
- **faqs**: id, question, question_en, answer, answer_en, category, order
- **settings**: id, key, value

## Credenciales
- **Admin**: admin@trailexplorer.com / admin123
- **Demo User**: user@example.com / user123

## Puertos
- Backend: http://localhost:3001
- Frontend: http://localhost:5173 (o siguiente disponible)

## Características Implementadas

### Usuario
- [x] Registro y Login con JWT
- [x] Dark mode
- [x] Cambio de idioma (EN/ES)

### Shuttles
- [x] CRUD completo desde admin
- [x] Imágenes generadas automáticamente combinando origen + destino
- [x] Disponibilidad por días de la semana (availability_days)
- [x] Texto de disponibilidad auto-generado
- [x] Opciones de equipaje extra con precios
- [x] Pickup info, cancellation policy, operator
- [x] Filtrado por tipo (local/international)

### Reservas
- [x] Formulario en modal
- [x] Número de pasajeros (1-15)
- [x] Nombre de persona a recoger (pickup_person_name)
- [x] Equipaje extra por tipo y cantidad
- [x] Cálculo automático de precio total
- [x] Estados: pending, confirmed, completed, cancelled

### Admin
- [x] Dashboard con estadísticas
- [x] Gestión de Countries, Cities, Shuttles, Bookings, FAQs
- [x] Subida de imágenes con optimización
- [x] Filtros y búsqueda

## Próximos Pasos Sugeridos

1. **Reservas**:
   - Agregar capacidad máxima por fecha
   - Verificar disponibilidad en tiempo real
   - Notificaciones por email

2. **Shuttles**:
   - Horarios múltiples por día
   - Galería de imágenes adicional

3. **UI/UX**:
   - Animaciones de transición
   - Loading states mejorados
   - Páginas de error personalizadas

4. **Pagos**:
   - Integración con Stripe/PayPal (demo mode actual)

5. **Reviews**:
   - Sistema de reseñas para shuttles

## Comandos
```bash
# Iniciar backend
cd server && npm run dev

# Iniciar frontend
cd client && npm run dev

# Reset base de datos
cd server && node src/reset-db.js
```
