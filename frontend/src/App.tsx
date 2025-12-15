import React, { useState, useEffect } from 'react';
import { SearchState, EbayItem, FilterState } from './types';
import { searchEbay, sendImageContext, checkConfig } from './services/api';
import SearchBar from './components/SearchBar';
import AdvancedFilters from './components/AdvancedFilters';
import Dashboard from './components/Dashboard';
import ResultsList from './components/ResultsList';
import CameraPanel from './components/CameraPanel';
import SetupScreen from './components/SetupScreen';

const App: React.FC = () => {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null);

  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    type: 'active',
    sort: 'price_asc'
  });
  
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    conditions: [],
    freeShipping: false,
    localPickup: false,
    minFeedbackScore: ''
  });

  const [items, setItems] = useState<EbayItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    checkConfig().then(setIsConfigured);
  }, []);

  const handleSearch = async () => {
    if (!searchState.query) return;

    setIsLoading(true);
    setError(null);
    try {
      const result = await searchEbay(searchState, filters);
      setItems(result.items);
    } catch (err: any) {
      setError(err.response?.data?.details || err.message || 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageCapture = async (imageSrc: string) => {
    setCapturedImage(imageSrc);
    try {
      await sendImageContext(imageSrc);
    } catch (e) {
      console.warn("Failed to send image context", e);
    }
  };

  if (isConfigured === null) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  }

  if (isConfigured === false) {
    return <SetupScreen onConfigured={() => setIsConfigured(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">eBay Market Lens</h1>
          <p className="text-slate-500">Analyze real-time market data and sold history</p>
        </header>

        <SearchBar 
          searchState={searchState} 
          setSearchState={setSearchState} 
          onSearch={handleSearch}
          isLoading={isLoading}
          toggleCamera={() => setIsCameraOpen(true)}
          capturedImage={capturedImage}
          clearImage={() => setCapturedImage(null)}
        />

        <AdvancedFilters filters={filters} setFilters={setFilters} />

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Dashboard items={items} type={searchState.type} />
        
        <ResultsList items={items} />

        {items.length === 0 && !isLoading && !error && (
          <div className="text-center py-20 text-slate-400">
            <p>Start by searching for an item (e.g., "RTX 3080")</p>
          </div>
        )}
      </div>

      <CameraPanel 
        isOpen={isCameraOpen} 
        onToggle={() => setIsCameraOpen(false)} 
        onCapture={handleImageCapture} 
      />
    </div>
  );
};

export default App;