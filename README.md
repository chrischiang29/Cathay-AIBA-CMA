# 市場報告個人化摘要與產品接口

> **MVP Demo**
> 以 GenAI 動態提示詞編排，實現「資訊 → 洞察 → 行動」的超個人化投研導購體系

---

## 專案背景與問題定義

國泰世華 CUBE App 擁有 **700 萬+** 數位用戶，每日產出大量專業投研報告（House View）。然而這套體系存在一個核心斷層：

```
專業投研報告  ──×──  一般客戶  ──×──  金融產品申購
（資訊密度過高）    （20% 信心缺口）    （缺乏直接交易入口）
```

**傳統解法的限制：** 靜態推薦系統只能做到「產品 × 人」的二元匹配，無法將市場環境（宏觀研報）作為第三維度動態注入。

**本方案解法：** 以 GenAI Agentic Workflow 打通從「研報解讀 → 個人化摘要 → 產品推薦 → CTA 導購」的完整轉化鏈路，讓同一份 PDF 研報，同時對三種客群說出三種語言。

---

## MVP 展示目的

本 MVP 對應《國泰 AI 財金導購 Agent 方案》中的 **M1-M2 里程碑**，核心驗證目標：

| 驗證維度 | 展示內容 | 對應業務指標 |
|---|---|---|
| **Persona 引擎可行性** | 同一份研報對三客群產出截然不同的語氣與重點 | 摘要觸達率與點擊率（Engagement） |
| **市場訊號提取準確度** | Gemini 能否從非結構化 PDF 中識別出可比對產品的市場訊號 | Reasoning Node 的邏輯品質 |
| **導購轉化路徑完整性** | 從摘要 → 產品卡片 → 阿發直購按鈕的完整 CTA 鏈路 | 產品頁跳轉率（Pre-conversion） |
| **KYC 合規阻斷機制** | 超出客群風險等級的產品自動改為教育型內容 | 適合度原則（Suitability）合規驗證 |
| **System Prompt 可維運性** | 各客群提示詞以獨立 .md 檔管理，前端可即時查看 | 內容更新成本與一致性維護 |

---

## 系統架構

### 整體架構圖

![整體架構圖](PNG/Structure.png)

### 前端頁面

![前端頁面](PNG/Frontend.png)

---

## 用戶貼標（Persona Tagging）

### 三大客群標籤定義

系統以 `persona_tag` 作為全流程的核心識別符，貫穿「System Prompt 選擇 → 產品過濾 → KYC 阻斷 → CTA 文案」每一環節。

| Tag | 客群名稱 | 目標對象描述 | 對應前端顏色 |
|---|---|---|---|
| `new_parents` | 新手爸媽 | 育兒階段、重視保障、穩健低波動偏好 | 綠色（#10B981） |
| `hnw_professionals` | 高淨值專業人士 | 高收入、金融知識豐富、接受全風險等級 | 藍色（#3B82F6） |
| `fresh_grads` | 社會新鮮人（Z世代） | 剛入職場、小資族、高 App 黏著度 | 紫色（#8B5CF6） |

### 貼標機制（MVP 版本）

目前 MVP 採用**靜態三路並發**設計：每次上傳 PDF，系統同時對三個 Tag 各產出一份完整報告，前端三欄並排呈現對比效果。

**後續規劃（M3）：** 整合真實 CRM 資料，依客戶實際屬性（年齡、資產規模、過往交易紀錄）動態指派對應 Tag，實現一對一個人化。

---

## System Prompt 設計

### Prompt 管理架構

所有系統提示詞以獨立 `.md` 檔案形式存放於 `backend/prompts/`，達到以下目標：

1. **可維運性**：業務人員可直接修改 `.md` 檔調整語氣或分析重點，不需改動程式碼
2. **前端透明度**：前端 PromptViewer 元件直接呼叫 `GET /api/prompts/{tag}`，讓展示者可即時查看 AI 的「思考框架」
3. **版控可追蹤**：Prompt 更新歷程可透過 Git 追蹤，支援 A/B 測試版本管理

### 各客群 Prompt 核心設計

#### 新手爸媽（`new_parents.md`）

