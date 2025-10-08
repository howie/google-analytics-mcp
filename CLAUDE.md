# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**GA4 Admin MCP Server** - A Model Context Protocol (MCP) server for automating Google Analytics 4 configuration through natural language.

### Core Purpose
Automate GA4 property configuration (custom dimensions, conversion events, audiences) through Claude Code, reducing setup time from 15 minutes to 30 seconds.

### Technology Stack
- **Runtime**: Node.js 18+
- **Language**: TypeScript 5+
- **Framework**: @modelcontextprotocol/sdk v0.5.0
- **API Client**: googleapis v131.0.0
- **Authentication**: google-auth-library v9.0.0
- **Testing**: Jest 29.5.0 with ts-jest
- **Build**: TypeScript Compiler (tsc)

### Key Differentiator
The official Google Analytics MCP (`googleanalytics/google-analytics-mcp`) only provides **read** functionality. This server provides GA4 **Admin API write operations** for configuration automation.

## Quick Start

```bash
# Install dependencies
npm install

# Build TypeScript to JavaScript
npm run build

# Run tests
npm test                    # Unit tests only
npm run test:coverage       # With coverage report
npm run test:integration    # Integration tests (requires credentials)

# Start server (for testing)
node dist/index.js

# Lint and format
npm run lint                # Check for issues
npm run lint:fix            # Auto-fix issues
npm run format              # Format with Prettier
npm run format:check        # Check formatting

# Type checking
npm run typecheck           # Verify types without building
```

## MCP Server Tools

The server provides **4 tools** for GA4 Admin API automation:

### 1. create_custom_dimension
Create a custom dimension in GA4 property.

**Required**: `propertyId`, `parameterName`, `displayName`
**Optional**: `description`, `scope` (EVENT|USER|ITEM)

### 2. create_conversion_event
Mark an event as a conversion in GA4.

**Required**: `propertyId`, `eventName`

### 3. list_custom_dimensions
List all custom dimensions for a GA4 property.

**Required**: `propertyId`

### 4. list_conversion_events
List all conversion events for a GA4 property.

**Required**: `propertyId`

**Property ID Format**:
- ✅ Numeric: `123456789`
- ✅ Full resource name: `properties/123456789`
- ✅ G-ID (auto-converted): `G-123456789` → `properties/123456789`

## Project Structure

```
google-analytics-mcp/
├── src/
│   └── index.ts              # MCP server implementation (330 lines)
├── tests/
│   ├── unit/
│   │   └── tools.test.ts     # 15 unit tests (all passing)
│   ├── integration/
│   │   └── ga4-api.test.ts   # 11 integration tests (requires credentials)
│   ├── mocks/
│   │   └── googleapis.ts     # Mock Google APIs for testing
│   ├── fixtures/
│   │   └── test-data.ts      # Test data fixtures
│   └── setup.ts              # Jest setup configuration
├── docs/
│   ├── claude/               # Claude Code specific documentation
│   │   ├── quick-reference.md       # Commands, config, workflows
│   │   ├── development-standards.md # TDD, code quality, commits
│   │   ├── architecture.md          # System design, components
│   │   ├── testing.md               # Testing strategy, test writing
│   │   └── context/
│   │       ├── project-overview.md  # High-level project context
│   │       └── active-work.md       # Current tasks, decisions
│   ├── features/             # Feature planning and documentation
│   │   ├── README.md         # Complete feature specification
│   │   ├── IMPLEMENTATION.md # Development status (85% complete)
│   │   ├── GA4_SETUP_GUIDE.md
│   │   ├── GA4_QUICK_START.md
│   │   ├── GA4_API_SETUP.md
│   │   ├── LEARNINGS_FROM_OFFICIAL.md
│   │   ├── QUICK_START.md
│   │   └── TECHNICAL.md
│   └── open-source/          # Open source preparation
│       └── publishing-checklist.md  # Release preparation
├── dist/                     # Compiled JavaScript output
│   ├── index.js              # Main executable (10KB)
│   ├── index.js.map          # Source map
│   ├── index.d.ts            # Type definitions
│   └── index.d.ts.map
├── CLAUDE.md                 # This file (navigation hub)
├── README.md                 # User-facing documentation
├── CONTRIBUTING.md           # Open source contribution guidelines
├── CHANGELOG.md              # Version history
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
└── jest.config.js            # Jest testing configuration
```

## Development Standards

### Testing Strategy

**Test Coverage Target**: 80% (configured in jest.config.js)
**Current Coverage**: 0% (see Known Issues below)

