# eBay Market Lens 🔍

A powerful full-stack web application for analyzing eBay marketplace data with real-time insights, advanced filtering, and visual analytics.

![eBay Market Lens](https://img.shields.io/badge/React-18.2-blue) ![Node.js](https://img.shields.io/badge/Node.js-Express-green) ![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue)

## ✨ Features

### 🔍 **Market Analysis**
- Search and analyze both **active listings** and **sold item history**
- Real-time market data with price trends and statistics
- Interactive charts and visualizations using Recharts
- Price distribution analysis and time-series data

### 🎛️ **Advanced Filtering**
- **Item Condition**: New, Used, Refurbished
- **Price Range**: Min/Max price constraints
- **Shipping Options**: Free shipping, Local pickup, Expedited
- **Seller Quality**: Minimum feedback score and rating filters
- Combinable filters that work across both active and sold listings

### 📸 **Camera Integration**
- Capture product images directly from your device
- Support for Linux desktop and Android browsers
- Front/rear camera selection on mobile devices
- Visual reference alongside search results

### 🔐 **Enhanced Credential Management**
- **One-time setup** with guided credential entry
- **Settings panel** for viewing and updating credentials
- **Auto-detection** of Production vs Sandbox environment
- **Secure storage** with credential masking
- **Environment badge** showing current API status

### 📊 **Data Visualization**
- Price distribution histograms
- Time-series sold price charts
- Average, min, max price indicators
- Dynamic updates based on filters and search

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **eBay Developer Account** with API credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ebay-api-lister.git
   cd ebay-api-lister
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the application**
   ```bash
   npm run dev
   ```

   This will start:
   - Backend server on `http://localhost:3001`
   - Frontend dev server on `http://localhost:5173`

4. **Open your browser**

   Navigate to `http://localhost:5173`

### First-Time Setup

On first launch, you'll see a setup screen:

1. **Get your eBay API credentials**:
   - Go to [eBay Developer Program](https://developer.ebay.com/signin)
   - Sign in and navigate to **My Account → Application Keys**
   - Create a "Production" or "Sandbox" Keyset
   - Copy your **App ID** (Client ID) and **Cert ID** (Client Secret)

2. **Enter credentials in the setup screen**:
   - Paste your App ID and Cert ID
   - Click "Verify & Save"
   - The app will auto-detect your environment (Production/Sandbox)

3. **Start searching!**
   - Your credentials are saved locally in `backend/config.json`
   - You can update them anytime via the Settings panel

## 🔧 Configuration

### Environment Variables (Optional)

You can optionally set credentials via environment variables in the backend:

Create `backend/.env`:
```env
EBAY_APP_ID=your_app_id_here
EBAY_CERT_ID=your_cert_id_here
EBAY_ENV=PRODUCTION
```

**Note**: UI-based setup is recommended as it auto-detects the environment.

### Credential Storage

- Credentials are stored in `backend/config.json`
- Never committed to version control (in `.gitignore`)
- Masked when displayed in the UI
- Only accessible by the local backend

## 📱 Usage

### Basic Search
1. Enter a product name in the search bar (e.g., "RTX 3080")
2. Choose between "Active Listings" or "Sold Items"
3. Select sort order (Price, Date)
4. Click "Search"

### Advanced Filtering
1. Click "Advanced Filters" to expand the filter panel
2. Set your desired filters:
   - Price range
   - Item condition
   - Shipping options
   - Seller feedback score
3. Filters apply automatically to your search

### Camera Feature
1. Click the camera icon in the search bar
2. Allow camera permissions
3. Capture an image of the product
4. Use as visual reference while searching

### Managing Credentials
1. Click the "Settings" button in the header
2. View your current credentials (masked)
3. See your current environment (Production/Sandbox)
4. Update credentials if needed
5. Quick link to eBay Developer Portal

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- Recharts (data visualization)
- Lucide React (icons)
- Axios (HTTP client)

**Backend:**
- Node.js + Express
- eBay Browse API (active listings)
- eBay Finding API (sold items)
- OAuth 2.0 client credentials flow

### Project Structure

```
ebay-api-lister/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── SetupScreen.tsx       # Initial credential setup
│   │   │   ├── SettingsPanel.tsx     # Credential management
│   │   │   ├── EnvironmentBadge.tsx  # Environment indicator
│   │   │   ├── SearchBar.tsx         # Search interface
│   │   │   ├── AdvancedFilters.tsx   # Filter controls
│   │   │   ├── Dashboard.tsx         # Analytics dashboard
│   │   │   ├── ResultsList.tsx       # Search results
│   │   │   └── CameraPanel.tsx       # Camera integration
│   │   ├── services/
│   │   │   └── api.ts                # API client
│   │   ├── types.ts                  # TypeScript types
│   │   └── App.tsx                   # Main app component
│   └── vite.config.ts
├── backend/
│   ├── server.js                     # Express server
│   ├── ebayClient.js                 # eBay API integration
│   ├── filterMapper.js               # Filter translation
│   └── config.json                   # Stored credentials (gitignored)
└── package.json
```

## 🔒 Security & Privacy

- ✅ Credentials stored **locally only** in `backend/config.json`
- ✅ Never sent to any third party
- ✅ Masked when displayed in UI
- ✅ Backend acts as proxy - frontend never calls eBay directly
- ✅ No credential logging
- ✅ HTTPS recommended for production deployment

## 🛠️ Development

### Run Backend Only
```bash
npm run server
```

### Run Frontend Only
```bash
vite
```

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📝 API Endpoints

### Backend API

- `GET /api/config` - Check if credentials are configured
- `GET /api/config/details` - Get masked credentials and environment
- `POST /api/config` - Save and verify credentials
- `GET /api/search` - Search eBay listings with filters
- `POST /api/analyze-image` - Submit camera image context

## 🐛 Troubleshooting

### "Cannot connect to backend server"
- Ensure backend is running on port 3001
- Check that `npm run dev` started both servers

### "Invalid credentials"
- Verify your App ID and Cert ID from eBay Developer Portal
- Ensure credentials match your environment (Production/Sandbox)

### "Camera not working"
- Grant camera permissions in your browser
- Use HTTPS or localhost (required for camera access)
- Check that your device has a camera

### "No results found"
- Try broader search terms
- Check your filters aren't too restrictive
- Verify you're searching the correct listing type (Active/Sold)

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ using React, Node.js, and the eBay API**
