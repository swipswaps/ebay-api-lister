import React, { useState, useEffect } from 'react';
import { SearchState, EbayItem, FilterState } from './types';
import { searchEbay, sendImageContext, checkConfig } from './services/api';
import SearchBar from './components/SearchBar';
import AdvancedFilters from './components/AdvancedFilters';
import Dashboard from './components/Dashboard';
import ResultsList from './components/ResultsList';
import CameraPanel from './components/CameraPanel';
import SetupScreen from './components/SetupScreen';
import SettingsPanel from './components/SettingsPanel';
import EnvironmentBadge from './components/EnvironmentBadge';

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-slate-600 font-medium">Loading eBay Market Lens...</p>
          <p className="text-slate-400 text-sm mt-2">Checking configuration</p>
        </div>
      </div>
    );
  }

  if (isConfigured === false) {
    return <SetupScreen onConfigured={() => setIsConfigured(true)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-slate-900">eBay Market Lens</h1>
              <EnvironmentBadge />
            </div>
            <p className="text-slate-500">Analyze real-time market data and sold history</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="hidden sm:inline">Settings</span>
          </button>
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

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};

export default App;