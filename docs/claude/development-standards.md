# Development Standards

**Purpose**: Coding standards, testing practices, and development workflows for GA4 Admin MCP Server
**Audience**: Claude Code and developers contributing to the project

---

## Code Style Guidelines

### TypeScript Standards

**Strict Mode**: Enabled
- `strict: true` in tsconfig.json
- No implicit `any` types
- Strict null checking
- Strict function types

**Type Annotations**:
```typescript
// ✅ Good: Explicit parameter and return types
async function getAuthClient(): Promise<OAuth2Client> {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/analytics.edit']
  });
  return await auth.getClient();
}

// ❌ Bad: Implicit any
async function getAuthClient() {
  const auth = new GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/analytics.edit']
  });
  return await auth.getClient();
}
```

**Interface Naming**:
```typescript
// ✅ Good: Clear, descriptive interfaces
interface CreateCustomDimensionArgs {
  propertyId: string;
  parameterName: string;
  displayName: string;
  description?: string;
  scope?: "EVENT" | "USER" | "ITEM";
}

// ❌ Bad: Vague names
interface Args {
  id: string;
  name: string;
  // ...
}
```

### Code Formatting

**Tool**: Prettier
**Configuration**: See `.prettierrc` or package.json

**Rules**:
- 2-space indentation
- Single quotes for strings
- Trailing commas where valid
- 80-character line length (recommended)
- Semicolons required

**Commands**:
```bash
# Format all TypeScript files
npm run format

# Check formatting without changing
npm run format:check

# Format on save (VS Code)
# Add to .vscode/settings.json:
# "editor.formatOnSave": true
```

### Linting

**Tool**: ESLint
**Configuration**: See `.eslintrc` or package.json

**Key Rules**:
- `@typescript-eslint/recommended`
- `no-unused-vars` (error)
- `no-console` (warn, except console.error)
- `prefer-const` (error)

**Commands**:
```bash
# Check for linting issues
npm run lint

# Auto-fix where possible
npm run lint:fix
```

---

## Testing Methodology

### Test-Driven Development (TDD)

**Follow Red-Green-Refactor Cycle**:

1. **Red**: Write failing test first
   ```typescript
   it('should create custom dimension successfully', async () => {
     // Test code that will fail initially
   });
   ```

2. **Green**: Write minimum code to make test pass
   ```typescript
   // Implement just enough to pass the test
   ```

3. **Refactor**: Improve code without changing behavior
   ```typescript
   // Clean up implementation
   // Tests should still pass
   ```

### Test Structure

**AAA Pattern**: Arrange, Act, Assert

```typescript
it('should create a custom dimension successfully', async () => {
  // Arrange: Set up test data and mocks
  const mockCreate = mockAnalyticsAdminClient.properties.customDimensions.create;
  const args = {
    propertyId: '123456',
    parameterName: 'test_param',
    displayName: 'Test Dimension',
    scope: 'EVENT',
  };

  // Act: Execute the code under test
  const result = await mockCreate({
    parent: `properties/${args.propertyId}`,
    requestBody: {
      parameterName: args.parameterName,
      displayName: args.displayName,
      scope: args.scope,
    },
  });

  // Assert: Verify the outcome
  expect(mockCreate).toHaveBeenCalledTimes(1);
  expect(result.data).toHaveProperty('parameterName', 'test_param');
});
```

### Test Coverage Requirements

**Target Coverage**: 80% (all metrics)
- Statements: 80%
- Branches: 80%
- Functions: 80%
- Lines: 80%

**Current Coverage**: 0% (see Known Issues in CLAUDE.md)

**Improvement Plan**:
1. Refactor tests to test actual MCP server handlers
2. Add edge case tests
3. Test error handling paths
4. Test input validation

### Test Organization

**Directory Structure**:
```
tests/
├── unit/               # Fast tests with mocks
│   └── tools.test.ts
├── integration/        # Tests with real GA4 API
│   └── ga4-api.test.ts
├── mocks/             # Mock implementations
│   └── googleapis.ts
├── fixtures/          # Test data
│   └── test-data.ts
└── setup.ts           # Jest configuration
```

**Naming Conventions**:
- Test files: `*.test.ts`
- Test suites: `describe('Feature Name', () => {})`
- Test cases: `it('should do something', async () => {})`

---

## Development Workflow

### Before Starting Work

```bash
# 1. Update repository
git pull origin main

# 2. Create feature branch (if applicable)
git checkout -b feature/your-feature-name

# 3. Install dependencies (if package.json changed)
npm install

# 4. Verify tests pass
npm test
```

### During Development

**Watch Mode for Fast Feedback**:
```bash
# Terminal 1: TypeScript watch mode
npm run dev

# Terminal 2: Test watch mode
npm run test:watch
```

