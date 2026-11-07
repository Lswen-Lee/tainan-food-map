// 首頁：依 data/shops.js 產生篩選列、卡片與地圖標記。不需要手動修改。
(function () {
  var F = window.Food;
  var SITE = window.SITE;
  var SHOPS = window.SHOPS || [];

  F.showProblems(F.validate(SHOPS));

  // ---- 網站標題 ----
  document.title = SITE.title + "｜" + SITE.area + "美食地圖";
  document.querySelector("[data-site=title]").textContent = SITE.title;
  document.querySelector("[data-site=subtitle]").textContent = SITE.subtitle;
  document.querySelector("[data-site=area]").textContent = SITE.area;
  document.querySelector("[data-site=author]").textContent = SITE.author;

  // ---- 篩選狀態 ----
  var state = { status: "全部", category: "全部", price: "全部", tags: [] };

  function matches(s) {
    if (state.status !== "全部" && s.status !== state.status) return false;
    if (state.category !== "全部" && s.category !== state.category) return false;
    if (state.price !== "全部" && s.price !== state.price) return false;
    for (var i = 0; i < state.tags.length; i++) {
      if ((s.tags || []).indexOf(state.tags[i]) === -1) return false;
    }
    return true;
  }

  // ---- 篩選按鈕（只列出資料中真的有用到的值）----
  function countBy(getter) {
    var c = {};
    SHOPS.forEach(function (s) {
      [].concat(getter(s)).forEach(function (v) { c[v] = (c[v] || 0) + 1; });
    });
    return c;
  }

  function chip(group, value, label, pressed) {
    return '<button type="button" class="chip" data-group="' + group + '" data-value="' +
      F.esc(value) + '" aria-pressed="' + pressed + '">' + label + "</button>";
  }

  function renderFilters() {
    var catCount = countBy(function (s) { return s.category; });
    var tagCount = countBy(function (s) { return s.tags || []; });
    var priceCount = countBy(function (s) { return s.price; });
    var statusCount = countBy(function (s) { return s.status; });

    var statuses = chip("status", "全部", "都看看", state.status === "全部");
    window.STATUSES.forEach(function (st) {
      statuses += chip("status", st, st + " <small>" + (statusCount[st] || 0) + "</small>", state.status === st);
    });

    var cats = chip("category", "全部", "全部 <small>" + SHOPS.length + "</small>", state.category === "全部");
    Object.keys(window.CATEGORIES).forEach(function (c) {
      if (catCount[c]) cats += chip("category", c, window.CATEGORIES[c] + " " + c + " <small>" + catCount[c] + "</small>", state.category === c);
    });

    var prices = chip("price", "全部", "不限", state.price === "全部");
    Object.keys(window.PRICES).forEach(function (p) {
      if (priceCount[p]) prices += chip("price", p, p + ' <small>' + window.PRICES[p] + "</small>", state.price === p);
    });

    var tags = "";
    window.TAGS.forEach(function (t) {
      if (tagCount[t]) tags += chip("tag", t, "#" + t, state.tags.indexOf(t) !== -1);
    });

    document.getElementById("filter-status").innerHTML = statuses;
    document.getElementById("filter-category").innerHTML = cats;
    document.getElementById("filter-price").innerHTML = prices;
    document.getElementById("filter-tags").innerHTML = tags || '<span class="muted">（還沒有標籤）</span>';
  }

  document.querySelector(".filters").addEventListener("click", function (e) {
    var btn = e.target.closest(".chip");
    if (!btn) return;
    var group = btn.dataset.group, value = btn.dataset.value;
    if (group === "tag") {
      var i = state.tags.indexOf(value);
      if (i === -1) state.tags.push(value); else state.tags.splice(i, 1);
    } else {
      state[group] = value;
    }
    renderFilters();
    renderCards();
  });

  // ---- 卡片 ----
  function card(s) {
    var photo = s.photo
      ? '<img src="' + F.esc(s.photo) + '" alt="' + F.esc(s.name) + '" loading="lazy">'
      : F.sticker(s.category, "big");
    return '' +
      '<article class="card" id="card-' + s.slug + '">' +
        '<div class="card__photo">' + photo + F.statusBadge(s.status) + "</div>" +
        '<div class="card__body">' +
          '<div class="card__meta">' +
            '<span class="cat-label">' + F.sticker(s.category) + F.esc(s.category) + "</span>" +
            F.priceStamp(s.price) +
          "</div>" +
          '<h3 class="card__name"><a href="shops/' + s.slug + '.html">' + F.esc(s.name) + "</a></h3>" +
          '<p class="card__line">「' + F.esc(s.oneLiner) + "」</p>" +
          '<ul class="must">' + s.must.map(function (m) { return "<li>" + F.esc(m) + "</li>"; }).join("") + "</ul>" +
          '<p class="card__addr">📍 ' + F.esc(s.address) + "</p>" +
          '<p class="tags">' + (s.tags || []).map(function (t) { return "#" + F.esc(t); }).join(" ") + "</p>" +
          '<div class="card__actions">' +
            '<button type="button" class="btn" data-locate="' + s.slug + '">在地圖上看</button>' +
            '<a class="btn btn--ink" href="shops/' + s.slug + '.html">' + (s.status === "吃過" ? "看心得 →" : "看詳情 →") + "</a>" +
          "</div>" +
        "</div>" +
      "</article>";
  }

  function renderCards() {
    var list = SHOPS.filter(matches);
    var grid = document.getElementById("cards");
    grid.innerHTML = list.length
      ? list.map(card).join("")
      : '<p class="empty">沒有符合條件的店，換個條件試試看。</p>';
    document.getElementById("result-count").textContent = "共 " + list.length + " 家";
    Object.keys(markers).forEach(function (slug) {
      var visible = list.some(function (s) { return s.slug === slug; });
      if (visible) markers[slug].addTo(map); else markers[slug].remove();
    });
  }

  // ---- 地圖 ----
  var map = window.L.map("map", { scrollWheelZoom: false }).setView(SITE.center, SITE.zoom);
  F.addTiles(map);
  var markers = {};
  SHOPS.forEach(function (s) {
    if (typeof s.lat !== "number" || typeof s.lng !== "number") return;
    markers[s.slug] = window.L.marker([s.lat, s.lng], { icon: F.pinIcon(s), title: s.name })
      .bindPopup('<strong>' + F.esc(s.name) + '</strong><br>' + F.esc(s.must[0] || "") +
                 '<br><a href="shops/' + s.slug + '.html">' + (s.status === "吃過" ? "看心得 →" : "看詳情 →") + "</a>");
    markers[s.slug].on("click", function () {
      var el = document.getElementById("card-" + s.slug);
      if (el) { el.classList.add("is-flash"); setTimeout(function () { el.classList.remove("is-flash"); }, 1200); }
    });
  });
  var points = SHOPS.filter(function (s) { return markers[s.slug]; }).map(function (s) { return [s.lat, s.lng]; });
  if (points.length > 1) map.fitBounds(points, { padding: [40, 40] });
  else if (points.length === 1) map.setView(points[0], 16);

  document.getElementById("cards").addEventListener("click", function (e) {
    var btn = e.target.closest("[data-locate]");
    if (!btn) return;
    var m = markers[btn.dataset.locate];
    if (!m) return;
    document.getElementById("map").scrollIntoView({ behavior: "smooth", block: "center" });
    map.flyTo(m.getLatLng(), 17, { duration: 0.8 });
    m.openPopup();
  });

  renderFilters();
  renderCards();
})();
