# GA4 Admin MCP Server

> ⚠️ **Work in Progress** - Custom MCP server for Google Analytics 4 Admin operations

## 為什麼需要這個？

官方 Google Analytics MCP (`googleanalytics/google-analytics-mcp`) 只提供**讀取**功能。

這個自訂 MCP server 提供 GA4 **Admin API** 的寫入功能：
- ✅ 建立 custom dimensions
- ✅ 標記 conversion events
- ✅ 建立 audiences (未來)
- ✅ 管理 property settings (未來)

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

```
幫我在 GA4 (G-859X61KC45) 建立以下自訂維度：
1. method - 登入方式
2. session_id - Session ID
3. error_type - 錯誤類型
4. step - 快速開始步驟
```

Claude 會自動使用 MCP 工具完成設定。

## 與其他方案比較

| 方案 | 設定時間 | 可重複性 | 整合度 |
|-----|---------|----------|--------|
| 手動設定 | 15 分鐘 | ❌ 低 | - |
| Python 腳本 | 2 分鐘 | ✅ 高 | ⭐⭐ |
| **MCP Server** | 30 秒 | ✅✅ 極高 | ⭐⭐⭐⭐⭐ |

## 技術架構

```
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
