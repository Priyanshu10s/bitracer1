/**
 * dashboard_stats.js — BitTracer Block Dashboard Stats
 * Fetches block-level data from Blockchair and renders detail cards.
 */

"use strict";

let currentBlockStats = null;

const BLOCK_EMOJIS = ["🪙", "💸", "🔄", "💰", "📊", "🏊", "📈", "🌐", "💹"];

function randomEmoji() {
  return BLOCK_EMOJIS[Math.floor(Math.random() * BLOCK_EMOJIS.length)];
}

async function fetchBlockStats() {
  const chain = document.getElementById("chain-select").value;
  const height = document.getElementById("block-height").value.trim();

  if (!height) {
    alert("Please enter a block height.");
    return;
  }

  const spinner = document.getElementById("ds-spinner");
  const errEl = document.getElementById("ds-error");
  const cardsEl = document.getElementById("block-cards");
  const detailEl = document.getElementById("block-detail");

  spinner.classList.remove("hidden");
  errEl.classList.add("hidden");
  cardsEl.innerHTML = "";
  detailEl.classList.add("hidden");

  try {
    const resp = await fetch(`/api/blockchair/${encodeURIComponent(chain)}/block/${height}`);
    const data = await resp.json();

    if (data.error) throw new Error(data.error);
    if (!data.data) throw new Error("No block data returned.");

    currentBlockStats = data.data;
    renderBlockCards(currentBlockStats);
  } catch (err) {
    errEl.textContent = "Failed to fetch stats: " + err.message;
    errEl.classList.remove("hidden");
  } finally {
    spinner.classList.add("hidden");
  }
}

function renderBlockCards(stats) {
  const container = document.getElementById("block-cards");
  const keys = Object.keys(stats);

  container.innerHTML = keys.map((blockKey) => {
    const block = stats[blockKey]?.block || {};
    return `
      <div class="bg-white dark:bg-gray-800 rounded-2xl shadow border
                  border-indigo-100 dark:border-indigo-900 hover:shadow-lg
                  transition-all duration-200">
        <div class="p-4 bg-gradient-to-r from-blue-50 to-indigo-50
                    dark:from-blue-900/30 dark:to-indigo-900/30 rounded-t-2xl">
          <h3 class="font-bold text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
            <span class="text-xl">${randomEmoji()}</span>
            Block ${blockKey}
          </h3>
        </div>
        <div class="p-4 space-y-2">
          <div>
            <p class="text-xs text-gray-500 font-medium">Hash</p>
            <p class="text-xs font-mono break-all">${block.hash || "N/A"}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium">Time</p>
            <p class="text-sm font-semibold">${block.time || "N/A"}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium">Transactions</p>
            <p class="text-sm font-semibold">${formatNumber(block.transaction_count)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500 font-medium">Size</p>
            <p class="text-sm font-semibold">${formatNumber(block.size)} bytes</p>
          </div>
        </div>
        <div class="p-3 pt-0">
          <button onclick='showBlockDetail("${blockKey}")'
            class="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white
                   rounded-xl text-sm font-semibold hover:from-blue-600 hover:to-indigo-700
                   active:scale-95 transition-all duration-200">
            View Details
          </button>
        </div>
      </div>`;
  }).join("");
}

function showBlockDetail(blockKey) {
  if (!currentBlockStats || !currentBlockStats[blockKey]) return;

  const block = currentBlockStats[blockKey].block || {};
  const detailEl = document.getElementById("block-detail");
  const gridEl = document.getElementById("block-detail-grid");

  gridEl.innerHTML = Object.entries(block).map(([key, val]) => `
    <div class="bg-white dark:bg-indigo-900/20 p-4 rounded-xl shadow-sm hover:shadow-md transition">
      <h4 class="text-xs font-bold text-indigo-600 dark:text-indigo-300 uppercase tracking-wide mb-1">
        ${key.replace(/_/g, " ")}
      </h4>
      <p class="text-sm text-gray-800 dark:text-gray-200 break-all font-mono">
        ${formatNumber(val)}
      </p>
    </div>`).join("");

  detailEl.classList.remove("hidden");
  detailEl.scrollIntoView({ behavior: "smooth" });
}

function closeDetail() {
  document.getElementById("block-detail").classList.add("hidden");
}
