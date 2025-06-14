#!/usr/bin/env python3
"""
Simple HTTP server for frontend development
Serves static files from the current directory
Run with: python start-server.py [port]
"""

import http.server
import socketserver
import webbrowser
import os
import sys
from pathlib import Path

# Configuration
DEFAULT_PORT = 8000
HOST = 'localhost'

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # If path is '/', redirect to views/index.html
        if self.path == '/':
            self.send_response(302)
            self.send_header('Location', '/views/index.html')
            self.end_headers()
            return
        
        return super().do_GET()

def start_server():
    # Get port from command line argument or use default
    port = DEFAULT_PORT
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ Invalid port number. Using default port 8000.")
            port = DEFAULT_PORT
    
    print(f"🚀 Starting Cevehak Frontend Server...")
    print(f"📍 Host: {HOST}")
    print(f"🔌 Port: {port}")
    print(f"📂 Serving from: {os.getcwd()}")
    
    # Create server
    with socketserver.TCPServer((HOST, port), MyHTTPRequestHandler) as httpd:
        server_url = f"http://{HOST}:{port}"
        print(f"\n✅ Server running at: {server_url}")
        print(f"🌐 Opening browser automatically...")
        print(f"🛑 Press Ctrl+C to stop the server\n")
        
        # Open browser automatically
        webbrowser.open(server_url)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            print("👋 Goodbye!")

if __name__ == "__main__":
    start_server()