**TDD Workflow**:
1. Write failing test
2. Run `npm test` to verify it fails
3. Implement minimum code
4. Run `npm test` to verify it passes
5. Refactor if needed
6. Repeat

### Before Committing

**Pre-commit Checklist**:

```bash
# 1. Type check
npm run typecheck
# ✅ No TypeScript errors

# 2. Lint and format
npm run lint:fix
npm run format
# ✅ All linting issues fixed
# ✅ Code formatted consistently

# 3. Build
npm run build
# ✅ Build succeeds without errors

# 4. Run all tests
npm test
# ✅ All tests pass

# 5. Check coverage (optional but recommended)
npm run test:coverage
# ✅ Coverage meets or approaches 80% target

# 6. Verify server starts
timeout 2 node dist/index.js || true
# ✅ Server outputs: "GA4 Admin MCP Server running on stdio"
```

**If ANY step fails**, fix the issue before committing.

### Commit Messages

**Format**: Follow Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `test`: Adding or updating tests
- `docs`: Documentation changes
- `refactor`: Code refactoring (no behavior change)
- `style`: Code style/formatting (no logic change)
- `chore`: Maintenance tasks (dependencies, build, etc.)

**Examples**:

```bash
# Good commits
git commit -m "feat: add audience management tools"
git commit -m "fix: handle property ID with G- prefix correctly"
git commit -m "test: add integration tests for conversion events"
git commit -m "docs: update CLAUDE.md with new tools"

# Bad commits
git commit -m "update stuff"
git commit -m "WIP"
git commit -m "fix bug"
```

**Footer**:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

---

## Code Quality Checks

### Type Safety

**Always use TypeScript types**:
```typescript
// ✅ Good: Strong typing
interface ToolResult {
  success: boolean;
  message?: string;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

function handleResult(result: ToolResult): void {
  if (result.success) {
    console.log(result.message);
  }
}

// ❌ Bad: Using any
function handleResult(result: any): void {
  console.log(result.message);
}
```

### Error Handling

**Always handle errors explicitly**:
```typescript
// ✅ Good: Specific error handling
try {
  const response = await analyticsadmin.properties.customDimensions.create({...});
  return {
    success: true,
    message: `✅ Created custom dimension: ${displayName}`,
    data: response.data,
  };
} catch (error: any) {
  return {
    success: false,
    error: {
      code: error.code || 'UNKNOWN',
      message: error.message || 'An error occurred',
      details: error.errors || error.response?.data,
    },
  };
}

// ❌ Bad: Swallowing errors
try {
  const response = await analyticsadmin.properties.customDimensions.create({...});
  return response.data;
} catch (error) {
  // Silent failure
  return null;
}
```

### Input Validation

**Validate inputs before processing**:
```typescript
// ✅ Good: Validate inputs
function normalizePropertyId(propertyId: string): string {
  if (!propertyId || typeof propertyId !== 'string') {
    throw new Error('Property ID must be a non-empty string');
  }

  // Handle different formats
  if (propertyId.startsWith('properties/')) {
    return propertyId;
  }

  // Remove G- prefix if present
  const numericId = propertyId.replace(/^G-/, '');

  // Validate numeric ID
  if (!/^\d+$/.test(numericId)) {
    throw new Error(`Invalid property ID format: ${propertyId}`);
  }

  return `properties/${numericId}`;
}

// ❌ Bad: Assume inputs are valid
function normalizePropertyId(propertyId: string): string {
  return `properties/${propertyId.replace('G-', '')}`;
}
```

---

## Dependency Management

### Adding Dependencies

**Before adding a new dependency**:
1. Check if it's really needed (can we implement it ourselves?)
2. Verify it's actively maintained (check last commit date)
3. Check for security vulnerabilities
4. Verify it has TypeScript types

**Process**:
```bash
# 1. Add dependency
npm install package-name

# 2. Add dev dependency
npm install --save-dev package-name

# 3. Update package-lock.json
npm install

# 4. Test that everything still works
npm test
npm run build

# 5. Commit both package.json and package-lock.json
git add package.json package-lock.json
git commit -m "chore: add package-name dependency"
```

### Updating Dependencies

**Regular Updates** (monthly):
```bash
# Check for outdated packages
npm outdated

# Update minor/patch versions
npm update

# Update major versions (carefully)
npm install package-name@latest

# Test thoroughly after updates
npm run build
npm test
```

**Security Updates** (immediately):
```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities automatically
npm audit fix

# For breaking changes, update manually
npm audit fix --force  # Use with caution
```

---

## Documentation Standards

### Code Comments

**When to comment**:
- Complex algorithms
- Non-obvious workarounds
- Important business logic
- API quirks or limitations

**When NOT to comment**:
- Obvious code
- Redundant descriptions
- Out-of-date information

