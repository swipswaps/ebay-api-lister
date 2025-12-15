import axios from 'axios';
import { SearchState, ApiResult, FilterState } from '../types';

// Storage key for backend URL
const BACKEND_URL_KEY = 'ebay_lens_backend_url';

// Invariant: Valid absolute URLs.
// We derive the base URL based on environment:
// - GitHub Pages: Use configured backend URL from localStorage
// - Local dev: Use Vite proxy (window.location.origin/api)
const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001/api';

  // Check if running on GitHub Pages
  const isGitHubPages = window.location.hostname.includes('github.io');

  if (isGitHubPages) {
    // Get backend URL from localStorage or use default
    const savedBackendUrl = localStorage.getItem(BACKEND_URL_KEY);
    return savedBackendUrl || 'http://localhost:3001/api';
  }

  // Local development - use Vite proxy
  return `${window.location.origin}/api`;
};

// Function to update backend URL
export const setBackendUrl = (url: string) => {
  localStorage.setItem(BACKEND_URL_KEY, url);
  // Recreate axios instance with new base URL
  apiClient.defaults.baseURL = url;
};

// Function to get current backend URL
export const getBackendUrl = (): string => {
  if (typeof window === 'undefined') return 'http://localhost:3001/api';

  const isGitHubPages = window.location.hostname.includes('github.io');
  if (isGitHubPages) {
    return localStorage.getItem(BACKEND_URL_KEY) || 'http://localhost:3001/api';
  }
  return `${window.location.origin}/api`;
};

// Function to check if running on GitHub Pages
export const isGitHubPages = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.location.hostname.includes('github.io');
};

const apiClient = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export const checkConfig = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get<{configured: boolean}>('/config');
    return response.data.configured;
  } catch (e) {
    // If the server is down or returns 404/500, we assume not configured or retry needed
    console.warn("Config check failed:", e);
    return false;
  }
};

export const saveConfig = async (appId: string, certId: string) => {
  // Post to /config
  const response = await apiClient.post('/config', { appId, certId });
  return response.data;
};

export const getConfigDetails = async () => {
  const response = await apiClient.get('/config/details');
  return response.data;
};

export const searchEbay = async (
  params: SearchState, 
  filters: FilterState
): Promise<ApiResult> => {
  const response = await apiClient.get('/search', {
    params: {
      q: params.query,
      type: params.type,
      sort: params.sort,
      filters: JSON.stringify(filters)
    }
  });
  return response.data;
};

export const sendImageContext = async (base64Image: string) => {
  return apiClient.post('/analyze-image', { image: base64Image });
};