**Test Types**:
1. **Unit Tests** (`tests/unit/`) - Mock all external dependencies
2. **Integration Tests** (`tests/integration/`) - Real GA4 API calls
3. **E2E Tests** - Manual Claude Code integration testing

**Running Tests**:
```bash
# Fast unit tests (no credentials needed)
npm test

# Integration tests (requires credentials)
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json
export GA4_TEST_PROPERTY_ID=123456789
npm run test:integration

# Coverage report (generates coverage/ directory)
npm run test:coverage
```

### Code Quality

**TypeScript Strict Mode**: Enabled
- No implicit any
- Strict null checks
- Strict function types

**Code Style**:
- ESLint for linting
- Prettier for formatting
- 2-space indentation
- Single quotes for strings
- Trailing commas

### Authentication

**Service Account (Recommended)**:
```bash
# 1. Create service account in GCP Console
# 2. Download JSON key to ~/.config/gcp/ga4-admin-key.json
# 3. In GA4 Admin → Property Access Management
#    Add service account email with Editor role
# 4. Set environment variable
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json
```

**Required Scopes**:
- `https://www.googleapis.com/auth/analytics.edit`
- `https://www.googleapis.com/auth/analytics.readonly`

**Required Permissions**:
- GA4 Property: **Editor** role

### 🚨 CRITICAL Development Workflow

After making ANY code changes:

1. **Type check**:
   ```bash
   npm run typecheck
   ```

2. **Lint and format**:
   ```bash
   npm run lint:fix
   npm run format
   ```

3. **Build**:
   ```bash
   npm run build
   ```

4. **MANDATORY: Run tests**:
   ```bash
   npm test
   ```

5. **Verify server starts**:
   ```bash
   node dist/index.js
   # Should output: "GA4 Admin MCP Server running on stdio"
   ```

6. **Fix any failures** before considering work complete

### Commit Standards

Follow Conventional Commits:
- `feat:` - New features
- `fix:` - Bug fixes
- `test:` - Test additions or fixes
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

**Include in commit message footer**:
```
🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

## Claude Code Integration

### Configuration

Add to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "ga4-admin": {
      "command": "node",
      "args": [
        "/path/to/google-analytics-mcp/dist/index.js"
      ],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account-key.json"
      }
    }
  }
}
```

**Note**: Update paths to match your local setup.

### Usage Examples

**Natural Language**:
```
Using ga4-admin MCP, create a custom dimension in property 123456789:
- Parameter name: signup_method
- Display name: Signup Method
- Description: How the user signed up (email/google)
- Scope: EVENT
```

**Batch Operations**:
```
For GA4 property 123456789:
1. List all current custom dimensions
2. Create dimension "user_tier" for tracking free vs paid
3. Mark events "signup_complete" and "purchase" as conversions
4. List all conversion events to confirm
```

📚 **Complete Integration Guide**: See `docs/claude/testing.md` (E2E Testing section)

## Known Issues & Technical Debt

### 🔴 High Priority

1. **Code Coverage: 0%**
   - **Issue**: Unit tests exist (15/15 passing) but don't test actual MCP server handlers
   - **Cause**: Tests mock googleapis API but don't instantiate MCP server
   - **Impact**: No verification that MCP request handlers work correctly
   - **Fix**: Refactor tests to test actual server.setRequestHandler implementations
   - **Tracked in**: docs/claude/testing.md (Test Execution History)

2. **Input Validation Not Enforced**
   - **Issue**: Validation logic exists in tests but not in server code
   - **Missing**: Property ID format validation, parameter name rules, scope validation
   - **Risk**: Invalid inputs could cause API errors
   - **Fix**: Add validation layer before API calls

### 🟡 Medium Priority

3. **Error Handling Could Be Better**
   - **Current**: Basic try-catch with generic error messages
   - **Needed**: Classify errors by type (404, 403, 409, 500)
   - **Needed**: User-friendly error messages with actionable guidance

4. **No Retry Logic**
   - **Issue**: Transient API failures cause immediate failure
   - **Needed**: Exponential backoff retry for 5xx errors
   - **Needed**: Rate limit handling

### 🟢 Low Priority

5. **No Structured Logging**
   - **Issue**: Only basic console.error output
   - **Needed**: Structured logging with levels (debug, info, warn, error)
   - **Needed**: Debug mode for troubleshooting

6. **No Metrics Collection**
   - **Issue**: No performance monitoring
   - **Needed**: Response time tracking, error rate monitoring

📚 **Complete Technical Debt**: See `docs/features/IMPLEMENTATION.md`

## 📚 Documentation Structure

This project uses a two-tier documentation system:

### Tier 1: CLAUDE.md (this file)
- Navigation hub and quick reference
- Links to comprehensive docs
- Commands-first approach

