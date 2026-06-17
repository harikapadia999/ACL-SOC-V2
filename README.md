# AI SOC Orchestrator

> **AI-powered Security Operations Center (SOC) Orchestrator** - Advanced alert triage, threat intelligence, and investigation platform with real-time monitoring.

![AI SOC Orchestrator](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![React](https://img.shields.io/badge/React-18.2.0-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-3178c6.svg)
![Deployed](https://img.shields.io/badge/deployed-Vercel-black.svg)

## 🌐 Live Demo

**Production URL**: [https://ai-soc-orchestrator.vercel.app](https://ai-soc-orchestrator.vercel.app)

## 🚀 Features

### 📊 Dashboard
- **Real-time Metrics**: Active alerts, triaged today, average response time, critical escalations
- **Trend Analysis**: Visual indicators showing percentage changes from previous day
- **Recent Alerts Table**: Quick overview of the latest security alerts
- **Auto-refresh**: Powered by React Query with smart caching

### 🚨 Alert Triage
- **Advanced Filtering**: Filter by severity, verdict, source, date range, and MITRE techniques
- **Sortable Columns**: Sort alerts by ID, severity, response time, and triggered time
- **Detailed Alert View**: Comprehensive alert information with AI-powered analysis
- **Optimistic Updates**: Instant UI feedback with background sync

### 🔍 Alert Detail View
- **Timeline Visualization**: Step-by-step breakdown of alert processing
- **AI Reasoning**: Detailed explanation of AI decision-making process
- **Threat Intelligence**: IP reputation, domain analysis, and IOC information
- **MITRE ATT&CK Mapping**: Associated tactics and techniques
- **Raw Data Access**: Complete alert payload for deep investigation

### 💬 Chat & Investigate
- **AI Assistant**: Natural language interface for security investigations
- **SIEM Integration**: Query logs and search for suspicious activities
- **Real-time Responses**: Instant analysis and recommendations

### 🎨 UI/UX
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Dark Mode Support**: Easy on the eyes during long monitoring sessions
- **Accessibility**: WCAG 2.1 compliant interface
- **Performance**: Code splitting, lazy loading, and optimized bundle size
- **Empty States**: Helpful guidance when no data is available

## 🛠️ Tech Stack

### Frontend
- **React 18.2** - Modern UI library with concurrent features
- **TypeScript 5.2** - Type-safe development with strict mode
- **Vite 5.0** - Lightning-fast build tool with HMR
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Router 6.21** - Client-side routing with lazy loading
- **React Query 5.17** - Powerful data synchronization and caching
- **Zustand 4.4** - Lightweight state management
- **Axios 1.6** - HTTP client with interceptors
- **Lucide React** - Beautiful icon library
- **React Hot Toast** - Elegant notifications
- **Zod 3.22** - Runtime type validation

### Deployment
- **Platform**: Vercel
- **Architecture**: Static site with API proxy
- **Backend**: https://ai-soc.onrender.com/api/v1
- **Auto-deployment**: Triggered on push to main branch

### Testing
- **Vitest 1.1** - Fast unit test framework
- **Testing Library** - React component testing
- **Coverage Reports** - Comprehensive test coverage

## 📦 Installation

### Prerequisites
- **Node.js 18+** and npm/yarn
- **Git**

### Quick Start

```bash
# Clone repository
git clone https://github.com/harikapadia999/ai-soc-orchestrator.git
cd ai-soc-orchestrator

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Environment Setup

Create environment files:

**`.env.development`** (for local development):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

**`.env.production`** (for production):
```env
VITE_API_BASE_URL=/api
VITE_WS_URL=wss://ai-soc.onrender.com/ws
```

### Available Scripts

```bash
# Development
npm run dev          # Start dev server with HMR

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Testing
npm run test         # Run tests in watch mode
npm run test:ui      # Open Vitest UI
npm run test:coverage # Generate coverage report

# Code Quality
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
ai-soc-orchestrator/
├── docs/                   # Documentation
│   └── API_REFERENCE.md   # Complete API docs
├── public/                # Static assets
├── src/
│   ├── components/        # React components
│   │   ├── alerts/       # Alert-specific components
│   │   ├── dashboard/    # Dashboard components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # Reusable UI components
│   ├── hooks/            # Custom React hooks
│   │   ├── useAlerts.ts  # Alert data fetching
│   │   └── useDashboard.ts # Dashboard data
│   ├── lib/              # Utilities
│   │   ├── constants.ts  # App constants
│   │   ├── env.ts        # Environment validation
│   │   └── utils.ts      # Helper functions
│   ├── pages/            # Page components (lazy loaded)
│   ├── services/         # API services
│   │   └── api/         # API client and methods
│   ├── test/             # Test setup
│   ├── types/            # TypeScript definitions
│   ├── App.tsx           # Main app with routing
│   ├── main.tsx          # Entry point with providers
│   └── index.css         # Global styles
├── .env.development      # Dev environment vars
├── .env.production       # Prod environment vars
├── .env.example          # Example env file
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config (strict mode)
├── vitest.config.ts      # Test configuration
├── tailwind.config.js    # Tailwind CSS config
├── vite.config.ts        # Vite config with optimizations
└── README.md            # This file
```

## 🚀 Deployment

### Production (Vercel)

The application is automatically deployed to Vercel on every push to the `main` branch.

**Live URL**: https://ai-soc-orchestrator.vercel.app

#### Vercel Configuration

The `vercel.json` file configures:
- API proxy rewrites to backend
- CORS headers
- Static file serving

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ai-soc.onrender.com/api/v1/:path*"
    }
  ]
}
```

#### Manual Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

### Other Platforms

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

Build and run:
```bash
docker build -t ai-soc-orchestrator .
docker run -p 3000:3000 ai-soc-orchestrator
```

## 🔌 API Integration

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment documentation.

### API Endpoints

All API requests are proxied through Vercel:

```
Frontend: /api/dashboard/metrics,
↓
Vercel Proxy
↓
Backend: https://ai-soc.onrender.com/api/v1/dashboard/metrics,
```

### Quick Examples

```typescript
import { useDashboardMetrics, useAlerts, useAlert } from '@/hooks';

// Fetch dashboard metrics with caching
const { data, isLoading, error } = useDashboardMetrics();

// Fetch all alerts
const { data: alerts } = useAlerts();

// Fetch specific alert
const { data: alert } = useAlert('ALT-001');
```

## 🧪 Testing

### Run Tests

```bash
# Watch mode
npm run test

# UI mode
npm run test:ui

# Coverage
npm run test:coverage
```

### Test Structure

```
src/
├── lib/
│   └── utils.test.ts      # Utils tests
└── components/
    └── ui/
        └── Button.test.tsx # Component tests
```

## ⚡ Performance Optimizations

- **Code Splitting**: Lazy loading for all pages
- **Bundle Optimization**: Vendor chunking for better caching
- **Tree Shaking**: Removes unused code
- **Minification**: Terser with console.log removal in production
- **React Query**: Smart caching and background refetching
- **Image Optimization**: WebP format support

## 🔒 Security

- **Environment Validation**: Runtime checks for required variables
- **Type Safety**: TypeScript strict mode enabled
- **Input Validation**: Zod schemas for runtime validation
- **XSS Protection**: React's built-in escaping
- **HTTPS Only**: Production enforces secure connections
- **CORS**: Properly configured via Vercel

## 📊 Monitoring

- **React Query Devtools**: Available in development
- **Error Boundaries**: Graceful error handling
- **Toast Notifications**: User-friendly error messages
- **Console Logging**: Development only (removed in production)

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed contribution guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

### v2.0.0 (Latest)
- ✅ Deployed to Vercel with proxy architecture
- ✅ Simplified deployment (removed serverless functions)
- ✅ Added React Query for data fetching and caching
- ✅ Implemented code splitting with lazy loading
- ✅ Added comprehensive testing infrastructure
- ✅ Enabled TypeScript strict mode
- ✅ Optimized build configuration
- ✅ Added environment validation
- ✅ Cleaned up debugging documentation
- ✅ Production-ready codebase

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment guide
- [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
- [SECURITY.md](./SECURITY.md) - Security policies
- [CHANGELOG.md](./CHANGELOG.md) - Version history
- [QUICKSTART.md](./QUICKSTART.md) - Quick start guide

## 📧 Support

- **Issues**: [GitHub Issues](https://github.com/harikapadia999/ai-soc-orchestrator/issues)
- **Discussions**: [GitHub Discussions](https://github.com/harikapadia999/ai-soc-orchestrator/discussions)

---

**Built with ❤️ by the AI SOC Team**
