# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-30

### Added
- Initial release of AI SOC Orchestrator
- Dashboard with real-time metrics
  - Active alerts counter
  - Triaged today counter
  - Average response time
  - Critical escalations counter
- Alert Triage page
  - Advanced filtering (severity, verdict, source, date range)
  - Sortable columns
  - Pagination support
- Alert Detail page
  - Comprehensive alert information
  - Timeline visualization
  - AI reasoning and analysis
  - Threat intelligence data
  - MITRE ATT&CK mapping
  - Raw alert data viewer
- Chat & Investigate interface
  - AI-powered investigation assistant
  - Natural language queries
  - SIEM log search
  - Real-time responses
- Responsive design
  - Mobile-optimized layout
  - Tablet support
  - Desktop experience
- API integration
  - Dashboard metrics endpoint
  - Alert retrieval endpoints
  - Advanced query filters
  - Error handling and retry logic
- State management with Zustand
  - Authentication state
  - WebSocket connection state
- UI Components
  - Reusable component library
  - Loading states and skeletons
  - Toast notifications
  - Badge system for severity levels
- Development tools
  - TypeScript configuration
  - ESLint setup
  - Tailwind CSS integration
  - Vite build system
- Deployment configurations
  - Vercel deployment
  - Netlify deployment
  - Docker containerization
  - GitHub Actions CI/CD
- Documentation
  - Comprehensive README
  - API integration guide
  - Contributing guidelines
  - License (MIT)

### Security
- JWT token-based authentication
- HTTPS-only API communication
- XSS protection
- Input validation
- Secure headers in nginx configuration

## [Unreleased]

### Planned Features
- Advanced analytics dashboard
- Custom alert rules engine
- Integration with more SIEM platforms
- Mobile app (iOS/Android)
- Automated playbook execution
- Machine learning model training interface
- Multi-tenant support
- SSO integration (SAML, OAuth)
- Dark mode toggle
- Export functionality (PDF, CSV, JSON)
- Alert correlation engine
- Threat hunting workspace
- Incident response automation
- Compliance reporting
- User management and RBAC
- Audit logging
- API rate limiting
- Webhook integrations
- Slack/Teams notifications
- Email alerting

[1.0.0]: https://github.com/harikapadia999/ai-soc-orchestrator/releases/tag/v1.0.0
