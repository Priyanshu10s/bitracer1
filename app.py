"""
BitTracer - Cryptocurrency Dashboard
Main Flask application entry point.
"""

from flask import Flask
from routes.main import main_bp
from routes.api import api_bp

app = Flask(__name__)
app.secret_key = "bittracer-secret-key-2024"

# Register blueprints
app.register_blueprint(main_bp)
app.register_blueprint(api_bp, url_prefix="/api")


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=3000)
