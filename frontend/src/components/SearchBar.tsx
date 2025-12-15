
import React from 'react';
import { Search, Camera } from 'lucide-react';
import { SearchState } from '../types';

interface SearchBarProps {
  searchState: SearchState;
  setSearchState: React.Dispatch<React.SetStateAction<SearchState>>;
  onSearch: () => void;
  isLoading: boolean;
  toggleCamera: () => void;
  capturedImage: string | null;
  clearImage: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  searchState, 
  setSearchState, 
  onSearch, 
  isLoading,
  toggleCamera,
  capturedImage,
  clearImage
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6 sticky top-0 z-10">
      <div className="flex flex-col md:flex-row gap-4">
        
        {/* Input Group */}
        <div className="flex-1 flex gap-2">
           <div className="relative flex-1">
             <Search className="absolute left-3 top-3 text-slate-400" size={20} />
             <input
               type="text"
               value={searchState.query}
               onChange={(e) => setSearchState(prev => ({ ...prev, query: e.target.value }))}
               onKeyDown={handleKeyDown}
               placeholder="Search eBay..."
               className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
           </div>
           
           <button 
             onClick={toggleCamera}
             className={`p-2 rounded-lg border transition-colors ${capturedImage ? 'bg-green-100 border-green-400 text-green-700' : 'bg-slate-100 border-slate-300 text-slate-600 hover:bg-slate-200'}`}
             title="Use Camera"
           >
             <Camera size={20} />
           </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={searchState.type}
            onChange={(e) => setSearchState(prev => ({ ...prev, type: e.target.value as any }))}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium"
          >
            <option value="active">For Sale</option>
            <option value="sold">Sold History</option>
          </select>

          <select
            value={searchState.sort}
            onChange={(e) => setSearchState(prev => ({ ...prev, sort: e.target.value as any }))}
            className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-medium"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="date_desc">Newest First</option>
          </select>

          <button
            onClick={onSearch}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {/* Image Context Indicator */}
      {capturedImage && (
        <div className="mt-3 flex items-center gap-3 bg-slate-50 p-2 rounded border border-slate-200 inline-flex">
          <img src={capturedImage} alt="Context" className="w-10 h-10 object-cover rounded" />
          <span className="text-xs text-slate-600">Image context active</span>
          <button onClick={clearImage} className="text-xs text-red-500 hover:underline">Remove</button>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
