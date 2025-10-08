# Architecture

**Purpose**: Technical architecture documentation for GA4 Admin MCP Server
**Audience**: Claude Code and developers working on the project

---

## System Overview

The GA4 Admin MCP Server is a **Model Context Protocol (MCP) server** that provides write access to Google Analytics 4 Admin API through natural language interactions via Claude Code.

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Claude Code                          │
│  User: "Create custom dimension for signup_method"     │
└────────────────────┬────────────────────────────────────┘
                     │ MCP Protocol (stdio)
                     │ JSON-RPC Messages
                     ↓
┌─────────────────────────────────────────────────────────┐
│              GA4 Admin MCP Server                       │
│  ┌─────────────────────────────────────────────────┐   │
│  │  MCP Protocol Layer (@modelcontextprotocol/sdk) │   │
│  │  - Tool registration (ListToolsRequestSchema)   │   │
│  │  - Tool execution (CallToolRequestSchema)       │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌─────────────────┴──────────────────────────────┐   │
│  │           Tool Router (switch/case)            │   │
│  │  - create_custom_dimension                     │   │
│  │  - create_conversion_event                     │   │
│  │  - list_custom_dimensions                      │   │
│  │  - list_conversion_events                      │   │
│  └──────────────────┬──────────────────────────────┘   │
│                     │                                    │
│  ┌─────────────────┴──────────────────────────────┐   │
│  │      Authentication Layer (GoogleAuth)         │   │
│  │  - Service Account authentication              │   │
│  │  - Scope management                            │   │
│  │  - Token refresh                               │   │
│  └──────────────────┬──────────────────────────────┘   │
└───────────────────┬─┴──────────────────────────────────┘
                    │ HTTPS
                    │ googleapis v131.0.0
                    ↓
┌─────────────────────────────────────────────────────────┐
│         Google Analytics Admin API v1beta               │
│  - properties.customDimensions.*                        │
│  - properties.conversionEvents.*                        │
│  - properties.audiences.* (future)                      │
└─────────────────────────────────────────────────────────┘
```

---

## Core Components

### 1. MCP Server Layer

**File**: `src/index.ts` (lines 42-52)

**Responsibilities**:
- Initialize MCP server with metadata
- Register capabilities (tools)
- Handle stdio transport

**Implementation**:
```typescript
const server = new Server(
  {
    name: "ga4-admin-server",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);
```

**Key Points**:
- Server runs on stdio (stdin/stdout) - not HTTP
- Logs go to stderr to avoid interfering with MCP protocol
- Stateless - each request is independent

### 2. Tool Registration

**File**: `src/index.ts` (lines 55-137)

**Responsibilities**:
- Define available tools and their schemas
- Specify input parameters and types
- Provide tool descriptions

**Tool Definition Example**:
```typescript
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "create_custom_dimension",
        description: "Create a custom dimension in Google Analytics 4",
        inputSchema: {
          type: "object",
          properties: {
            propertyId: {
              type: "string",
              description: "GA4 Property ID (e.g., 'G-859X61KC45' or '123456789')",
            },
            parameterName: {
              type: "string",
              description: "Event parameter name (e.g., 'method', 'session_id')",
            },
            // ... more properties
          },
          required: ["propertyId", "parameterName", "displayName"],
        },
      },
      // ... more tools
    ],
  };
});
```

**Input Schema Validation**:
- MCP SDK validates inputs against schema before execution
- Required fields enforced automatically
- Type checking handled by protocol layer

### 3. Tool Router

**File**: `src/index.ts` (lines 140-317)

**Responsibilities**:
- Route tool calls to appropriate handlers
- Parse and validate arguments
- Execute GA4 Admin API operations
- Format responses in MCP-compliant format

**Routing Implementation**:
```typescript
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const authClient = await getAuthClient();
    google.options({ auth: authClient as any });

    switch (name) {
      case "create_custom_dimension":
        // Handle create dimension
        break;
      case "create_conversion_event":
        // Handle create event
        break;
      // ... more cases
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error: any) {
    // Error handling
  }
});
```

**Response Format**:
```typescript
// Success response
{
  content: [
    {
      type: "text",
      text: JSON.stringify({
        success: true,
        message: "✅ Created custom dimension: Signup Method",
        dimension: { /* GA4 response data */ }
      }, null, 2)
    }
  ]
}

