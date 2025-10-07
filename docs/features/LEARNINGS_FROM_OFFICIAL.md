# 從官方 Google Analytics MCP 學習的重點

> 研究 https://github.com/googleanalytics/google-analytics-mcp 的實作模式和最佳實踐

**研究日期**: 2025-10-07
**官方版本**: Python-based MCP using FastMCP framework
**我們的版本**: TypeScript-based MCP using @modelcontextprotocol/sdk

---

## 一、架構對比

### 官方 (Python)
```
analytics_mcp/
├── coordinator.py         # FastMCP singleton server
├── server.py              # Entry point, tool imports
├── tools/
│   ├── admin/info.py      # Admin API tools (read-only)
│   ├── reporting/         # Data API tools
│   └── utils.py           # API client creation
└── tests/
    ├── server_test.py     # Basic smoke tests
    └── utils_test.py
```

### 我們的實作 (TypeScript)
```
mcp-servers/ga4-admin/
├── src/
│   └── index.ts           # All-in-one MCP server
├── package.json
└── tsconfig.json
```

**觀察**: 官方採用模組化架構，我們目前是單檔案。

---

## 二、認證機制

### 官方做法
```python
# analytics_mcp/tools/utils.py
from google.auth import default

def create_admin_api_client():
    """Uses Application Default Credentials (ADC)"""
    credentials, _ = default(
        scopes=["https://www.googleapis.com/auth/analytics.readonly"]
    )
    return AnalyticsAdminServiceAsyncClient(
        credentials=credentials,
        client_info=ClientInfo(user_agent=f"...")
    )
```

**特點**:
- ✅ 使用 ADC (Application Default Credentials)
- ✅ 自動發現認證（環境變數、gcloud、metadata server）
- ✅ 每次創建新 client，無需手動管理
- ✅ 指定 scope: `analytics.readonly`

### 我們的做法
```typescript
// mcp-servers/ga4-admin/src/index.ts
import { GoogleAuth } from 'google-auth-library';

const auth = new GoogleAuth({
  scopes: ['https://www.googleapis.com/auth/analytics.edit']
});
```

**特點**:
- ✅ 也使用 GoogleAuth（Node.js 版本的 ADC）
- ✅ 支援 GOOGLE_APPLICATION_CREDENTIALS
- ✅ Scope: `analytics.edit` (我們需要寫入權限)
- ⚠️ 全域單例，可能需要改進

---

## 三、錯誤處理

### 官方做法
```python
# 非常簡單，幾乎沒有自訂錯誤處理
async def get_property_details(property_id: int | str) -> Dict[str, Any]:
    client = create_admin_api_client()
    property_rn = construct_property_rn(property_id)
    response = await client.get_property(name=property_rn)
    return proto_to_dict(response)
```

**觀察**:
- ❌ 沒有 try-catch
- ❌ 沒有自訂錯誤訊息
- ❌ 依賴 Google API client 的預設錯誤
- ❌ 沒有 retry 機制

**結論**: 官方選擇極簡主義，讓錯誤自然傳播。

### 我們的做法
```typescript
// 有基本 try-catch
try {
  const response = await analyticsadmin.properties.customDimensions.create({...});
  return { success: true, message: "✅ Created..." };
} catch (error: any) {
  return { success: false, error: error.message };
}
```

**評價**:
- ✅ 比官方好，有錯誤捕獲
- ⚠️ 但還可以更細緻（區分 404, 403, 409 等）

---

## 四、輸入驗證

### 官方做法
```python
def construct_property_rn(property_id: int | str) -> str:
    """Flexible property ID handling"""
    if isinstance(property_id, int):
        return f"properties/{property_id}"
    return property_id  # Assume already formatted
```

**特點**:
- ✅ 接受多種輸入格式
- ✅ 自動標準化資源名稱
- ✅ 簡單且實用

### 我們的做法
```typescript
// 目前沒有輸入驗證
const propertyPath = `properties/${args.propertyId}`;
```

