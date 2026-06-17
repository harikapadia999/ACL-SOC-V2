# 🚀 Quick Start Guide

Get your AI SOC Orchestrator up and running in 5 minutes!

---

## 🌐 Live Demo

**Production URL**: [https://ai-soc-orchestrator.vercel.app](https://ai-soc-orchestrator.vercel.app)

No installation needed - just visit the link to try it out!

---

## Prerequisites

Before you begin local development, ensure you have:
- **Node.js 18+** installed ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** installed ([Download](https://git-scm.com/))

---

## Step 1: Clone the Repository

```bash
git clone https://github.com/harikapadia999/ai-soc-orchestrator.git
cd ai-soc-orchestrator
```

---

## Step 2: Install Dependencies

Using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

This will install all required packages (~150MB).

---

## Step 3: Configure Environment

Create environment files:

**For Development** (`.env.development`):
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/ws
```

**For Production** (`.env.production`):
```env
VITE_API_BASE_URL=/api
VITE_WS_URL=wss://ai-soc.onrender.com/ws
```

The production environment uses Vercel's proxy to connect to the backend.

---

## Step 4: Start Development Server

```bash
npm run dev
```

Or with yarn:
```bash
yarn dev
```

The application will start at: **http://localhost:5173**

---

## Step 5: Explore the Application

### Dashboard
Navigate to `/dashboard` to see:
- Active alerts count
- Triaged today metrics
- Average response time
- Critical escalations

### Alert Triage
Visit `/alerts` to:
- View all security alerts
- Filter by severity, verdict, source
- Sort and search alerts
- Click any alert for detailed analysis

### Alert Details
Click on an alert to see:
- Complete alert information
- Timeline of API integrations
- AI reasoning and decision
- Threat intelligence data
- MITRE ATT&CK mapping

### Chat & Investigate
Go to `/investigate` to:
- Ask questions about security incidents
- Search SIEM logs
- Get AI-powered recommendations

### Settings
Access `/settings` to:
- Update profile information
- Configure notifications
- Change security settings
- Manage API configuration

---

## 🎯 Common Tasks

### Build for Production
```bash
npm run build
```

Output will be in the `dist/` folder.

### Preview Production Build
```bash
npm run preview
```

### Run Tests
```bash
npm run test
```

### Run Linter
```bash
npm run lint
```

### Fix Linting Issues
```bash
npm run lint -- --fix
```

---

## 🚀 Deploy to Production

### Vercel (Recommended - Already Configured)

The project is already set up for Vercel deployment with automatic deployments on push to `main`.

**Manual Deployment:**
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel --prod
   ```

3. Your app will be live at a Vercel URL!

**Configuration:**
- `vercel.json` is already configured with API proxy
- Environment variables are set in Vercel dashboard
- Automatic deployments on git push

### Netlify
1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

### Docker
```bash
# Build image
docker build -t ai-soc-orchestrator .

# Run container
docker run -p 3000:3000 ai-soc-orchestrator
```

---

## 🔧 Troubleshooting

### Port Already in Use
If port 5173 is already in use, Vite will automatically try the next available port.

To specify a custom port:
```bash
npm run dev -- --port 3000
```

### Module Not Found Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Build Errors
Ensure you're using Node.js 18 or higher:
```bash
node --version
```

### API Connection Issues

**In Development:**
Check your `.env.development` file:
```bash
cat .env.development
```

**In Production:**
The app uses Vercel proxy (`/api/*`) which forwards to the backend.

Test backend connectivity:
```bash
curl https://ai-soc.onrender.com/api/v1/dashboard/metrics,
```

---

## 📚 Next Steps

- Read the [Full Documentation](README.md)
- Check out [Deployment Guide](DEPLOYMENT.md)
- Review [Contributing Guidelines](CONTRIBUTING.md)
- Explore [Security Policy](SECURITY.md)

---

## 💡 Tips

1. **Hot Module Replacement**: Changes are reflected instantly during development
2. **TypeScript**: Full type safety - your IDE will help catch errors
3. **Responsive Design**: Test on mobile, tablet, and desktop
4. **Error Handling**: Check browser console for detailed error messages
5. **Performance**: Use React DevTools to profile component performance
6. **Production**: Visit the live demo at https://ai-soc-orchestrator.vercel.app

---

## 🎉 You're All Set!

The application is now running locally. Start exploring the features and building amazing security automation!

For production deployment, the app is already live on Vercel with automatic deployments configured.
