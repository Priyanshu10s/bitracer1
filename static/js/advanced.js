/**
 * advanced.js — BitTracer Advanced Blockchain Features
 * Handles broadcast transaction, nodes list, and state changes.
 */

"use strict";

let currentFeature = null;

const FEATURE_META = {
  broadcast: {
    title: "Broadcast Transaction",
    descTitle: "What is Transaction Broadcasting?",
    descBody:
      "Broadcasting a transaction sends it to the blockchain network for processing and inclusion in a block.",
  },
  nodes: {
    title: "Nodes List",
    descTitle: "Understanding Node Information",
    descBody:
      "Node information provides insights into the distribution and health of the blockchain network.",
  },
  stateChanges: {
    title: "State Changes",
    descTitle: "Exploring State Changes",
    descBody:
      "State changes show how account balances and smart contract storage are modified in a specific block.",
  },
};

function selectFeature(feature) {
  currentFeature = feature;
  const meta = FEATURE_META[feature];

  // Show the panel
  document.getElementById("feature-panel").classList.remove("hidden");
  document.getElementById("feature-title").textContent = meta.title;
  document.getElementById("feature-desc-title").querySelector("span").textContent =
    meta.descTitle;
  document.getElementById("feature-desc-body").textContent = meta.descBody;

  // Hide all input sections, then show the right one
  ["broadcast-inputs", "state-inputs", "nodes-inputs"].forEach((id) =>
    document.getElementById(id).classList.add("hidden")
  );

  if (feature === "broadcast") {
    document.getElementById("broadcast-inputs").classList.remove("hidden");
  } else if (feature === "stateChanges") {
    document.getElementById("state-inputs").classList.remove("hidden");
  } else if (feature === "nodes") {
    document.getElementById("nodes-inputs").classList.remove("hidden");
  }

  // Clear previous result
  document.getElementById("result-panel").classList.add("hidden");
  document.getElementById("result-json").textContent = "";
  document.getElementById("adv-spinner").classList.add("hidden");

  // Scroll into view
  document.getElementById("feature-panel").scrollIntoView({ behavior: "smooth" });
}

function getChain() {
  return document.getElementById("chain-select").value;
}

function showAdvSpinner() {
  document.getElementById("adv-spinner").classList.remove("hidden");
  document.getElementById("result-panel").classList.add("hidden");
}

function hideAdvSpinner() {
  document.getElementById("adv-spinner").classList.add("hidden");
}

function showResult(data) {
  hideAdvSpinner();
  document.getElementById("result-json").textContent = JSON.stringify(data, null, 2);
  document.getElementById("result-panel").classList.remove("hidden");
}

// ── Broadcast Transaction ─────────────────────────────────────────────────
async function doBroadcast() {
  const chain = getChain();
  const hex = document.getElementById("tx-hex").value.trim();
  if (!hex) {
    alert("Please enter a transaction hex.");
    return;
  }

  showAdvSpinner();
  try {
    const resp = await fetch(`/api/blockchair/${chain}/broadcast`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: hex }),
    });
    const data = await resp.json();
    showResult(data);
  } catch (err) {
    showResult({ error: "Error broadcasting transaction: " + err.message });
  }
}

// ── Nodes List ────────────────────────────────────────────────────────────
async function doNodes() {
  const chain = getChain();
  showAdvSpinner();
  try {
    const resp = await fetch(`/api/blockchair/${chain}/nodes`);
    const data = await resp.json();
    showResult(data.data || data);
  } catch (err) {
    showResult({ error: "Error fetching nodes data: " + err.message });
  }
}

// ── State Changes ─────────────────────────────────────────────────────────
async function doStateChanges() {
  const chain = getChain();
  const height = document.getElementById("block-height-state").value.trim();
  if (!height) {
    alert("Please enter a block height.");
    return;
  }

  showAdvSpinner();
  try {
    const resp = await fetch(`/api/blockchair/${chain}/state-changes/${height}`);
    const data = await resp.json();
    showResult(data.data || data);
  } catch (err) {
    showResult({ error: "Error fetching state changes: " + err.message });
  }
}
