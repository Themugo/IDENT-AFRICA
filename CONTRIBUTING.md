# Contributing to IDENT AFRICA

Thank you for your interest in contributing to IDENT AFRICA! This document provides guidelines and instructions for contributing.

---

## 🤝 Code of Conduct

By participating in this project, you agree to maintain:
- **Respect** for all community members
- **Professionalism** in all interactions
- **Constructive feedback** over criticism
- **Inclusivity** in discussions

---

## 🔀 Branch Strategy

We use a **GitHub Flow** branching strategy:

```
main (production)
    │
    ├── development (integration)
    │       │
    │       ├── feature/your-feature-name
    │       ├── bugfix/issue-description
    │       ├── hotfix/critical-fix
    │       └── refactor/improvement-name
    │
    └── release/v1.x.x (optional)
```

### Branch Naming Conventions

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/description` | `feature/ai-planner-v2` |
| Bugfix | `bugfix/issue-description` | `bugfix/login-redirect` |
| Hotfix | `hotfix/critical-fix` | `hotfix/payment-failure` |
| Refactor | `refactor/description` | `refactor/auth-service` |
| Docs | `docs/description` | `docs/api-documentation` |

### Branch Lifecycle

1. Create branch from `main`
2. Make changes and commit
3. Push and create Pull Request
4. Review and merge
5. Delete branch after merge

---

## 📝 Commit Rules

### Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Type Categories

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no code change |
| `refactor` | Code refactoring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvements |
| `ci` | CI/CD changes |

### Examples

```bash
# Good commit messages
feat(auth): add biometric login support
fix(payments): resolve M-Pesa callback issue
docs(api): update endpoint documentation
refactor(booking): simplify validation logic
test(supplier): add integration tests

# Bad commit messages (avoid)
fixed stuff
WIP
changes
asdfgh
```

### Commit Guidelines

1. **Subject line**: Max 72 characters, imperative mood
2. **Body**: Explain *what* and *why*, not *how*
3. **Reference issues**: Include issue numbers
4. **Atomic commits**: One logical change per commit

---

## 🔄 Development Workflow

### 1. Setup

```bash
# Fork the repository
# Clone your fork
git clone https://github.com/YOUR_USERNAME/IDENT-AFRICA.git
cd IDENT-AFRICA

# Add upstream remote
git remote add upstream https://github.com/Themugo/IDENT-AFRICA.git

# Install dependencies
npm install
```

### 2. Create Feature Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 3. Make Changes

```bash
# Make your changes
# Write tests for new functionality
# Ensure code follows project style

# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(scope): description of change"
```

### 4. Push and Create PR

```bash
# Push to your fork
git push origin feature/your-feature-name

# Create Pull Request on GitHub
# Fill in PR template
# Request review from maintainers
```

### 5. Keep Branch Updated

```bash
# Fetch latest main
git fetch upstream

# Rebase on main
git rebase upstream/main

# Push updates
git push origin feature/your-feature-name --force
```

---

## 📋 Pull Request Guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing performed

## Checklist
- [ ] Code follows project style
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No console errors
```

### PR Requirements

- [ ] Descriptive title (imperative mood)
- [ ] Reference related issue
- [ ] Passes all CI checks
- [ ] Has appropriate tests
- [ ] Documentation updated if needed
- [ ] Breaking changes noted

### PR Review Process

1. **Automated checks** must pass
2. **Code review** by maintainer(s)
3. **Changes requested** if needed
4. **Approval** granted
5. **Merge** by maintainer

---

## 🧪 Testing Requirements

### Test Coverage Expectations

| Change Type | Test Required |
|-------------|---------------|
| New feature | Unit + Integration tests |
| Bug fix | Test that reproduces bug |
| Refactor | Existing tests must pass |
| API changes | API integration tests |
| UI changes | Visual/functional tests |

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- src/services/booking.test.ts

# Run with coverage
npm test -- --coverage
```

---

## 🎨 Code Style

### Prettier Configuration

We use Prettier for code formatting. Configuration is in `.prettierrc`.

### TypeScript Guidelines

- Use explicit types over `any`
- Prefer interfaces over type aliases
- Export types for public APIs
- Use optional chaining where appropriate

### React Best Practices

- Functional components with hooks
- Proper prop typing
- Memoize expensive computations
- Use React.memo for pure components

---

## 📚 Documentation

### When to Update Docs

| Change | Documentation Required |
|--------|---------------------|
| New feature | Feature documentation |
| API change | API endpoint docs |
| Config change | Configuration guide |
| UI change | User guide updates |

### Documentation Location

- `README.md` - Project overview
- `DEPLOYMENT.md` - Deployment guide
- `CONTRIBUTING.md` - This file
- `src/**/*.md` - Component/module docs

---

## 🐛 Reporting Issues

### Issue Templates

Use the provided issue templates:
- **Bug Report** - For reporting bugs
- **Feature Request** - For proposing features
- **Security Issue** - Email maintainers directly

### Before Creating Issue

1. Search existing issues
2. Verify on latest version
3. Check if reproduction steps clear

---

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's license.

---

## 📞 Getting Help

- **Issues**: Use GitHub Issues
- **Discussions**: Use GitHub Discussions
- **Email**: Contact maintainers for sensitive issues

---

**Thank you for contributing to IDENT AFRICA!** 🦁
