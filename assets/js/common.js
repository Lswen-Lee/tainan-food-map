// 首頁與詳細頁共用的小工具。
(function () {
  var REQUIRED = ["slug", "name", "category", "price", "address", "lat", "lng",
                  "hours", "must", "oneLiner", "status"];

  function esc(text) {
    return String(text == null ? "" : text)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // 依 CLAUDE.md §5、§7、§8 檢查資料，回傳問題清單（中文）。
  function validate(shops) {
    var problems = [];
    var seen = {};
    shops.forEach(function (s, i) {
      var who = "第 " + (i + 1) + " 筆（" + (s.name || s.slug || "未命名") + "）";
      REQUIRED.forEach(function (key) {
        if (s[key] === undefined || s[key] === "" ||
            (Array.isArray(s[key]) && s[key].length === 0)) {
          problems.push(who + "缺少必填欄位 " + key);
        }
      });
      if (s.slug && !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(s.slug)) {
        problems.push(who + "的 slug「" + s.slug + "」不符合命名規則（小寫英數＋連字號）");
      }
      if (s.slug && seen[s.slug]) problems.push(who + "的 slug「" + s.slug + "」重複了");
      seen[s.slug] = true;
      if (s.category && !window.CATEGORIES[s.category]) {
        problems.push(who + "的類別「" + s.category + "」不在詞彙表內");
      }
      (s.tags || []).forEach(function (t) {
        if (window.TAGS.indexOf(t) === -1) problems.push(who + "的標籤「" + t + "」不在詞彙表內");
      });
      if ((s.tags || []).length > 3) problems.push(who + "的標籤超過 3 個");
      if (s.price && !window.PRICES[s.price]) problems.push(who + "的價位「" + s.price + "」不是 $、$$、$$$");
      if (s.must && s.must.length > 3) problems.push(who + "的推薦品項超過 3 樣");
      if (typeof s.lat !== "number" || typeof s.lng !== "number") {
        problems.push(who + "的座標 lat／lng 必須是數字");
      }
      if (s.status && window.STATUSES.indexOf(s.status) === -1) {
        problems.push(who + "的狀態「" + s.status + "」只能是 吃過 或 想吃");
      }
      if (s.status === "吃過" && !/^\d{4}-\d{2}$/.test(s.visited || "")) {
        problems.push(who + "是「吃過」，visited 必須是 YYYY-MM");
      }
      if (s.status === "想吃") {
        if (s.visited) problems.push(who + "是「想吃」，visited 應該留空");
        if (!s.sources || s.sources.length < 2) problems.push(who + "是「想吃」，sources 至少要 2 個來源");
        if (!/^\d{4}-\d{2}-\d{2}$/.test(s.checked || "")) problems.push(who + "是「想吃」，checked 必須是查詢日期 YYYY-MM-DD");
      }
    });
    return problems;
  }

  function showProblems(problems) {
    if (!problems.length) return;
    problems.forEach(function (p) { console.warn("[資料檢查] " + p); });
    var box = document.createElement("div");
    box.className = "data-warning";
    box.setAttribute("role", "alert");
    box.innerHTML = "<strong>資料檢查發現 " + problems.length + " 個問題（請依 CLAUDE.md 修正）：</strong><ul>" +
      problems.map(function (p) { return "<li>" + esc(p) + "</li>"; }).join("") + "</ul>";
    document.body.insertBefore(box, document.body.firstChild);
  }

  function sticker(category, size) {
    var emoji = window.CATEGORIES[category] || "🍽️";
    return '<span class="sticker' + (size ? " sticker--" + size : "") + '" aria-hidden="true">' + emoji + "</span>";
  }

  function priceStamp(price) {
    return '<span class="price-stamp" title="一人約 ' + esc(window.PRICES[price] || "") + '">' + esc(price) + "</span>";
  }

  function statusBadge(status) {
    var cls = status === "吃過" ? "status status--ate" : "status status--want";
    return '<span class="' + cls + '">' + esc(status) + "</span>";
  }

  function mapsLink(shop) {
    return "https://www.google.com/maps/search/?api=1&query=" + shop.lat + "," + shop.lng;
  }

  // 地圖上的貼紙圖釘
  function pinIcon(shop) {
    return window.L.divIcon({
      className: "pin",
      html: '<span class="pin__face"><span>' + (window.CATEGORIES[shop.category] || "🍽️") + "</span></span>",
      iconSize: [40, 40],
      iconAnchor: [20, 38],
      popupAnchor: [0, -34]
    });
  }

  function addTiles(map) {
    window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
  }

  window.Food = {
    esc: esc, validate: validate, showProblems: showProblems, sticker: sticker,
    priceStamp: priceStamp, statusBadge: statusBadge, mapsLink: mapsLink, pinIcon: pinIcon, addTiles: addTiles
  };
})();
