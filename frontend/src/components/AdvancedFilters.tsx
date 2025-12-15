import React from 'react';
import { FilterState } from '../types';
import { SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const AdvancedFilters: React.FC<Props> = ({ filters, setFilters }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleCondition = (condition: string) => {
    setFilters(prev => {
      const exists = prev.conditions.includes(condition);
      return {
        ...prev,
        conditions: exists 
          ? prev.conditions.filter(c => c !== condition)
          : [...prev.conditions, condition]
      };
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 mb-6 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
      >
        <span className="flex items-center gap-2 font-medium text-slate-700">
          <SlidersHorizontal size={18} /> Advanced Filters
        </span>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>

      {isOpen && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Price Range */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Price Range</h4>
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                placeholder="Min" 
                value={filters.minPrice}
                onChange={e => setFilters(prev => ({...prev, minPrice: e.target.value}))}
                className="w-full p-2 border rounded text-sm"
              />
              <span className="text-slate-400">-</span>
              <input 
                type="number" 
                placeholder="Max" 
                value={filters.maxPrice}
                onChange={e => setFilters(prev => ({...prev, maxPrice: e.target.value}))}
                className="w-full p-2 border rounded text-sm"
              />
            </div>
          </div>

          {/* Condition */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Condition</h4>
            <div className="flex flex-col gap-2">
              {['New', 'Used', 'Refurbished'].map(cond => (
                <label key={cond} className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={filters.conditions.includes(cond)}
                    onChange={() => toggleCondition(cond)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-700">{cond}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Shipping */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Shipping & Pickup</h4>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={filters.freeShipping}
                onChange={e => setFilters(prev => ({...prev, freeShipping: e.target.checked}))}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-slate-700">Free Shipping Only</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox"
                checked={filters.localPickup}
                onChange={e => setFilters(prev => ({...prev, localPickup: e.target.checked}))}
                className="rounded text-blue-600"
              />
              <span className="text-sm text-slate-700">Local Pickup Only</span>
            </label>
          </div>

          {/* Seller Quality */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-900">Seller Quality</h4>
            <div className="flex items-center gap-2">
               <label className="text-sm text-slate-600 whitespace-nowrap">Min Feedback:</label>
               <input 
                 type="number"
                 value={filters.minFeedbackScore}
                 onChange={e => setFilters(prev => ({...prev, minFeedbackScore: e.target.value}))}
                 placeholder="e.g. 100"
                 className="w-full p-2 border rounded text-sm"
               />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedFilters;