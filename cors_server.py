#!/usr/bin/env python3
"""
支持 CORS 的简单 HTTP 服务器
用于本地开发，允许跨域请求
"""
import http.server
import socketserver
from urllib.parse import urlparse

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 添加 CORS 头
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        # 处理预检请求
        self.send_response(200)
        self.end_headers()

    def log_message(self, format, *args):
        # 自定义日志格式
        print(f"[HTTP Server] {args[0]} - {args[1]}")

if __name__ == '__main__':
    PORT = 8080

    with socketserver.TCPServer(("", PORT), CORSRequestHandler) as httpd:
        print(f"========================================")
        print(f"支持 CORS 的 HTTP 服务器已启动")
        print(f"地址: http://127.0.0.1:{PORT}")
        print(f"按 Ctrl+C 停止服务器")
        print(f"========================================")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n服务器已停止")
