import json
import yfinance as yf
from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

ISIN_TICKER = {
    "IE00B03HD191": "IE00B03HD191.IR",
    "IE00B18GC888": "IE00B18GC888.IR",
    "IE00BFZMJT78": "IE00BFZMJT78.IR",
    "IE000QAZP7L2": "IE000QAZP7L2.IR",
    "ES0141116030": "ES0141116030.MC",
    "FR0000447823": "FR0000447823.PA",
}

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        params = parse_qs(urlparse(self.path).query)
        isin = params.get("isin", [""])[0].upper().strip()
        
        if not isin:
            self._respond(400, {"error": "ISIN requerido"})
            return

        ticker = ISIN_TICKER.get(isin, isin + ".IR")
        
        try:
            t = yf.Ticker(ticker)
            info = t.fast_info
            precio = info.get("lastPrice") or info.get("regularMarketPrice")
            if not precio:
                hist = t.history(period="5d")
                if hist.empty:
                    raise Exception(f"Sin datos para {ticker}")
                precio = float(hist["Close"].dropna().iloc[-1])
            self._respond(200, {"precio": round(float(precio), 4), "ticker": ticker, "isin": isin})
        except Exception as e:
            self._respond(500, {"error": str(e), "ticker": ticker, "isin": isin})

    def _respond(self, code, body):
        self.send_response(code)
        self.send_header("Content-type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(json.dumps(body).encode())
