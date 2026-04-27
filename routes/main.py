"""
Main page routes for BitTracer.
Serves all HTML pages via Jinja2 templates.
"""

from flask import Blueprint, render_template
from config import CURRENCIES, NEWS_LANGUAGES, SUPPORTED_CHAINS, ENABLE_LOGIN

main_bp = Blueprint("main", __name__)


@main_bp.route("/")
def index():
    """Dashboard / home page."""
    return render_template(
        "index.html",
        currencies=CURRENCIES,
        enable_login=ENABLE_LOGIN,
    )


@main_bp.route("/news")
def news():
    """Crypto news page."""
    return render_template(
        "news.html",
        languages=NEWS_LANGUAGES,
    )


@main_bp.route("/advanced-features")
def advanced_features():
    """Advanced blockchain features page."""
    return render_template(
        "advanced.html",
        chains=SUPPORTED_CHAINS,
    )


@main_bp.route("/general-stats")
def general_stats():
    """General multi-chain blockchain stats page."""
    return render_template(
        "general_stats.html",
        chains=SUPPORTED_CHAINS,
    )


@main_bp.route("/dashboard-stats")
def dashboard_stats():
    """Block-level dashboard stats page."""
    return render_template(
        "dashboard_stats.html",
        chains=SUPPORTED_CHAINS,
    )
