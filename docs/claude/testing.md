# Testing Strategy

**Purpose**: Comprehensive testing guide for GA4 Admin MCP Server
**Audience**: Claude Code and developers writing tests

---

## Testing Philosophy

### Test Pyramid

Our testing strategy follows the test pyramid approach:

```
       ┌───────────────┐
       │   E2E Tests   │ Manual (Claude Code integration)
       │   (Manual)    │ 8 test scenarios
       └───────────────┘
            ▲
            │
       ┌────┴──────────────┐
       │ Integration Tests │ Real GA4 API calls
       │   (Automated)     │ 11 tests, requires credentials
       └───────────────────┘ Slow (~30s per test)
            ▲
            │
       ┌────┴────────────────────┐
       │     Unit Tests          │ Mocked dependencies
       │    (Automated)          │ 15 tests, fast (~5s total)
       └─────────────────────────┘ No credentials needed
```

**Key Principles**:
1. **More unit tests** - Fast feedback, no external dependencies
2. **Some integration tests** - Verify real API interactions
3. **Manual E2E tests** - Validate full user experience

---

## Unit Testing

### Overview

**Purpose**: Test individual components in isolation
**Speed**: Very fast (~5 seconds for all 15 tests)
**Dependencies**: None (fully mocked)
**Coverage Target**: 80%

### Test Structure

**File**: `tests/unit/tools.test.ts`

**Test Organization**:
```typescript
describe('MCP Tools', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  describe('create_custom_dimension', () => {
    it('should create a custom dimension successfully', async () => {
      // Test implementation
    });

    it('should handle property ID as string or number', async () => {
      // Test implementation
    });

    it('should handle API errors gracefully', async () => {
      // Test implementation
    });
  });

  describe('create_conversion_event', () => {
    // Event-related tests
  });

  // More test suites...
});
```

### Mocking Strategy

**Mock googleapis library**:
```typescript
// tests/mocks/googleapis.ts
export const mockAnalyticsAdminClient = {
  properties: {
    customDimensions: {
      create: jest.fn().mockResolvedValue({
        data: mockCustomDimension,
      }),
      list: jest.fn().mockResolvedValue({
        data: {
          customDimensions: [mockCustomDimension],
          nextPageToken: null,
        },
      }),
    },
    conversionEvents: {
      create: jest.fn().mockResolvedValue({
        data: mockConversionEvent,
      }),
      list: jest.fn().mockResolvedValue({
        data: {
          conversionEvents: [mockConversionEvent],
          nextPageToken: null,
        },
      }),
    },
  },
};

// Use in tests
jest.mock('googleapis', () => ({
  google: {
    analyticsadmin: jest.fn(() => mockAnalyticsAdminClient),
    auth: {
      GoogleAuth: jest.fn().mockImplementation(() => ({
        getClient: jest.fn().mockResolvedValue({}),
      })),
    },
  },
}));
```

### Writing Unit Tests

**Test Template (AAA Pattern)**:
```typescript
it('should [expected behavior]', async () => {
  // Arrange: Set up test data
  const mockCreate = mockAnalyticsAdminClient.properties.customDimensions.create;
  const args = {
    propertyId: '123456',
    parameterName: 'test_param',
    displayName: 'Test Dimension',
    scope: 'EVENT',
  };

  // Act: Execute the code
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
  expect(mockCreate).toHaveBeenCalledWith({
    parent: 'properties/123456',
    requestBody: {
      parameterName: 'test_param',
      displayName: 'Test Dimension',
      scope: 'EVENT',
    },
  });
  expect(result.data).toHaveProperty('parameterName', 'test_param');
});
```

### Test Categories

**1. Happy Path Tests**:
- Successful dimension creation
- Successful event marking
- Successful list operations

**2. Error Handling Tests**:
- 404 Not Found (invalid property)
- 403 Forbidden (insufficient permissions)
- 409 Conflict (duplicate dimension)
- 500 Internal Server Error

**3. Input Validation Tests**:
- Property ID format validation
- Parameter name rules
- Scope value validation

**4. Edge Case Tests**:
- Empty lists
- Null/undefined inputs
- Special characters in names

### Running Unit Tests

```bash
# Run all unit tests
npm test

# Watch mode (auto-rerun on changes)
npm run test:watch

# Run specific test file
npm test -- tests/unit/tools.test.ts

# Run specific test by name
npm test -- -t "should create a custom dimension"

# Verbose output
npm test -- --verbose
```

---

## Integration Testing

### Overview

**Purpose**: Test real API interactions with Google Analytics
**Speed**: Slow (~30 seconds per test)
**Dependencies**: Requires GA4 credentials and test property
**Coverage**: API contracts, authentication, error handling

### Prerequisites