// Error response
{
  content: [
    {
      type: "text",
      text: JSON.stringify({
        success: false,
        error: "Property not found",
        details: { /* error details */ }
      }, null, 2)
    }
  ],
  isError: true
}
```

### 4. Authentication Layer

**File**: `src/index.ts` (lines 31-39)

**Responsibilities**:
- Authenticate with Google Cloud using service account
- Manage OAuth2 tokens
- Refresh tokens as needed

**Implementation**:
```typescript
async function getAuthClient() {
  const auth = new GoogleAuth({
    scopes: [
      "https://www.googleapis.com/auth/analytics.edit",
      "https://www.googleapis.com/auth/analytics.readonly",
    ],
  });
  return await auth.getClient();
}
```

**Authentication Flow**:
1. Read `GOOGLE_APPLICATION_CREDENTIALS` environment variable
2. Load service account JSON key
3. Request OAuth2 token with specified scopes
4. Cache token for subsequent requests
5. Refresh token when expired (automatic)

**Required Scopes**:
- `analytics.edit` - Create/modify GA4 resources
- `analytics.readonly` - List GA4 resources

### 5. GA4 API Client

**File**: `src/index.ts` (line 11)

**Responsibilities**:
- Interface with Google Analytics Admin API
- Handle API requests/responses
- Manage API versions

**Implementation**:
```typescript
import { google } from "googleapis";

const analyticsadmin = google.analyticsadmin("v1beta");
```

**API Operations**:
```typescript
// Create custom dimension
await analyticsadmin.properties.customDimensions.create({
  parent: "properties/123456789",
  requestBody: {
    parameterName: "signup_method",
    displayName: "Signup Method",
    description: "How the user signed up",
    scope: "EVENT",
  },
});

// List custom dimensions
await analyticsadmin.properties.customDimensions.list({
  parent: "properties/123456789",
});
```

---

## Data Flow

### Creating a Custom Dimension

**Step-by-Step Flow**:

1. **User Interaction** (Claude Code)
   ```
   User: "Create a custom dimension for tracking signup method in GA4 property 123456789"
   ```

2. **MCP Protocol Message** (JSON-RPC over stdio)
   ```json
   {
     "jsonrpc": "2.0",
     "method": "tools/call",
     "params": {
       "name": "create_custom_dimension",
       "arguments": {
         "propertyId": "123456789",
         "parameterName": "signup_method",
         "displayName": "Signup Method",
         "description": "How the user signed up (email/google)",
         "scope": "EVENT"
       }
     },
     "id": 1
   }
   ```

3. **Server Processing** (src/index.ts)
   - Parse request parameters
   - Validate arguments against schema
   - Authenticate with Google Cloud
   - Normalize property ID format
   - Call GA4 Admin API

4. **GA4 Admin API Call** (HTTPS)
   ```http
   POST https://analyticsadmin.googleapis.com/v1beta/properties/123456789/customDimensions
   Authorization: Bearer <oauth2_token>
   Content-Type: application/json

   {
     "parameterName": "signup_method",
     "displayName": "Signup Method",
     "description": "How the user signed up (email/google)",
     "scope": "EVENT"
   }
   ```

5. **GA4 API Response**
   ```json
   {
     "name": "properties/123456789/customDimensions/1234",
     "parameterName": "signup_method",
     "displayName": "Signup Method",
     "description": "How the user signed up (email/google)",
     "scope": "EVENT",
     "disallowAdsPersonalization": false
   }
   ```

6. **MCP Response** (JSON-RPC over stdio)
   ```json
   {
     "jsonrpc": "2.0",
     "result": {
       "content": [
         {
           "type": "text",
           "text": "{\n  \"success\": true,\n  \"message\": \"✅ Created custom dimension: Signup Method\",\n  \"dimension\": {...}\n}"
         }
       ]
     },
     "id": 1
   }
   ```

7. **User Feedback** (Claude Code)
   ```
   Claude: "I've successfully created the custom dimension 'Signup Method' for tracking signup_method in your GA4 property 123456789. The dimension is now available for use in your reports."
   ```

---

## Design Patterns

### 1. Stateless Request Handling

**Pattern**: Each tool call is completely independent

**Benefits**:
- No state management complexity
- Safe for concurrent requests (future)
- Easy to test
- No memory leaks

**Implementation**:
```typescript
// Each request creates new auth client
const authClient = await getAuthClient();
google.options({ auth: authClient as any });

// Process request
// No state persisted between requests
```

### 2. Error Handling Strategy

**Pattern**: Catch all errors, format for MCP protocol

**Benefits**:
- Consistent error responses
- No server crashes
- Detailed error information for debugging

**Implementation**:
```typescript
try {
  // Execute tool logic
} catch (error: any) {
  return {
    content: [{
      type: "text",
      text: JSON.stringify({
        success: false,
        error: error.message,
        details: error.errors || error.response?.data,
      }, null, 2)
    }],
    isError: true,
  };
}
```

### 3. Property ID Normalization

**Pattern**: Accept multiple formats, normalize to canonical form

**Benefits**:
- User-friendly (accepts G-XXXXXXXXX or numeric)
- Consistent internal representation
- Reduces API errors

**Current Implementation**:
```typescript
const propertyPath = propertyId.startsWith("properties/")
  ? propertyId
  : `properties/${propertyId.replace("G-", "")}`;
