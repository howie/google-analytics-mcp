# Quick Reference Guide

**Purpose**: Fast reference for common commands, configurations, and workflows
**Audience**: Claude Code and developers working on the project

---

## Essential Commands

### Development

```bash
# Install dependencies
npm install

# Build project
npm run build

# Clean build artifacts
npm run clean

# Type check without building
npm run typecheck
```

### Testing

```bash
# Run unit tests (fast, no credentials needed)
npm test

# Run unit tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run integration tests (requires credentials)
npm run test:integration

# Run specific test file
npm test -- tests/unit/tools.test.ts
```

### Code Quality

```bash
# Lint code
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Format code with Prettier
npm run format

# Check formatting without changing files
npm run format:check
```

### Running the Server

```bash
# Start MCP server (stdio mode)
node dist/index.js

# With explicit credentials
GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json node dist/index.js

# Test server startup (2 second timeout)
timeout 2 node dist/index.js || true
```

---

## Configuration Files

### package.json

**Key Scripts**:
- `build` - Compile TypeScript to JavaScript
- `test` - Run Jest unit tests
- `test:coverage` - Generate coverage report
- `test:integration` - Run integration tests
- `lint` - Run ESLint
- `format` - Format with Prettier

**Dependencies**:
- `@modelcontextprotocol/sdk` - MCP protocol implementation
- `googleapis` - Google APIs client library
- `google-auth-library` - Authentication handling

**Dev Dependencies**:
- `typescript` - TypeScript compiler
- `jest` - Testing framework
- `eslint` - Linting
- `prettier` - Code formatting

### tsconfig.json

**Key Settings**:
- `module`: "ESNext"
- `target`: "ES2020"
- `moduleResolution`: "node"
- `esModuleInterop`: true
- `strict`: true
- `outDir`: "./dist"
- `rootDir`: "./src"

### jest.config.js

**Key Settings**:
- `preset`: "ts-jest"
- `testEnvironment`: "node"
- `testMatch`: `["**/?(*.)+(spec|test).ts"]`
- `coverageThreshold`: 80% for all metrics
- `setupFilesAfterEnv`: `["<rootDir>/tests/setup.ts"]`

---

## Environment Variables

### Required for Integration Tests

```bash
# Google Cloud service account credentials
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json

# GA4 test property ID (numeric)
export GA4_TEST_PROPERTY_ID=123456789
```

### Optional

```bash
# Node environment
export NODE_ENV=development

# Test mode (for debugging)
export NODE_DEBUG=test
```

---

## Claude Code Integration

### MCP Server Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "ga4-admin": {
      "command": "node",
      "args": [
        "/Users/howie/Workspace/github/google-analytics-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/Users/howie/.config/gcp/ga4-admin-key.json"
      }
    }
  }
}
```

**Important**:
- Use absolute paths for both `args` and `env`
- Ensure `dist/index.js` exists (run `npm run build`)
- Service account must have Editor role in GA4 property

### Verifying MCP Server

```bash
# In Claude Code, check server is loaded
List all available MCP servers

# Check available tools
Show me all tools from ga4-admin MCP server

# Test tool execution
Using ga4-admin, list custom dimensions for property 123456789
```

---

## Google Cloud Setup

### Service Account Creation

```bash
# 1. Create service account via gcloud
gcloud iam service-accounts create ga4-admin-mcp \
  --display-name="GA4 Admin MCP Server"

# 2. Get service account email
gcloud iam service-accounts list

# 3. Create and download key
gcloud iam service-accounts keys create ~/.config/gcp/ga4-admin-key.json \
  --iam-account=ga4-admin-mcp@PROJECT_ID.iam.gserviceaccount.com

# 4. Add to GA4 (manual)
# - Go to GA4 Admin → Property Access Management
# - Add service account email
# - Grant "Editor" role
```

### Verify Authentication

```bash
# Test credentials are valid
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json
gcloud auth application-default print-access-token

# Should output a valid access token
```

---

## GA4 API Reference

### Property ID Formats

```bash
# ✅ Accepted formats (auto-converted):
123456789                    # Numeric only
G-123456789                  # Measurement ID (converted to numeric)
properties/123456789         # Full resource name

# ❌ Invalid:
G-XXXXXXXXX                  # Wrong format
properties/G-123456789       # Wrong format
```

### Finding Your Property ID

1. Open GA4 → Admin
2. Click "Property Settings"
3. Look for "Property ID" (numeric value like `123456789`)
4. **NOT** the Measurement ID (starts with G-)

### Parameter Name Rules

```bash
# ✅ Valid parameter names:
signup_method
user_tier
error_type
step_number