| 設計維度 | 內容 |
|---|---|
| **角色定位** | 家庭財務守護者 |
| **語氣關鍵詞** | 孩子、成長、安穩、守護、未來、踏實 |
| **禁用詞** | 崩潰、暴跌、危機、Duration、Beta、Sharpe Ratio |
| **正向重框** | 「崩潰」→「防禦契機」；「暴跌」→「長期佈局時機」 |
| **分析重點** | 教育基金、低波動資產、家庭保障、長期配息 |

**輸出格式結構：**
```
### 本週市場重點（溫暖版）
### 對孩子未來的意義
### 守護家庭的三個行動建議
### 適合現階段的產品方向
### 溫馨提醒（合規免責）
```

#### 高淨值專業人士（`hnw_professionals.md`）

| 設計維度 | 內容 |
|---|---|
| **角色定位** | 頂尖私人銀行首席策略分析師 |
| **語氣關鍵詞** | 結構化、數據導向、高信噪比、前瞻性 |
| **禁用風格** | 情感化字眼、無意義修飾語（如「非常」、「很好」） |
| **特殊要求** | 若 House View 與市場共識有偏離，必須明確指出並提供邏輯依據 |
| **分析重點** | Fed 利率路徑、大類資產配置、避險資產動態、稅務環境、風險收益比 |

**輸出格式結構：**
```
### Executive Summary（執行摘要）
### 關鍵宏觀指標變動
### 大類資產配置建議方向（格式：資產類別 → 方向 → 理由）
### 主要風險情境
### 與市場共識的差異點
### 合規聲明
```

#### 社會新鮮人（`fresh_grads.md`）

| 設計維度 | 內容 |
|---|---|
| **角色定位** | 職場數位前輩 |
| **語氣關鍵詞** | 複利外掛、小資力、趨勢熱點、無痛升級、現在就開始 |
| **比喻手法** | 定期定額→「複利外掛」；市場調整→「補貨時機」 |
| **格式限制** | 段落不超過 3 句，適合碎片化閱讀 |
| **分析重點** | DCA 成本攤平、ESG/AI 熱點、數位工具應用、第一桶金規劃 |

**輸出格式結構：**
```
### 本週趨勢外掛（3分鐘版）
### 這跟你有什麼關係？
### 現在可以做的3件事
### 小資族不能錯過的機會點
### 免責提醒（輕鬆版）
```

### 市場訊號提取 Prompt（`reasoning_extractor.md`）

這是第五個特殊用途 Prompt，不面向用戶，專供 Reasoning Node（Step 2）使用：

```
任務：從摘要文字中提取 3～6 個市場訊號關鍵字
輸出格式：只輸出 JSON 陣列，不含任何其他說明
範例輸出：["降息", "債券利好", "台股", "ESG", "避險"]
```

提取出的關鍵字陣列直接進入 Step 3 的產品比對邏輯。

---

## KYC 識別與合規阻斷機制

### 風險等級對照（RR1～RR5）

| 風險等級 | 標籤 | 代表產品類型 |
|---|---|---|
| RR1 | 保守型 | 貨幣市場基金、保本商品 |
| RR2 | 穩健型 | 投資等級債券基金 |
| RR3 | 穩健積極型 | 高股息ETF、REITs、台股大盤ETF |
| RR4 | 積極型 | 股票型基金、單一國家ETF |
| RR5 | 高積極型 | 槓桿ETF、中國A股、高波動基金 |

### 各客群 KYC 上限設定

```python
# backend/services/suitability_check.py
PERSONA_MAX_RISK = {
    "new_parents":        3,  # 保守～穩健：僅推薦 RR1–RR3
    "fresh_grads":        3,  # 入門階段：僅推薦 RR1–RR3
    "hnw_professionals":  5,  # 全風險等級開放：RR1–RR5 均可推薦
}
```

> **設計說明：** `hnw_professionals` 設定為 RR5（全開放），代表具備足夠金融知識與資產規模，不施加風險上限限制。`new_parents` 與 `fresh_grads` 則設定 RR3 上限，確保不推薦高波動商品。

### 阻斷邏輯與前端呈現

