# GitHub Repository Setup Guide

> 快速設定指南 - 5 分鐘完成 repository 優化

## 📝 Repository Settings

### 1. General Settings

**訪問**: https://github.com/howie/google-analytics-mcp/settings

**Description** (描述):
```
MCP server for Google Analytics 4 Admin API - automate GA4 configuration with natural language via Claude Code
```

**Website** (網站):
```
https://github.com/howie/google-analytics-mcp#readme
```

**Topics** (標籤) - 點擊 "Add topics":
```
mcp
model-context-protocol
google-analytics
ga4
admin-api
automation
claude-code
typescript
custom-dimensions
conversion-events
```

### 2. Features

勾選以下功能：
- ✅ Issues
- ✅ Discussions (optional - 方便社群討論)
- ❌ Projects (暫時不需要)
- ❌ Wiki (已有完整文件)

### 3. Social Preview

如果想要自訂社交媒體預覽圖：
- 訪問: https://github.com/howie/google-analytics-mcp/settings
- 滾動到 "Social preview"
- 上傳 1280x640 像素的圖片（optional）

建議內容：
- 背景: 簡潔的漸層或純色
- 文字: "GA4 Admin MCP"
- 副標題: "Automate Google Analytics 4 with Claude Code"
- Logo: GA4 + Claude icon (如果有授權)

---

## 🔐 Branch Protection Rules

**訪問**: https://github.com/howie/google-analytics-mcp/settings/branches

### Protect `main` branch

點擊 "Add branch protection rule"：

**Branch name pattern**: `main`

**勾選以下規則**:
- ✅ Require a pull request before merging
  - ✅ Require approvals: 1
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ Require status checks to pass before merging
  - ✅ Require branches to be up to date before merging
  - 🔍 Status checks (等 CI 第一次執行後會出現):
    - `Lint`
    - `Type Check`
    - `Test`
    - `Build`
- ✅ Require conversation resolution before merging
- ❌ Require signed commits (optional - 需要 GPG key)
- ✅ Include administrators (讓規則也套用到管理員)

**注意**: 第一次 CI 跑完後才能選擇 status checks

---

## 🔑 Secrets and Variables

**訪問**: https://github.com/howie/google-analytics-mcp/settings/secrets/actions

### Repository Secrets

**必要** (for CI/CD):
```
GA4_TEST_CREDENTIALS
  Value: 完整的 service account JSON (用於測試)

GA4_TEST_PROPERTY_ID
  Value: G-XXXXXXXXXX (測試用的 GA4 property ID)
```

**Optional** (for enhanced features):
```
NPM_TOKEN
  Value: npm publish token (如果要發布到 npm)
  說明: https://docs.npmjs.com/creating-and-viewing-access-tokens

CODECOV_TOKEN
  Value: Codecov token (for coverage reports)
  說明: https://about.codecov.io/

SNYK_TOKEN
  Value: Snyk security scanning token
  說明: https://snyk.io/
```

### 如何建立 GA4 測試環境

1. **建立測試 Property**:
   - 訪問 GA4: https://analytics.google.com/
   - 建立新的 property: "GA4 Admin MCP Test"
   - 記下 Property ID (G-XXXXXXXXXX)

2. **建立 Service Account**:
   ```bash
   # 在 GCP Console 建立
   gcloud iam service-accounts create ga4-mcp-test \
     --display-name="GA4 Admin MCP Test"

   # 建立 key
   gcloud iam service-accounts keys create ~/ga4-mcp-test-key.json \
     --iam-account=ga4-mcp-test@PROJECT_ID.iam.gserviceaccount.com
   ```

3. **在 GA4 中加入 Service Account**:
   - GA4 Admin → Property Access Management
   - 加入: `ga4-mcp-test@PROJECT_ID.iam.gserviceaccount.com`
   - 角色: Editor

4. **加入到 GitHub Secrets**:
   - 複製 `~/ga4-mcp-test-key.json` 的完整內容
   - 貼到 `GA4_TEST_CREDENTIALS` secret

---

## 📋 About Section

**訪問**: https://github.com/howie/google-analytics-mcp

點擊右上角的 ⚙️ (Settings icon)

**填寫**:
- Description: (同上)
- Website: https://github.com/howie/google-analytics-mcp#readme
- Topics: (同上 10 個 topics)

**勾選**:
- ❌ Releases (等有正式 release 再勾)
- ❌ Packages (等發布到 npm 再勾)
- ❌ Deployments (不需要)

---

## 🎨 README Badges (Optional)

等完成測試和 CI 設定後，可以加入這些 badges 到 README.md：

```markdown
# GA4 Admin MCP Server

[![CI](https://github.com/howie/google-analytics-mcp/workflows/CI/badge.svg)](https://github.com/howie/google-analytics-mcp/actions)
[![npm version](https://badge.fury.io/js/%40coachly%2Fga4-admin-mcp.svg)](https://www.npmjs.com/package/@coachly/ga4-admin-mcp)
[![codecov](https://codecov.io/gh/howie/google-analytics-mcp/branch/main/graph/badge.svg)](https://codecov.io/gh/howie/google-analytics-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
```

---

## ✅ Quick Checklist

手動操作（需要在 GitHub 網頁完成）：

- [ ] 更新 repository description
- [ ] 加入 website URL
- [ ] 加入 10 個 topics
- [ ] 啟用 Issues
- [ ] (Optional) 啟用 Discussions
- [ ] 設定 branch protection rules
- [ ] 建立 GA4 測試環境
- [ ] 加入 `GA4_TEST_CREDENTIALS` secret
- [ ] 加入 `GA4_TEST_PROPERTY_ID` secret
- [ ] (Optional) 加入 NPM_TOKEN
- [ ] (Optional) 加入 CODECOV_TOKEN

**時間**: 約 5-10 分鐘 (不含測試環境建立)

---

## 🔗 Quick Links

- Repository Settings: https://github.com/howie/google-analytics-mcp/settings
- Branch Protection: https://github.com/howie/google-analytics-mcp/settings/branches
- Secrets: https://github.com/howie/google-analytics-mcp/settings/secrets/actions
- Actions: https://github.com/howie/google-analytics-mcp/actions
- Issues: https://github.com/howie/google-analytics-mcp/issues

---

**準備完成後，進入 Task 2: 測試實作** ✅