**Environment Variables**:
```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json
export GA4_TEST_PROPERTY_ID=123456789
```

**Test Property Requirements**:
- Dedicated test property (not production!)
- Service account with Editor permissions
- OK to create test resources (dimensions accumulate)

### Test Structure

**File**: `tests/integration/ga4-api.test.ts`

**Test Organization**:
```typescript
// Skip if no credentials
const skipIfNoCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? describe
  : describe.skip;

skipIfNoCredentials('GA4 Admin API Integration Tests', () => {
  let analyticsadmin: any;

  beforeAll(async () => {
    // Initialize real Google Auth
    const auth = new GoogleAuth({
      scopes: ['https://www.googleapis.com/auth/analytics.edit'],
    });

    analyticsadmin = google.analyticsadmin({
      version: 'v1beta',
      auth: auth as any,
    });
  });

  describe('Custom Dimensions', () => {
    it('should create a custom dimension', async () => {
      // Real API call
      const timestamp = Date.now();
      const result = await analyticsadmin.properties.customDimensions.create({
        parent: `properties/${TEST_PROPERTY_ID}`,
        requestBody: {
          parameterName: `test_param_${timestamp}`,
          displayName: `Test Dimension ${timestamp}`,
          scope: 'EVENT',
        },
      });

      expect(result.data).toHaveProperty('name');
      expect(result.data.parameterName).toBe(`test_param_${timestamp}`);
    }, 30000); // 30 second timeout
  });
});
```

### Test Categories

**1. CRUD Operations**:
- Create custom dimension
- List custom dimensions
- Get specific dimension
- (Delete not supported by GA4 API)

**2. Validation Tests**:
- Reject duplicate parameter names
- Reject invalid property IDs
- Reject invalid parameter name formats

**3. Error Scenarios**:
- Invalid property ID (404)
- Insufficient permissions (403)
- Duplicate dimensions (409)

**4. Pagination Tests**:
- Handle paginated list results
- Verify nextPageToken handling

### Running Integration Tests

```bash
# Set up credentials first
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json
export GA4_TEST_PROPERTY_ID=123456789

# Run integration tests only
npm run test:integration

# Run with verbose output
npm run test:integration -- --verbose
```

### Cleanup Strategy

**Important**: Custom dimensions **cannot be deleted** via API.

**Options**:
1. **Timestamped Names**: Use `test_param_${timestamp}` to avoid duplicates
2. **Manual Cleanup**: Periodically archive old test dimensions in GA4 UI
3. **Dedicated Test Property**: Use separate property for integration tests

---

## E2E Testing (Manual)

### Overview

**Purpose**: Validate full Claude Code integration
**Type**: Manual testing
**Frequency**: Before releases, after major changes

### Test Guide

**Documentation**: See `CLAUDE_CODE_INTEGRATION.md`

**Test Scenarios** (8 total):
1. ✅ List custom dimensions
2. ✅ Create custom dimension
3. ✅ Create conversion event
4. ✅ List conversion events
5. ❌ Error handling - Invalid property ID
6. ❌ Error handling - Duplicate dimension
7. 🤖 Natural language interaction
8. 📦 Batch operations

### E2E Test Checklist

Before each release:

- [ ] Server appears in Claude Code MCP list
- [ ] All 4 tools are discoverable
- [ ] create_custom_dimension works with real property
- [ ] create_conversion_event works with real property
- [ ] list operations return actual data
- [ ] Error messages are user-friendly
- [ ] Natural language requests work correctly
- [ ] Batch operations execute in order

---

## Test Coverage

### Current Status

**Unit Test Coverage**: 0% (Known Issue)

**Why 0%?**
- Tests mock the googleapis API
- Tests don't test actual MCP server request handlers
- Coverage tool doesn't see src/index.ts being executed

**What IS tested**:
- ✅ Mock API behavior (googleapis mocks work correctly)
- ✅ Input validation logic
- ✅ Error handling patterns
- ❌ MCP server initialization
- ❌ Tool request handlers
- ❌ Tool routing logic
- ❌ Response formatting

### Improving Coverage

**Phase 1: Refactor Unit Tests** (High Priority)

Current approach:
```typescript
// ❌ Testing mocks, not actual code
const mockCreate = mockAnalyticsAdminClient.properties.customDimensions.create;
const result = await mockCreate({...});
```

Better approach:
```typescript
// ✅ Test actual MCP server handlers
import { server } from '../src/index';

const response = await server.handleRequest({
  jsonrpc: '2.0',
  method: 'tools/call',
  params: {
    name: 'create_custom_dimension',
    arguments: {
      propertyId: '123456',
      parameterName: 'test_param',
      displayName: 'Test Dimension',
    },
  },
  id: 1,
});

expect(response.result.content[0].text).toContain('success');
```

