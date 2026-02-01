import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8000
# Ensure we serve from the script's directory
os.chdir(os.path.dirname(os.path.abspath(__file__)))

Handler = http.server.SimpleHTTPRequestHandler

print(f"Starting local server at http://localhost:{PORT}")
print("Press Ctrl+C to stop the server")

# Open the dashboard in the default web browser
webbrowser.open(f"http://localhost:{PORT}/index.html")

try:
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        httpd.serve_forever()
except KeyboardInterrupt:
    print("\nServer stopped.")