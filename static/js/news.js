/**
 * news.js — BitTracer Crypto Chronicle
 * Fetches news from Blockchair via the Flask API proxy,
 * then renders + filters articles.
 */

"use strict";

let allNews = [];

document.addEventListener("DOMContentLoaded", () => {
  fetchNews();
});

async function fetchNews() {
  const lang = document.getElementById("lang-filter").value || "en";
  const spinner = document.getElementById("news-spinner");
  const grid = document.getElementById("news-grid");
  const errEl = document.getElementById("news-error");
  const emptyEl = document.getElementById("news-empty");

  spinner.classList.remove("hidden");
  grid.classList.add("hidden");
  errEl.classList.add("hidden");
  emptyEl.classList.add("hidden");

  try {
    const resp = await fetch(`/api/crypto?endpoint=news&currency=${lang}`);
    const data = await resp.json();
    if (data.error) throw new Error(data.error);
    allNews = data.data || [];
    populateTags();
    renderNews(allNews);
  } catch (err) {
    errEl.textContent = "Failed to fetch news: " + err.message;
    errEl.classList.remove("hidden");
  } finally {
    spinner.classList.add("hidden");
  }
}

function onLanguageChange() {
  fetchNews();
}

// Build tag dropdown from all articles
function populateTags() {
  const tagSet = new Set();
  allNews.forEach((item) => {
    (item.tags || "").split(",").forEach((t) => {
      const trimmed = t.trim();
      if (trimmed) tagSet.add(trimmed);
    });
  });

  const select = document.getElementById("tag-filter");
  // Reset to just "All Tags"
  select.innerHTML = '<option value="all_tags">All Tags</option>';
  [...tagSet].sort().forEach((tag) => {
    const opt = document.createElement("option");
    opt.value = tag;
    opt.textContent = tag;
    select.appendChild(opt);
  });
}

function filterNews() {
  const term = document.getElementById("news-search").value.toLowerCase();
  const tag = document.getElementById("tag-filter").value;

  const filtered = allNews.filter((item) => {
    const matchText =
      item.title.toLowerCase().includes(term) ||
      (item.description || "").toLowerCase().includes(term);
    const matchTag =
      tag === "all_tags" ||
      (item.tags || "").toLowerCase().includes(tag.toLowerCase());
    return matchText && matchTag;
  });
  renderNews(filtered);
}

function renderNews(items) {
  const grid = document.getElementById("news-grid");
  const emptyEl = document.getElementById("news-empty");

  if (!items.length) {
    grid.classList.add("hidden");
    emptyEl.classList.remove("hidden");
    return;
  }

  emptyEl.classList.add("hidden");
  grid.innerHTML = items.map((item, i) => newsCard(item, i)).join("");
  grid.classList.remove("hidden");

  // Wire up expand/collapse buttons
  document.querySelectorAll(".toggle-expand").forEach((btn) => {
    btn.addEventListener("click", () => {
      const cardId = btn.dataset.id;
      const body = document.getElementById(`desc-${cardId}`);
      const isExpanded = body.dataset.expanded === "true";
      body.style.maxHeight = isExpanded ? "6rem" : "none";
      body.dataset.expanded = isExpanded ? "false" : "true";
      btn.textContent = isExpanded ? "⌄ Read More" : "⌃ Show Less";
    });
  });
}

function newsCard(item, index) {
  const tags = (item.tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean)
    .map(
      (t) =>
        `<span class="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">${t}</span>`
    )
    .join("");

  const dateStr = item.time
    ? new Date(item.time).toLocaleDateString()
    : "Unknown date";

  return `
    <div class="bg-white/80 dark:bg-slate-900/80 rounded-2xl shadow border
                border-blue-100 dark:border-blue-900 overflow-hidden hover:shadow-lg transition">
      <div class="border-b border-blue-50 dark:border-blue-900 p-4">
        <div class="flex items-start gap-3">
          <div class="p-2 bg-blue-50 dark:bg-blue-900/50 rounded-lg shrink-0 mt-1">📰</div>
          <div>
            <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug">
              ${escHtml(item.title)}
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              <span class="font-medium">${escHtml(item.source || "")}</span>
              ${item.source ? " • " : ""}
              <time>${dateStr}</time>
            </p>
          </div>
        </div>
      </div>

      <div class="p-4 space-y-3">
        <!-- Description with expand/collapse -->
        <div id="desc-${index}"
          style="max-height:6rem;overflow:hidden;transition:max-height 0.3s ease"
          data-expanded="false"
          class="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          ${escHtml(item.description || "No description available.")}
        </div>

        <!-- Tags -->
        <div class="flex flex-wrap gap-2">${tags}</div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-3 border-t border-blue-50 dark:border-blue-900">
          <button data-id="${index}"
            class="toggle-expand text-blue-600 dark:text-blue-400 text-sm hover:underline">
            ⌄ Read More
          </button>
          <a href="${item.link}" target="_blank" rel="noopener noreferrer"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1">
            🔗 View Article
          </a>
        </div>
      </div>
    </div>`;
}

// Simple HTML escape helper
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