**Phase 2: Add Edge Cases** (Medium Priority)
- Invalid property ID formats
- Missing required parameters
- Special characters in names
- Very long parameter names (>40 chars)
- All error code paths (404, 403, 409, 500)

**Phase 3: Integration Coverage** (Low Priority)
- Measure integration test coverage separately
- Ensure all API endpoints are tested
- Verify error handling with real API

### Coverage Commands

```bash
# Generate coverage report
npm run test:coverage

# View in browser (macOS)
open coverage/index.html

# View in browser (Linux)
xdg-open coverage/index.html

# View coverage summary in terminal
npm run test:coverage | grep "All files"
```

### Coverage Thresholds

**Configured in jest.config.js**:
```javascript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
}
```

**Current**: 0% / 80% (all metrics)
**Target**: 80%+ (all metrics)
**Timeline**: Phase 2 (short-term, 1-2 weeks)

---

## Test Data Management

### Mock Data

**Location**: `tests/mocks/googleapis.ts`

**Mock Dimension**:
```typescript
export const mockCustomDimension = {
  name: 'properties/123456/customDimensions/1',
  parameterName: 'test_param',
  displayName: 'Test Dimension',
  description: 'A test custom dimension',
  scope: 'EVENT',
  disallowAdsPersonalization: false,
};
```

**Mock Conversion Event**:
```typescript
export const mockConversionEvent = {
  name: 'properties/123456/conversionEvents/1',
  eventName: 'test_conversion',
  createTime: '2025-10-07T00:00:00Z',
  deletable: true,
  custom: true,
};
```

### Test Fixtures

**Location**: `tests/fixtures/test-data.ts`

**Use Case**: Shared test data across multiple test files

**Example**:
```typescript
export const validPropertyIds = [
  '123456789',
  'G-123456789',
  'properties/123456789',
];

export const invalidPropertyIds = [
  '',
  'invalid',
  'G-XXXXXXXXX',
];

export const validParameterNames = [
  'method',
  'session_id',
  'error_type',
  'step_number',
];

export const invalidParameterNames = [
  '1_invalid',           // Starts with number
  'invalid-dash',        // Contains dash
  'too_long_' + 'a'.repeat(40),  // Over 40 chars
];
```

---

## Continuous Integration

### CI/CD Pipeline (Future)

**GitHub Actions Workflow**:
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Type check
        run: npm run typecheck

      - name: Lint
        run: npm run lint

      - name: Run unit tests
        run: npm test

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage/coverage-final.json
```

**Integration Tests in CI**:
- Require secrets (service account key)
- Run on separate workflow or job
- Only on main branch or releases

---

## Debugging Tests

### Common Issues

**Tests Fail After Dependencies Update**:
```bash
# Clear Jest cache
npx jest --clearCache

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Run tests again
npm test
```

**Timeout Errors**:
```typescript
// Increase timeout for slow tests
it('should handle slow operation', async () => {
  // Test code
}, 30000); // 30 second timeout
```

**Mock Not Working**:
```bash
# Verify mock is imported before actual module
# Mock should be at top of test file
jest.mock('googleapis', () => ({...}));

// Import AFTER mock
import { google } from 'googleapis';
```

### Debug Mode

**Run specific test with debugging**:
```bash
# Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand tests/unit/tools.test.ts

# Then open chrome://inspect in Chrome
```

**VS Code Debug Configuration**:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand", "--no-cache", "${fileBasename}"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

---

## Best Practices

### DO:
- ✅ Write tests first (TDD)
- ✅ Test one thing per test
- ✅ Use descriptive test names
- ✅ Follow AAA pattern (Arrange, Act, Assert)
- ✅ Mock external dependencies
- ✅ Test error cases
- ✅ Clean up resources (even if test fails)

### DON'T:
- ❌ Test implementation details
- ❌ Have tests depend on each other
- ❌ Skip writing tests ("I'll add them later")
- ❌ Commit failing tests
- ❌ Leave commented-out tests
- ❌ Use real credentials in unit tests

---

## Test Metrics

### Current Metrics (v0.1.0)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Unit Tests | 15 | 20+ | 🟡 Good |
| Integration Tests | 11 | 10+ | 🟢 Excellent |
| E2E Scenarios | 8 | 8 | 🟢 Complete |
| Coverage | 0% | 80% | 🔴 Needs Work |
| Test Speed | ~5s | <10s | 🟢 Excellent |

### Success Criteria

**For v1.0 Release**:
- [ ] 80%+ code coverage
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] All E2E scenarios validated
- [ ] No skipped tests
- [ ] Test execution < 10 seconds (unit)
- [ ] Test execution < 5 minutes (integration)

---

**Last Updated**: 2025-10-08
**Version**: 0.1.0
