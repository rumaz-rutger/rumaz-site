from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os, webbrowser
os.chdir(Path(__file__).resolve().parent)
url = 'http://127.0.0.1:8080/'
print('RuMaZ HTML preview: ' + url + ' — Ctrl+C to stop')
webbrowser.open(url)
ThreadingHTTPServer(('127.0.0.1', 8080), SimpleHTTPRequestHandler).serve_forever()