### Tier 2: docs/claude/
- **quick-reference.md** - Commands, config, workflows (500+ lines)
- **development-standards.md** - TDD, code quality, commits (700+ lines)
- **architecture.md** - System design, components, data flow (660+ lines)
- **testing.md** - Testing strategy, test writing, debugging (1100+ lines)
- **context/project-overview.md** - High-level project context (380+ lines)
- **context/active-work.md** - Current tasks, decisions, metrics (390+ lines)

### Root Documentation
- **README.md** - User-facing project overview
- **CONTRIBUTING.md** - Open source contribution guidelines
- **CHANGELOG.md** - Version history

### docs/open-source/
- **publishing-checklist.md** - Open source release preparation

### Feature Documentation
- **Feature Planning**: `@docs/features/README.md` - Complete specification
- **Setup Guides**: `@docs/features/GA4_SETUP_GUIDE.md` - Manual GA4 setup
- **API Automation**: `@docs/features/GA4_API_SETUP.md` - Python automation alternative
- **Technical Details**: `@docs/features/TECHNICAL.md` - MCP server architecture
- **Research Notes**: `@docs/features/LEARNINGS_FROM_OFFICIAL.md` - Lessons from official GA MCP
- **Implementation Status**: `@docs/features/IMPLEMENTATION.md` - 85% complete, v0.1.0

### External Resources
- **MCP Protocol**: https://modelcontextprotocol.io/docs
- **GA4 Admin API**: https://developers.google.com/analytics/devguides/config/admin/v1
- **Official GA MCP**: https://github.com/googleanalytics/google-analytics-mcp (read-only)
- **Google Auth Library**: https://github.com/googleapis/google-auth-library-nodejs

## Important Notes

### Security
- ✅ Never commit service account JSON keys
- ✅ Use environment variables for credentials
- ✅ Store keys outside project directory (`~/.config/gcp/`)
- ✅ Add `.env` and `*.json` (keys) to `.gitignore`
- ✅ Rotate keys regularly

### GA4 API Limitations
- ⚠️ Custom dimensions **cannot be deleted**, only archived (manually in UI)
- ⚠️ Property ID must be numeric (not G-XXXXXXXXX measurement ID)
- ⚠️ Parameter names must start with letter, max 40 characters
- ⚠️ Scope values are case-sensitive: EVENT, USER, ITEM (uppercase)

### MCP Server Behavior
- ✅ Server runs on stdio (stdin/stdout communication)
- ✅ Logs go to stderr (won't interfere with MCP protocol)
- ✅ Server blocks waiting for input (expected behavior)
- ✅ Each tool call is stateless and independent

### Testing Requirements
- ⚠️ Integration tests require real GA4 property (can create test data)
- ⚠️ Test property must have service account with Editor permissions
- ⚠️ Integration tests will create real resources (plan cleanup)

### Performance
- ⚡ Typical API response time: 1-3 seconds per operation
- ⚡ Batch operations run sequentially (no parallel API calls yet)
- ⚡ No caching (every request hits GA4 API)

## Task Management

Use TodoWrite tool extensively for:
- Planning multi-step feature implementations
- Tracking test coverage improvements
- Managing technical debt resolution
- Breaking down complex refactoring tasks
- Ensuring all test scenarios are covered

Always mark todos as completed immediately after finishing tasks.

## Next Steps

### Immediate (Current Sprint)
1. ⏳ **Manual Claude Code Integration Testing**
   - See `docs/claude/testing.md` (E2E Testing section) for 8 test scenarios
   - Verify all 4 tools work with real GA4 property
   - Document any issues found

2. ⏳ **Set Up Service Account Credentials**
   - Create GA4 test property or use existing
   - Generate service account key
   - Run integration tests

### Short-term (Next Week)
3. ⏳ **Improve Test Coverage**
   - Refactor unit tests to test actual MCP handlers
   - Target: >50% coverage
   - Add more edge case tests

4. ⏳ **Add Input Validation**
   - Property ID format validation
   - Parameter name rules enforcement
   - Scope value validation

### Medium-term (Next Month)
5. ⏳ **Phase 2 Features**
   - Audience management (create, list, update)
   - Batch operations (bulk create)
   - Configuration import/export (JSON files)

6. ⏳ **Production Readiness**
   - Improve error messages
   - Add retry logic
   - Structured logging
   - Performance metrics

📚 **Detailed Roadmap**: See `@docs/features/README.md`

---

**Version**: 0.1.0
**Status**: ✅ Phase 1 Complete - Ready for Manual Testing
**Last Updated**: 2025-10-08
**Maintainer**: GA4 Admin MCP Contributors
