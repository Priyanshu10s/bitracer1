# BitTracer 🪙 — Python Edition

A full-featured cryptocurrency dashboard built with **Python (Flask)**, converted from the original Next.js/TypeScript project. It tracks live coin prices, market data, crypto news, and advanced blockchain features — all powered by the CoinGecko and Blockchair APIs.

---

## Features

| Page | Description |
|---|---|
| **Dashboard** (`/`) | Live crypto list, market-share pie chart, volume bar chart, 30-day price/market cap charts, search & currency filter |
| **Crypto News** (`/news`) | Latest blockchain news with search, language filter, and tag filter |
| **Advanced Features** (`/advanced-features`) | Broadcast transactions, network nodes list, block state changes |
| **General Stats** (`/general-stats`) | Multi-chain statistics from Blockchair |
| **Dashboard Stats** (`/dashboard-stats`) | Block-level detail lookup by block height |

---

## Project Structure

```
cryptotrack-python/
├── app.py                   # Flask entry point
├── config.py                # API keys & configuration
├── requirements.txt         # Python dependencies
├── README.md
├── build_zip.py             # Script to bundle project as ZIP
├── routes/
│   ├── __init__.py
│   ├── main.py              # Page routes (Jinja2 templates)
│   └── api.py               # API proxy routes (CoinGecko + Blockchair)
├── templates/
│   ├── base.html            # Shared layout (Tailwind CDN, Chart.js CDN)
│   ├── index.html           # Dashboard
│   ├── news.html            # News page
│   ├── advanced.html        # Advanced blockchain features
│   ├── general_stats.html   # General multi-chain stats
│   └── dashboard_stats.html # Block-level dashboard stats
└── static/
    ├── css/
    │   └── style.css        # Custom styles
    └── js/
        ├── main.js          # Dashboard logic + Chart.js rendering
        ├── news.js          # News fetch, filter, render
        ├── advanced.js      # Broadcast, nodes, state changes
        ├── general_stats.js # General stats rendering
        └── dashboard_stats.js # Block detail rendering
```

---

## Setup Instructions

### 1. Clone / unzip the project
```bash
unzip cryptotrack-python.zip
cd cryptotrack-python
```

### 2. Create a virtual environment (recommended)
```bash
python -m venv venv

# Activate on macOS/Linux
source venv/bin/activate

# Activate on Windows
venv\Scripts\activate
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure API keys
Open `config.py` and replace the placeholder values with your real API keys:

```python
COINGECKO_API_KEY = "your_coingecko_api_key"
BLOCKCHAIR_API_KEY = "your_blockchair_api_key"
```

- **CoinGecko**: Free key at [coingecko.com/en/api](https://www.coingecko.com/en/api)
- **Blockchair**: Free key at [blockchair.com/api](https://blockchair.com/api)

### 5. Run the application
```bash
python app.py
```

Open your browser at: **http://localhost:3000**

---

## Dependencies

| Package | Version | Purpose |
|---|---|---|
| Flask | 3.0.3 | Web framework & routing |
| requests | 2.32.3 | Server-side API calls (proxy) |
| Werkzeug | 3.0.3 | WSGI utilities (bundled with Flask) |

**Frontend libraries** (loaded via CDN, no install needed):
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Chart.js](https://www.chartjs.org/) — interactive charts

---

## API Key Notes

- The Flask backend acts as a **server-side proxy** for all external APIs, so your keys are never exposed to the browser.
- With a **free CoinGecko key** you get ~30 calls/minute.
- With a **free Blockchair key** you get 1440 calls/day.
- The app gracefully shows error banners when rate limits are hit.

---

## Optional: Enable Login Gate

In `config.py`, set:
```python
ENABLE_LOGIN = True
```

Demo users are defined in the `DEMO_USERS` list in `config.py`. In production, replace with a proper authentication system.

---

## Build ZIP

To package the project for distribution:
```bash
python build_zip.py
```
This creates `cryptotrack-python.zip` in the project root.

---

## Credits

Original project: **BitTracer** by [The Raj](https://github.com/TheRaj71)  
Python conversion: Full-featured Flask port maintaining identical functionality.
