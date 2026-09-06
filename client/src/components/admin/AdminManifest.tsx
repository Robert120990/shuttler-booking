import { useState, useEffect } from 'react';
import {
  ClipboardList,
  Calendar,
  Clock,
  MapPin,
  Building,
  Users,
  Luggage,
  Printer,
  MessageCircle,
  Phone,
  CheckCircle2,
  RefreshCw,
  Filter,
  Check,
  Copy,
} from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { bookingsApi } from '../../api/endpoints';
import type { ManifestData, ManifestRoute } from '../../types';

export const AdminManifest = () => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedShuttleId, setSelectedShuttleId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [manifestData, setManifestData] = useState<ManifestData | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedRouteId, setCopiedRouteId] = useState<string | null>(null);

  const fetchManifest = async () => {
    try {
      setLoading(true);
      const res = await bookingsApi.getManifest(selectedDate, selectedShuttleId || undefined);
      setManifestData(res.data);
    } catch (error) {
      console.error('Error al obtener manifiesto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchManifest();
  }, [selectedDate, selectedShuttleId]);

  const handleQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handleBoardingChange = async (
    bookingId: string,
    newStatus: 'pending' | 'boarded' | 'no_show'
  ) => {
    try {
      setUpdatingId(bookingId);
      await bookingsApi.updateBoarding(bookingId, newStatus);

      // Optimistically update local state
      setManifestData((prev) => {
        if (!prev) return prev;

        let boardedDelta = 0;
        let pendingDelta = 0;
        let noShowDelta = 0;

        const updatedRoutes = prev.routes.map((route) => {
          const updatedPassengers = route.passengers.map((p) => {
            if (p.id === bookingId) {
              const oldStatus = p.boarding_status || 'pending';
              const seats = Number(p.seats) || 1;

              // Adjust previous counts
              if (oldStatus === 'boarded') boardedDelta -= seats;
              else if (oldStatus === 'no_show') noShowDelta -= seats;
              else pendingDelta -= seats;

              // Adjust new counts
              if (newStatus === 'boarded') boardedDelta += seats;
              else if (newStatus === 'no_show') noShowDelta += seats;
              else pendingDelta += seats;

              return { ...p, boarding_status: newStatus };
            }
            return p;
          });
          return { ...route, passengers: updatedPassengers };
        });

        return {
          ...prev,
          summary: {
            ...prev.summary,
            boarded_count: Math.max(0, prev.summary.boarded_count + boardedDelta),
            pending_count: Math.max(0, prev.summary.pending_count + pendingDelta),
            no_show_count: Math.max(0, prev.summary.no_show_count + noShowDelta),
          },
          routes: updatedRoutes,
        };
      });
    } catch (error) {
      console.error('Error al actualizar estado de abordaje:', error);
      alert('Error al actualizar el estado de abordaje');
    } finally {
      setUpdatingId(null);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const generateRouteManifestText = (route: ManifestRoute) => {
    let text = `📋 *MANIFIESTO DE DESPACHO - TRAIL EXPLORER*\n`;
    text += `🚐 *Ruta:* ${route.origin_name || 'Origen'} ➔ ${route.destination_name || 'Destino'} (${route.shuttle_name})\n`;
    text += `📅 *Fecha:* ${selectedDate} | ⏰ *Horario:* ${route.schedule || 'Salida'}\n`;
    text += `👥 *Total Pasajeros:* ${route.total_passengers} | 🧳 *Equipajes:* ${route.total_luggage}\n`;
    text += `-------------------------------------------\n\n`;

    route.passengers.forEach((p, idx) => {
      const bCode = (p.id || '').replace(/-/g, '').slice(0, 6).toUpperCase();
      text += `*${idx + 1}. [${p.pickup_location}]*\n`;
      text += `   👤 Pasajero: ${p.passenger_name || 'Sin nombre'}`;
      if (p.pickup_person_name && p.pickup_person_name !== p.passenger_name) {
        text += ` (Recoger a: ${p.pickup_person_name})`;
      }
      text += `\n   👥 Pax: ${p.seats} | 🧳 Equipaje: ${p.extra_luggage || 0}`;
      text += `\n   📞 Tel: ${p.passenger_phone || 'N/A'}`;
      text += `\n   🏁 Destino: ${p.dropoff_location}`;
      text += `\n   🎫 Localizador: #${bCode}`;
      text += `\n   💰 Pago: ${p.payment_status === 'paid' ? 'PAGADO ✅' : 'PENDIENTE ⚠️'}\n\n`;
    });

    return text;
  };

  const handleCopyRouteManifest = (route: ManifestRoute) => {
    const text = generateRouteManifestText(route);
    navigator.clipboard.writeText(text);
    setCopiedRouteId(route.shuttle_id);
    setTimeout(() => setCopiedRouteId(null), 2500);
  };

  const handleShareRouteWhatsApp = (route: ManifestRoute) => {
    const text = generateRouteManifestText(route);
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const summary = manifestData?.summary || {
    total_bookings: 0,
    total_passengers: 0,
    total_luggage: 0,
    boarded_count: 0,
    pending_count: 0,
    no_show_count: 0,
    routes_count: 0,
  };

  const routes = manifestData?.routes || [];

  return (
    <div className="space-y-6">
      {/* Printable CSS style sheet */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #admin-manifest-print-sheet, #admin-manifest-print-sheet * {
            visibility: visible;
          }
          #admin-manifest-print-sheet {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 10px;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Screen Header */}
      <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900">Manifiesto de Despacho Diario</h1>
            <Badge variant="info" className="text-xs">Operaciones</Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Control de salidas, paradas de recogida por hotel y lista de abordaje para conductores.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            onClick={fetchManifest}
            disabled={loading}
            className="flex items-center gap-1.5 text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>

          <Button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Hoja de Ruta</span>
          </Button>
        </div>
      </div>

      {/* Date & Filter Toolbar */}
      <Card className="no-print border border-slate-200 shadow-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Quick Date Presets */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide mr-1">
                Fecha:
              </span>
              <button
                type="button"
                onClick={() => handleQuickDate(-1)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(0)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  selectedDate === todayStr
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => handleQuickDate(1)}
                className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
              >
                Mañana
              </button>
              <div className="flex items-center gap-2 ml-1">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                />
              </div>
            </div>

            {/* Route Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedShuttleId}
                onChange={(e) => setSelectedShuttleId(e.target.value)}
                className="px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Todas las rutas programadas ({routes.length})</option>
                {routes.map((r) => (
                  <option key={r.shuttle_id} value={r.shuttle_id}>
                    {r.origin_name} ➔ {r.destination_name} ({r.schedule || 'Salida'})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats Summary */}
      <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Pasajeros a Transportar</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{summary.total_passengers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Abordados / Listos</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">
                {summary.boarded_count} <span className="text-xs font-normal text-slate-400">/ {summary.total_passengers}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Luggage className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Bultos Equipaje Extra</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{summary.total_luggage}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Rutas Activas Hoy</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-900">{summary.routes_count}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Area (Included in Printable Sheet) */}
      <div id="admin-manifest-print-sheet" className="space-y-6">
        {/* Printable Header - Visible in Print Only */}
        <div className="hidden print:block border-b-2 border-slate-800 pb-3 mb-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-bold uppercase tracking-wider">Trail Explorer Shuttle</h1>
              <p className="text-sm font-semibold">MANIFIESTO DE DESPACHO Y HOJA DE RUTA</p>
            </div>
            <div className="text-right text-xs">
              <p><strong>Fecha:</strong> {selectedDate}</p>
              <p><strong>Generado el:</strong> {new Date().toLocaleDateString('es-ES')} {new Date().toLocaleTimeString('es-ES')}</p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600 mb-2" />
            <p className="text-sm font-medium">Cargando manifiesto del día...</p>
          </div>
        ) : routes.length === 0 ? (
          /* Empty State */
          <Card className="border border-slate-200 p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1">
              No hay viajes ni reservas para esta fecha
            </h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              No se encontraron pasajeros asignados a ninguna ruta para el día {selectedDate}.
              Puedes seleccionar otra fecha con el calendario superior.
            </p>
          </Card>
        ) : (
          /* Routes List */
          routes.map((route, rIndex) => (
            <Card key={route.shuttle_id} className="border border-slate-200 shadow-sm overflow-hidden mb-6 page-break-after">
              {/* Route Header */}
              <div className="bg-slate-900 text-white p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold uppercase tracking-wider bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded">
                      Ruta #{rIndex + 1}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded border border-white/30 text-white font-medium">
                      {route.operator || 'Trail Explorer'}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2">
                    <span>{route.origin_name}</span>
                    <span className="text-emerald-400">➔</span>
                    <span>{route.destination_name}</span>
                  </h2>
                  <div className="flex items-center gap-4 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      Horario: {route.schedule || 'Salida programada'}
                    </span>
                    {route.duration_hours && (
                      <span>Duración: {route.duration_hours}h</span>
                    )}
                  </div>
                </div>

                {/* Route Actions and Counters */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="text-right mr-2 hidden sm:block">
                    <p className="text-xs text-slate-400">Total en Unidad</p>
                    <p className="text-sm font-bold text-emerald-400">
                      {route.total_passengers} pasajeros ({route.total_luggage} equipajes)
                    </p>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyRouteManifest(route)}
                    className="no-print bg-slate-800 border-slate-700 text-white hover:bg-slate-700 text-xs"
                  >
                    {copiedRouteId === route.shuttle_id ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400 mr-1" />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1" />
                        Copiar
                      </>
                    )}
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => handleShareRouteWhatsApp(route)}
                    className="no-print bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs font-semibold"
                  >
                    <MessageCircle className="w-3.5 h-3.5 mr-1 fill-current" />
                    Enviar al Chofer
                  </Button>
                </div>
              </div>

              {/* Passengers / Pick-up Points Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-xs uppercase font-semibold">
                      <th className="py-3 px-3 w-10 text-center">#</th>
                      <th className="py-3 px-4">Punto de Recogida (Hotel / Hostel)</th>
                      <th className="py-3 px-4">Pasajero & Contacto</th>
                      <th className="py-3 px-3 text-center">Asientos</th>
                      <th className="py-3 px-3 text-center">Equipaje</th>
                      <th className="py-3 px-4">Destino de Bajada</th>
                      <th className="py-3 px-3 text-center">Pago</th>
                      <th className="no-print py-3 px-4 text-center">Estado de Abordaje</th>
                      <th className="hidden print:table-cell py-3 px-4 text-center">Firma / Check</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {route.passengers.map((p, pIndex) => {
                      const bCode = (p.id || '').replace(/-/g, '').slice(0, 6).toUpperCase();
                      const boardingStatus = p.boarding_status || 'pending';
                      const cleanPhone = (p.passenger_phone || '').replace(/[^0-9]/g, '');

                      return (
                        <tr
                          key={p.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            boardingStatus === 'boarded'
                              ? 'bg-emerald-50/40'
                              : boardingStatus === 'no_show'
                              ? 'bg-red-50/40 opacity-75'
                              : ''
                          }`}
                        >
                          {/* # Order */}
                          <td className="py-3.5 px-3 text-center font-bold text-slate-500">
                            {pIndex + 1}
                          </td>

                          {/* Pickup Spot */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-start gap-2">
                              <Building className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="font-bold text-slate-900 block leading-snug">
                                  {p.pickup_location}
                                </span>
                                <span className="text-xs text-slate-500 font-mono">
                                  Ref: #{bCode}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Passenger */}
                          <td className="py-3.5 px-4">
                            <div>
                              <span className="font-semibold text-slate-800 block">
                                {p.passenger_name || 'Sin nombre registrado'}
                              </span>
                              {p.pickup_person_name && p.pickup_person_name !== p.passenger_name && (
                                <span className="text-xs text-slate-500 block">
                                  (Recoger a: {p.pickup_person_name})
                                </span>
                              )}
                              {/* Direct call & whatsapp buttons */}
                              {p.passenger_phone && (
                                <div className="no-print flex items-center gap-2 mt-1">
                                  <a
                                    href={`tel:${p.passenger_phone}`}
                                    className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 hover:underline"
                                  >
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>{p.passenger_phone}</span>
                                  </a>
                                  <a
                                    href={`https://wa.me/${cleanPhone}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#25D366] hover:text-[#20bd5a]"
                                    title="Contactar por WhatsApp"
                                  >
                                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                                  </a>
                                </div>
                              )}
                              {/* Phone for print view */}
                              {p.passenger_phone && (
                                <span className="hidden print:block text-xs text-slate-600">
                                  Tel: {p.passenger_phone}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Seats */}
                          <td className="py-3.5 px-3 text-center">
                            <Badge variant="info" className="text-xs font-bold py-0.5 px-2">
                              {p.seats} pax
                            </Badge>
                          </td>

                          {/* Extra Luggage */}
                          <td className="py-3.5 px-3 text-center">
                            {p.extra_luggage ? (
                              <span className="text-xs font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                                +{p.extra_luggage}
                              </span>
                            ) : (
                              <span className="text-xs text-slate-400">-</span>
                            )}
                          </td>

                          {/* Dropoff */}
                          <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                              <span>{p.dropoff_location}</span>
                            </div>
                          </td>

                          {/* Payment */}
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                p.payment_status === 'paid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {p.payment_status === 'paid' ? 'Pagado' : `$${p.total_price}`}
                            </span>
                          </td>

                          {/* Boarding Status Toggle (Screen only) */}
                          <td className="no-print py-3.5 px-4 text-center">
                            <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-100/80">
                              <button
                                type="button"
                                disabled={updatingId === p.id}
                                onClick={() => handleBoardingChange(p.id, 'pending')}
                                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                                  boardingStatus === 'pending'
                                    ? 'bg-white text-slate-800 shadow-sm font-semibold'
                                    : 'text-slate-500 hover:text-slate-800'
                                }`}
                              >
                                Pendiente
                              </button>

                              <button
                                type="button"
                                disabled={updatingId === p.id}
                                onClick={() => handleBoardingChange(p.id, 'boarded')}
                                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                                  boardingStatus === 'boarded'
                                    ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                                    : 'text-slate-500 hover:text-emerald-700'
                                }`}
                              >
                                Abordó ✓
                              </button>

                              <button
                                type="button"
                                disabled={updatingId === p.id}
                                onClick={() => handleBoardingChange(p.id, 'no_show')}
                                className={`px-2 py-1 text-xs font-medium rounded-md transition-all ${
                                  boardingStatus === 'no_show'
                                    ? 'bg-red-600 text-white shadow-sm font-semibold'
                                    : 'text-slate-500 hover:text-red-700'
                                }`}
                              >
                                No Show
                              </button>
                            </div>
                          </td>

                          {/* Print Checkbox/Sign Box (Print only) */}
                          <td className="hidden print:table-cell py-3.5 px-4 text-center">
                            <div className="w-6 h-6 border-2 border-slate-400 rounded mx-auto" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
