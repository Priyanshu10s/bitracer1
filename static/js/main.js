/**
 * main.js — BitTracer Dashboard
 * Handles crypto list, charts, coin detail panel, search, tabs, login.
 */

"use strict";

// ── State ─────────────────────────────────────────────────────────────────
let cryptoList = [];
let trendingList = [];
let selectedCrypto = null;
let currentCurrency = "usd";
let activeTab = "all";
let priceChangeChart = null;
let priceMcapChart = null;
let volDistChart = null;
let marketShareChart = null;
let volumeChart = null;
const CHART_COLORS = [
  "#a855f7", "#ec4899", "#3b82f6", "#10b981", "#f59e0b",
  "#ef4444", "#6366f1", "#14b8a6",
];

// ── Boot ──────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const loginModal = document.getElementById("login-modal");
  if (loginModal) {
    // ENABLE_LOGIN mode — check session storage for auth
    const auth = sessionStorage.getItem("isAuthenticated");
    if (auth === "true") {
      loginModal.classList.add("hidden");
      boot();
    }
    // otherwise the modal stays visible — user must log in
  } else {
    // Login is disabled; go straight to data fetch
    boot();
  }
});

function boot() {
  currentCurrency = document.getElementById("currency-select").value || "usd";
  fetchCryptoList();
  fetchTrending();
}

// ── Login ─────────────────────────────────────────────────────────────────
async function handleLogin() {
  const id = document.getElementById("login-user").value;
  const password = document.getElementById("login-pass").value;
  const errEl = document.getElementById("login-error");

  try {
    const resp = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, password }),
    });
    const data = await resp.json();
    if (data.success) {
      sessionStorage.setItem("isAuthenticated", "true");
      document.getElementById("login-modal")?.classList.add("hidden");
      boot();
    } else {
      errEl.textContent = data.error || "Invalid credentials";
      errEl.classList.remove("hidden");
    }
  } catch {
    errEl.textContent = "Login failed. Please try again.";
    errEl.classList.remove("hidden");
  }
}

function handleLogout() {
  sessionStorage.removeItem("isAuthenticated");
  const loginModal = document.getElementById("login-modal");
  if (loginModal) {
    loginModal.classList.remove("hidden");
  }
  cryptoList = [];
  trendingList = [];
  selectedCrypto = null;
  document.getElementById("all-grid").innerHTML = "";
  document.getElementById("trending-grid").innerHTML = "";
  document.getElementById("detail-panel").classList.add("hidden");
  document.getElementById("crypto-section").classList.add("hidden");
}

// ── Navigation ────────────────────────────────────────────────────────────
function handleNavigation(value) {
  if (value) window.location.href = value;
}