當產品 `risk_level > persona 上限`，系統執行以下動作：

```
正常通過（suitability_passed = true）：
  → 顯示完整產品卡片 + 阿發直購 CTA 按鈕

KYC 阻斷（suitability_passed = false）：
  → 顯示產品基本資訊（名稱、類型、風險標籤）
  → 替換 CTA 按鈕為教育型說明（灰色、不可點擊）
  → 顯示 education_note：
       RR4：「建議先深入了解產品特性與市場波動風險...」
       RR5：「此產品屬高風險商品，含槓桿或高波動特性...」
```

**實際案例：**
- 新手爸媽看到 FNI（台灣高股息基金，RR4）→ 阻斷，顯示教育說明
- 高淨值專業人士看到 00645（道瓊正2，RR5）→ 通過，顯示「趨勢已現・果斷出擊」CTA

---

## 產品推薦機制

### Step 2：市場訊號提取

Gemini 讀取 Step 1 產出的個人化摘要，透過 `reasoning_extractor.md` 提示詞，輸出一個 JSON 陣列：

```json
["降息", "債券利好", "台股", "ESG", "避險"]
```

此步驟是整個推薦系統的感知層，訊號提取品質直接決定後續比對精準度。

### Step 3：產品比對演算法

每個產品有兩組訊號欄位：

- `market_signals`：此環境下**適合推薦**的市場訊號（正向）
- `negative_signals`：此環境下**不應推薦**的市場訊號（反向排除）

```python
# backend/services/product_matcher.py
def match_products(signals, persona_tag, max_results=3):
    for product in products:
        # 條件一（必要）：suitable_personas 包含此 persona
        if persona_tag not in product["suitable_personas"]:
            continue

        # 正向分數：market_signals 與提取訊號的交集
        positive_score = len(set(signals) & set(product["market_signals"]))

        # 負向分數：negative_signals 與提取訊號的交集
        negative_score = len(set(signals) & set(product["negative_signals"]))

        # 淨分 < 0 直接排除（市場環境與產品邏輯矛盾）
        net_score = positive_score - negative_score
        if net_score < 0:
            continue

    # 依淨分降序，取前 3 筆（net_score=0 保留作為 fallback）
    return top_3_by_net_score
```

**升息環境示意（negative_signals 排除效果）：**
```
提取訊號：["升息", "通膨升溫", "Fed鷹派", "台股"]

FDG  正分 0  負分 3（升息、通膨升溫、Fed鷹派） → 淨分 -3 → 排除
FAG  正分 0  負分 3（升息、通膨升溫、Fed鷹派） → 淨分 -3 → 排除
FBK  正分 0  負分 1（升息）                     → 淨分 -1 → 排除
00878 正分 1（台股）  負分 0                     → 淨分  1 → 保留
FNI   正分 1（台股）  負分 0                     → 淨分  1 → 保留

結果：升息環境債券、REITs 自動排除，改推台股相關產品
```

**降息環境示意（正向命中）：**
```
提取訊號：["降息", "債券利好", "避險", "台股"]

FDG  正分 2（降息、避險）  負分 0 → 淨分  2 → 保留（優先）
FAG  正分 2（降息、避險）  負分 0 → 淨分  2 → 保留（優先）
FBK  正分 1（降息）        負分 0 → 淨分  1 → 保留
00878 正分 1（台股）        負分 0 → 淨分  1 → 保留

排序結果：FDG = FAG > FBK = 00878
```

### Step 4：KYC 合規阻斷

見上方「KYC 識別與合規阻斷機制」章節。

### Step 5：CTA 卡片組合

每張產品卡片包含以下欄位：

| 欄位 | 說明 | 範例 |
|---|---|---|
| `name` | 產品全名 | 國泰美國優質債券基金 |
| `short_name` | 簡稱 | 美國優質債券 |
| `type` | 產品類型 | bond_fund |
| `region` | 投資地區 | 美國 |
| `asset_class` | 資產類別 | 債券 |
| `risk_level` | 風險等級（1-5） | 2 |
| `highlight` | 產品特色標籤 | 投資等級債 · 月配息 · 低波動 |
| `cta_label` | 個人化按鈕文案（依 persona） | 給家人的未來多一份保障 |
| `cta_mode` | 購買模式 | `regular`（定期定額）或 `single`（單筆） |
| `product_url` | 阿發直購連結 | https://... |
| `reasoning_hint` | AI 推理依據說明 | 根據文件中的降息、避險訊號，此產品... |
| `suitability_passed` | KYC 是否通過 | `true` / `false` |
| `education_note` | 不合規時的教育說明 | 此產品風險等級較高（RR4）... |

