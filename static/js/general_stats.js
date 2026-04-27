/**
 * general_stats.js — BitTracer General Blockchain Stats
 * Fetches multi-chain stats from Blockchair and renders summary cards + detail grids.
 */

"use strict";

let allStats = null;

// Stat cards to highlight at the top (key → label)
const HIGHLIGHT_KEYS = [
  ["blocks", "Total Blocks"],
  ["transactions", "Total Transactions"],
  ["outputs", "Total Outputs"],
  ["circulation", "Circulation"],
  ["blockchain_size", "Blockchain Size"],
  ["nodes", "Active Nodes"],
  ["mempool_transactions", "Mempool TXs"],
  ["hashrate_24h", "Hashrate (24h)"],
];

const CHAIN_ICONS = {
  bitcoin: "₿",
  ethereum: "Ξ",
  litecoin: "Ł",
  dogecoin: "Ð",
  dash: "Đ",
  "bitcoin-cash": "₿C",
  "bitcoin-sv": "BSV",
  zcash: "ZEC",
  ecash: "XEC",
  groestlcoin: "GRS",
};

document.addEventListener("DOMContentLoaded", fetchStats);

async function fetchStats() {
  const spinner = document.getElementById("gs-spinner");
  const errEl = document.getElementById("gs-error");
  const summaryCards = document.getElementById("summary-cards");
  const chainDetail = document.getElementById("chain-detail");

  spinner.classList.remove("hidden");
  summaryCards.classList.add("hidden");
  chainDetail.classList.add("hidden");
  errEl.classList.add("hidden");

  try {
    const resp = await fetch("/api/blockchair/stats");
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    allStats = data.data || {};
    renderSummaryCards();
    renderChainDetails();
  } catch (err) {
    errEl.textContent = "Failed to fetch stats: " + err.message;
    errEl.classList.remove("hidden");
  } finally {
    spinner.classList.add("hidden");
  }
}

function renderSummaryCards() {
  const container = document.getElementById("summary-cards");
  const chains = Object.keys(allStats);
  if (!chains.length) return;

  // Use first chain (bitcoin) for summary highlights
  const btcData = allStats["bitcoin"]?.data || {};
  const gradients = [
    "from-blue-500 via-indigo-500 to-violet-500",
    "from-orange-400 via-amber-400 to-yellow-400",
    "from-green-500 via-emerald-500 to-teal-500",
    "from-pink-500 via-rose-500 to-red-500",
    "from-purple-500 via-violet-500 to-indigo-500",
    "from-cyan-500 via-sky-500 to-blue-500",
    "from-teal-500 via-emerald-500 to-green-400",
    "from-amber-500 via-orange-400 to-red-400",
  ];

  container.innerHTML = HIGHLIGHT_KEYS.map(([key, label], i) => {
    const value = btcData[key];
    return `
      <div class="rounded-2xl p-5 text-white bg-gradient-to-br ${gradients[i % gradients.length]} shadow-md">
        <p class="text-xs font-semibold uppercase tracking-wide opacity-80">${label} (BTC)</p>
        <p class="text-2xl font-bold mt-1">${formatNumber(value)}</p>
      </div>`;
  }).join("");

  container.classList.remove("hidden");
}

function renderChainDetails() {
  const filter = document.getElementById("chain-filter").value;
  const container = document.getElementById("chain-detail");

  const chains = filter === "all"
    ? Object.keys(allStats)
    : Object.keys(allStats).filter((c) => c === filter);

  if (!chains.length) {
    container.innerHTML =
      '<p class="text-center text-gray-500 py-10">No data for selected chain.</p>';
    container.classList.remove("hidden");
    return;
  }

  container.innerHTML = chains.map((chain) => chainSection(chain)).join("");
  container.classList.remove("hidden");
}

function chainSection(chain) {
  const chainData = allStats[chain]?.data || {};
  const icon = CHAIN_ICONS[chain] || "🔗";
  const entries = Object.entries(chainData);

  if (!entries.length) return "";

  const cards = entries.map(([key, val]) => `
    <div class="p-4 bg-white/80 dark:bg-slate-800/80 rounded-xl shadow-sm
                hover:shadow-md transition-all duration-200 border border-rose-100
                dark:border-teal-900 break-words">
      <p class="text-xs font-semibold text-rose-600 dark:text-teal-300 uppercase tracking-wide mb-1">
        ${key.replace(/_/g, " ")}
      </p>
      <p class="text-lg font-bold text-slate-800 dark:text-slate-100 break-all">
        ${formatNumber(val)}
      </p>
    </div>`).join("");

  return `
    <div class="mb-10 p-5 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-2xl shadow-xl">
      <h3 class="text-xl font-bold mb-5 bg-clip-text text-transparent
                 bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500">
        ${icon} ${chain.toUpperCase()} Detailed Analytics
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        ${cards}
      </div>
    </div>`;
}
