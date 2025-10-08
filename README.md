# Google Analytics 4 Admin MCP Server

> 🤖 Automate Google Analytics 4 configuration with Claude Code in 30 seconds

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-0.5.0-green.svg)](https://modelcontextprotocol.io/)

**An MCP (Model Context Protocol) server that enables Claude Code to perform Google Analytics 4 Admin API operations through natural language.**

## Why This Project?

The official Google Analytics MCP (`googleanalytics/google-analytics-mcp`) only provides **read-only** functionality.

This custom MCP server provides **write operations** for GA4 Admin API:

- ✅ Create custom dimensions
- ✅ Mark conversion events
- ✅ List and manage GA4 configuration
- 🔄 Create audiences (coming soon)
- 🔄 Manage property settings (coming soon)

**Time Comparison:**

- Manual setup: 15 minutes
- Python script: 2 minutes
- **This MCP Server: 30 seconds** ⚡

## 快速開始

### 安裝

```bash
cd mcp-servers/ga4-admin
npm install
npm run build
```

### 設定

1. 建立 service account 並下載 JSON key
2. 在 GA4 中給予 service account Editor 權限
3. 設定環境變數:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account-key.json
```

### 在 Claude Code 中使用

在 `~/.claude/settings.json` 加入:

```json
{
  "mcpServers": {
    "ga4-admin": {
      "command": "node",
      "args": ["/path/to/coaching_transcript_tool/mcp-servers/ga4-admin/dist/index.js"],
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/path/to/service-account-key.json"
      }
    }
  }
}
```

## 可用工具

### 1. create_custom_dimension

```typescript
{
  propertyId: "G-859X61KC45",
  parameterName: "method",
  displayName: "登入方式",
  description: "使用者的登入/註冊方式",
  scope: "EVENT"
}
```

### 2. create_conversion_event

```typescript
{
  propertyId: "G-859X61KC45",
  eventName: "user_signup_complete"
}
```

### 3. list_custom_dimensions

```typescript
{
  propertyId: "G-859X61KC45"
}
```

### 4. list_conversion_events

```typescript
{
  propertyId: "G-859X61KC45"
}
```

## 範例使用

在 Claude Code 中:

```text
幫我在 GA4 (G-859X61KC45) 建立以下自訂維度：
1. method - 登入方式
2. session_id - Session ID
3. error_type - 錯誤類型
4. step - 快速開始步驟
```

Claude 會自動使用 MCP 工具完成設定。

## 與其他方案比較

| 方案 | 前置時間 | 執行時間 | 總時間 | 可重複 | 整合度 |
|-----|---------|---------|--------|--------|--------|
| 手動設定 | 0 | 15 分鐘 | **15 分鐘** | ❌ 低 | - |
| Python 腳本 | 5 分鐘 | 2 分鐘 | **7 分鐘** | ✅ 高 | ⭐⭐ |
| **MCP Server** | 6 分鐘 | **30 秒** | **6.5 分鐘** | ✅✅ 極高 | ⭐⭐⭐⭐⭐ |

**MCP Server 優勢**:

- ⚡ 執行最快（30 秒）
- 🔄 完全可重複
- 🤖 自然語言操作
- 📝 與 Claude Code 完美整合
- 🔧 可擴展（未來可加更多功能）

## 技術架構

```text
Claude Code
    ↓ (MCP Protocol)
GA4 Admin MCP Server
    ↓ (Google Analytics Admin API)
Google Analytics 4
```

## 待實作功能

- [ ] Create custom dimensions ✅
- [ ] Mark conversion events ✅
- [ ] List custom dimensions ✅
- [ ] List conversion events ✅
- [ ] Create audiences
- [ ] Update property settings
- [ ] Delete custom dimensions
- [ ] Batch operations

## 開發

```bash
# 開發模式
npm run dev

# 測試
npm test

# Build
npm run build
```

## 授權

MIT
