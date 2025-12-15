import React, { useState, useEffect } from 'react';
import { Settings, X, Key, Eye, EyeOff, CheckCircle, AlertTriangle, Loader2, Sparkles, RefreshCw, Info, ExternalLink } from 'lucide-react';
import { getConfigDetails, saveConfig } from '../services/api';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ConfigDetails {
  configured: boolean;
  appId: string | null;
  certId: string | null;
  env: string | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const [currentConfig, setCurrentConfig] = useState<ConfigDetails | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [appId, setAppId] = useState('');
  const [certId, setCertId] = useState('');
  const [showCertId, setShowCertId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCurrentConfig();
    }

    // Handle ESC key to close
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  const loadCurrentConfig = async () => {
    try {
      const config = await getConfigDetails();
      setCurrentConfig(config);
    } catch (err) {
      console.error('Failed to load config:', err);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      const response = await saveConfig(appId, certId);
      setSuccess(true);
      setIsEditing(false);
      setAppId('');
      setCertId('');
      
      // Reload config to show updated masked values
      await loadCurrentConfig();
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      let serverMsg = err.response?.data?.error || err.message || 'Update failed';
      
      if (serverMsg.includes('invalid_client')) {
        serverMsg = 'Invalid credentials. Please check your App ID and Cert ID.';
      } else if (serverMsg.includes('both Production and Sandbox')) {
        serverMsg = 'Credentials rejected by eBay. Please verify your credentials.';
      }
      
      setError(serverMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setAppId('');
    setCertId('');
    setError('');
    setSuccess(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Settings size={20} />
            <h3 className="font-semibold">Settings</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h4 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Key size={18} />
            eBay API Credentials
          </h4>

          {!isEditing ? (
            <div className="space-y-4">
              {currentConfig?.configured ? (
                <>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase">App ID</label>
                        <p className="text-slate-800 font-mono text-sm mt-1">{currentConfig.appId}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase">Cert ID</label>
                        <p className="text-slate-800 font-mono text-sm mt-1">{currentConfig.certId}</p>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 uppercase">Environment</label>
                        <p className="text-slate-800 font-semibold text-sm mt-1">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded ${
                            currentConfig.env === 'PRODUCTION' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {currentConfig.env}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <RefreshCw size={16} />
                      Update Credentials
                    </button>
                    <a
                      href="https://developer.ebay.com/my/keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                      <ExternalLink size={16} />
                      View Keys on eBay
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <p>No credentials configured</p>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">App ID (Client ID)</label>
                <input
                  type="text"
                  value={appId}
                  onChange={e => setAppId(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Enter new App ID"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Cert ID (Client Secret)</label>
                <div className="relative">
                  <input
                    type={showCertId ? "text" : "password"}
                    value={certId}
                    onChange={e => setCertId(e.target.value)}
                    className="w-full p-2 pr-10 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter new Cert ID"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCertId(!showCertId)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCertId ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded flex items-start gap-2 text-sm border border-red-200">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {success && (
            <div className="mt-4 bg-green-50 text-green-700 p-3 rounded flex items-center gap-2 text-sm border border-green-200">
              <Sparkles size={16} />
              <span>Credentials updated successfully!</span>
            </div>
          )}

          {/* Info Section */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">About Your Credentials</p>
                  <ul className="space-y-1 text-xs">
                    <li>• Credentials are stored locally in <code className="bg-blue-100 px-1 rounded">backend/config.json</code></li>
                    <li>• The app auto-detects Production vs Sandbox environment</li>
                    <li>• Your credentials are never sent to any third party</li>
                    <li>• Get your keys from <a href="https://developer.ebay.com" target="_blank" rel="noopener noreferrer" className="underline">eBay Developer Portal</a></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;

