// 店家詳細頁：依 <body data-slug="…"> 從 data/shops.js 帶入「自動」區塊。不需要手動修改。
(function () {
  var F = window.Food;
  var slug = document.body.dataset.slug;
  var shop = (window.SHOPS || []).filter(function (s) { return s.slug === slug; })[0];

  if (!shop) {
    F.showProblems(["找不到 slug 為「" + slug + "」的店家。請確認 data/shops.js 有這筆資料，且 <body data-slug> 拼寫一致（CLAUDE.md §7）。"]);
    return;
  }
  F.showProblems(F.validate([shop]));

  function fill(name, html) {
    var el = document.querySelector('[data-auto="' + name + '"]');
    if (el) el.innerHTML = html;
  }

  document.title = shop.name + "｜" + window.SITE.title;
  fill("name", F.esc(shop.name));
  fill("badges",
    '<span class="cat-label">' + F.sticker(shop.category) + F.esc(shop.category) + "</span>" +
    F.priceStamp(shop.price) + F.statusBadge(shop.status) +
    '<span class="muted">一人約 ' + F.esc(window.PRICES[shop.price]) + "</span>");
  fill("oneLiner", F.esc(shop.oneLiner));
  fill("hero", shop.photo
    ? '<img src="../' + F.esc(shop.photo) + '" alt="' + F.esc(shop.name) + '">'
    : F.sticker(shop.category, "huge"));
  fill("info",
    "<tr><th>地址</th><td>" + F.esc(shop.address) + "</td></tr>" +
    "<tr><th>營業時間</th><td>" + F.esc(shop.hours) + "</td></tr>" +
    "<tr><th>必點</th><td>" + shop.must.map(F.esc).join("、") + "</td></tr>" +
    "<tr><th>標籤</th><td class=\"tags\">" + ((shop.tags || []).map(function (t) { return "#" + F.esc(t); }).join(" ") || "—") + "</td></tr>" +
    "<tr><th>狀態</th><td>" + (shop.status === "吃過" ? "吃過（" + F.esc(shop.visited) + "）" : "想吃，還沒去") + "</td></tr>");

  // 資料來源（有 sources 才顯示）
  var sourcesBox = document.querySelector('[data-auto="sources"]');
  if (sourcesBox) {
    if (shop.sources && shop.sources.length) {
      sourcesBox.innerHTML = "<h2>資料來源</h2>" +
        '<p class="muted">以下資訊於 ' + F.esc(shop.checked || "（未註明）") +
        " 上網查證整理，營業時間與價格可能變動，請以店家公告為準。</p>" +
        '<ol class="sources">' + shop.sources.map(function (u) {
          var host = u;
          try { host = new URL(u).hostname.replace(/^www\./, ""); } catch (e) {}
          return '<li><a href="' + F.esc(u) + '" target="_blank" rel="noopener">' + F.esc(host) + "</a></li>";
        }).join("") + "</ol>";
    } else {
      sourcesBox.remove();
    }
  }
  fill("mapLink", '<a class="btn btn--ink" href="' + F.mapsLink(shop) + '" target="_blank" rel="noopener">在 Google 地圖開啟 ↗</a>');
  fill("footer", F.esc(window.SITE.title) + " · " + F.esc(window.SITE.author));

  var map = window.L.map("mini-map", { scrollWheelZoom: false, zoomControl: true })
    .setView([shop.lat, shop.lng], 17);
  F.addTiles(map);
  window.L.marker([shop.lat, shop.lng], { icon: F.pinIcon(shop), title: shop.name }).addTo(map);
})();
