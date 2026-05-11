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
        isin = params.get("isin", [""])[0].upper()
        ticker = ISIN_TICKER.get(isin, isin + ".IR")
        try:
            data = yf.Ticker(ticker)
            precio = data.fast_info["lastPrice"]
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(f'{{"precio": {round(precio, 4)}, "ticker": "{ticker}"}}'.encode())
        except Exception as e:
            self.send_response(500)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(f'{{"error": "{str(e)}"}}'.encode())