**問題**:
- ❌ 沒有驗證 property ID 格式
- ❌ 沒有檢查必填參數
- ❌ 沒有參數類型轉換

**需要改進**: 借鑑官方的彈性處理。

---

## 五、API 回應處理

### 官方做法
```python
def proto_to_dict(message) -> Dict[str, Any]:
    """Convert protobuf to dict"""
    return json.loads(MessageToJson(message))

def proto_to_json(message) -> str:
    """Convert protobuf to JSON string"""
    return MessageToJson(message)
```

**特點**:
- ✅ 統一的 protobuf 轉換工具
- ✅ 乾淨的 JSON 輸出
- ✅ 可重複使用

### 我們的做法
```typescript
// 直接返回 API response
return {
  success: true,
  message: `✅ Created custom dimension: ${displayName}`,
  dimension: response.data
};
```

**評價**:
- ✅ 包含更多上下文（success flag, message）
- ✅ 對 MCP 使用者更友好
- ⚠️ 可能過於詳細

---

## 六、測試策略

### 官方測試
```python
# tests/server_test.py
class TestUtils(unittest.TestCase):
    def test_server_initialization(self):
        """Basic smoke test"""
        from analytics_mcp import server
        self.assertIsNotNone(server.mcp)
```

**特點**:
- ⚠️ 非常簡單的煙霧測試
- ❌ 沒有 API mocking
- ❌ 沒有工具行為測試
- ❌ 測試覆蓋率低

**結論**: 官方測試非常基礎，不值得模仿。

### 我們的計畫
```
tests/
├── unit/
│   ├── tools/
│   │   ├── dimensions.test.ts
│   │   └── events.test.ts
│   └── auth/client.test.ts
└── integration/
    └── real-api.test.ts
```

**目標**:
- ✅ 單元測試 with mocking
- ✅ 整合測試（真實 API）
- ✅ > 80% 覆蓋率

---

## 七、依賴管理

### 官方依賴
```python
# pyproject.toml
dependencies = [
    "fastmcp",
    "google-analytics-admin>=0.23.3",
    "google-analytics-data>=0.18.10",
    "google-auth>=2.28.0"
]
```

### 我們的依賴
```json
{
  "@modelcontextprotocol/sdk": "^0.5.0",
  "googleapis": "^131.0.0",
  "google-auth-library": "^9.0.0"
}
```

**觀察**:
- 官方用 FastMCP (更高階的 MCP 框架)
- 我們用原始 MCP SDK (更靈活)
- 兩者都依賴官方 Google 認證庫

---

## 八、值得借鑑的部分

### ✅ 立即採用
1. **彈性輸入處理**
   ```typescript
   function normalizePropertyId(propertyId: string | number): string {
     if (typeof propertyId === 'number' || /^\d+$/.test(propertyId)) {
       return `properties/${propertyId}`;
     }
     return propertyId.startsWith('properties/')
       ? propertyId
       : `properties/${propertyId}`;
   }
   ```

2. **統一的錯誤格式**
   ```typescript
   interface ToolResult {
     success: boolean;
     message?: string;
     data?: any;
     error?: {
       code: string;
       message: string;
       details?: any;
     };
   }
   ```

3. **Client Info 設定**
   ```typescript
   // 加入 user agent 讓 Google 知道請求來源
   const auth = new GoogleAuth({
     scopes: ['https://www.googleapis.com/auth/analytics.edit'],
     clientOptions: {
       userAgent: 'ga4-admin-mcp/0.1.0'
     }
   });
   ```

### 🔄 中期改進
4. **模組化架構**
   ```
   src/
   ├── index.ts              # Entry point
   ├── server.ts             # MCP server setup
   ├── auth/
   │   └── client.ts         # Auth handling
   ├── tools/
   │   ├── dimensions.ts     # Dimension tools
   │   ├── events.ts         # Event tools
   │   └── common.ts         # Shared utilities
   └── types/
       └── index.ts          # TypeScript definitions
   ```

