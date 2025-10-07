# GA4 Admin MCP Server - 功能規劃

> 🤖 使用 MCP (Model Context Protocol) 自動化 Google Analytics 4 設定

## 專案概述

### 目標
提供一個 MCP server，讓 Claude Code 能夠直接操作 Google Analytics 4 的 Admin API，實現：
- 30 秒完成 GA4 設定（vs. 15 分鐘手動操作）
- 自然語言操作（vs. 點擊 UI）
- 完全可重複（vs. 手動易出錯）
- 與開發流程整合（vs. 獨立操作）

### 背景
在實作 onboarding event tracking (v2.27.0) 後，需要在 GA4 中設定：
- 4 個自訂維度
- 4 個轉換事件
- 多個自訂報表和漏斗

手動設定耗時且容易出錯，且團隊協作時難以同步設定。

---

## 一、功能規格

### 1.1 核心功能

#### ✅ Phase 1: 基礎操作 (MVP)

**1.1.1 建立自訂維度**
```typescript
Tool: create_custom_dimension
Input: {
  propertyId: string      // GA4 Property ID (e.g., 'G-859X61KC45')
  parameterName: string   // Event parameter name
  displayName: string     // Display name in GA4 UI
  description?: string    // Optional description
  scope?: 'EVENT' | 'USER' | 'ITEM'  // Default: EVENT
}
Output: {
  success: boolean
  message: string
  dimension: CustomDimension
}
```

**1.1.2 標記轉換事件**
```typescript
Tool: create_conversion_event
Input: {
  propertyId: string
  eventName: string      // e.g., 'user_signup_complete'
}
Output: {
  success: boolean
  message: string
  event: ConversionEvent
}
```

**1.1.3 列出自訂維度**
```typescript
Tool: list_custom_dimensions
Input: {
  propertyId: string
}
Output: {
  success: boolean
  count: number
  dimensions: CustomDimension[]
}
```

**1.1.4 列出轉換事件**
```typescript
Tool: list_conversion_events
Input: {
  propertyId: string
}
Output: {
  success: boolean
  count: number
  events: ConversionEvent[]
}
```

#### 🔄 Phase 2: 進階功能 (Future)

**1.2.1 受眾管理**
- 建立受眾（基於事件和條件）
- 列出受眾
- 更新受眾

**1.2.2 資料串流管理**
- 建立資料串流
- 管理增強型評估設定

**1.2.3 批次操作**
- 批次建立維度
- 批次標記轉換
- 從設定檔匯入/匯出

---

## 二、技術架構

### 2.1 系統架構

```
┌─────────────────────────────────────────────────────┐
│                  Claude Code                        │
│  (User: "請幫我設定 GA4 custom dimensions")          │
└─────────────────┬───────────────────────────────────┘
                  │ MCP Protocol
                  ↓
┌─────────────────────────────────────────────────────┐
│            GA4 Admin MCP Server                     │
│  - Tool routing                                     │
│  - Parameter validation                             │
│  - Error handling                                   │
└─────────────────┬───────────────────────────────────┘
                  │ Google Auth
                  ↓
┌─────────────────────────────────────────────────────┐
│        Google Analytics Admin API v1beta            │
│  - properties.customDimensions.*                    │
│  - properties.conversionEvents.*                    │
│  - properties.audiences.* (future)                  │
└─────────────────────────────────────────────────────┘
```

### 2.2 技術棧

**Runtime**:
- Node.js 18+
- TypeScript 5+

**主要依賴**:
```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "googleapis": "^131.0.0",
  "google-auth-library": "^9.0.0"
}
```

**認證**:
- Service Account (推薦)
- OAuth 2.0 (可選)
- Scope: `https://www.googleapis.com/auth/analytics.edit`

### 2.3 檔案結構

```
mcp-servers/ga4-admin/
├── src/
│   ├── index.ts           # MCP server entry point
│   ├── tools/             # Tool implementations
│   │   ├── dimensions.ts  # Custom dimension tools
│   │   ├── events.ts      # Conversion event tools
│   │   └── common.ts      # Shared utilities
│   ├── auth/
│   │   └── client.ts      # Google auth setup
│   └── types/
│       └── ga4.ts         # TypeScript types
├── package.json
├── tsconfig.json
├── README.md              # User documentation
└── QUICK_START.md         # Setup guide
```

---

## 三、實作計畫

### 3.1 Phase 1: MVP (已完成)