// ── Data fetching ─────────────────────────────────────────────────────────
async function fetchCryptoList() {
  showSpinner("global-spinner");
  document.getElementById("crypto-section").classList.add("hidden");
  try {
    const resp = await fetch(`/api/crypto?endpoint=markets&currency=${currentCurrency}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    cryptoList = data;
    renderAllGrid();
    renderSummaryCharts();
  } catch (err) {
    showError("Failed to fetch cryptocurrency list: " + err.message);
  } finally {
    hideSpinner("global-spinner");
    document.getElementById("crypto-section").classList.remove("hidden");
  }
}

async function fetchTrending() {
  try {
    const resp = await fetch("/api/crypto?endpoint=trending");
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    trendingList = data.coins || [];
    renderTrendingGrid();
  } catch (err) {
    showError("Failed to fetch trending data: " + err.message);
  }
}

async function fetchChartData(coinId) {
  try {
    const resp = await fetch(
      `/api/crypto?endpoint=chart&id=${coinId}&currency=${currentCurrency}&days=30`
    );
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    return data;
  } catch (err) {
    showError("Failed to fetch chart data: " + err.message);
    return null;
  }
}

// ── UI refresh ────────────────────────────────────────────────────────────
function handleRefresh() {
  fetchCryptoList();
  fetchTrending();
  if (selectedCrypto) loadCoinDetail(selectedCrypto);
}

function onCurrencyChange() {
  currentCurrency = document.getElementById("currency-select").value;
  fetchCryptoList();
  if (selectedCrypto) loadCoinDetail(selectedCrypto);
}

// ── Coin grid rendering ───────────────────────────────────────────────────
function filterCryptoList() {
  const term = document.getElementById("search-input").value.toLowerCase();
  const filtered = cryptoList.filter(
    (c) =>
      c.name.toLowerCase().includes(term) ||
      c.symbol.toLowerCase().includes(term)
  );
  renderAllGrid(filtered);
}

function renderAllGrid(list) {
  const grid = document.getElementById("all-grid");
  const coins = list !== undefined ? list : cryptoList;
  grid.innerHTML = coins.map((c) => coinCard(c)).join("");
}

function renderTrendingGrid() {
  const grid = document.getElementById("trending-grid");
  grid.innerHTML = trendingList
    .map(({ item }) => trendingCard(item))
    .join("");
}

function coinCard(c) {
  const change = c.price_change_percentage_24h;
  const sign = change >= 0 ? "▲" : "▼";
  const color = change >= 0 ? "text-green-500" : "text-red-500";
  return `
    <div onclick="loadCoinDetail(${JSON.stringify(c).replace(/"/g, "&quot;")})"
      class="cursor-pointer bg-white dark:bg-gray-800 rounded-2xl shadow p-4
             hover:shadow-lg hover:scale-[1.02] transition-all duration-200
             border border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-2 mb-2">
        <img src="${c.image}" alt="${c.name}" class="w-8 h-8" />
        <span class="font-bold text-base">${c.name}</span>
      </div>
      <p class="text-sm text-gray-500 uppercase font-medium">${c.symbol}</p>
      <p class="text-xl font-bold mt-1">${formatCurrency(c.current_price, currentCurrency)}</p>
      <p class="text-sm font-semibold ${color}">
        ${sign} ${Math.abs(change).toFixed(2)}%
      </p>
    </div>`;
}

function trendingCard(item) {
  return `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow p-4
                border border-gray-100 dark:border-gray-700">
      <div class="flex items-center gap-2 mb-2">
        <img src="${item.small}" alt="${item.name}" class="w-8 h-8" />
        <span class="font-bold">${item.name}</span>
      </div>
      <p class="text-sm uppercase font-medium text-gray-500">${item.symbol}</p>
      <p class="font-bold mt-1">Rank #${item.market_cap_rank}</p>
      <p class="text-sm">Price (BTC): ${item.price_btc.toFixed(8)}</p>
    </div>`;
}

// ── Tabs ──────────────────────────────────────────────────────────────────
function switchTab(tab) {
  activeTab = tab;
  const allGrid = document.getElementById("all-grid");
  const trendingGrid = document.getElementById("trending-grid");
  const tabAll = document.getElementById("tab-all");
  const tabTrending = document.getElementById("tab-trending");

  if (tab === "all") {
    allGrid.classList.remove("hidden");
    trendingGrid.classList.add("hidden");
    tabAll.classList.add("bg-blue-500", "text-white");
    tabAll.classList.remove("bg-white", "dark:bg-gray-800", "text-gray-600");
    tabTrending.classList.remove("bg-blue-500", "text-white");
    tabTrending.classList.add("bg-white", "dark:bg-gray-800", "text-gray-600");
  } else {
    trendingGrid.classList.remove("hidden");
    allGrid.classList.add("hidden");
    tabTrending.classList.add("bg-blue-500", "text-white");
    tabTrending.classList.remove("bg-white", "dark:bg-gray-800", "text-gray-600");
    tabAll.classList.remove("bg-blue-500", "text-white");
    tabAll.classList.add("bg-white", "dark:bg-gray-800", "text-gray-600");
  }
}

// ── Coin detail panel ─────────────────────────────────────────────────────
async function loadCoinDetail(coin) {
  // Support both object and stringified JSON
  if (typeof coin === "string") {
    try { coin = JSON.parse(coin); } catch { return; }
  }
  selectedCrypto = coin;

  const panel = document.getElementById("detail-panel");
  panel.classList.remove("hidden");
  panel.scrollIntoView({ behavior: "smooth" });

  // Populate header
  document.getElementById("detail-img").src = coin.image;
  document.getElementById("detail-img").alt = coin.name;
  document.getElementById("detail-title").textContent =
    `${coin.name} (${coin.symbol.toUpperCase()}) Details`;

  // Price info
  const chg = coin.price_change_percentage_24h;
  const chgColor = chg >= 0 ? "text-green-500" : "text-red-500";
  document.getElementById("d-price").innerHTML =
    `<strong>Current Price:</strong> ${formatCurrency(coin.current_price, currentCurrency)}`;
  document.getElementById("d-change").innerHTML =
    `<strong>24h Change:</strong> <span class="${chgColor}">${chg.toFixed(2)}%</span>`;
  document.getElementById("d-ath").innerHTML =
    `<strong>All-Time High:</strong> ${formatCurrency(coin.ath, currentCurrency)}`;
  document.getElementById("d-atl").innerHTML =
    `<strong>All-Time Low:</strong> ${formatCurrency(coin.atl, currentCurrency)}`;

  // Market info
  document.getElementById("d-mcap").innerHTML =
    `<strong>Market Cap:</strong> ${formatCurrency(coin.market_cap, currentCurrency)}`;
  document.getElementById("d-vol").innerHTML =
    `<strong>24h Volume:</strong> ${formatCurrency(coin.total_volume, currentCurrency)}`;
  document.getElementById("d-circ").innerHTML =
    `<strong>Circulating Supply:</strong> ${(coin.circulating_supply || 0).toLocaleString()} ${coin.symbol.toUpperCase()}`;
  document.getElementById("d-total").innerHTML =
    `<strong>Total Supply:</strong> ${coin.total_supply ? coin.total_supply.toLocaleString() : "N/A"} ${coin.symbol.toUpperCase()}`;
  document.getElementById("d-max").innerHTML =
    `<strong>Max Supply:</strong> ${coin.max_supply ? coin.max_supply.toLocaleString() : "N/A"} ${coin.symbol.toUpperCase()}`;

  // Fetch & render charts
  const chartData = await fetchChartData(coin.id);
  if (!chartData) return;

  const formatted = chartData.prices.map(([ts, price], i) => ({
    date: new Date(ts).toISOString().split("T")[0],
    price,
    marketCap: chartData.market_caps[i][1],
    priceChange:
      i > 0
        ? ((price - chartData.prices[i - 1][1]) / chartData.prices[i - 1][1]) * 100
        : 0,
  }));

  const labels = formatted.map((d) => d.date);

  // Price change line chart
  renderLineChart(
    "price-change-chart",
    labels,
    formatted.map((d) => d.priceChange.toFixed(3)),
    "Price Change (%)",
    "#a855f7",
    priceChangeChart,
    (c) => { priceChangeChart = c; }
  );

  // Price + MarketCap dual-axis chart
  renderDualChart(
    "price-mcap-chart",
    labels,
    formatted.map((d) => d.price),
    formatted.map((d) => d.marketCap),
    currentCurrency,
    priceMcapChart,
    (c) => { priceMcapChart = c; }
  );

  // Volume distribution bar
  const volumes = chartData.total_volumes;
  const vol24h = volumes[volumes.length - 1][1];
  const vol7d = volumes.slice(-7).reduce((s, [, v]) => s + v, 0);
  const vol30d = volumes.reduce((s, [, v]) => s + v, 0);

  renderBarChart(
    "vol-dist-chart",
    ["24h", "7d", "30d"],
    [vol24h, vol7d, vol30d],
    "Volume",
    ["#a855f7", "#3b82f6", "#10b981"],
    volDistChart,
    (c) => { volDistChart = c; }
  );
}

// ── Summary charts (market share + volume) ────────────────────────────────
function renderSummaryCharts() {
  const top5 = cryptoList.slice(0, 5);
  const names = top5.map((c) => c.name);
  const colors = top5.map((_, i) => CHART_COLORS[i % CHART_COLORS.length]);

  // Market share pie
  if (marketShareChart) marketShareChart.destroy();
  const mCtx = document.getElementById("market-share-chart").getContext("2d");
  marketShareChart = new Chart(mCtx, {
    type: "doughnut",
    data: {
      labels: names,
      datasets: [{
        data: top5.map((c) => c.market_cap),
        backgroundColor: colors,
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom" } },
    },
  });

  // Volume bar
  if (volumeChart) volumeChart.destroy();
  const vCtx = document.getElementById("volume-chart").getContext("2d");
  volumeChart = new Chart(vCtx, {
    type: "bar",
    data: {
      labels: names,
      datasets: [{
        label: "24h Volume",
        data: top5.map((c) => c.total_volume),
        backgroundColor: colors,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: (v) => abbreviate(v) } } },
    },
  });
}

// ── Chart helpers ─────────────────────────────────────────────────────────
function renderLineChart(id, labels, data, label, color, existing, setter) {
  if (existing) existing.destroy();
  const ctx = document.getElementById(id).getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label,
        data,
        borderColor: color,
        backgroundColor: color + "33",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { x: { ticks: { maxTicksLimit: 6 } } },
    },
  });
  setter(chart);
}

function renderDualChart(id, labels, priceData, mcapData, currency, existing, setter) {
  if (existing) existing.destroy();
  const ctx = document.getElementById(id).getContext("2d");
  const chart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Price",
          data: priceData,
          borderColor: "#a855f7",
          backgroundColor: "transparent",
          yAxisID: "y",
          tension: 0.3,
          pointRadius: 0,
        },
        {
          label: "Market Cap",
          data: mcapData,
          borderColor: "#3b82f6",
          backgroundColor: "transparent",
          yAxisID: "y1",
          tension: 0.3,
          pointRadius: 0,
        },
      ],
    },
    options: {
      responsive: true,
      scales: {
        x: { ticks: { maxTicksLimit: 6 } },
        y: {
          position: "left",
          ticks: { callback: (v) => abbreviate(v) },
        },
        y1: {
          position: "right",
          grid: { drawOnChartArea: false },
          ticks: { callback: (v) => abbreviate(v) },
        },
      },
    },
  });
  setter(chart);
}

function renderBarChart(id, labels, data, label, colors, existing, setter) {
  if (existing) existing.destroy();
  const ctx = document.getElementById(id).getContext("2d");
  const chart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label,
        data,
        backgroundColor: colors,
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { ticks: { callback: (v) => abbreviate(v) } } },
    },
  });
  setter(chart);
}

// ── Utilities ─────────────────────────────────────────────────────────────
function abbreviate(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + "T";
  if (n >= 1e9) return (n / 1e9).toFixed(1) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(1) + "M";
  if (n >= 1e3) return (n / 1e3).toFixed(1) + "K";
  return n;
}
