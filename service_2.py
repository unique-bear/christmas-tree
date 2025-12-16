#!/usr/bin/env python3
"""
Custom HTTP Server with proper MIME types for TSX/TS files
适配 .tsx/.ts 文件的 HTTP 服务器
"""

import http.server
import socketserver
import mimetypes
import os

# Add custom MIME types for TypeScript and TSX files
mimetypes.add_type('application/javascript', '.tsx')
mimetypes.add_type('application/javascript', '.ts')
mimetypes.add_type('application/javascript', '.jsx')
mimetypes.add_type('text/css', '.css')

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    """
    Custom handler that properly serves TypeScript and TSX files
    """
    
    def end_headers(self):
        # Add CORS headers to allow cross-origin requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate')
        super().end_headers()
    
    def guess_type(self, path):
        """
        Override to ensure correct MIME types for TS/TSX files
        """
        base, ext = os.path.splitext(path)
        if ext in ('.tsx', '.ts', '.jsx'):
            return 'application/javascript'
        elif ext == '.css':
            return 'text/css'
        return super().guess_type(path)

PORT = 8000

def run_server():
    """
    Start the HTTP server on the specified port
    """
    handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("=" * 60)
        print(f"🎄 Server running at: http://localhost:{PORT}")
        print("=" * 60)
        print(f"📂 Serving directory: {os.getcwd()}")
        print("\n✅ MIME types configured:")
        print("   - .tsx → application/javascript")
        print("   - .ts  → application/javascript")
        print("   - .jsx → application/javascript")
        print("\n🌐 Open in browser: http://localhost:8000")
        print("\n⚠️  Press Ctrl+C to stop the server")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped by user")

if __name__ == "__main__":
    run_server()
