"""
Configuration file for BitTracer.
Replace the placeholder values with your real API keys.
"""

# CoinGecko API key (get yours at https://www.coingecko.com/en/api)
COINGECKO_API_KEY = "CG-5V6eEgDLfWQ4f8XXH9XEhpVc"

# Blockchair API key (get yours at https://blockchair.com/api)
BLOCKCHAIR_API_KEY = "G___HjUi7D7DsjDjqWa2huOHJPo7UXS2"

# CoinGecko base URL
COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3"

# Blockchair base URL
BLOCKCHAIR_BASE_URL = "https://api.blockchair.com"

# Feature flags
ENABLE_LOGIN = False  # Set True to enable login gate

# Hardcoded demo users (only active when ENABLE_LOGIN = True)
DEMO_USERS = [
    {"id": "user1", "password": "pass1"},
    {"id": "user2", "password": "pass2"},
    {"id": "user3", "password": "pass3"},
]

# Supported fiat currencies
CURRENCIES = [
    {"label": "USD", "value": "usd"},
    {"label": "EUR", "value": "eur"},
    {"label": "GBP", "value": "gbp"},
    {"label": "INR", "value": "inr"},
]

# Supported news languages
NEWS_LANGUAGES = [
    {"label": "English", "value": "en"},
    {"label": "Spanish", "value": "es"},
    {"label": "French", "value": "fr"},
    {"label": "German", "value": "de"},
    {"label": "Italian", "value": "it"},
    {"label": "Portuguese", "value": "pt"},
    {"label": "Russian", "value": "ru"},
    {"label": "Chinese", "value": "zh"},
]

# Supported blockchains for advanced features
SUPPORTED_CHAINS = [
    {"label": "Bitcoin", "value": "bitcoin"},
    {"label": "Bitcoin Cash", "value": "bitcoin-cash"},
    {"label": "Litecoin", "value": "litecoin"},
    {"label": "Bitcoin SV", "value": "bitcoin-sv"},
    {"label": "Dogecoin", "value": "dogecoin"},
    {"label": "Dash", "value": "dash"},
    {"label": "Groestlcoin", "value": "groestlcoin"},
    {"label": "Zcash", "value": "zcash"},
    {"label": "eCash", "value": "ecash"},
    {"label": "Bitcoin Testnet", "value": "bitcoin/testnet"},
]
