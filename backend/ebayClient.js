import axios from 'axios';
import { mapBrowseApiFilters, mapFindingApiFilters } from './filterMapper.js';

// In-memory config store
let globalConfig = {
  appId: process.env.EBAY_APP_ID || '',
  certId: process.env.EBAY_CERT_ID || '',
  env: process.env.EBAY_ENV || 'PRODUCTION'
};

export function getConfig() {
  return globalConfig;
}

export function setConfig(newConfig) {
  globalConfig = { ...globalConfig, ...newConfig };
}

const ENDPOINTS = {
  PRODUCTION: {
    AUTH: 'https://api.ebay.com/identity/v1/oauth2/token',
    BROWSE: 'https://api.ebay.com/buy/browse/v1',
    FINDING: 'https://svcs.ebay.com/services/search/FindingService/v1',
    SCOPE: 'https://api.ebay.com/oauth/api_scope'
  },
  SANDBOX: {
    AUTH: 'https://api.sandbox.ebay.com/identity/v1/oauth2/token',
    BROWSE: 'https://api.sandbox.ebay.com/buy/browse/v1',
    FINDING: 'https://svcs.sandbox.ebay.com/services/search/FindingService/v1',
    SCOPE: 'https://api.ebay.com/oauth/api_scope'
  }
};

let cachedToken = null;
let tokenExpirationTime = 0;

export function resetCache() {
  cachedToken = null;
  tokenExpirationTime = 0;
}

/**
 * Verifies credentials by trying Production first, then Sandbox.
 */
export async function verifyAndDetectEnv(appId, certId) {
  // Try Production
  try {
    await requestToken(appId, certId, 'PRODUCTION');
    return 'PRODUCTION';
  } catch (prodError) {
    const msg = prodError.message || '';
    // If invalid client or authentication failure, try Sandbox
    if (msg.includes('invalid_client') || msg.includes('authentication')) {
      try {
        await requestToken(appId, certId, 'SANDBOX');
        return 'SANDBOX';
      } catch (sandboxError) {
        throw new Error('Keys rejected by both Production and Sandbox. Double-check your App ID and Cert ID.');
      }
    }
    throw prodError;
  }
}

async function requestToken(appId, certId, envName) {
  const config = ENDPOINTS[envName];
  const credentials = Buffer.from(`${appId}:${certId}`).toString('base64');
  
  // Use URLSearchParams for standard encoding
  const params = new URLSearchParams();
  params.append('grant_type', 'client_credentials');
  params.append('scope', config.SCOPE);

  try {
    const response = await axios.post(config.AUTH, params.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
        'Accept': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    const errorData = error.response?.data;
    const errorMsg = errorData?.error_description || errorData?.error || error.message;
    
    // Normalize eBay error messages
    if (errorData?.error === 'invalid_client') {
      throw new Error(`invalid_client`);
    }
    throw new Error(errorMsg);
  }
}

export async function getOAuthToken() {
  const { appId, certId, env } = globalConfig;

  if (!appId || !certId) {
    throw new Error('eBay credentials not configured');
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpirationTime - 60000) {
    return cachedToken;
  }

  try {
    const data = await requestToken(appId, certId, env);
    cachedToken = data.access_token;
    tokenExpirationTime = now + (data.expires_in * 1000);
    return cachedToken;
  } catch (error) {
    console.error(`Auth Failed (${env}):`, error.message);
    throw new Error(`Failed to authenticate with eBay (${env}). Check your keys.`);
  }
}

export async function searchActiveListings(query, sort = 'price', filters = {}) {
  const token = await getOAuthToken();
  const { env } = globalConfig;
  const config = ENDPOINTS[env];
  
  let sortField = 'price';
  if (sort === 'date_desc') sortField = 'newness';
  if (sort === 'price_desc') sortField = '-price';

  const filterString = mapBrowseApiFilters(filters);

  try {
    const response = await axios.get(`${config.BROWSE}/item_summary/search`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        'Accept': 'application/json'
      },
      params: {
        q: query,
        limit: 50,
        sort: sortField,
        filter: filterString
      }
    });

    return {
      total: response.data.total,
      items: (response.data.itemSummaries || []).map(item => ({
        id: item.itemId,
        title: item.title,
        price: parseFloat(item.price?.value || 0),
        currency: item.price?.currency || 'USD',
        image: item.image?.imageUrl || null,
        url: item.itemWebUrl,
        date: item.itemCreationDate,
        condition: item.condition,
        status: 'ACTIVE'
      }))
    };
  } catch (error) {
    console.error("Browse API Error:", error.response?.data || error.message);
    // Return empty result on error instead of crashing/500 if it's just a no-result scenario
    if (error.response?.status === 404) return { total: 0, items: [] };
    throw new Error("Failed to search active listings.");
  }
}

export async function searchSoldListings(query, sort = 'price', filters = {}) {
  const { appId, env } = globalConfig;
  const config = ENDPOINTS[env];
  
  let sortOrder = 'CurrentPriceHighest';
  if (sort === 'price_asc') sortOrder = 'CurrentPriceLowest';
  if (sort === 'date_desc') sortOrder = 'EndTimeSoonest';

  const itemFilters = mapFindingApiFilters(filters);

  const filterParams = {};
  itemFilters.forEach((f, index) => {
    filterParams[`itemFilter(${index}).name`] = f.name;
    if (Array.isArray(f.value)) {
      f.value.forEach((v, vIndex) => {
        filterParams[`itemFilter(${index}).value(${vIndex})`] = v;
      });
    } else {
      filterParams[`itemFilter(${index}).value`] = f.value;
    }
  });

  try {
    // Finding API (legacy) often prefers the App ID in headers or params
    // It can also accept OAuth, but SECURITY-APPNAME is the classic way
    const response = await axios.get(config.FINDING, {
      params: {
        'OPERATION-NAME': 'findCompletedItems',
        'SERVICE-VERSION': '1.13.0',
        'SECURITY-APPNAME': appId,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'keywords': query,
        'sortOrder': sortOrder,
        'paginationInput.entriesPerPage': 50,
        ...filterParams
      }
    });

    const data = response.data.findCompletedItemsResponse?.[0];
    
    if (!data) {
        return { total: 0, items: [] };
    }
    
    if (data.ack?.[0] !== 'Success' && data.ack?.[0] !== 'Warning') {
      if (data.errorMessage) {
        console.warn("Finding API Warn:", JSON.stringify(data.errorMessage));
      }
      return { total: 0, items: [] };
    }

    const searchResult = data.searchResult?.[0];
    const items = searchResult?.item || [];

    return {
      total: parseInt(searchResult?.['@count'] || '0'),
      items: items.map(item => ({
        id: item.itemId?.[0],
        title: item.title?.[0],
        price: parseFloat(item.sellingStatus?.[0]?.currentPrice?.[0]?.__value__ || 0),
        currency: item.sellingStatus?.[0]?.currentPrice?.[0]?.['@currencyId'] || 'USD',
        image: item.galleryURL?.[0] || null,
        url: item.viewItemURL?.[0],
        date: item.listingInfo?.[0]?.endTime?.[0],
        condition: item.condition?.[0]?.conditionDisplayName?.[0] || 'Unknown',
        status: 'SOLD'
      }))
    };
  } catch (error) {
    console.error("Finding API Error:", error.message);
    throw new Error("Failed to search sold listings.");
  }
}