---

## 產品標示設計

### products.json 欄位結構

每筆產品在 `backend/data/products.json` 中包含以下核心標示欄位：

```json
{
  "pid": "FDG",
  "name": "國泰美國優質債券基金",
  "short_name": "美國優質債券",
  "type": "bond_fund",
  "region": "美國",
  "asset_class": "債券",
  "risk_level": 2,
  "highlight": "投資等級債 · 月配息 · 低波動",
  "description": "主要投資信用評等 BBB- 以上之美國優質債券...",

  "suitable_personas": ["new_parents", "hnw_professionals"],
  "market_signals": ["降息", "利率下行", "避險", "債券", "固定收益", "美債", "投資等級債"],
  "negative_signals": ["升息", "利率上行", "通膨升溫", "升息循環", "Fed鷹派"],

  "cta_label": {
    "new_parents":       "給家人的未來多一份保障",
    "hnw_professionals": "佈局投資等級債・鎖定資本利得",
    "fresh_grads":       "穩健起步・每月小額自動扣款"
  },
  "cta_mode": {
    "new_parents":       "regular",
    "hnw_professionals": "single",
    "fresh_grads":       "regular"
  },

  "product_url": "https://www.cathaybk.com.tw/cathaybk/personal/investment/fund/search",
  "afun_url": "https://www.cathaybk.com.tw/cathaybk/personal/investment/fund/search"
}
```

### 前端風險等級顯示

ProductCard 元件依 `risk_level` 數值渲染對應的視覺標籤：

| risk_level | 標籤文字 | 顏色 |
|---|---|---|
| 1 | RR1 保守 | 灰色 |
| 2 | RR2 穩健 | 綠色 |
| 3 | RR3 穩健積極 | 藍色 |
| 4 | RR4 積極 | 橘色 |
| 5 | RR5 高積極 | 紅色 |

### 目前收錄產品（10 筆） 僅供參考

| 代號 | 名稱 | 類型 | 風險 | 適合客群 | 購買模式 |
|---|---|---|---|---|---|
| FDG | 國泰美國優質債券基金 | 債券基金 | RR2 | 新手爸媽、高淨值 | 定期定額 / 單筆 |
| FAG | 國泰全球債券基金 | 債券基金 | RR2 | 新手爸媽、高淨值 | 定期定額 / 單筆 |
| FBK | 國泰全球不動產基金 | REITs | RR3 | 新手爸媽、高淨值 | 定期定額 / 單筆 |
| 00878 | 國泰永續高股息 ETF | 高股息ETF | RR3 | 全客群 | 定期定額 / 單筆 |
| 00858 | 國泰台灣加權 ETF | 指數ETF | RR3 | 新鮮人、新手爸媽 | 定期定額 |
| 00882 | 國泰台灣 ESG 永續 ETF | ESG ETF | RR3 | 新鮮人、新手爸媽 | 定期定額 |
| FNI | 國泰台灣高股息基金 | 股票型基金 | RR4 | 全客群* | 定期定額 / 單筆 |
| 00846 | 國泰韓國三星 ETF | 股票ETF | RR4 | 高淨值、新鮮人* | 定期定額 / 單筆 |
| FHB | 國泰中國A股基金 | 股票型基金 | RR5 | 高淨值 | 單筆 |
| 00645 | 國泰美國道瓊正2 ETF | 槓桿ETF | RR5 | 高淨值 | 單筆 |

> *標記說明：FNI（RR4）與 00846（RR4）雖在 `suitable_personas` 含新鮮人/新手爸媽，但 KYC 阻斷機制（Step 4）會在推薦時將其標記為 `suitability_passed=false`，改顯示教育型說明而非直購按鈕。

