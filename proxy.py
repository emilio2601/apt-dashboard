from http.server import HTTPServer, BaseHTTPRequestHandler
from sys import argv
import requests

BIND_HOST = 'localhost'
PORT = 8008


class SimpleHTTPRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        r = requests.get(f"https://bustime.mta.info/api/2/siri/stop-monitoring.json?key={os.environ.get("MTA_BUS_API_KEY")}6&OperatorRef=MTA%20NYCT&MonitoringRef=MTA_402039&LineRef=MTA%20NYCT_M14D%2B")
        self.write_response(r.content)

    def write_response(self, content):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')  
        self.end_headers()
        self.wfile.write(content)

        print(self.headers)


print(f'Listening on http://{BIND_HOST}:{PORT}\n')

httpd = HTTPServer((BIND_HOST, PORT), SimpleHTTPRequestHandler)
httpd.serve_forever()