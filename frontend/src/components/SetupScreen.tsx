import React, { useState } from 'react';
import { Key, ExternalLink, CheckCircle, AlertTriangle, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';
import { saveConfig } from '../services/api';

interface SetupScreenProps {
  onConfigured: () => void;
}

const SetupScreen: React.FC<SetupScreenProps> = ({ onConfigured }) => {
  const [appId, setAppId] = useState('');
  const [certId, setCertId] = useState('');
  const [showCertId, setShowCertId] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedEnv, setDetectedEnv] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleInputChange = (setter: React.Dispatch<React.SetStateAction<string>>, value: string) => {
    setter(value);
    if (error) setError('');
    if (showSuccess) setShowSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setShowSuccess(false);

    try {
      const response = await saveConfig(appId, certId);
      setDetectedEnv(response.env);
      setShowSuccess(true);

      // Delay navigation to show success message
      setTimeout(() => {
        onConfigured();
      }, 1500);
    } catch (err: any) {
      console.error("Setup error:", err);
      // Extract error message safely
      let serverMsg = err.response?.data?.error;

      // Fallback for network/runtime errors (like URL constructor issues) that don't have a response
      if (!serverMsg) {
        serverMsg = err.message || 'Unknown error occurred';
      }

      // Provide helpful error messages
      if (serverMsg.includes('URL constructor')) {
        serverMsg = 'Browser environment error: Please refresh and try again.';
      } else if (serverMsg.includes('invalid_client')) {
        serverMsg = 'Invalid credentials. Please check your App ID and Cert ID are correct.';
      } else if (serverMsg.includes('both Production and Sandbox')) {
        serverMsg = 'Credentials rejected by eBay. Please verify your App ID and Cert ID from the eBay Developer Portal.';
      } else if (serverMsg.includes('Network Error') || serverMsg.includes('ECONNREFUSED')) {
        serverMsg = 'Cannot connect to backend server. Please ensure the backend is running on port 3001.';
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
              <li>Go to the <a href="https://developer.ebay.com/signin" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">eBay Developer Program</a>.</li>
              <li>Sign in and navigate to <strong>My Account → Application Keys</strong>.</li>
              <li>Create a "Production" or "Sandbox" Keyset (app auto-detects).</li>
              <li>Copy the <strong>App ID</strong> (Client ID) and <strong>Cert ID</strong> (Client Secret).</li>
            </ol>
            <p className="text-xs text-slate-500 mt-3 italic">
              💡 Tip: The app will automatically detect whether your keys are for Production or Sandbox environment.
            </p>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                App ID (Client ID)
                <span className="text-xs text-slate-500 font-normal ml-2">Required</span>
              </label>
              <input
                type="text"
                value={appId}
                onChange={e => handleInputChange(setAppId, e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="e.g., YourAppN-YourApp-PRD-1234567890-abcdefgh"
                required
                minLength={10}
              />
              <p className="text-xs text-slate-500 mt-1">Usually starts with your app name</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Cert ID (Client Secret)
                <span className="text-xs text-slate-500 font-normal ml-2">Required</span>
              </label>
              <div className="relative">
                <input
                  type={showCertId ? "text" : "password"}
                  value={certId}
                  onChange={e => handleInputChange(setCertId, e.target.value)}
                  className="w-full p-2 pr-10 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="PRD-1234567890abcdef-1234-5678-9abc-defg"
                  required
                  minLength={10}
                />
                <button
                  type="button"
                  onClick={() => setShowCertId(!showCertId)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  title={showCertId ? "Hide" : "Show"}
                >
                  {showCertId ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Keep this secret - never share publicly</p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded flex items-start gap-2 text-sm border border-red-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Configuration Error</p>
                  <p>{error}</p>
                </div>
              </div>
            )}

            {showSuccess && detectedEnv && (
              <div className="bg-green-50 text-green-700 p-3 rounded flex items-start gap-2 text-sm border border-green-200">
                <Sparkles size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Success!</p>
                  <p>Connected to eBay {detectedEnv} environment</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || showSuccess}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Verifying credentials...
                </>
              ) : showSuccess ? (
                <>
                  <CheckCircle size={18} />
                  Verified!
                </>
              ) : (
                <>
                  Verify & Save <CheckCircle size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SetupScreen;