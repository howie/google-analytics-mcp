# Contributing to GA4 Admin MCP Server

Thank you for your interest in contributing to the GA4 Admin MCP Server! This document provides guidelines and instructions for contributing.

## 🌟 Ways to Contribute

- 🐛 Report bugs and issues
- 💡 Suggest new features or improvements
- 📝 Improve documentation
- 🔧 Submit bug fixes or new features
- ✅ Write tests
- 🌐 Add translations

## 📋 Before You Start

1. **Check existing issues** - Someone might already be working on it
2. **Open an issue first** - Discuss major changes before implementing
3. **Follow the code style** - Use ESLint and Prettier configurations
4. **Write tests** - Maintain or improve code coverage
5. **Update documentation** - Keep README and docs in sync

## 🚀 Getting Started

### 1. Fork and Clone

```bash
# Fork the repository on GitHub, then clone it
git clone https://github.com/YOUR_USERNAME/ga4-admin-mcp.git
cd ga4-admin-mcp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Development Environment

```bash
# Create a service account key for testing
# Place it at ~/.config/gcp/ga4-admin-test-key.json

# Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-test-key.json

# Build the project
npm run build

# Run in development mode
npm run dev
```

### 4. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

## 🔨 Development Workflow

### Code Style

We use ESLint and Prettier for code formatting:

```bash
# Format code
npm run format

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

### Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Testing Requirements**:
- All new features must have tests
- Bug fixes should include regression tests
- Maintain minimum 80% code coverage

### Building

```bash
# Build TypeScript
npm run build

# Clean build artifacts
npm run clean
```

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples**:
```bash
git commit -m "feat(dimensions): add support for USER scope dimensions"
git commit -m "fix(auth): handle expired credentials gracefully"
git commit -m "docs(readme): update installation instructions"
```

## 🔍 Pull Request Process

### 1. Before Submitting

- ✅ Code builds without errors
- ✅ All tests pass
- ✅ Code follows style guidelines
- ✅ Documentation is updated
- ✅ Commit messages follow conventions

### 2. Submit PR

```bash
git push origin feature/your-feature-name
```

Then open a Pull Request on GitHub with:

**Title**: Brief description following conventional commits format

**Description**: Include:
- What changes were made
- Why the changes are needed
- How to test the changes
- Any breaking changes
- Related issue numbers (if applicable)

**PR Template**:
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How to Test
1. Step 1
2. Step 2
3. Expected result

## Checklist
- [ ] Tests pass
- [ ] Code follows style guidelines
- [ ] Documentation updated
- [ ] No breaking changes (or documented)

## Related Issues
Fixes #123
```

### 3. Review Process

- Maintainers will review your PR
- Address any feedback or requested changes
- Once approved, maintainers will merge your PR

## 🐛 Reporting Bugs

**Before reporting**:
1. Check if the bug has already been reported
2. Try to reproduce with the latest version
3. Gather relevant information

**Bug Report Template**:
```markdown
## Description
Clear description of the bug

## Steps to Reproduce
1. Step 1
2. Step 2
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., macOS 14.0]
- Node.js version: [e.g., 18.17.0]
- MCP version: [e.g., 0.1.0]
- Claude Code version: [e.g., 1.0.0]

## Additional Context
Logs, screenshots, etc.
```

## 💡 Suggesting Features

**Feature Request Template**:
```markdown
## Problem
What problem does this solve?

## Proposed Solution
How should it work?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Any other relevant information
```

## 📚 Documentation

Documentation is crucial! When contributing:

- Update README.md for user-facing changes
- Update QUICK_START.md for setup changes
- Add JSDoc comments for new functions
- Update API documentation
- Include code examples

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Example unit test
describe('normalizePropertyId', () => {
  it('should format numeric property ID', () => {
    expect(normalizePropertyId(123456)).toBe('properties/123456');
  });

  it('should handle already formatted property ID', () => {
    expect(normalizePropertyId('properties/123456')).toBe('properties/123456');
  });
});
```

### Integration Tests

```typescript
// Example integration test (requires real API)
describe('create_custom_dimension', () => {
  it('should create dimension successfully', async () => {
    const result = await createCustomDimension({
      propertyId: TEST_PROPERTY_ID,
      parameterName: 'test_param',
      displayName: 'Test Dimension'
    });

    expect(result.success).toBe(true);
    expect(result.dimension).toBeDefined();
  });
});
```

## 🔐 Security

- **Never commit secrets or API keys**
- Use environment variables for credentials
- Report security vulnerabilities privately to maintainers
- Don't open public issues for security concerns

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behaviors**:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behaviors**:
- Trolling, insulting/derogatory comments
- Public or private harassment
- Publishing others' private information
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers are responsible for clarifying standards and taking appropriate action in response to unacceptable behavior.

## 📞 Contact

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Email**: [maintainer email when ready]

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- GitHub contributors page

Thank you for contributing! 🎉
