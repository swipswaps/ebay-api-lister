import axios from 'axios';
import { SearchState, ApiResult, FilterState } from '../types';

// Invariant: Valid absolute URLs.
// We derive the base URL from window.location.origin to ensure it is absolute
// and correctly routed through the Vite proxy to the backend.
const getBaseUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3001/api';
  return `${window.location.origin}/api`;
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