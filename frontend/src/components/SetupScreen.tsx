import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle, AlertTriangle } from 'lucide-react';
import { saveConfig } from '../services/api';

interface SetupScreenProps {
  onConfigured: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onConfigured }) => {
  const [appId, setAppId] = useState('');
  const [certId, setCertId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await saveConfig(appId, certId);
      onConfigured();
    } catch (err: any) {
      console.error("Setup error:", err);
      // Extract error message safely
      let serverMsg = err.response?.data?.error;
      
      // Fallback for network/runtime errors (like URL constructor issues) that don't have a response
      if (!serverMsg) {
        serverMsg = err.message || 'Unknown error occurred';
      }
      
      if (serverMsg.includes('URL constructor')) {
        serverMsg = 'Browser environment error: Please refresh and try again.';
      }

      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white max-w-lg w-full rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-blue-600 p-6 text-center">
          <div className="mx-auto bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            <Key className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome to eBay Market Lens</h2>
          <p className="text-blue-100 mt-2">One-time setup required</p>
        </div>

        <div className="p-8">
          <p className="text-slate-600 mb-6 text-sm">
            To use this application, you need to provide your <strong>eBay Developer credentials</strong> (App ID and Cert ID). These will be saved locally to your environment.
          </p>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6">
            <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-2">
              <ExternalLink size={16} /> How to get keys:
            </h4>
            <ol className="list-decimal list-inside text-sm text-slate-600 space-y-1">
              <li>Go to the <a href="https://developer.ebay.com/signin" target="_blank" className="text-blue-600 hover:underline">eBay Developer Program</a>.</li>
              <li>Sign in and create a "Production" Keyset.</li>
              <li>Copy the <strong>App ID</strong> (Client ID) and <strong>Cert ID</strong> (Client Secret).</li>
            </ol>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">App ID (Client ID)</label>
              <input 
                type="text" 
                value={appId}
                onChange={e => handleInputChange(setAppId, e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Your App ID"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Cert ID (Client Secret)</label>
              <input 
                type="password" 
                value={certId}
                onChange={e => handleInputChange(setCertId, e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Your Cert ID"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded flex items-start gap-2 text-sm">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>Verifying...</>
              ) : (
                <>Verify & Save <CheckCircle size={18} /></>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;