#### Day 1: 基礎設定 ✅
- [x] 建立專案結構
- [x] 設定 TypeScript
- [x] 安裝依賴
- [x] 實作認證

#### Day 2: 核心功能 ✅
- [x] 實作 create_custom_dimension
- [x] 實作 create_conversion_event
- [x] 實作 list_custom_dimensions
- [x] 實作 list_conversion_events

#### Day 3: 測試與文件 ⏳
- [ ] 單元測試
- [ ] 整合測試
- [ ] 撰寫使用文件
- [ ] 範例腳本

### 3.2 Phase 2: 進階功能 (Future)

#### Week 2: 受眾管理
- [ ] 建立受眾工具
- [ ] 受眾條件設定
- [ ] 受眾列表與更新

#### Week 3: 批次操作
- [ ] 批次建立維度
- [ ] 設定檔匯入/匯出
- [ ] 錯誤復原機制

#### Week 4: 優化與整合
- [ ] 效能優化
- [ ] 錯誤處理改進
- [ ] CI/CD 整合

---

## 四、使用情境

### 4.1 基本設定

**情境**: 新專案需要設定 GA4

**手動流程** (15 分鐘):
1. 登入 GA4 Console
2. 逐一建立 4 個自訂維度
3. 逐一標記 4 個轉換事件
4. 手動檢查設定

**使用 MCP** (30 秒):
```
Claude，請幫我設定 GA4 (G-859X61KC45)：

自訂維度：
- method (登入方式)
- session_id (Session ID)
- error_type (錯誤類型)
- step (快速開始步驟)

轉換事件：
- user_signup_complete
- session_create_complete
- audio_upload_complete
- transcript_view
```

**結果**: Claude 自動完成所有設定並回報結果

### 4.2 多環境同步

**情境**: 需要在 staging 和 production 同步設定

**手動流程** (30 分鐘):
1. 在 staging 重複所有設定
2. 在 production 重複所有設定
3. 檢查兩邊一致性

**使用 MCP** (1 分鐘):
```
Claude，請在以下兩個 property 建立相同的 GA4 設定：
- Staging: G-XXXXXXXXXX
- Production: G-859X61KC45

參考 docs/features/onboarding-improvement/README.md Phase 2.4
```

### 4.3 設定驗證

**情境**: 檢查當前 GA4 設定

**手動流程** (5 分鐘):
1. 登入 GA4
2. 點擊查看各項設定
3. 手動比對文件

**使用 MCP** (10 秒):
```
Claude，列出 GA4 (G-859X61KC45) 的所有自訂維度和轉換事件
```

---

## 五、與其他方案比較

### 5.1 功能比較

| 功能 | 手動 | Python 腳本 | **MCP Server** | 官方 GA MCP |
|-----|------|------------|----------------|-------------|
| 建立維度 | ✅ | ✅ | ✅ | ❌ |
| 標記轉換 | ✅ | ✅ | ✅ | ❌ |
| 列出設定 | ✅ | ✅ | ✅ | ✅ |
| 自然語言操作 | ❌ | ❌ | ✅ | ❌ |
| Claude Code 整合 | ❌ | ⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| 可重複性 | ❌ | ✅ | ✅ | ✅ |
| 批次操作 | ❌ | ✅ | 🔄 | ❌ |

### 5.2 時間比較

| 方案 | 前置設定 | 單次執行 | 總時間 (首次) | 再次執行 |
|-----|---------|---------|-------------|---------|
| 手動 | 0 | 15 分鐘 | **15 分鐘** | 15 分鐘 |
| Python 腳本 | 5 分鐘 | 2 分鐘 | **7 分鐘** | 2 分鐘 |
| **MCP Server** | 6 分鐘 | 30 秒 | **6.5 分鐘** | **30 秒** |

### 5.3 適用場景

**手動設定** ✅:
- 一次性設定
- 不熟悉命令列
- 不需要重複

**Python 腳本** ✅:
- CI/CD 整合
- 批次處理
- 無需 Claude Code

**MCP Server** ⭐⭐⭐⭐⭐:
- 團隊協作
- 多環境管理
- 經常需要調整
- 使用 Claude Code
- 需要自然語言操作

---

## 六、安全考量

### 6.1 認證管理

**Service Account**:
- ✅ 推薦用於自動化
- ✅ 權限控制精確
- ⚠️ JSON key 需妥善保管

