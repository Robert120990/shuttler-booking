import React, { useState, useMemo } from 'react';
import {
  TRIP_ITEMS_TO_BRING,
  renderToBringIcon,
  parseToBringString,
  buildToBringString,
} from '../../constants/tripItemsToBring';
import { Check, Plus, X, Sparkles } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface TripToBringSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TripToBringSelector: React.FC<TripToBringSelectorProps> = ({
  value,
  onChange,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  // Parse the current comma-separated value
  const { selectedIds, customItems } = useMemo(() => {
    return parseToBringString(value);
  }, [value]);

  const handleToggle = (id: string) => {
    let nextIds: string[];
    if (selectedIds.includes(id)) {
      nextIds = selectedIds.filter((item) => item !== id);
    } else {
      nextIds = [...selectedIds, id];
    }
    const serialized = buildToBringString(nextIds, customItems);
    onChange(serialized);
  };

  const handleSelectRecommended = () => {
    const recommendedIds = TRIP_ITEMS_TO_BRING.filter((i) => i.isDefaultRecommended).map((i) => i.id);
    const serialized = buildToBringString(recommendedIds, customItems);
    onChange(serialized);
  };

  const handleSelectAll = () => {
    const allIds = TRIP_ITEMS_TO_BRING.map((i) => i.id);
    const serialized = buildToBringString(allIds, customItems);
    onChange(serialized);
  };

  const handleClearAll = () => {
    onChange('');
  };

  const handleAddCustomItem = () => {
    const trimmed = customInput.trim();
    if (!trimmed) return;
    if (!customItems.includes(trimmed)) {
      const nextCustom = [...customItems, trimmed];
      const serialized = buildToBringString(selectedIds, nextCustom);
      onChange(serialized);
    }
    setCustomInput('');
    setShowCustomInput(false);
  };

  const handleRemoveCustomItem = (itemToRemove: string) => {
    const nextCustom = customItems.filter((item) => item !== itemToRemove);
    const serialized = buildToBringString(selectedIds, nextCustom);
    onChange(serialized);
  };

  const totalCount = selectedIds.length + customItems.length;

  return (
    <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-800">
              Qué Traer a Bordo
            </span>
            <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5">
              {totalCount} {totalCount === 1 ? 'artículo' : 'artículos'}
            </Badge>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Selecciona las recomendaciones de equipaje y artículos para los pasajeros.
          </p>
        </div>

        {/* Action quick buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSelectRecommended}
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-md border border-blue-200 transition-colors"
            title="Seleccionar los artículos esenciales"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Recomendados
          </button>
          <button
            type="button"
            onClick={handleSelectAll}
            className="text-xs font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 px-2 py-1 rounded border border-slate-200 transition-colors"
          >
            Todos
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="text-xs font-medium text-slate-500 hover:text-red-600 bg-white hover:bg-red-50 px-2 py-1 rounded border border-slate-200 transition-colors"
          >
            Limpiar
          </button>
        </div>
      </div>

      {/* Grid of Selectable Options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {TRIP_ITEMS_TO_BRING.map((item) => {
          const isSelected = selectedIds.includes(item.id);

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleToggle(item.id)}
              className={`flex items-start justify-between p-3 rounded-xl border text-left transition-all duration-150 ${
                isSelected
                  ? 'bg-blue-50/80 border-blue-400/90 text-slate-900 shadow-sm ring-1 ring-blue-400/40'
                  : 'bg-white border-slate-200/90 text-slate-700 hover:bg-slate-50/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${
                    isSelected
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {renderToBringIcon(item.iconType, 'w-5 h-5')}
                </div>
                <div className="min-w-0 pr-1">
                  <span className="block font-bold text-sm leading-tight text-slate-900 truncate">
                    {item.name}
                  </span>
                  {item.subtitle && (
                    <span className="block text-xs text-slate-500 mt-0.5 leading-normal">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>

              {/* Checkbox indicator */}
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white'
                    : 'border border-slate-300 bg-white'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom items already added */}
      {customItems.length > 0 && (
        <div className="pt-2">
          <span className="text-xs font-semibold text-slate-700 block mb-1.5">
            Artículos adicionales personalizados:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {customItems.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100/80 text-blue-900 border border-blue-300"
              >
                {item}
                <button
                  type="button"
                  onClick={() => handleRemoveCustomItem(item)}
                  className="text-blue-700 hover:text-red-600"
                  title="Eliminar"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Custom item input toggle */}
      <div className="pt-1">
        {!showCustomInput ? (
          <button
            type="button"
            onClick={() => setShowCustomInput(true)}
            className="text-xs font-medium text-blue-700 hover:text-blue-800 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            ¿Deseas recomendar otro artículo no listado?
          </button>
        ) : (
          <div className="flex items-center gap-2 mt-1">
            <input
              type="text"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomItem();
                }
              }}
              placeholder="Ej: Toalla pequeña, Candado TSA..."
              className="flex-1 text-xs px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={handleAddCustomItem}
              className="text-xs font-semibold px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Agregar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                setCustomInput('');
              }}
              className="text-xs text-slate-500 hover:text-slate-700 px-2 py-1.5"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