新增或調整產品時直接修改 `data/products.json`，系統即時生效，無需重啟後端。

---

## Agentic Workflow 五步驟說明

```
Step 1  個人化摘要生成
        輸入：PDF 全文 + 客群 System Prompt（.md）
        輸出：符合客群語氣、重點、格式的 Markdown 摘要
        技術：asyncio.to_thread() 包裝同步 requests.post() 呼叫
        模型：Vertex AI Gemini（Service Account REST API）

Step 2  市場訊號提取
        輸入：Step 1 產出的摘要文字
        輸出：["降息", "債券利好", "避險需求上升"] 等關鍵字陣列
        技術：第二次 Gemini 呼叫，使用 reasoning_extractor.md 專用 Prompt
        注意：回傳內容先 strip markdown code block，再 JSON.parse

Step 3  產品比對
        輸入：市場訊號 × Persona tag
        邏輯：products.json 中，suitable_personas 符合 AND market_signals 交集最多
        輸出：最多 3 筆排序後的候選產品（score=0 也保留，確保有 fallback）

Step 4  KYC 合規阻斷
        輸入：候選產品 × Persona 預設最高風險等級
        邏輯：產品 risk_level > Persona 上限 → suitability_passed = false
        輸出：加上合規標記的產品清單（不合規改顯示教育型說明）

Step 5  CTA 卡片組合
        輸入：通過檢查的產品 × Persona × 市場訊號
        輸出：含個人化文案、推理依據說明（reasoning_hint）、阿發直購連結的完整卡片物件
```

**並發架構：** 三個 Persona 的五步驟流程透過 `asyncio.gather()` 同時執行，API 回應時間約為單一 Persona 的時間（而非三倍）。

---

## 專案結構

```
cube-ai-advisor/
├── README.md
├── .gitignore                          # 根目錄全域機密防護
├── .git-hooks/
│   └── pre-commit                      # Commit 前機密掃描 hook
│
├── backend/
│   ├── main.py                         # FastAPI 路由入口
│   ├── requirements.txt
│   ├── .env.example                    # 環境變數範本（安全，可 push）
│   ├── .gitignore
│   │
│   ├── credentials/
│   │   ├── gen-lang-client-api-key-example.json  ← 範本（可 push）
│   │   └── gen-lang-client-api-key.json          ← 實際憑證（.gitignore 保護）
│   │
│   ├── prompts/                        # System Prompt 管理中心
│   │   ├── new_parents.md              # 新手爸媽
│   │   ├── hnw_professionals.md        # 高淨值專業人士
│   │   ├── fresh_grads.md              # 社會新鮮人（Z世代）
│   │   └── reasoning_extractor.md     # 市場訊號提取 Prompt
│   │
│   ├── data/
│   │   └── products.json               # 國泰產品目錄（10筆，含直購連結）
│   │
│   └── services/
│       ├── pdf_service.py              # PDF 文字提取（pdfplumber，50k char 截斷）
│       ├── llm_service.py              # Vertex AI Gemini REST 直連（google-auth）
│       ├── prompt_loader.py            # .md 提示詞載入器
│       ├── orchestrator.py             # 五步驟並發編排主控（asyncio.gather）
│       ├── reasoning_service.py        # Step 2：市場訊號提取
│       ├── product_matcher.py          # Step 3：訊號 × Persona 選品（lru_cache）
│       ├── suitability_check.py        # Step 4：KYC 合規阻斷
│       └── cta_builder.py              # Step 5：CTA 卡片組合
│
└── frontend/
    ├── package.json
    ├── vite.config.ts                  # /api proxy → localhost:8000
    └── src/
        ├── App.tsx                     # 主頁面：左右雙欄佈局
        ├── api/client.ts               # fetch 封裝
        ├── types/index.ts              # TypeScript 型別定義
        └── components/
            ├── PromptViewer.tsx        # 左側：System Prompt 即時查看
            ├── DocumentUploader.tsx    # PDF 上傳元件
            ├── ReportCard.tsx          # 個人化報告卡片（摘要 + 訊號 + 產品）
            └── ProductCard.tsx         # 產品推薦卡片（KYC標記 + CTA直購按鈕）
```

