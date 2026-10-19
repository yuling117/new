# 智能冰箱靈感大廚 - 實作計畫

本計畫旨在打造具備 **AI 照片辨識一鍵盤點**、**客製化飲食偏好與設備限制篩選**、**一鍵動態換菜與庫存扣除** 以及 **3 種可切換介面風格** 的全端智慧冰箱料理系統。

---

## 1. 系統架構與組件規劃

```
┌────────────────────────────────────────────────────────┐
│                      Client (React)                    │
│  - 3 Themes Switcher (Warm Japanese, Clean Eco, Dark)  │
│  - Fridge Inventory Manager (Add, Edit, Delete, Snap)  │
│  - Smart Filters & Constraints Selector                │
│  - AI Recipe Generator & Dynamic Chat / Substitution   │
│  - Cooking Completion & Inventory Deduction            │
└───────────────────────────┬────────────────────────────┘
                            │ REST API (`/api/gemini/*`)
┌───────────────────────────▼────────────────────────────┐
│                    Server (Express)                    │
│  - POST /api/recognize-fridge (Multimodal Vision)      │
│  - POST /api/generate-recipes (Structured JSON AI)     │
│  - POST /api/substitute-recipe (Dynamic Chat Recipe)   │
└───────────────────────────┬────────────────────────────┘
                            │ @google/genai SDK
┌───────────────────────────▼────────────────────────────┐
│                     Gemini API                         │
│  - model: "gemini-3.8-flash"                           │
└────────────────────────────────────────────────────────┘
```

---

## 2. 核心功能模組

1. **伺服器端 Gemini API 整合 (`server.ts`)**
   - `/api/recognize-fridge`：接收上傳的冰箱照片（Base64），使用 `gemini-3.8-flash` 辨識食材並以 JSON 回傳清單（名稱、數量、單位、分類）。
   - `/api/generate-recipes`：接收冰箱現有食材清單、飲食風格（高蛋白、低醣、全素等）、設備限制（電鍋、氣炸鍋、微波爐、單口爐）與時間限制，透過 `gemini-3.8-flash` 結構化 JSON 生成 3 道精選食譜。
   - `/api/substitute-recipe`：接收原有食譜與使用者的換菜指令（例如：「換一道不用開火的」），即時生成替代食譜。

2. **前端介面與體驗設計 (`src/App.tsx`, `src/index.css`)**
   - **主題切換器 (3 Styles)**：
     - 風格一：溫馨日系日嚐風 (Warm Minimalist & Natural Wood tones)
     - 風格二：極簡清新料理實驗室 (Clean Organic Eco)
     - 風格三：深夜食堂專業主廚風 (Dark Mode Sleek Tech Gourmet)
   - **分頁與互動檢視**：
     - **Tab 1: 冰箱庫存 (Fridge Inventory)**：顯示現有食材、手動新增、刪除、一鍵相機拍照辨識。
     - **Tab 2: 智慧食譜 (Smart Recipe Generator)**：設定設備與飲食限制、一鍵生成食譜、檢視步驟、食材清單、動態換菜、一鍵點擊「開始烹飪並扣除庫存」。
     - **Tab 3: 常用菜譜 / 歷史紀錄**：檢視已完成的料理與使用紀錄。

---

## 3. 驗證計畫
1. 執行 `compile_applet` 確保編譯成功無錯誤。
2. 驗證伺服器端 API 路由與 Gemini API 串接正確。
3. 測試前端 3 種主題切換、拍照辨識模擬、篩選器與庫存自動扣除流程。
