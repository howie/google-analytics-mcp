# GA4 Admin MCP - 快速開始

> ⚡ 30 秒完成 GA4 設定！

## 安裝步驟

### 1. 安裝依賴 (1 分鐘)

```bash
cd mcp-servers/ga4-admin
npm install
npm run build
```

### 2. 設定 Service Account (3 分鐘)

如果還沒有 service account key，執行：

```bash
# 建立 service account (使用專案的腳本)
cd ../../terraform/scripts
./create-ga4-service-account.sh

# 或手動在 GCP Console 建立
```

**手動步驟**:
1. GCP Console → IAM & Admin → Service Accounts
2. 建立新的 SA: `ga4-admin-mcp@PROJECT.iam.gserviceaccount.com`
3. 下載 JSON key 到 `~/.config/gcp/ga4-admin-key.json`
4. 在 GA4 中給予 Editor 權限

### 3. 設定 Claude Code (2 分鐘)

編輯 `~/.claude/settings.json`:

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

### 4. 重啟 Claude Code

關閉並重新開啟 Claude Code。

---

## 使用方式

### 方法 1: 直接對話

```
Claude，請幫我在 GA4 (G-859X61KC45) 建立以下設定：

自訂維度：
1. method - 登入方式 (EVENT)
2. session_id - Session ID (EVENT)
3. error_type - 錯誤類型 (EVENT)
4. step - 快速開始步驟 (EVENT)

轉換事件：
1. user_signup_complete
2. session_create_complete
3. audio_upload_complete
4. transcript_view
```

Claude 會自動使用 MCP 工具完成！

### 方法 2: 使用工具

在 Claude Code 中查看可用的 MCP 工具：

```
列出 ga4-admin MCP 可用的工具
```

然後直接呼叫：

```
使用 create_custom_dimension 工具建立 method 維度
```

---

## 驗證設定

```bash
# 測試 MCP 連線
node dist/index.js

# 應該看到：
# GA4 Admin MCP Server running on stdio
```

在 Claude Code 中測試：

```
查詢 GA4 property G-859X61KC45 的所有自訂維度
```

---

## 一鍵設定腳本

**完整自動化**（需要先設定 service account）：

在 Claude Code 中執行：

```
請使用 ga4-admin MCP 完成專案的 GA4 設定，參考 docs/features/onboarding-improvement/README.md 中 Phase 2.4 的需求。
```

Claude 會：
1. ✅ 讀取需求文件
2. ✅ 建立 4 個自訂維度
3. ✅ 標記 4 個轉換事件
4. ✅ 列出結果確認

**總時間**: 30 秒！

---

## 疑難排解

### Error: Cannot find module '@modelcontextprotocol/sdk'

```bash
npm install
npm run build
```

### Error: Permission denied

檢查：
1. Service account JSON key 路徑正確
2. GA4 中有加入 service account 並給予 Editor 權限

### Claude Code 看不到 MCP

1. 確認 `settings.json` 路徑正確
2. 確認 `dist/index.js` 已編譯
3. 重啟 Claude Code

---

## 與其他方案比較

| 方案 | 前置時間 | 執行時間 | 總時間 | 可重複 |
|-----|---------|---------|--------|--------|
| 手動設定 | 0 | 15 分鐘 | **15 分鐘** | ❌ |
| Python 腳本 | 5 分鐘 | 2 分鐘 | **7 分鐘** | ✅ |
| **MCP Server** | 6 分鐘 | **30 秒** | **6.5 分鐘** | ✅✅ |

**優勢**:
- ⚡ 執行最快（30 秒）
- 🔄 完全可重複
- 🤖 自然語言操作
- 📝 與 Claude Code 完美整合
- 🔧 可擴展（未來可加更多功能）

---

**推薦度**: ⭐⭐⭐⭐⭐
**適用場景**: 團隊協作、多環境、經常需要重設
