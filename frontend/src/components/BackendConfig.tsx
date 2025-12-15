import React, { useState, useEffect } from 'react';
import { Server, CheckCircle, AlertTriangle, ExternalLink, X } from 'lucide-react';
import { getBackendUrl, setBackendUrl, isGitHubPages } from '../services/api';
import axios from 'axios';

interface BackendConfigProps {
  isOpen: boolean;
  onClose: () => void;
}

const BackendConfig: React.FC<BackendConfigProps> = ({ isOpen, onClose }) => {
  const [backendUrl, setBackendUrlState] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBackendUrlState(getBackendUrl());
    }
  }, [isOpen]);

  const testConnection = async (url: string) => {
    setIsTestingConnection(true);
    setConnectionStatus('idle');
    setErrorMessage('');

    try {
      const response = await axios.get(`${url.replace('/api', '')}/health`, {
        timeout: 5000,
      });
      
      if (response.data.status === 'ok') {
        setConnectionStatus('success');
        return true;
      } else {
        setConnectionStatus('error');
        setErrorMessage('Backend responded but health check failed');
        return false;
      }
    } catch (err: any) {
      setConnectionStatus('error');
      if (err.code === 'ECONNABORTED') {
        setErrorMessage('Connection timeout - backend may not be running');
      } else if (err.message.includes('Network Error')) {
        setErrorMessage('Cannot connect to backend - check URL and CORS settings');
      } else {
        setErrorMessage(err.message || 'Connection failed');
      }
      return false;
    } finally {
      setIsTestingConnection(false);
    }
  };

  const handleSave = async () => {
    const trimmedUrl = backendUrl.trim();
    
    // Validate URL format
    try {
      new URL(trimmedUrl.replace('/api', ''));
    } catch {
      setConnectionStatus('error');
      setErrorMessage('Invalid URL format');
      return;
    }

    // Test connection before saving
    const isConnected = await testConnection(trimmedUrl);
    
    if (isConnected) {
      setBackendUrl(trimmedUrl);
      setTimeout(() => {
        onClose();
        window.location.reload(); // Reload to apply new backend URL
      }, 1000);
    }
  };

  const handleTest = () => {
    testConnection(backendUrl.trim());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-2xl w-full rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-slate-800 p-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <Server size={20} />
            <h3 className="font-semibold">Backend Configuration</h3>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-white">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
            <div className="flex items-start gap-2">
              <ExternalLink size={16} className="text-blue-600 mt-0.5 shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Running on GitHub Pages</p>
                <p className="mb-2">You need to run the backend server locally on your computer.</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Clone the repository to your local machine</li>
                  <li>Run <code className="bg-blue-100 px-1 rounded">npm install</code> in the project directory</li>
                  <li>Start the backend with <code className="bg-blue-100 px-1 rounded">npm run server</code></li>
                  <li>The backend will run on <code className="bg-blue-100 px-1 rounded">http://localhost:3001</code></li>
                  <li>Enter the backend URL below and test the connection</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Backend API URL
              </label>
              <input
                type="text"
                value={backendUrl}
                onChange={(e) => setBackendUrlState(e.target.value)}
                className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono text-sm"
                placeholder="http://localhost:3001/api"
              />
              <p className="text-xs text-slate-500 mt-1">
                Default: http://localhost:3001/api
              </p>
            </div>

            {connectionStatus === 'success' && (
              <div className="bg-green-50 text-green-700 p-3 rounded flex items-center gap-2 text-sm border border-green-200">
                <CheckCircle size={16} />
                <span>Connection successful! Backend is running.</span>
              </div>
            )}

            {connectionStatus === 'error' && (
              <div className="bg-red-50 text-red-600 p-3 rounded flex items-start gap-2 text-sm border border-red-200">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold">Connection Failed</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleTest}
                disabled={isTestingConnection}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isTestingConnection ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={handleSave}
                disabled={isTestingConnection || connectionStatus !== 'success'}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                Save & Reload
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BackendConfig;

