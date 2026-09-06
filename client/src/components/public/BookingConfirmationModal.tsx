import { useState, useEffect } from 'react';
import { CheckCircle2, Copy, Check, Printer, MessageCircle, X, MapPin, Calendar, Clock, Users, Luggage, Building, ShieldCheck } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { settingsApi } from '../../api/endpoints';
import type { Booking, Shuttle } from '../../types';

interface BookingConfirmationModalProps {
  booking: Booking;
  shuttle: Shuttle;
  onClose: () => void;
}

export const BookingConfirmationModal = ({
  booking,
  shuttle,
  onClose,
}: BookingConfirmationModalProps) => {
  const [copied, setCopied] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState('+503 1234 5678');
  const [supportPhone, setSupportPhone] = useState('+503 1234 5678');

  // Format short locator code (e.g. TE-8A4C91DF)
  const bookingCode = `TE-${(booking.id || '').replace(/-/g, '').slice(0, 8).toUpperCase()}`;

  const originName = shuttle.origin_name || (shuttle as any).origin_city?.name || 'Origen';
  const destName = shuttle.destination_name || (shuttle as any).destination_city?.name || 'Destino';

  useEffect(() => {
    let isMounted = true;
    settingsApi.getPublic()
      .then((res) => {
        if (!isMounted) return;
        if (res.data?.contact_whatsapp) {
          setWhatsappNumber(res.data.contact_whatsapp);
        }
        if (res.data?.contact_phone) {
          setSupportPhone(res.data.contact_phone);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(bookingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  // Build clean WhatsApp message URL
  const cleanPhone = whatsappNumber.replace(/[^0-9]/g, '');
  const paymentText = booking.payment_status === 'paid'
    ? `✅ Pagado en línea (${booking.payment_method === 'wompi' ? 'Wompi - Tarjeta' : booking.payment_method === 'paypal' ? 'PayPal' : 'En línea'})`
    : `⏳ Pago al abordar en efectivo: $${booking.total_price} USD`;

  const waMessage = `¡Hola Trail Explorer! Acabo de hacer una reserva en su página web:
📌 *Localizador:* #${bookingCode}
🚐 *Ruta:* ${originName} → ${destName}
📅 *Fecha:* ${booking.date}
⏰ *Horario:* ${shuttle.schedule || 'Salida programada'}
👤 *Pasajero:* ${booking.passenger_name || 'Pasajero'}
📞 *Teléfono:* ${booking.passenger_phone || 'N/A'}
📍 *Punto de recogida:* ${booking.pickup_location}
🏁 *Destino en llegada:* ${booking.dropoff_location}
👥 *Asientos:* ${booking.seats} | 🧳 *Equipaje extra:* ${booking.extra_luggage || 0}
💵 *Total:* $${booking.total_price} USD
💳 *Método de Pago:* ${paymentText}

¿Podrían confirmarme los detalles de la recogida, por favor?`;

  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(waMessage)}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      {/* Printable styles container */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #digital-voucher-print-area, #digital-voucher-print-area * {
            visibility: visible;
          }
          #digital-voucher-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
            background: white !important;
            color: black !important;
            box-shadow: none !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 text-white px-6 py-6 sm:py-7 relative">
          <button
            onClick={onClose}
            className="no-print absolute top-4 right-4 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Cerrar ventana"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="absolute -inset-1.5 rounded-full bg-emerald-300/30 animate-ripple pointer-events-none" />
              <div className="w-12 h-12 rounded-full bg-white text-emerald-600 shadow-md flex items-center justify-center relative z-10">
                <CheckCircle2 className="w-7 h-7" />
              </div>
            </div>
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-wider bg-emerald-500/30 px-2.5 py-0.5 rounded-full mb-1">
                ¡Reserva Exitosa!
              </span>
              <h2 className="text-xl sm:text-2xl font-bold leading-tight">
                Voucher de Viaje Confirmado
              </h2>
              <p className="text-emerald-100 text-xs sm:text-sm mt-0.5">
                Hemos registrado tu solicitud. Guarda este comprobante para tu viaje.
              </p>
            </div>
          </div>
        </div>

        {/* Voucher Content - Included in print */}
        <div id="digital-voucher-print-area" className="p-5 sm:p-7 space-y-6">
          {/* Printable Brand Header (visible on paper/PDF) */}
          <div className="hidden print:flex items-center justify-between pb-4 border-b border-slate-300">
            <div className="flex items-center gap-3">
              <img src="/logo.jpeg" alt="Trail Explorer" className="h-12 w-auto object-contain rounded" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Trail Explorer Shuttle</h1>
                <p className="text-xs text-slate-600">Transporte Turístico & Shuttles en Centroamérica</p>
              </div>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Soporte 24/7</p>
              <p>{supportPhone}</p>
              <p>info@trailexplorer.com</p>
            </div>
          </div>

          {/* Localizer & Quick Copy Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50/80 border border-emerald-200 rounded-xl p-3.5 sm:p-4">
            <div>
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">
                Código Localizador / Reserva
              </span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-950 font-mono tracking-wider mt-0.5">
                #{bookingCode}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="no-print inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-800 bg-white hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-sm transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-emerald-700" />
                    <span>Copiar código</span>
                  </>
                )}
              </button>
              <Badge variant="success" className="text-xs py-1 px-2.5">
                {booking.status === 'confirmed' ? 'Confirmado' : 'Registrado'}
              </Badge>
            </div>
          </div>

          {/* Journey Details Boarding Card */}
          <Card className="border border-slate-200 shadow-sm overflow-hidden">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Detalle del Trayecto
              </span>
              <span className="text-xs font-medium text-slate-500">
                Operador: {shuttle.operator || 'Trail Explorer'}
              </span>
            </div>

            <CardContent className="p-4 sm:p-5 space-y-4">
              {/* Route line */}
              <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-4">
                <div className="text-left">
                  <span className="text-xs text-slate-400 font-medium">Origen</span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">{originName}</p>
                </div>
                <div className="flex flex-col items-center px-3">
                  <span className="text-xs text-emerald-600 font-semibold mb-1">
                    {shuttle.duration_hours}h aprox.
                  </span>
                  <div className="w-20 sm:w-32 h-0.5 bg-emerald-400 relative">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -top-1 left-0" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 absolute -top-1 right-0" />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Destino</span>
                  <p className="text-base sm:text-lg font-bold text-slate-900">{destName}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-sm">
                <div className="flex items-start gap-2.5">
                  <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Fecha de Salida</span>
                    <span className="font-semibold text-slate-800">{booking.date}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Clock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Horario / Turno</span>
                    <span className="font-semibold text-slate-800">{shuttle.schedule || 'Salida programada'}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Building className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Lugar de Recogida (Pick-up)</span>
                    <span className="font-semibold text-slate-900">{booking.pickup_location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Punto de Entrega (Drop-off)</span>
                    <span className="font-semibold text-slate-900">{booking.dropoff_location}</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Users className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Pasajero Titular</span>
                    <span className="font-semibold text-slate-800">
                      {booking.passenger_name || 'Sin nombre registrado'}
                    </span>
                    {booking.pickup_person_name && booking.pickup_person_name !== booking.passenger_name && (
                      <span className="text-xs text-slate-500 block">
                        (Recoger a: {booking.pickup_person_name})
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Luggage className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-slate-500 block">Capacidad & Equipaje</span>
                    <span className="font-semibold text-slate-800">
                      {booking.seats} {booking.seats === 1 ? 'asiento' : 'asientos'}
                      {booking.extra_luggage ? ` + ${booking.extra_luggage} equipaje extra` : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Payment Row */}
              <div className="bg-slate-50 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between border border-slate-200 gap-3">
                <div>
                  <span className="text-xs text-slate-500 block">Total del Pasaje</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
                    ${booking.total_price} USD
                  </span>
                </div>
                <div className="sm:text-right">
                  <span className="text-xs text-slate-500 block mb-1">Método y Estado de Pago</span>
                  <div className="flex flex-col sm:items-end gap-1">
                    {booking.payment_status === 'paid' ? (
                      <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        <Check className="w-3.5 h-3.5 text-emerald-700" />
                        PAGADO EN LÍNEA ({booking.payment_method === 'wompi' ? 'Wompi' : booking.payment_method === 'paypal' ? 'PayPal' : 'Confirmado'})
                      </span>
                    ) : (
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2.5 py-1 rounded-full inline-flex items-center gap-1.5 shadow-sm">
                        💵 PAGO PENDIENTE AL ABORDAR
                      </span>
                    )}
                    {booking.payment_id && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Ref. Transacción: #{booking.payment_id}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Passenger Notice & Instructions */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 space-y-1.5">
            <p className="font-semibold flex items-center gap-1.5 text-amber-950">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Instrucciones Importantes para el Día de tu Viaje:
            </p>
            <ul className="list-disc list-inside space-y-1 text-amber-800 pl-1">
              <li>Por favor, mantente listo en la recepción de tu hotel <strong>15 minutos antes</strong> de la hora acordada.</li>
              <li>Presenta este voucher digital desde tu teléfono móvil o impreso al chofer de la unidad.</li>
              {booking.payment_status === 'paid' ? (
                <li className="font-semibold text-emerald-800">Tu viaje está <strong>100% pagado en línea</strong>. No requieres abonar ningún saldo extra al chofer.</li>
              ) : (
                <li className="font-semibold text-amber-950">Recuerda llevar <strong>${booking.total_price} USD en efectivo exacto</strong> o realizar tu transferencia al momento de abordar la unidad.</li>
              )}
              <li>Si necesitas ajustar tu equipaje o dirección de recogida, comunícate con nosotros por WhatsApp.</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons Footer (Hidden during print) */}
        <div className="no-print bg-slate-50 border-t border-slate-200 px-5 sm:px-7 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center justify-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            <span>Descargar / Imprimir PDF</span>
          </Button>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-semibold text-sm rounded-lg shadow transition-colors"
            >
              <MessageCircle className="w-4 h-4 fill-current" />
              <span>Coordinar por WhatsApp</span>
            </a>

            <Button onClick={onClose} className="bg-slate-900 hover:bg-slate-800 text-white">
              Entendido / Finalizar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
