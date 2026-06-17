# Contributing to AI SOC Orchestrator

Thank you for your interest in contributing to AI SOC Orchestrator! This document provides guidelines and instructions for contributing.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## How to Contribute

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates. When creating a bug report, include:

- **Clear title and description**
- **Steps to reproduce** the issue
- **Expected behavior** vs actual behavior
- **Screenshots** if applicable
- **Environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Clear title and description**
- **Use case** and motivation
- **Proposed solution** or implementation approach
- **Alternative solutions** considered

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Follow the coding style** used throughout the project
3. **Write clear commit messages** following conventional commits
4. **Add tests** for new features
5. **Update documentation** as needed
6. **Ensure CI passes** before requesting review

## Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/ai-soc-orchestrator.git
cd ai-soc-orchestrator

# Add upstream remote
git remote add upstream https://github.com/harikapadia999/ai-soc-orchestrator.git

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Start development server
npm run dev
```

## Coding Standards

### TypeScript
- Use TypeScript for all new code
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable and function names

### React
- Use functional components with hooks
- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types

### Styling
- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design (mobile-first)
- Test on multiple screen sizes

### File Organization
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components
├── services/      # API and external services
├── store/         # State management
├── types/         # TypeScript types
├── lib/           # Utility functions
└── hooks/         # Custom React hooks
```

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(alerts): add severity filter to alerts table

fix(dashboard): correct metric calculation for response time

docs(readme): update installation instructions
```

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Writing Tests
- Write tests for new features
- Maintain test coverage above 80%
- Test edge cases and error scenarios
- Use descriptive test names

## Pull Request Process

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes**
   - Write code
   - Add tests
   - Update documentation

4. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template
   - Request review

## Review Process

- All PRs require at least one approval
- CI must pass before merging
- Address review comments promptly
- Keep PRs focused and reasonably sized

## Release Process

Releases are managed by maintainers:

1. Version bump following [Semantic Versioning](https://semver.org/)
2. Update CHANGELOG.md
3. Create release tag
4. Deploy to production

## Questions?

Feel free to:
- Open an issue for questions
- Join our community discussions
- Contact maintainers directly

Thank you for contributing! 🎉
