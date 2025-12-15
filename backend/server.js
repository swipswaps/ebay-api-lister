import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { searchActiveListings, searchSoldListings, verifyAndDetectEnv, resetCache, setConfig, getConfig } from './ebayClient.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_FILE = path.join(__dirname, 'config.json');

const app = express();
const PORT = process.env.PORT || 3001;

// Allow CORS from anywhere for simplicity in dev/hybrid environments
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Initialize Config
if (fs.existsSync(CONFIG_FILE)) {
  try {
    const savedConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    setConfig(savedConfig);
    console.log(`Loaded configuration for environment: ${savedConfig.env}`);
  } catch (e) {
    console.error("Failed to load config.json:", e);
  }
} else {
  console.log("No config.json found. Waiting for user setup.");
}

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root Route for basic connectivity test
app.get('/', (req, res) => {
  res.send('eBay Market Lens Backend is running.');
});

// Config Check
app.get('/api/config', (req, res) => {
  const config = getConfig();
  const configured = !!config.appId && !!config.certId;
  res.json({ configured });
});

// Get Config Details (masked credentials)
app.get('/api/config/details', (req, res) => {
  const config = getConfig();

  if (!config.appId || !config.certId) {
    return res.json({
      configured: false,
      appId: null,
      certId: null,
      env: null
    });
  }

  // Mask credentials for security
  const maskCredential = (credential) => {
    if (!credential || credential.length < 8) return '****';
    return credential.slice(0, 4) + '****' + credential.slice(-4);
  };

  res.json({
    configured: true,
    appId: maskCredential(config.appId),
    certId: maskCredential(config.certId),
    env: config.env
  });
});

// Config Setup
app.post('/api/config', async (req, res) => {
  let { appId, certId } = req.body;
  
  if (!appId || !certId) {
    return res.status(400).json({ error: 'Both App ID and Cert ID are required' });
  }

  appId = appId.trim();
  certId = certId.trim();

  const oldConfig = getConfig();

  try {
    resetCache(); 
    const detectedEnv = await verifyAndDetectEnv(appId, certId);
    
    const newConfig = {
      appId,
      certId,
      env: detectedEnv
    };

    setConfig(newConfig);
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(newConfig, null, 2));
    
    res.json({ success: true, env: detectedEnv });
  } catch (error) {
    setConfig(oldConfig);
    const errorMsg = error.message || 'Verification failed';
    console.error("Config verification failed:", errorMsg);
    res.status(401).json({ error: errorMsg });
  }
});

app.get('/api/search', async (req, res) => {
  const { q, type, sort, filters } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }

  const config = getConfig();
  if (!config.appId || !config.certId) {
    return res.status(503).json({ error: 'Server not configured. Please set API keys.' });
  }

  try {
    let parsedFilters = {};
    try {
      parsedFilters = filters ? JSON.parse(filters) : {};
    } catch (parseError) {
      console.warn('Invalid filters JSON, utilizing defaults:', parseError.message);
      parsedFilters = {};
    }
    
    let result;
    if (type === 'sold') {
      result = await searchSoldListings(q, sort, parsedFilters);
    } else {
      result = await searchActiveListings(q, sort, parsedFilters);
    }
    res.json(result);
  } catch (error) {
    console.error('Search route error:', error.message);
    res.status(500).json({ 
      error: 'Failed to fetch data from eBay',
      details: error.message 
    });
  }
});

app.post('/api/analyze-image', (req, res) => {
  res.json({ success: true, message: 'Image context received' });
});

// Fallback for unhandled routes
app.use('*', (req, res) => {
  console.log(`404 Unhandled Route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'Route not found' });
});

// Listen on 0.0.0.0 to bind to all network interfaces
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend running on http://0.0.0.0:${PORT}`);
});