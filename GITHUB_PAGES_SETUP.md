# GitHub Pages Deployment Guide

## Overview

This app uses a **hybrid architecture** where:
- **Frontend** is hosted on GitHub Pages (static files)
- **Backend** runs locally on your computer

This approach provides:
- ✅ Free hosting for the frontend
- ✅ Secure credential storage (never leaves your machine)
- ✅ No server costs
- ✅ Easy updates via Git push

## Architecture Diagram

```
┌─────────────────────────────────────┐
│   GitHub Pages (Frontend)           │
│   https://username.github.io/repo   │
│                                     │
│   - React App                       │
│   - Static HTML/CSS/JS              │
│   - No credentials                  │
└──────────────┬──────────────────────┘
               │
               │ HTTPS/CORS
               │
┌──────────────▼──────────────────────┐
│   Local Backend                     │
│   http://localhost:3001             │
│                                     │
│   - Express Server                  │
│   - eBay API Integration            │
│   - Credential Storage              │
└──────────────┬──────────────────────┘
               │
               │ eBay API
               │
┌──────────────▼──────────────────────┐
│   eBay APIs                         │
│   - Browse API                      │
│   - Finding API                     │
└─────────────────────────────────────┘
```

## Step-by-Step Setup

### 1. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### 2. Configure Repository Name

The app needs to know your repository name for proper routing.

Edit `vite.config.ts`:
```typescript
base: process.env.GITHUB_PAGES === 'true' ? '/your-repo-name/' : '/',
```

Replace `your-repo-name` with your actual repository name.

### 3. Push to Main Branch

The GitHub Actions workflow will automatically:
1. Install dependencies
2. Build the frontend
3. Deploy to GitHub Pages

```bash
git add .
git commit -m "Configure GitHub Pages deployment"
git push origin main
```

### 4. Wait for Deployment

1. Go to **Actions** tab in your repository
2. Watch the "Deploy to GitHub Pages" workflow
3. Wait for it to complete (usually 1-2 minutes)
4. Your app will be live at: `https://username.github.io/repo-name/`

### 5. Run Backend Locally

On your computer:

```bash
# Clone the repository (if not already)
git clone https://github.com/username/repo-name.git
cd repo-name

# Install dependencies
npm install

# Start the backend
npm run server
```

The backend will run on `http://localhost:3001`

### 6. Configure Backend URL in App

1. Visit your GitHub Pages URL
2. Click the **Backend** button (orange) in the header
3. Enter backend URL: `http://localhost:3001/api`
4. Click **Test Connection**
5. If successful, click **Save & Reload**

### 7. Configure eBay Credentials

1. Click **Settings** in the header
2. Enter your eBay App ID and Cert ID
3. Click **Verify & Save**
4. Start searching!

## How It Works

### Frontend (GitHub Pages)

The frontend is a static React app that:
- Detects it's running on GitHub Pages via `window.location.hostname`
- Stores backend URL in `localStorage`
- Makes API calls to your local backend
- Handles all UI and visualization

### Backend (Local)

The backend is an Express server that:
- Handles eBay API authentication (OAuth)
- Stores credentials in `backend/config.json`
- Proxies requests to eBay APIs
- Enables CORS for GitHub Pages origin

### Communication

```javascript
// Frontend detects environment
const isGitHubPages = window.location.hostname.includes('github.io');

// Uses appropriate backend URL
const backendUrl = isGitHubPages 
  ? localStorage.getItem('backend_url') 
  : window.location.origin + '/api';

// Makes API calls
axios.get(`${backendUrl}/search?q=laptop`);
```

## Security Considerations

### ✅ What's Secure

- **Credentials**: Stored only on your local machine
- **API Keys**: Never exposed to frontend or GitHub
- **CORS**: Backend only accepts requests from known origins
- **HTTPS**: GitHub Pages uses HTTPS by default

### ⚠️ Important Notes

- Backend must be running for the app to work
- Backend URL is stored in browser localStorage
- Each device needs to configure backend URL separately
- Credentials are in `backend/config.json` (gitignored)

## Updating the App

### Update Frontend

Just push to main branch:
```bash
git add .
git commit -m "Update frontend"
git push origin main
```

GitHub Actions will automatically redeploy.

### Update Backend

Pull latest changes and restart:
```bash
git pull origin main
npm install  # If dependencies changed
npm run server
```

## Troubleshooting

### Backend Connection Issues

**Problem**: "Cannot connect to backend"

**Solutions**:
1. Verify backend is running: `curl http://localhost:3001/health`
2. Check backend URL in app settings
3. Ensure CORS is enabled in backend
4. Try `http://localhost:3001/api` instead of `127.0.0.1`

### CORS Errors

**Problem**: CORS errors in browser console

**Solutions**:
1. Backend has `app.use(cors())` - this allows all origins
2. If you modified backend, ensure CORS middleware is active
3. Check browser console for specific CORS error details

### GitHub Pages 404

**Problem**: GitHub Pages shows 404

**Solutions**:
1. Check GitHub Actions workflow completed successfully
2. Verify Pages is enabled in repository settings
3. Ensure `base` path in `vite.config.ts` matches repo name
4. Wait a few minutes for DNS propagation

## Advanced Configuration

### Custom Domain

If using a custom domain:

1. Update `vite.config.ts`:
   ```typescript
   base: '/',  // Root path for custom domain
   ```

2. Add CNAME file to `public/` folder:
   ```
   yourdomain.com
   ```

### Multiple Environments

You can run different backends for different purposes:

- **Development**: `http://localhost:3001/api`
- **Staging**: `http://192.168.1.100:3001/api` (LAN)
- **Production**: Your own hosted backend

Just change the backend URL in the app settings.

## Benefits of This Architecture

1. **Free Hosting**: GitHub Pages is free for public repos
2. **Security**: Credentials never leave your machine
3. **Flexibility**: Run backend only when needed
4. **Updates**: Push to deploy - no manual builds
5. **Portability**: Use from any device with internet
6. **Privacy**: Your search history stays local

## Limitations

1. Backend must be running to use the app
2. Each device needs backend URL configuration
3. Can't use from mobile unless backend is on LAN
4. No server-side caching or persistence

## Next Steps

- Set up the backend as a system service (runs on startup)
- Configure firewall to allow LAN access
- Use ngrok for remote access to local backend
- Deploy backend to a cloud service for 24/7 availability

