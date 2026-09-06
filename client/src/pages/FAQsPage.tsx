import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { SEO } from '../components/seo/SEO';
import { useLanguageStore } from '../i18n';

const FAQ_DATA_EN = [
  {
    category: 'Booking',
    questions: [
      { q: 'How can I book a service?', a: 'To book a service, click the "Book Now" button on our website. Select an available date, pickup time, enter your locations and number of seats, then proceed to payment.' },
      { q: 'Can I book multiple seats at once?', a: 'Yes, you can select the number of seats you need when completing the booking form on our website.' },
      { q: 'Can I choose my pickup and dropoff locations?', a: 'Yes, during the booking process you can enter or select your preferred pickup and dropoff locations.' },
    ],
  },
  {
    category: 'Payment',
    questions: [
      { q: 'What payment methods are accepted?', a: 'We accept Visa and Mastercard credit/debit cards, ApplePay, GooglePay, and PayPal.' },
      { q: 'Can I pay cash?', a: 'We do not accept cash for reservations. Please use our online payment methods.' },
      { q: 'Are there any processing fees?', a: 'Payment processing fees are currently 20% for each payment made on our platforms.' },
    ],
  },
  {
    category: 'Cancellation',
    questions: [
      { q: 'What is your cancellation policy?', a: 'You can cancel any service at any time. Cancellations made at least 24 hours before departure are eligible for a refund within 3-5 business days.' },
      { q: 'What about late cancellations?', a: 'Late cancellations (less than 24 hours before departure) will not be refunded as the payment is considered an administration fee.' },
      { q: 'Can I get a credit instead of a refund?', a: 'Yes! Instead of a refund to your payment method, you can receive the full amount as Store Credit, valid for one year.' },
    ],
  },
  {
    category: 'Travel',
    questions: [
      { q: 'What is the luggage policy?', a: 'Standard luggage includes one backpack and one small carry-on bag per person. Surfboards, bicycles, or kayaks are not allowed.' },
      { q: 'Can I bring my pet?', a: 'Pets are not allowed on international buses due to immigration regulations. On domestic buses, pets are allowed in carriers but may need an additional seat.' },
      { q: 'What documents do I need for international services?', a: 'All travelers must present appropriate documentation at each border crossing, including a passport with at least six months validity.' },
    ],
  },
];

const FAQ_DATA_ES = [
  {
    category: 'Reservas',
    questions: [
      { q: '¿Cómo puedo reservar un servicio?', a: 'Para reservar un servicio, haz clic en el botón "Reservar" en nuestro sitio web. Selecciona una fecha disponible, hora de salida, ingresa tus ubicaciones y cantidad de asientos, luego procede a la confirmación.' },
      { q: '¿Puedo reservar múltiples asientos a la vez?', a: 'Sí, puedes seleccionar el número de asientos que necesitas al completar el formulario de reserva en nuestra web.' },
      { q: '¿Puedo elegir mis puntos de recogida y destino?', a: 'Sí, durante el proceso de reserva puedes ingresar o seleccionar tu hotel, hostal o dirección de recogida y destino preferido.' },
    ],
  },
  {
    category: 'Pagos',
    questions: [
      { q: '¿Qué métodos de pago son aceptados?', a: 'Aceptamos tarjetas de crédito y débito Visa y Mastercard, ApplePay, GooglePay y PayPal.' },
      { q: '¿Puedo pagar en efectivo?', a: 'No aceptamos pagos en efectivo al conductor para confirmación de reservas. Por favor utiliza nuestras opciones de pago en línea.' },
      { q: '¿Hay tarifas de procesamiento?', a: 'Las tarifas de procesamiento de pago están incluidas o detalladas al momento de completar la reserva.' },
    ],
  },
  {
    category: 'Cancelaciones',
    questions: [
      { q: '¿Cuál es la política de cancelación?', a: 'Puedes cancelar cualquier servicio en cualquier momento. Las cancelaciones realizadas al menos 24 horas antes de la salida son elegibles para reembolso completo en 3-5 días hábiles.' },
      { q: '¿Qué sucede con cancelaciones de último momento?', a: 'Las cancelaciones con menos de 24 horas de anticipación no son reembolsables debido a la reserva garantizada de la unidad de transporte.' },
      { q: '¿Puedo obtener crédito en lugar de reembolso?', a: '¡Sí! En lugar de un reembolso a tu tarjeta, puedes recibir el monto total como crédito para futuras reservas válido por un año.' },
    ],
  },
  {
    category: 'Viaje y Equipaje',
    questions: [
      { q: '¿Cuál es la política de equipaje?', a: 'El equipaje estándar incluye una mochila o maleta principal y un bolso de mano por persona. Artículos voluminosos como tablas de surf requieren añadir equipaje extra.' },
      { q: '¿Puedo llevar a mi mascota?', a: 'En rutas internacionales no se permiten mascotas debido a regulaciones migratorias. En rutas nacionales se permiten en transportadora con aviso previo.' },
      { q: '¿Qué documentos necesito para rutas internacionales?', a: 'Todos los pasajeros deben presentar pasaporte vigente con al menos 6 meses de validez y los visados correspondientes para el cruce de fronteras.' },
    ],
  },
];

export const FAQsPage = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();

  const faqData = language === 'es' ? FAQ_DATA_ES : FAQ_DATA_EN;
  const flatFaqs = faqData.flatMap((section) => section.questions);

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: flatFaqs.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <SEO
        title={t('faqs.title')}
        description={t('faqs.subtitle')}
        path="/faqs"
        jsonLd={[faqSchema]}
      />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">{t('faqs.title')}</h1>
          <p className="text-lg text-slate-600">{t('faqs.subtitle')}</p>
        </div>

        <div className="space-y-8">
          {faqData.map((section) => (
            <Card key={section.category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full" />
                  {section.category}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.questions.map((item, index) => (
                  <details key={index} className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <span className="font-medium text-slate-900">{item.q}</span>
                      <ChevronDown className="w-5 h-5 text-slate-400 group-open:rotate-180 transition-transform" />
                    </summary>
                    <div className="p-4 text-slate-600">
                      {item.a}
                    </div>
                  </details>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">{t('faqs.stillHaveQuestions')}</p>
          <Link to="/contact" className="text-emerald-600 font-medium hover:underline">
            {t('faqs.contactUs')}
          </Link>
        </div>
      </div>
    </div>
  );
};
