"""
API proxy routes for BitTracer.
Acts as a server-side proxy to CoinGecko and Blockchair APIs,
keeping API keys hidden from the client.
"""

import requests
from flask import Blueprint, request, jsonify
from config import (
    COINGECKO_API_KEY,
    BLOCKCHAIR_API_KEY,
    COINGECKO_BASE_URL,
    BLOCKCHAIR_BASE_URL,
    DEMO_USERS,
    ENABLE_LOGIN,
)

api_bp = Blueprint("api", __name__)

# Shared CoinGecko headers
COINGECKO_HEADERS = {"x-cg-demo-api-key": COINGECKO_API_KEY}


# ---------------------------------------------------------------------------
# CoinGecko endpoints
# ---------------------------------------------------------------------------

@api_bp.route("/crypto")
def crypto_proxy():
    """
    Unified proxy for CoinGecko and Blockchair APIs.
    Query params:
        endpoint : markets | trending | chart | news
        currency : usd | eur | gbp | inr  (markets / chart / news)
        id       : coingecko coin id       (chart only)
        days     : number of days          (chart only)
    """
    endpoint = request.args.get("endpoint", "")
    currency = request.args.get("currency", "usd")
    coin_id = request.args.get("id", "")
    days = request.args.get("days", "30")

    try:
        if endpoint == "markets":
            url = (
                f"{COINGECKO_BASE_URL}/coins/markets"
                f"?vs_currency={currency}&order=market_cap_desc"
                f"&per_page=100&page=1&sparkline=false"
            )
            resp = requests.get(url, headers=COINGECKO_HEADERS, timeout=15)
            return jsonify(resp.json())

        elif endpoint == "trending":
            url = f"{COINGECKO_BASE_URL}/search/trending"
            resp = requests.get(url, headers=COINGECKO_HEADERS, timeout=15)
            return jsonify(resp.json())

        elif endpoint == "chart":
            if not coin_id:
                return jsonify({"error": "Missing coin id"}), 400
            url = (
                f"{COINGECKO_BASE_URL}/coins/{coin_id}/market_chart"
                f"?vs_currency={currency}&days={days}"
            )
            resp = requests.get(url, headers=COINGECKO_HEADERS, timeout=15)
            return jsonify(resp.json())

        elif endpoint == "news":
            url = (
                f"{BLOCKCHAIR_BASE_URL}/news"
                f"?q=language({currency})&limit=100&key={BLOCKCHAIR_API_KEY}"
            )
            resp = requests.get(url, timeout=15)
            return jsonify(resp.json())

        else:
            return jsonify({"error": "Invalid endpoint"}), 400

    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out"}), 504
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Blockchair endpoints
# ---------------------------------------------------------------------------

@api_bp.route("/blockchair/stats")
def blockchair_general_stats():
    """Fetch general stats across all chains from Blockchair."""
    try:
        url = f"{BLOCKCHAIR_BASE_URL}/stats?key={BLOCKCHAIR_API_KEY}"
        resp = requests.get(url, timeout=15)
        return jsonify(resp.json())
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": str(exc)}), 500


@api_bp.route("/blockchair/<chain>/block/<block_height>")
def blockchair_block_stats(chain, block_height):
    """Fetch dashboard stats for a specific block on a given chain."""
    try:
        url = (
            f"{BLOCKCHAIR_BASE_URL}/{chain}/dashboards/block/{block_height}"
            f"?key={BLOCKCHAIR_API_KEY}"
        )
        resp = requests.get(url, timeout=15)
        return jsonify(resp.json())
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": str(exc)}), 500


@api_bp.route("/blockchair/<chain>/nodes")
def blockchair_nodes(chain):
    """Fetch network nodes information for a given chain."""
    try:
        url = f"{BLOCKCHAIR_BASE_URL}/{chain}/nodes?key={BLOCKCHAIR_API_KEY}"
        resp = requests.get(url, timeout=15)
        return jsonify(resp.json())
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": str(exc)}), 500


@api_bp.route("/blockchair/<chain>/state-changes/<block_height>")
def blockchair_state_changes(chain, block_height):
    """Fetch state changes for a specific block on a given chain."""
    try:
        url = (
            f"{BLOCKCHAIR_BASE_URL}/{chain}/state/changes/block/{block_height}"
            f"?key={BLOCKCHAIR_API_KEY}"
        )
        resp = requests.get(url, timeout=15)
        return jsonify(resp.json())
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": str(exc)}), 500


@api_bp.route("/blockchair/<chain>/broadcast", methods=["POST"])
def blockchair_broadcast(chain):
    """Broadcast a raw transaction to the network."""
    transaction_hex = request.json.get("data", "")
    if not transaction_hex:
        return jsonify({"error": "Missing transaction hex"}), 400
    try:
        url = f"{BLOCKCHAIR_BASE_URL}/{chain}/push/transaction"
        resp = requests.post(
            url,
            data=f"data={transaction_hex}",
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=15,
        )
        return jsonify(resp.json())
    except requests.exceptions.RequestException as exc:
        return jsonify({"error": str(exc)}), 500


# ---------------------------------------------------------------------------
# Auth endpoint (used only when ENABLE_LOGIN = True)
# ---------------------------------------------------------------------------

@api_bp.route("/login", methods=["POST"])
def login():
    """Simple demo login endpoint."""
    if not ENABLE_LOGIN:
        return jsonify({"success": True, "message": "Login disabled"})

    body = request.get_json(force=True, silent=True) or {}
    user_id = body.get("id", "")
    password = body.get("password", "")

    matched = any(
        u["id"] == user_id and u["password"] == password for u in DEMO_USERS
    )
    if matched:
        return jsonify({"success": True})
    return jsonify({"success": False, "error": "Invalid credentials"}), 401