---

## 快速啟動

### 前置需求

- Python 3.11+
- Node.js 18+
- GCP Service Account JSON（需啟用 Vertex AI API + 計費）

### 1. 後端設定

```bash
cd backend

# 建立並啟動虛擬環境
python -m venv .venv
.venv\Scripts\activate          # Windows PowerShell
# source .venv/bin/activate     # macOS / Linux

# 安裝依賴
pip install -r requirements.txt

# 設定環境變數
cp .env.example .env
# 編輯 .env，填入你的 GCP 設定（參考 credentials/*-example.json）

# 放入憑證（參考 example 格式）
# 將真實金鑰存為：credentials/gen-lang-client-api-key.json

# 啟動後端
python main.py
# → http://localhost:8000
```

### 2. 前端設定

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### 3. 安裝 pre-commit hook（建議）

```bash
# Windows
copy .git-hooks\pre-commit .git\hooks\pre-commit

# macOS / Linux
cp .git-hooks/pre-commit .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

---

## 憑證設定說明

參考 `backend/credentials/gen-lang-client-api-key-example.json` 的格式：

```json
{
  "type": "service_account",
  "project_id": "your-gcp-project-id",
  "private_key_id": "your-key-id",
  "private_key": "-----BEGIN RSA PRIVATE KEY-----\n...",
  "client_email": "your-sa@your-project.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "...",
  "universe_domain": "googleapis.com"
}
```

`.env` 設定：

```env
GOOGLE_APPLICATION_CREDENTIALS=credentials/gen-lang-client-api-key.json
VERTEX_AI_LOCATION=global
LLM_MODEL=gemini-2.5-flash-lite
```

---

## API 端點

| 方法 | 路徑 | 說明 |
|---|---|---|
| `GET` | `/api/health` | 服務健康檢查 |
| `GET` | `/api/prompts` | 取得全部客群 System Prompt 內容 |
| `GET` | `/api/prompts/{tag}` | 取得指定客群 Prompt |
| `POST` | `/api/generate` | 上傳 PDF，並發產出三客群報告 + 產品推薦 |

---

## 安全防護說明

### 三層機密防護架構

```
Layer 1  .gitignore（被動）
         攔截 .env、credentials/*.json、*-key.json 等
         例外放行：*-example.json（範本檔可 push）

Layer 2  pre-commit hook（主動）
         每次 commit 前掃描：
         ① .env 檔案名稱
         ② credentials/ 路徑下非 example 的 JSON
         ③ JSON 內容含真實 private_key 值（"xxx" 視為範本，允許通過）
         例外放行：檔名含 example 或 private_key 值為 "xxx"

Layer 3  .env.example（範本）
         提供安全的設定格式範本，實際值不入版控
```

---

## 後續規劃（對應 Agent 方案里程碑）

| 里程碑 | 內容 | 狀態 |
|---|---|---|
| M1-M2 | Persona 引擎 + 五步驟 Agentic Workflow MVP | ✅ 本 Demo |
| M3 | 整合真實 CRM 客戶標籤，進行 A/B Testing | 待開發 |
| M4 | 引入 RLHF 理專評分機制，法遵合規壓力測試 | 待開發 |
| M5 | 整合至 CUBE App 客服、投資、信用卡各入口 | 待開發 |
| M6 | 全站上線，啟動轉化漏斗即時監控 | 待開發 |

---

## 參考文件

| 文件 | 說明 |
|---|---|
| [國泰 AI 財金導購 Agent 方案.pdf](../國泰%20AI%20財金導購%20Agent%20方案.pdf) | Agentic Workflow 架構規劃、CTA 節點設計、商業指標定義 |
| [國泰 CUBE AI 財顧報告創新方案.pdf](../國泰%20CUBE%20AI%20財顧報告創新方案.pdf) | 超個人化投研體系原理、三客群 Prompt 設計策略 |
| [CUBE_GenAI_Personalization_Strategy.pdf](../CUBE_GenAI_Personalization_Strategy.pdf) | GenAI 個人化策略簡報、Prompt Orchestration Layer 架構圖 |