```typescript
// ✅ Good: Explains why
// Custom dimensions cannot be deleted via API, only archived manually in GA4 UI
// So we skip cleanup in tests to avoid orphaned dimensions

// ✅ Good: Explains workaround
// GA4 API requires numeric property ID, but accepts G- prefix
// We normalize all formats to properties/NUMERIC_ID
const propertyPath = normalizePropertyId(propertyId);

// ❌ Bad: States the obvious
// Create a custom dimension
const response = await analyticsadmin.properties.customDimensions.create({...});

// ❌ Bad: Outdated comment
// TODO: Fix this later (from 6 months ago)
```

### JSDoc Comments

**For public APIs and complex functions**:
```typescript
/**
 * Creates a custom dimension in Google Analytics 4 property.
 *
 * @param propertyId - GA4 property ID (numeric or G-XXXXXXXXX format)
 * @param parameterName - Event parameter name (must start with letter, max 40 chars)
 * @param displayName - Display name shown in GA4 UI
 * @param description - Optional description of the dimension
 * @param scope - Dimension scope: EVENT, USER, or ITEM (default: EVENT)
 * @returns Promise resolving to dimension resource with name and metadata
 * @throws Error if property ID is invalid or dimension already exists
 */
async function createCustomDimension(
  propertyId: string,
  parameterName: string,
  displayName: string,
  description?: string,
  scope?: 'EVENT' | 'USER' | 'ITEM'
): Promise<CustomDimension> {
  // Implementation
}
```

### README Updates

**When to update README.md**:
- New features added
- Installation process changes
- Configuration options change
- Breaking changes

**Keep README.md updated with**:
- Current version number
- Accurate feature list
- Working examples
- Current limitations

---

## Performance Considerations

### Response Time Targets

- **Unit tests**: < 10 seconds total
- **Build time**: < 5 seconds
- **MCP tool response**: < 3 seconds per operation
- **Integration tests**: < 60 seconds per test

### Optimization Guidelines

**Don't optimize prematurely**:
1. Write correct code first
2. Measure performance
3. Optimize bottlenecks only if needed

**Common Optimizations**:
- Cache authentication client (don't recreate on every request)
- Batch API requests when possible (future feature)
- Use async/await properly (don't block unnecessarily)

---

## Security Best Practices

### Credentials Handling

**Never**:
- ❌ Commit credentials to git
- ❌ Log credentials to console
- ❌ Include credentials in error messages
- ❌ Store credentials in code

**Always**:
- ✅ Use environment variables
- ✅ Store keys outside project directory
- ✅ Add sensitive files to `.gitignore`
- ✅ Rotate keys regularly

### Input Sanitization

**Validate all external inputs**:
```typescript
// ✅ Good: Sanitize and validate
function validateParameterName(name: string): boolean {
  // GA4 rules: Must start with letter, max 40 chars, alphanumeric + underscore
  const regex = /^[a-zA-Z][a-zA-Z0-9_]{0,39}$/;
  return regex.test(name);
}

if (!validateParameterName(parameterName)) {
  throw new Error(`Invalid parameter name: ${parameterName}`);
}

// ❌ Bad: Trust user input
const response = await api.create({ parameterName });
```

---

## Debugging

### Debug Mode

**Enable verbose logging**:
```bash
# Set NODE_DEBUG environment variable
NODE_DEBUG=* node dist/index.js

# Jest verbose mode
npm test -- --verbose

# TypeScript build with source maps
npm run build  # Source maps enabled by default
```

### Common Issues

**Build Failures**:
```bash
# Clear and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build
```

**Test Failures**:
```bash
# Clear Jest cache
npx jest --clearCache
npm test

# Run specific test
npm test -- -t "test name"
```

**Type Errors**:
```bash
# Check types only
npm run typecheck

# See detailed errors
npx tsc --noEmit --pretty
```

---

## Continuous Improvement

### Code Reviews

**When submitting for review**:
- ✅ All tests pass
- ✅ Code is formatted and linted
- ✅ Documentation updated
- ✅ Commit messages follow convention

**When reviewing code**:
- Check test coverage
- Verify error handling
- Look for security issues
- Suggest improvements

### Refactoring

**When to refactor**:
- Code duplication (DRY principle)
- Complex functions (split into smaller functions)
- Unclear names (rename for clarity)
- After adding tests (make improvements safely)

**When NOT to refactor**:
- Don't refactor without tests
- Don't mix refactoring with feature additions
- Don't optimize without measuring

### Technical Debt

**Track in**:
- `CLAUDE.md` - Known Issues section
- `docs/features/IMPLEMENTATION.md` - Technical Debt section
- GitHub Issues (if applicable)

**Prioritize by**:
- Impact (high/medium/low)
- Effort (hours/days/weeks)
- Risk (blocking/important/nice-to-have)

---

**Last Updated**: 2025-10-08
**Version**: 0.1.0