```

**Future Improvement** (see Known Issues):
```typescript
function normalizePropertyId(propertyId: string): string {
  // Validate input
  if (!propertyId) throw new Error("Property ID required");

  // Handle full resource name
  if (propertyId.startsWith("properties/")) {
    return propertyId;
  }

  // Remove G- prefix
  const numericId = propertyId.replace(/^G-/, "");

  // Validate numeric format
  if (!/^\d+$/.test(numericId)) {
    throw new Error(`Invalid property ID: ${propertyId}`);
  }

  return `properties/${numericId}`;
}
```

---

## Scalability Considerations

### Current Limitations

1. **Sequential Processing**: Tools execute one at a time
2. **No Caching**: Every request hits GA4 API
3. **No Rate Limiting**: No protection against API rate limits
4. **No Retry Logic**: Single-shot requests only

### Future Enhancements

1. **Batch Operations**
   - Execute multiple operations in single tool call
   - Reduce total API calls
   - Atomic transactions (all or nothing)

2. **Response Caching**
   - Cache list operations (list_custom_dimensions)
   - TTL-based invalidation
   - Significant performance improvement for read operations

3. **Rate Limit Handling**
   - Exponential backoff for 429 errors
   - Queue requests during rate limit periods
   - Graceful degradation

4. **Parallel Execution**
   - Process multiple independent tool calls concurrently
   - Respect GA4 API rate limits
   - Improve batch operation performance

---

## Security Architecture

### Authentication Security

**Service Account Best Practices**:
- ✅ Use dedicated service account per environment
- ✅ Minimum required permissions (Editor on specific property)
- ✅ Rotate keys regularly (quarterly)
- ✅ Store keys outside project directory
- ✅ Never commit keys to version control

**Key Storage**:
```
~/.config/gcp/
├── ga4-admin-key.json          # Production key
├── ga4-admin-staging-key.json  # Staging key
└── ga4-admin-dev-key.json      # Development key
```

### Network Security

**HTTPS Only**:
- All GA4 API communication over HTTPS
- Certificate validation enabled
- No proxy support (security consideration)

**No External Listeners**:
- Server runs on stdio only
- No HTTP/TCP ports exposed
- Process-to-process communication via pipes

### Data Security

**No Persistent Storage**:
- No data written to disk
- No temporary files
- All data in memory only
- Automatic cleanup on process exit

**No Logging of Sensitive Data**:
- Credentials never logged
- API tokens never logged
- Only error messages to stderr

---

## Testing Architecture

### Test Pyramid

```
       ┌─────────────┐
       │ Integration │  11 tests (real GA4 API)
       │   Tests     │  Requires credentials
       └─────────────┘  Slow (~30s per test)
            ▲
            │
       ┌────┴─────────────┐
       │    Unit Tests    │  15 tests (mocked APIs)
       │                  │  Fast (~5s total)
       └──────────────────┘  No credentials needed
```

### Mock Strategy

**Unit Tests**: Mock `googleapis` library
```typescript
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

**Integration Tests**: Real API calls
```typescript
// Use actual googleapis library
import { google } from 'googleapis';

// Authenticate with real service account
const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/analytics.edit'],
});
```

### Coverage Strategy

**Current**: 0% (known issue - tests don't cover MCP handlers)

**Target**: 80% coverage on all metrics

**Plan**:
1. Refactor unit tests to instantiate MCP server
2. Test request handlers directly
3. Add edge case tests
4. Test error handling paths

---

## Future Architecture

### Phase 2 Features

**Audience Management**:
```typescript
// New tools
- create_audience
- list_audiences
- update_audience
- delete_audience

// New API endpoints
analyticsadmin.properties.audiences.*
```

**Batch Operations**:
```typescript
// Single tool call, multiple operations
{
  name: "batch_create_dimensions",
  arguments: {
    propertyId: "123456789",
    dimensions: [
      { parameterName: "method", displayName: "Signup Method" },
      { parameterName: "tier", displayName: "User Tier" },
      // ... more
    ]
  }
}
```

**Configuration Management**:
```typescript
// Import/export configurations
- export_property_config
- import_property_config

// JSON format for version control
{
  "customDimensions": [...],
  "conversionEvents": [...],
  "audiences": [...]
}
```

---

## Appendix: Technology Stack

### Core Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| @modelcontextprotocol/sdk | ^0.5.0 | MCP protocol implementation |
| googleapis | ^131.0.0 | Google APIs client library |
| google-auth-library | ^9.0.0 | Authentication with Google Cloud |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ^5.0.0 | TypeScript compiler |
| jest | ^29.5.0 | Testing framework |
| ts-jest | ^29.1.0 | Jest TypeScript integration |
| eslint | ^8.0.0 | Linting |
| prettier | ^3.0.0 | Code formatting |

### Runtime Requirements

- **Node.js**: 18.0.0 or higher
- **Platform**: macOS, Linux, Windows (with WSL)
- **Memory**: ~50MB typical usage
- **CPU**: Minimal (IO-bound operations)

---

**Last Updated**: 2025-10-08
**Version**: 0.1.0
