# Google Analytics 4 Admin MCP Server

> 🤖 Automate Google Analytics 4 configuration with Claude Code in just 30 seconds

[![CI](https://github.com/howie/google-analytics-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/howie/google-analytics-mcp/actions/workflows/ci.yml)
[![Release](https://github.com/howie/google-analytics-mcp/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/howie/google-analytics-mcp/actions/workflows/npm-publish.yml)
[![npm version](https://img.shields.io/npm/v/%40coachly%2Fga4-admin-mcp.svg)](https://www.npmjs.com/package/@coachly/ga4-admin-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/howie/google-analytics-mcp.svg?style=social&label=Stars)](https://github.com/howie/google-analytics-mcp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/howie/google-analytics-mcp.svg?style=social&label=Forks)](https://github.com/howie/google-analytics-mcp/network/members)

➡️ [繁體中文 README](./README.zh-TW.md)

**An MCP (Model Context Protocol) server that lets Claude Code execute Google Analytics 4 Admin API tasks via natural language.**

## Why build a custom GA4 MCP server?

The official Google Analytics MCP (`googleanalytics/google-analytics-mcp`) currently exposes **read-only** operations. This project focuses on **write** features that marketing and analytics teams need every day:

- ✅ Create custom dimensions
- ✅ Mark events as conversions
- ✅ Inspect and manage GA4 configuration
- 🔄 Create audiences *(coming soon)*
- 🔄 Update property settings *(coming soon)*

**Time comparison**

- Manual configuration: 15 minutes
- Python scripting: 2 minutes
- **This MCP server**: 30 seconds ⚡

## 📚 Complete setup guide

**👉 [Step-by-step tutorial](./docs/tutorial/SETUP_TUTORIAL.md)**

The guide covers:
- Creating a Google Cloud service account
- Enabling the Analytics Admin API
- Granting GA4 property access
- Installing and configuring the MCP server
- Validating your setup
- Usage examples and best practices

## Quick start

### Installation

```bash
git clone https://github.com/howie/google-analytics-mcp.git
cd google-analytics-mcp
npm install
npm run build
```

### Configuration

1. Create a service account and download the JSON key ([details](./docs/tutorial/SETUP_TUTORIAL.md#step-1-create-google-cloud-service-account))
2. Grant the service account **Editor** access in your GA4 property ([details](./docs/tutorial/SETUP_TUTORIAL.md#step-2-grant-ga4-property-access))
3. Point Claude Code to the compiled MCP server by adding the following to `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "ga4-admin": {
      "command": "node",
      "args": ["/path/to/google-analytics-mcp/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account-key.json"
      }
    }
  }
}
```

4. Restart Claude Code to load the server.

### Using the tools in Claude Code

Once the server is active, describe what you want to change in GA4. Claude will call the right MCP tool automatically. For example:

```text
Create a conversion event named "user_signup_complete" in GA4 property G-859X61KC45.
```

## Available tools

### 1. `create_custom_dimension`

```typescript
{
  propertyId: "G-859X61KC45",
  parameterName: "method",
  displayName: "Sign-in Method",
  description: "Describes how the user signed in or registered",
  scope: "EVENT"
}
```

### 2. `create_conversion_event`

```typescript
{
  propertyId: "G-859X61KC45",
  eventName: "user_signup_complete"
}
```

### 3. `list_custom_dimensions`

```typescript
{
  propertyId: "G-859X61KC45";
  pageSize?: number;
  pageToken?: string;
}
```

Use `pageToken` from a previous response to continue pagination when a property has many custom dimensions.

### 4. `list_conversion_events`

```typescript
{
  propertyId: "G-859X61KC45";
  pageSize?: number;
  pageToken?: string;
}
```

Set `pageSize` to control batch size and pass `pageToken` to fetch subsequent pages.

## Example prompt

```text
In GA4 property G-859X61KC45 create these custom dimensions:
1. method - sign-in method
2. session_id - session identifier
3. error_type - reported error type
4. step - onboarding step
```

Claude will orchestrate the necessary MCP calls to complete the setup.

## How does it compare?

| Approach          | Prep time | Execution time | Total time | Repeatable | Integration |
|-------------------|-----------|----------------|------------|------------|-------------|
| Manual setup      | 0         | 15 min         | **15 min** | ❌ Low     | –           |
| Python script     | 5 min     | 2 min          | **7 min**  | ✅ High    | ⭐⭐         |
| **MCP server**    | 6 min     | **30 sec**     | **6.5 min**| ✅✅ Very high | ⭐⭐⭐⭐⭐  |

**Why the MCP approach wins**

- ⚡ Fastest turnaround (seconds instead of minutes)
- 🔄 Fully repeatable for different properties
- 🤖 Natural-language friendly
- 📝 Seamless Claude Code integration
- 🔧 Designed for future expansion

## Known limitations

- `resolvePropertyId` currently inspects only the first page of account summaries and data streams (max ~50 of each). For organizations with larger inventories, supply the numeric property ID (e.g. `123456789`) instead of a measurement ID to avoid lookup failures.

## Architecture

```text
Claude Code
    ↓ (MCP Protocol)
GA4 Admin MCP Server
    ↓ (Google Analytics Admin API)
Google Analytics 4
```

## Roadmap

- [x] Create custom dimensions
- [x] Create conversion events
- [x] List custom dimensions
- [x] List conversion events
- [ ] Create audiences
- [ ] Update property settings
- [ ] Delete custom dimensions
- [ ] Batch operations

## Development

```bash
# Type-check and build
npm run build

# Run tests
npm test

# Developer mode (watch build)
npm run dev
```

## CI/CD

- Pushing to `main` or opening a pull request triggers the [CI workflow](./.github/workflows/ci.yml) to lint, type-check, build, and run tests.
- Releasing a new version is as simple as pushing a `v*` tag (or triggering the workflow manually). The [Release workflow](./.github/workflows/npm-publish.yml) rebuilds the package and publishes to npm. Make sure an `NPM_TOKEN` secret with publish rights is configured.

## License

MIT
