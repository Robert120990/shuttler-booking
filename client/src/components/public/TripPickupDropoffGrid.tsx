import React from 'react';
import {
  PICKUP_OPTIONS,
  DROPOFF_OPTIONS,
  renderLocationIcon,
  parsePickupDropoffString,
} from '../../constants/tripPickupDropoff';
import { Building2, MapPin, Info } from 'lucide-react';

interface TripPickupDropoffGridProps {
  pickupInfoRaw: string | null | undefined;
  language: string;
}

export const TripPickupDropoffGrid: React.FC<TripPickupDropoffGridProps> = ({
  pickupInfoRaw,
  language,
}) => {
  if (!pickupInfoRaw || !pickupInfoRaw.trim()) {
    return null;
  }

  const { pickupId, dropoffId, customNote } = parsePickupDropoffString(pickupInfoRaw);

  const pickup = PICKUP_OPTIONS.find((p) => p.id === pickupId) || PICKUP_OPTIONS[0];
  const dropoff = DROPOFF_OPTIONS.find((d) => d.id === dropoffId) || DROPOFF_OPTIONS[0];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Recogida */}
        <div className="bg-[#f0f9f1] border border-emerald-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
            {renderLocationIcon(pickup.iconType, 'w-5 h-5')}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {language === 'es' ? 'Punto de Recogida (Origen)' : 'Pickup Point (Origin)'}
            </span>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5 leading-tight">
              {language === 'es' ? pickup.title : pickup.titleEn}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {language === 'es' ? pickup.description : pickup.descriptionEn}
            </p>
          </div>
        </div>

        {/* Entrega */}
        <div className="bg-[#f0f4f9] border border-blue-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs mt-0.5">
            {renderLocationIcon(dropoff.iconType, 'w-5 h-5')}
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {language === 'es' ? 'Punto de Entrega (Destino)' : 'Dropoff Point (Destination)'}
            </span>
            <h4 className="font-bold text-slate-900 text-sm sm:text-base mt-0.5 leading-tight">
              {language === 'es' ? dropoff.title : dropoff.titleEn}
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              {language === 'es' ? dropoff.description : dropoff.descriptionEn}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Note or Specific Instruction */}
      {customNote && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">
              {language === 'es' ? 'Nota importante del operador:' : 'Important operator note:'}
            </span>
            <p className="mt-0.5 text-amber-800">{customNote}</p>
          </div>
        </div>
      )}
    </div>
  );
};
