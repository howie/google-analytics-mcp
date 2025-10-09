# Google Analytics 4 Admin MCP Server

> 🤖 30 秒內用 Claude Code 自動化完成 GA4 管理設定

[![CI](https://github.com/howie/google-analytics-mcp/actions/workflows/ci.yml/badge.svg)](https://github.com/howie/google-analytics-mcp/actions/workflows/ci.yml)
[![Release](https://github.com/howie/google-analytics-mcp/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/howie/google-analytics-mcp/actions/workflows/npm-publish.yml)
[![npm version](https://img.shields.io/npm/v/%40coachly%2Fga4-admin-mcp.svg)](https://www.npmjs.com/package/@coachly/ga4-admin-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub stars](https://img.shields.io/github/stars/howie/google-analytics-mcp.svg?style=social&label=Stars)](https://github.com/howie/google-analytics-mcp/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/howie/google-analytics-mcp.svg?style=social&label=Forks)](https://github.com/howie/google-analytics-mcp/network/members)

➡️ [English README](./README.md)

**一個讓 Claude Code 能夠透過自然語言操作 GA4 Admin API 的 MCP (Model Context Protocol) 伺服器。**

## 為什麼需要這個專案？

官方的 Google Analytics MCP (`googleanalytics/google-analytics-mcp`) 目前只支援**讀取**功能。

這個專案提供 **GA4 寫入操作**：

- ✅ 建立自訂維度 (Custom Dimensions)
- ✅ 標記轉換事件 (Conversion Events)
- ✅ 列出並管理 GA4 設定
- 🔄 建立受眾 (即將推出)
- 🔄 管理 Property 設定 (即將推出)

**花費時間比較**

- 人工操作：15 分鐘
- Python 腳本：2 分鐘
- **本 MCP 伺服器**：30 秒 ⚡

## 📚 完整設定教學

**👉 [完整安裝教學](./docs/tutorial/SETUP_TUTORIAL.md) - 詳細步驟一次看懂**

內容包含：

- ✅ 建立 Google Cloud 服務帳號
- ✅ 啟用 Analytics Admin API
- ✅ 開放 GA4 Property 權限
- ✅ 安裝並設定 MCP 伺服器
- ✅ 測試你的環境
- ✅ 使用範例與最佳實務

## 快速開始

### 安裝

```bash
git clone https://github.com/howie/google-analytics-mcp.git
cd google-analytics-mcp
npm install
npm run build
```

### 設定

1. 建立服務帳號並下載 JSON 金鑰（[詳細說明](./docs/tutorial/SETUP_TUTORIAL.md#step-1-create-google-cloud-service-account)）
2. 在 GA4 Property 中給予服務帳號 Editor 權限（[詳細說明](./docs/tutorial/SETUP_TUTORIAL.md#step-2-grant-ga4-property-access)）
3. 設定 Claude Code：

在 `~/.claude/settings.json` 中加入：

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

4. 重新啟動 Claude Code

### 在 Claude Code 中使用

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

在 Claude Code 中輸入：

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

- [x] 建立自訂維度
- [x] 標記轉換事件
- [x] 列出自訂維度
- [x] 列出轉換事件
- [ ] 建立受眾
- [ ] 更新 Property 設定
- [ ] 刪除自訂維度
- [ ] 批次操作

## 開發

```bash
# 開發模式
npm run dev

# 測試
npm test

# Build
npm run build
```

## CI/CD

- 每次對 `main` 的 push 或任何 Pull Request 會觸發 [CI workflow](./.github/workflows/ci.yml)，自動執行 Lint、TypeScript 型別檢查、編譯與單元測試。
- 發佈新版本時，在 `main` 上建立 `v*` 標籤或透過手動觸發會啟動 [Release workflow](./.github/workflows/npm-publish.yml)，在發佈到 npm 之前重新驗證並建置套件。請先在 GitHub 專案的 secrets 中設定 `NPM_TOKEN`。

## 授權

MIT
