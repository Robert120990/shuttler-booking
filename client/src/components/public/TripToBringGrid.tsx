import React from 'react';
import {
  matchToBringItem,
  renderToBringIcon,
} from '../../constants/tripItemsToBring';
import { CheckCircle2 } from 'lucide-react';

interface TripToBringGridProps {
  toBringRaw: string | null | undefined;
  language: string;
}

export const TripToBringGrid: React.FC<TripToBringGridProps> = ({
  toBringRaw,
  language,
}) => {
  if (!toBringRaw || !toBringRaw.trim()) {
    return null;
  }

  const items = toBringRaw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="bg-[#f0f4f9] border border-blue-200/70 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        {items.map((item, index) => {
          const matched = matchToBringItem(item);

          if (matched) {
            const title = language === 'es' ? matched.name : matched.nameEn;
            const subtitle = language === 'es' ? matched.subtitle : matched.subtitleEn;

            return (
              <div key={index} className="flex items-start gap-3 py-1">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-800 mt-0.5">
                  {renderToBringIcon(matched.iconType, 'w-6 h-6 stroke-[1.8]')}
                </div>
                <div className="min-w-0">
                  <span className="block font-bold text-slate-900 text-sm sm:text-base leading-tight">
                    {title}
                  </span>
                  {subtitle && (
                    <span className="block text-xs text-slate-600 font-normal mt-0.5 leading-snug">
                      {subtitle}
                    </span>
                  )}
                </div>
              </div>
            );
          }

          // Fallback for custom items not in catalog
          return (
            <div key={index} className="flex items-start gap-3 py-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-700 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <span className="block font-bold text-slate-900 text-sm sm:text-base leading-tight">
                  {item}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
