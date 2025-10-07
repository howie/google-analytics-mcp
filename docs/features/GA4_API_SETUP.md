# GA4 自動化設定 - 使用 Admin API

> 💡 使用 Python 腳本自動設定 GA4，而非手動點擊

## 為什麼選擇 API 方式？

| 方式 | 優點 | 缺點 |
|-----|------|------|
| **手動設定** | 簡單直觀 | 耗時 15+ 分鐘，容易出錯 |
| **API 腳本** ✅ | 快速（2 分鐘）、可重複 | 需要 GCP 設定 |
| **Terraform** | 基礎設施即代碼 | GA4 支援不完整 ❌ |
| **MCP** | 整合方便 | 目前無 GA MCP ❌ |

## 快速開始

### 前置準備 (5 分鐘)

#### 1. 啟用 Google Analytics Admin API

```bash
# 在 GCP Console 啟用 API
# https://console.cloud.google.com/apis/library/analyticsadmin.googleapis.com
```

**或使用 gcloud CLI**:
```bash
gcloud services enable analyticsadmin.googleapis.com
```

#### 2. 建立 Service Account

**在 GCP Console**:
1. 前往 IAM & Admin → Service Accounts
2. 建立新的 Service Account
3. 名稱: `ga4-config-automation`
4. 角色:
   - `Analytics Admin Editor` (必要)
   - 或 `Viewer` + `Editor` on GA4 property
5. 建立 JSON 金鑰並下載

**或使用 gcloud CLI**:
```bash
# 建立 Service Account
gcloud iam service-accounts create ga4-config-automation \
  --display-name="GA4 Configuration Automation"

# 授予權限 (需要在 GA4 中手動加入)
# 1. 複製 service account email
# 2. 到 GA4 Admin → Property Access Management
# 3. 加入此 email 並給予 Editor 權限

# 下載金鑰
gcloud iam service-accounts keys create ~/ga4-config-key.json \
  --iam-account=ga4-config-automation@YOUR_PROJECT.iam.gserviceaccount.com
```

#### 3. 在 GA4 中加入 Service Account

1. GA4 → Admin → Property Access Management
2. 點擊 "+" 加入使用者
3. 輸入 service account email (格式: `xxx@xxx.iam.gserviceaccount.com`)
4. 角色選擇: **Editor**

#### 4. 安裝 Python 套件

```bash
# 使用專案的 uv 環境
uv pip install google-analytics-admin

# 或使用 pip
pip install google-analytics-admin
```

#### 5. 設定環境變數

```bash
export GOOGLE_APPLICATION_CREDENTIALS=~/ga4-config-key.json
```

---

### 執行腳本 (2 分鐘)

#### 測試模式 (Dry Run)

```bash
python scripts/setup_ga4_config.py \
  --property-id G-859X61KC45 \
  --dry-run
```

#### 實際執行

```bash
python scripts/setup_ga4_config.py \
  --property-id G-859X61KC45
```

**預期輸出**:
```
🚀 Starting GA4 configuration...
📊 Property ID: G-859X61KC45

📏 Creating custom dimensions...
✅ Created custom dimension: 登入方式 (method)
✅ Created custom dimension: Session ID (session_id)
✅ Created custom dimension: 錯誤類型 (error_type)
✅ Created custom dimension: 快速開始步驟 (step)

🎯 Marking conversion events...
✅ Marked as conversion: user_signup_complete
✅ Marked as conversion: session_create_complete
✅ Marked as conversion: audio_upload_complete
✅ Marked as conversion: transcript_view

✨ GA4 configuration completed!

Next steps:
1. Go to GA4 → Explore → Create funnel analysis
2. Go to GA4 → Reports → Create custom reports
3. See docs/features/onboarding-improvement/GA4_SETUP_GUIDE.md
```

---

## 腳本做了什麼？

### 1. 建立 4 個自訂維度

| 參數名稱 | 顯示名稱 | 範圍 | 說明 |
|---------|---------|------|------|
| `method` | 登入方式 | Event | email/google |
| `session_id` | Session ID | Event | 教練 session ID |
| `error_type` | 錯誤類型 | Event | 錯誤原因 |
| `step` | 快速開始步驟 | Event | 步驟 1-4 |