# ❌ Invalid parameter names:
1_invalid           # Cannot start with number
invalid-dash        # Cannot use dashes
too_long_name_over_40_characters_invalid  # Max 40 chars
```

### Scope Values

```bash
# Valid scopes (case-sensitive):
EVENT       # Event-scoped dimension
USER        # User-scoped dimension
ITEM        # Item-scoped dimension

# Invalid:
event       # Must be uppercase
Event       # Must be uppercase
SESSION     # Not a valid scope
```

---

## Common Workflows

### Full Development Cycle

```bash
# 1. Make changes to src/index.ts
vim src/index.ts

# 2. Type check
npm run typecheck

# 3. Lint and format
npm run lint:fix
npm run format

# 4. Build
npm run build

# 5. Run tests
npm test

# 6. Verify server starts
timeout 2 node dist/index.js || true

# 7. Commit changes
git add .
git commit -m "feat: your change description"
```

### Adding a New Tool

```bash
# 1. Update tool definition in src/index.ts
#    - Add to ListToolsRequestSchema handler
#    - Add to CallToolRequestSchema switch statement

# 2. Create test in tests/unit/tools.test.ts
npm run test:watch  # Watch mode for TDD

# 3. Build and verify
npm run build
npm test

# 4. Test manually in Claude Code
# 5. Document in CLAUDE.md
```

### Fixing Failing Tests

```bash
# 1. Run tests to see failures
npm test

# 2. Run specific failing test
npm test -- tests/unit/tools.test.ts -t "test name"

# 3. Enable verbose output
npm test -- --verbose

# 4. Check coverage to find gaps
npm run test:coverage
open coverage/index.html  # macOS
```

---

## Troubleshooting

### Build Issues

```bash
# Clear build cache
npm run clean
npm run build

# Check for TypeScript errors
npm run typecheck

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Test Issues

```bash
# Clear Jest cache
npx jest --clearCache

# Run tests with no cache
npm test -- --no-cache

# Debug specific test
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/tools.test.ts
```

### Authentication Issues

```bash
# Verify credentials file exists
ls -la $GOOGLE_APPLICATION_CREDENTIALS

# Test authentication
gcloud auth application-default print-access-token

# Check service account email
cat $GOOGLE_APPLICATION_CREDENTIALS | grep client_email

# Verify GA4 property access (via integration test)
npm run test:integration
```

### MCP Server Not Found in Claude Code

```bash
# 1. Check settings.json syntax
cat ~/.claude/settings.json | jq .

# 2. Verify dist/index.js exists
ls -la dist/index.js

# 3. Test server manually
node dist/index.js
# Should output: "GA4 Admin MCP Server running on stdio"

# 4. Restart Claude Code completely

# 5. Check Claude Code logs (if available)
```

---

## File Locations

### Source Files
- `src/index.ts` - Main MCP server implementation (330 lines)

### Test Files
- `tests/unit/tools.test.ts` - Unit tests (15 tests)
- `tests/integration/ga4-api.test.ts` - Integration tests (11 tests)
- `tests/mocks/googleapis.ts` - Mock implementations
- `tests/fixtures/test-data.ts` - Test data
- `tests/setup.ts` - Jest setup

### Configuration Files
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `jest.config.js` - Jest configuration
- `.gitignore` - Git ignore rules

### Documentation Files
- `CLAUDE.md` - Navigation hub for Claude Code
- `README.md` - User-facing documentation
- `QUICK_START.md` - Quick setup guide
- `TEST_RESULTS.md` - Test report
- `CLAUDE_CODE_INTEGRATION.md` - Manual testing guide
- `docs/features/` - Feature documentation
- `docs/claude/` - Claude Code specific docs (this directory)

### Build Artifacts
- `dist/` - Compiled JavaScript (not in git)
- `coverage/` - Test coverage reports (not in git)
- `node_modules/` - Dependencies (not in git)

---

## Quick Tips

### Performance
- Unit tests run in ~5 seconds
- Build time is ~2 seconds
- Integration tests take ~30 seconds per test (real API calls)

### Best Practices
- Always run `npm test` before committing
- Use `npm run test:watch` during development
- Check `npm run test:coverage` to find untested code
- Run `npm run lint:fix && npm run format` before committing
- Keep commits small and focused

### Common Gotchas
- Property ID must be numeric, not G-XXXXXXXXX
- Parameter names must start with letter
- Scope values are case-sensitive (EVENT not event)
- Custom dimensions cannot be deleted (only archived manually)
- Service account must have Editor role, not Viewer

---

**Last Updated**: 2025-10-08
**Version**: 0.1.0
