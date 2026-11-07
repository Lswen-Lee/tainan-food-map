# 巷口食記 🥢

台南中西區的美食口袋名單地圖。每家店是一張「手寫菜單紙條」卡片，分成「吃過」（有我的心得）和「想吃」（網路查證，附來源）兩種。
可以依狀態、類別、預算、特色篩選，並在地圖上找到位置；點進去可以看推薦品項、小提醒和資料來源。

- 🌐 網站：https://lswen-lee.github.io/tainan-food-map/
- 🤖 AI 協作規則：[`CLAUDE.md`](CLAUDE.md)

## 專案結構

| 路徑 | 用途 |
|---|---|
| `CLAUDE.md` | 給 AI 的專案規則（目的、結構、格式、風格、流程、檢核清單） |
| `data/shops.js` | 所有店家資料，**唯一資料來源** |
| `data/site.js` | 網站設定與分類／標籤／價位詞彙表 |
| `index.html` | 首頁：篩選＋卡片＋地圖，依資料自動產生 |
| `templates/shop-template.html` | 店家詳細頁模板 |
| `shops/<slug>.html` | 各店家詳細頁 |
| `assets/` | 樣式、程式、照片 |
| `log.md` | 變更紀錄 |

## 怎麼新增一家店

對 AI 說一句話就可以，例如：

> 依照 CLAUDE.md 新增一家店：○○麵店，地址……，座標……，推薦牛肉麵 160 元……，我的心得是……

AI 會依 `CLAUDE.md` §4 的流程：檢查缺少的資料 → 寫入 `data/shops.js` → 用模板建立詳細頁 → 跑檢核清單 → 更新 `log.md`。
網站載入時也會自動檢查資料格式，填錯會在頁面頂端出現紅色警告。

## 本機預覽

直接雙擊 `index.html` 就能看。或在專案資料夾執行：

```bash
python -m http.server 8000
```

再打開 <http://localhost:8000>。

## 技術

純 HTML／CSS／JavaScript，沒有建置步驟。地圖使用 [Leaflet](https://leafletjs.com/) 與 [OpenStreetMap](https://www.openstreetmap.org/)，字體使用 Google Fonts 的霞鶩文楷 TC 與 Noto Sans TC。