### 2. 標記 4 個轉換事件

- ✅ `user_signup_complete` - 註冊完成
- ✅ `session_create_complete` - 建立 session
- ✅ `audio_upload_complete` - 上傳成功
- ✅ `transcript_view` - 查看逐字稿

---

## 無法自動化的部分

以下功能**必須手動設定**（API 不支援）:

### ❌ 漏斗分析 (Funnels)
需要在 GA4 UI 中手動建立:
- 路徑: GA4 → Explore → Funnel Exploration
- 參考: [GA4_SETUP_GUIDE.md - 漏斗分析](./GA4_SETUP_GUIDE.md#3-漏斗分析設定)

### ❌ 自訂報表
需要在 GA4 UI 中手動建立:
- 路徑: GA4 → Explore → Blank
- 參考: [GA4_SETUP_GUIDE.md - 自訂報表](./GA4_SETUP_GUIDE.md#4-自訂報表建立)

### ❌ 快訊 (Alerts)
需要在 GA4 UI 中手動設定:
- 路徑: GA4 → Admin → Custom Alerts
- 參考: [GA4_SETUP_GUIDE.md - 即時監控](./GA4_SETUP_GUIDE.md#5-即時監控設定)

---

## 疑難排解

### 錯誤: Permission Denied

**原因**: Service Account 沒有 GA4 權限

**解決方式**:
1. 檢查 service account email 是否正確
2. 確認在 GA4 Property Access Management 中有加入
3. 確認角色為 **Editor**（不是 Viewer）

### 錯誤: Property not found

**原因**: Property ID 錯誤或沒有權限

**解決方式**:
```bash
# 列出所有可存取的 properties
gcloud analytics properties list
```

### 錯誤: API not enabled

**解決方式**:
```bash
gcloud services enable analyticsadmin.googleapis.com
```

### 錯誤: Dimension already exists

**這是正常的！** 腳本會略過已存在的維度。

---

## 清理腳本 (選用)

如果需要移除所有設定:

```bash
# ⚠️ 警告: 這會刪除所有自訂維度和轉換事件！
python scripts/cleanup_ga4_config.py \
  --property-id G-859X61KC45 \
  --confirm
```

---

## 與手動設定的比較

| 項目 | 手動設定 | API 腳本 |
|-----|---------|----------|
| 自訂維度 | 5 分鐘 × 4 = 20 分鐘 | 10 秒 |
| 轉換事件 | 3 分鐘 × 4 = 12 分鐘 | 5 秒 |
| 可重複性 | ❌ 難以重複 | ✅ 完全可重複 |
| 錯誤率 | 中等 | 極低 |
| **總時間** | **~32 分鐘** | **~2 分鐘** |

---

## 進階用法

### 批次處理多個 Properties

```python
# 修改腳本支援多個 properties
property_ids = [
    "G-859X61KC45",  # Production
    "G-XXXXXXXXXX",  # Staging
]

for prop_id in property_ids:
    configurator = GA4Configurator(prop_id)
    configurator.setup_all()
```

### 整合到 CI/CD

```yaml
# .github/workflows/setup-ga4.yml
name: Setup GA4 Configuration

on:
  workflow_dispatch:

jobs:
  setup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install google-analytics-admin
      - run: |
          echo "${{ secrets.GA4_SERVICE_ACCOUNT_KEY }}" > /tmp/key.json
          export GOOGLE_APPLICATION_CREDENTIALS=/tmp/key.json
          python scripts/setup_ga4_config.py --property-id G-859X61KC45
```

---

## 相關文件

- 📘 [快速開始 (手動)](./GA4_QUICK_START.md)
- 📗 [完整設定指南](./GA4_SETUP_GUIDE.md)
- 📜 [Google Analytics Admin API](https://developers.google.com/analytics/devguides/config/admin/v1)
- 🐍 [Python Client Library](https://pypi.org/project/google-analytics-admin/)

---

**預計設定時間**: 7 分鐘（前置準備 5 分鐘 + 執行 2 分鐘）
**難度**: ⭐⭐⭐ (中等)
**推薦度**: ⭐⭐⭐⭐⭐ (強烈推薦，特別是有多個環境時)
