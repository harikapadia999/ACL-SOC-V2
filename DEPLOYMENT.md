# AI SOC Orchestrator - Deployment Guide

## 🚀 Production Deployment

The application is deployed on Vercel with a simple proxy architecture.

### Live URL
```
https://ai-soc-orchestrator.vercel.app
```

---

## 📋 Architecture

### Frontend
- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **State Management:** Zustand
- **Data Fetching:** TanStack Query (React Query)
- **Routing:** React Router v6

### Backend Integration
- **Proxy:** Vercel rewrites
- **Backend API:** https://ai-soc.onrender.com/api/v1
- **CORS:** Handled by Vercel headers

---

## 🔧 Configuration

### Environment Variables
```env
VITE_API_BASE_URL=/api
VITE_WS_URL=wss://ai-soc.onrender.com/ws
```

### Vercel Configuration (`vercel.json`)
```json
{
  "rewrites": [
    {
      "source": "/api/dashboard/metrics,",
      "destination": "https://ai-soc.onrender.com/api/v1/dashboard/metrics,"
    },
    {
      "source": "/api/alerts/alerts",
      "destination": "https://ai-soc.onrender.com/api/v1/alerts/alerts"
    },
    {
      "source": "/api/:path*",
      "destination": "https://ai-soc.onrender.com/api/v1/:path*"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization"
        }
      ]
    }
  ]
}
```

---

## 🛠️ Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
```
http://localhost:5173
```

---

## 📦 Deployment

### Automatic Deployment
- **Trigger:** Push to `main` branch
- **Platform:** Vercel
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

### Manual Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

---

## 🔍 API Endpoints

All API requests are proxied through Vercel:

### Dashboard Metrics
```
GET /api/dashboard/metrics,
```

### Alerts
```
GET /api/alerts/alerts
```

### Generic Proxy
```
/api/:path* → https://ai-soc.onrender.com/api/v1/:path*
```

---

## 📚 Documentation

- **README.md** - Project overview and features
- **CONTRIBUTING.md** - Contribution guidelines
- **SECURITY.md** - Security policies
- **CHANGELOG.md** - Version history
- **LICENSE** - MIT License

---

## 🎯 Key Features

- Real-time security metrics dashboard
- Alert management and monitoring
- Responsive design for all devices
- Dark mode UI
- Live data updates
- Error handling and retry logic

---

## 🔒 Security

- CORS properly configured
- Environment variables for sensitive data
- HTTPS enforced
- Security headers configured

---

## 📞 Support

For issues or questions, please refer to the project documentation or contact the development team.

---

## ✅ Production Checklist

- [x] Frontend deployed on Vercel
- [x] Backend API accessible
- [x] CORS configured
- [x] Environment variables set
- [x] Proxy rewrites working
- [x] All routes functional
- [x] Error handling implemented
- [x] Documentation complete

---

**Status:** ✅ Production Ready
**Last Updated:** January 2, 2026
