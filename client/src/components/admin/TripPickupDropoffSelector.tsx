import React, { useState, useMemo } from 'react';
import {
  PICKUP_OPTIONS,
  DROPOFF_OPTIONS,
  renderLocationIcon,
  parsePickupDropoffString,
  buildPickupDropoffString,
} from '../../constants/tripPickupDropoff';
import { Check, Sparkles, MapPin, Building2, Plus, MessageSquare } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TripPickupDropoffSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TripPickupDropoffSelector: React.FC<TripPickupDropoffSelectorProps> = ({
  value,
  onChange,
}) => {
  const { pickupId, dropoffId, customNote } = useMemo(() => {
    return parsePickupDropoffString(value);
  }, [value]);

  const [noteText, setNoteText] = useState(customNote);
  const [showNoteInput, setShowNoteInput] = useState(Boolean(customNote));

  const handleSelectPickup = (newPickupId: string) => {
    const serialized = buildPickupDropoffString(newPickupId, dropoffId, noteText);
    onChange(serialized);
  };

  const handleSelectDropoff = (newDropoffId: string) => {
    const serialized = buildPickupDropoffString(pickupId, newDropoffId, noteText);
    onChange(serialized);
  };

  const handleApplyPreset = (pId: string, dId: string) => {
    const serialized = buildPickupDropoffString(pId, dId, noteText);
    onChange(serialized);
  };

  const handleNoteChange = (text: string) => {
    setNoteText(text);
    const serialized = buildPickupDropoffString(pickupId, dropoffId, text);
    onChange(serialized);
  };

  const activePickup = PICKUP_OPTIONS.find((p) => p.id === pickupId) || PICKUP_OPTIONS[0];
  const activeDropoff = DROPOFF_OPTIONS.find((d) => d.id === dropoffId) || DROPOFF_OPTIONS[0];

  return (
    <div className="space-y-4 bg-slate-50/50 p-4 sm:p-5 rounded-xl border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900">
              Modalidades de Recogida y Entrega
            </span>
            <Badge variant="default" className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2 py-0.5">
              Configurado
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona cómo y dónde abordarán y descenderán los pasajeros en este shuttle.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleApplyPreset('hotel_door', 'hotel_door')}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded border border-emerald-200 transition-colors"
          >
            <Sparkles className="w-3 h-3" />
            Hotel a Hotel
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('airport', 'hotel_door')}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors"
          >
            Aeropuerto → Hotel
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('hotel_door', 'airport')}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors"
          >
            Hotel → Aeropuerto
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset('meeting_point', 'central_point')}
            className="text-[11px] font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors"
          >
            Puntos Céntricos
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* SECCIÓN 1: RECOGIDA (ORIGEN) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              1. Punto de Recogida (Origen)
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {activePickup.title}
            </span>
          </div>

          <div className="space-y-2">
            {PICKUP_OPTIONS.map((opt) => {
              const isSelected = opt.id === pickupId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectPickup(opt.id)}
                  className={`w-full flex items-start justify-between p-3 rounded-xl border text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-400 text-slate-900 shadow-xs ring-1 ring-emerald-400/40'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {renderLocationIcon(opt.iconType, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                        {opt.title}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {opt.description}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-200'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECCIÓN 2: ENTREGA (DESTINO) */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-blue-600" />
              2. Punto de Entrega (Destino)
            </span>
            <span className="text-[11px] font-medium text-slate-500">
              {activeDropoff.title}
            </span>
          </div>

          <div className="space-y-2">
            {DROPOFF_OPTIONS.map((opt) => {
              const isSelected = opt.id === dropoffId;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelectDropoff(opt.id)}
                  className={`w-full flex items-start justify-between p-3 rounded-xl border text-left transition-all duration-150 ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-xs ring-1 ring-blue-400/40'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start gap-2.5 min-w-0 pr-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {renderLocationIcon(opt.iconType, 'w-4 h-4')}
                    </div>
                    <div className="min-w-0">
                      <span className="block font-bold text-xs sm:text-sm text-slate-900 leading-tight">
                        {opt.title}
                      </span>
                      <span className="block text-[11px] text-slate-500 mt-0.5 leading-snug">
                        {opt.description}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-1 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white ring-2 ring-blue-200'
                        : 'border border-slate-300 bg-white'
                    }`}
                  >
                    {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Nota o instrucción complementaria */}
      <div className="pt-2 border-t border-slate-200">
        {!showNoteInput ? (
          <button
            type="button"
            onClick={() => setShowNoteInput(true)}
            className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            ¿Agregar una instrucción u horario específico de recogida/entrega?
          </button>
        ) : (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                Instrucción adicional (opcional):
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNoteInput(false);
                  handleNoteChange('');
                }}
                className="text-[11px] text-slate-400 hover:text-slate-600"
              >
                Eliminar nota
              </button>
            </div>
            <input
              type="text"
              value={noteText}
              onChange={(e) => handleNoteChange(e.target.value)}
              placeholder="Ej: Estar listo 20 minutos antes en recepción / Presentar pasaporte en mano"
              className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
};