5. **工具註冊模式**
   ```typescript
   // 類似官方的裝飾器模式
   const tools = [
     createDimensionTool,
     listDimensionsTool,
     createEventTool,
     listEventsTool
   ];

   tools.forEach(tool => server.addTool(tool));
   ```

### ❌ 不建議採用
6. **極簡測試** - 官方測試太簡單，不足以保證品質
7. **無錯誤處理** - 我們的 MCP 是寫入操作，需要更好的錯誤處理

---

## 九、改進計畫

### Phase 1: 立即改進（1 天）
- [ ] 加入 `normalizePropertyId()` 工具函數
- [ ] 統一錯誤回應格式
- [ ] 加入 user agent 設定
- [ ] 改進輸入驗證

### Phase 2: 重構（3-5 天）
- [ ] 模組化架構拆分
- [ ] 完整的單元測試
- [ ] 整合測試
- [ ] 錯誤分類處理（404, 403, 409, 500）

### Phase 3: 進階功能（1-2 週）
- [ ] Retry 機制
- [ ] 批次操作
- [ ] 詳細日誌
- [ ] 效能優化

---

## 十、Open Source 準備清單

基於官方專案的參考，我們需要：

### 必須有的檔案
- [x] `README.md` - 已有
- [x] `LICENSE` - 需要加（建議 Apache 2.0 或 MIT）
- [ ] `CONTRIBUTING.md` - 貢獻指南
- [ ] `CODE_OF_CONDUCT.md` - 行為準則
- [ ] `CHANGELOG.md` - 版本歷史
- [ ] `.github/`
  - [ ] `ISSUE_TEMPLATE/` - Issue 模板
  - [ ] `PULL_REQUEST_TEMPLATE.md` - PR 模板
  - [ ] `workflows/` - CI/CD

### 文檔完整性
- [x] 快速開始指南
- [x] API 文檔
- [ ] 架構說明
- [ ] 故障排除
- [ ] FAQ

### 品質保證
- [ ] 測試覆蓋率 > 80%
- [ ] CI/CD 自動化
- [ ] Linting (eslint)
- [ ] 格式化 (prettier)
- [ ] 型別檢查通過

---

## 十一、與官方的互補定位

### 官方 GA MCP (Python)
**定位**: Google Analytics **數據讀取與分析**
- ✅ Data API (報表、即時數據)
- ✅ Admin API (讀取設定)
- ✅ 適合數據分析師
- ✅ Gemini/Claude 查詢分析

### 我們的 GA4 Admin MCP (TypeScript)
**定位**: Google Analytics **設定自動化**
- ✅ Admin API (寫入操作)
- ✅ 建立維度、標記轉換
- ✅ 適合開發者和 DevOps
- ✅ Claude Code 自動化設定

**互補而非競爭**:
```
開發者工作流程：
1. 使用「我們的 MCP」→ 設定 GA4（30 秒）
2. 使用「官方 MCP」→ 查詢報表和數據分析
```

---

## 十二、總結

### 官方做得好的
1. ✅ 使用 ADC 自動發現認證
2. ✅ 彈性的輸入參數處理
3. ✅ 模組化架構
4. ✅ 清晰的專案結構

### 官方的不足
1. ❌ 測試覆蓋不足
2. ❌ 錯誤處理太簡單
3. ❌ 只支援讀取操作

### 我們的優勢
1. ✅ 支援寫入操作（核心差異）
2. ✅ 更好的錯誤處理
3. ✅ TypeScript 型別安全
4. ✅ 為 Claude Code 優化

### 我們需要改進
1. ⚠️ 輸入驗證和格式化
2. ⚠️ 模組化架構
3. ⚠️ 測試覆蓋率
4. ⚠️ 文檔完整性

---

**下一步**: 根據這些學習改進我們的實作，準備 open source 發布。

**維護者**: Coachly 開發團隊
**最後更新**: 2025-10-07
