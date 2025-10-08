# Testing Guide

> Comprehensive testing strategy for GA4 Admin MCP Server

## 📋 Test Structure

```
tests/
├── unit/               # Unit tests (mocked APIs)
│   └── tools.test.ts   # Tool implementation tests
├── integration/        # Integration tests (real APIs)
│   └── ga4-api.test.ts # Real GA4 API calls
├── mocks/              # Mock implementations
│   └── googleapis.ts   # Mocked Google APIs
├── fixtures/           # Test data
│   └── test-data.ts    # Common test fixtures
├── setup.ts            # Test environment setup
└── README.md           # This file
```

## 🚀 Running Tests

### All Tests
```bash
npm test
```

### Watch Mode (Development)
```bash
npm run test:watch
```

### With Coverage Report
```bash
npm run test:coverage
```

### Unit Tests Only
```bash
npm test -- tests/unit
```

### Integration Tests Only
```bash
npm run test:integration
```

**Note**: Integration tests require real GA4 credentials.

## 🔧 Test Setup

### Unit Tests

Unit tests use mocked APIs and don't require credentials:

```bash
# Just run the tests
npm test -- tests/unit
```

**What's tested**:
- Tool input/output correctness
- Error handling
- Input validation
- Edge cases

### Integration Tests

Integration tests make real API calls and require setup:

#### 1. Create Test GA4 Property

1. Visit [Google Analytics](https://analytics.google.com/)
2. Create a new property: "GA4 Admin MCP Test"
3. Note the Property ID (e.g., `G-XXXXXXXXXX`)

#### 2. Create Service Account

```bash
# In Google Cloud Console
gcloud iam service-accounts create ga4-mcp-test \
  --display-name="GA4 Admin MCP Test"

# Create JSON key
gcloud iam service-accounts keys create ~/ga4-mcp-test-key.json \
  --iam-account=ga4-mcp-test@PROJECT_ID.iam.gserviceaccount.com
```

#### 3. Grant Permissions

In GA4:
- Admin → Property Access Management
- Add user: `ga4-mcp-test@PROJECT_ID.iam.gserviceaccount.com`
- Role: **Editor**

#### 4. Set Environment Variables

```bash
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/ga4-mcp-test-key.json"
export GA4_TEST_PROPERTY_ID="G-XXXXXXXXXX"
```

Or create `.env.test` file:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/ga4-mcp-test-key.json
GA4_TEST_PROPERTY_ID=G-XXXXXXXXXX
```

#### 5. Run Integration Tests

```bash
npm run test:integration
```

**What's tested**:
- Real API authentication
- Actual dimension/event creation
- API error responses
- Pagination handling

## 📊 Coverage Goals

| Component | Target | Current |
|-----------|--------|---------|
| Tools | >80% | 0% |
| Error Handling | >80% | 0% |
| Validation | >90% | 0% |
| **Overall** | **>80%** | **0%** |

View coverage report:
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## ✅ Test Checklist

### Before Committing
- [ ] All unit tests pass
- [ ] Code coverage >80%
- [ ] No TypeScript errors
- [ ] Linting passes

### Before Release
- [ ] All tests pass (unit + integration)
- [ ] Integration tests with real GA4
- [ ] Edge cases covered
- [ ] Error scenarios tested

## 🐛 Common Issues

### "Cannot find module"
```bash
npm install
npm run build
```

### "Property not found" (Integration)
```bash
# Check credentials
echo $GOOGLE_APPLICATION_CREDENTIALS
echo $GA4_TEST_PROPERTY_ID

# Verify service account has access in GA4
```

### "Permission denied" (Integration)
```bash
# Service account needs Editor role in GA4
# Check GA4 Admin → Property Access Management
```

### Tests timeout
```bash
# Increase timeout in jest.config.js
# Or in individual test files:
jest.setTimeout(30000); // 30 seconds
```

## 📝 Writing New Tests

### Unit Test Template

```typescript
describe('my_new_tool', () => {
  beforeEach(() => {
    resetAllMocks();
  });

  it('should handle valid input', async () => {
    // Arrange
    const mockFunction = mockAnalyticsAdminClient.properties.myResource.action;

    // Act
    const result = await mockFunction({ /* args */ });

    // Assert
    expect(mockFunction).toHaveBeenCalledWith(/* expected args */);
    expect(result.data).toMatchObject(/* expected result */);
  });

  it('should handle errors', async () => {
    // Arrange
    mockFunction.mockRejectedValueOnce({ code: 404 });

    // Act & Assert
    await expect(mockFunction({ /* args */ })).rejects.toThrow();
  });
});
```

### Integration Test Template

```typescript
it('should create resource in real GA4', async () => {
  const result = await analyticsadmin.properties.resource.create({
    parent: `properties/${TEST_PROPERTY_ID}`,
    requestBody: { /* data */ }
  });

  expect(result.data).toHaveProperty('name');
  expect(result.data).toMatchObject(/* expected */ );
}, 30000); // 30 second timeout
```

## 🔍 Debugging Tests

### Run Single Test File
```bash
npm test -- tests/unit/tools.test.ts
```

### Run Single Test Case
```bash
npm test -- --testNamePattern="should create a custom dimension"
```

### Verbose Output
```bash
npm test -- --verbose
```

### Debug with Node Inspector
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 📚 Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [ts-jest Documentation](https://kulshekhar.github.io/ts-jest/)
- [Google Analytics Admin API](https://developers.google.com/analytics/devguides/config/admin/v1)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)

## 🎯 Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Run unit tests: `npm test -- tests/unit`
3. ⏳ Set up integration test environment
4. ⏳ Run integration tests: `npm run test:integration`
5. ⏳ Achieve >80% coverage
6. ⏳ Add more test cases

---

**Maintained by**: Coachly Team
**Last Updated**: 2025-10-07