**最佳實踐**:
```bash
# 1. 使用獨立 service account
ga4-admin-mcp@PROJECT.iam.gserviceaccount.com

# 2. 最小權限原則
# 只給予 Analytics Admin Editor on specific property

# 3. Key 檔案位置
~/.config/gcp/ga4-admin-key.json  # 不要放在專案目錄

# 4. 環境變數
export GOOGLE_APPLICATION_CREDENTIALS=~/.config/gcp/ga4-admin-key.json
```

### 6.2 權限設定

**GA4 Property Level**:
- Service account 需要 **Editor** 權限
- 可限制只能操作特定 properties

**GCP Project Level**:
- 需要啟用 Analytics Admin API
- Service account 不需要 GCP 專案權限

### 6.3 審計日誌

所有操作會記錄在：
- GA4 Admin → Change History
- GCP → Audit Logs (如果啟用)

---

## 七、測試計畫

### 7.1 單元測試

```typescript
// tests/tools/dimensions.test.ts
describe('create_custom_dimension', () => {
  test('creates dimension successfully', async () => {
    // Mock Google API
    // Test tool execution
  });

  test('handles duplicate dimension error', async () => {
    // Test error handling
  });
});
```

### 7.2 整合測試

```bash
# 使用測試 property
export GA4_TEST_PROPERTY=G-TESTXXXXXX
npm test:integration
```

### 7.3 E2E 測試

手動測試清單：
- [ ] 在 Claude Code 中安裝 MCP
- [ ] 使用自然語言建立維度
- [ ] 驗證 GA4 Console 有設定
- [ ] 使用自然語言列出設定
- [ ] 驗證輸出正確

---

## 八、維護計畫

### 8.1 版本管理

**Semantic Versioning**:
- `0.1.x` - MVP (基礎 CRUD 功能)
- `0.2.x` - 受眾管理
- `0.3.x` - 批次操作
- `1.0.0` - Production ready

### 8.2 更新策略

**依賴更新**:
- 每月檢查 `googleapis` 更新
- 跟隨 MCP SDK 版本

**API 變更**:
- Google Analytics Admin API 仍在 beta
- 需要關注 breaking changes

### 8.3 文件維護

- README.md - 使用說明
- QUICK_START.md - 快速開始
- CHANGELOG.md - 版本記錄
- API.md - API 文件 (future)

---

## 九、成功指標

### 9.1 量化指標

- **設定時間**: < 1 分鐘 (vs. 15 分鐘手動)
- **錯誤率**: < 1% (vs. 10%+ 手動)
- **採用率**: 80%+ 團隊成員使用
- **滿意度**: 4.5+ / 5.0

### 9.2 質化指標

- ✅ 團隊成員能獨立完成 GA4 設定
- ✅ 多環境設定保持一致
- ✅ 新人 onboarding 時間減少
- ✅ 減少設定相關的 tickets

---

## 十、相關資源

### 10.1 文件

- [MCP 快速開始](../../mcp-servers/ga4-admin/QUICK_START.md)
- [MCP README](../../mcp-servers/ga4-admin/README.md)
- [Python 腳本指南](../onboarding-improvement/GA4_API_SETUP.md)
- [手動設定指南](../onboarding-improvement/GA4_QUICK_START.md)

### 10.2 API 文件

- [Google Analytics Admin API](https://developers.google.com/analytics/devguides/config/admin/v1)
- [MCP Protocol Specification](https://modelcontextprotocol.io/docs)
- [Google Auth Library](https://github.com/googleapis/google-auth-library-nodejs)

### 10.3 相關專案

- [Official GA MCP Server](https://github.com/googleanalytics/google-analytics-mcp) - 只讀功能
- [Python GA4 Admin](https://pypi.org/project/google-analytics-admin/) - Python client

---

## 十一、常見問題

### Q1: 為什麼不用官方 GA MCP？
**A**: 官方版本只提供讀取功能，無法建立維度或標記轉換事件。

### Q2: Terraform 不能做到嗎？
**A**: GA4 的 Terraform provider 功能非常有限，不支援自訂維度和轉換事件。

### Q3: 需要每個人都設定 Service Account 嗎？
**A**: 不需要。可以共用一個團隊 service account，或由管理員集中設定。

### Q4: 會不會誤刪現有設定？
**A**: 目前 MVP 只有建立和讀取功能，沒有刪除功能，非常安全。

### Q5: 支援哪些 GA4 功能？
**A**: 目前支援自訂維度和轉換事件。未來會加入受眾、報表等功能。

---

**專案狀態**: 🟡 MVP 開發中
**維護者**: Coachly 開發團隊
**最後更新**: 2025-10-07
**版本**: 0.1.0-dev
