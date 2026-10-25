"""Local development server. ROMs are processed in memory, never executed."""
import argparse
import base64
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit
from .rom import MAX_ROM, RomError, analyze, export_zip
from .inputs import read_input
from .project import inspect, project_zip, compatibility

WEB = Path(__file__).resolve().parent.parent / 'web'


class Handler(BaseHTTPRequestHandler):
    def reply(self, status, body, content_type, filename='neslab-export.zip'):
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        if content_type == 'application/zip':
            self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        path = urlsplit(self.path).path
        if path == '/api/health':
            self.reply(200, b'{"app":"neslab","status":"ready"}', 'application/json; charset=utf-8')
            return
        files = {'/': ('index.html', 'text/html; charset=utf-8'), '/app.js': ('app.js', 'text/javascript; charset=utf-8'), '/style.css': ('style.css', 'text/css; charset=utf-8'),
                 '/player.js': ('player.js', 'text/javascript; charset=utf-8'), '/player.css': ('player.css', 'text/css; charset=utf-8'),
                 '/vendor/jsnes.min.js': ('vendor/jsnes.min.js', 'text/javascript; charset=utf-8')}
        if path not in files:
            self.reply(404, b'Not found', 'text/plain')
            return
        name, mime = files[path]
        self.reply(200, (WEB / name).read_bytes(), mime)

    def do_POST(self):
        if self.path not in ('/api/analyze', '/api/export', '/api/project', '/api/runtime'):
            self.reply(404, b'Not found', 'text/plain')
            return
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= MAX_ROM:
                raise RomError('Wybierz plik ROM o rozmiarze do 32 MiB.')
            data = self.rfile.read(length)
            if len(data) != length:
                raise RomError('Nie odebrano całego pliku.')
            data = read_input(data)
            if self.path == '/api/export':
                self.reply(200, export_zip(data), 'application/zip')
            elif self.path == '/api/project':
                self.reply(200, project_zip(data), 'application/zip', 'neslab-project.zip')
            elif self.path == '/api/runtime':
                report, _ = analyze(data)
                support = compatibility(data, report)
                if not support['available']:
                    raise RomError(' '.join(support['reasons']))
                config = {'romBase64': base64.b64encode(data).decode(), 'mapper': report['mapper'], 'sha256': report['sha256']}
                self.reply(200, json.dumps(config).encode(), 'application/json; charset=utf-8')
            else:
                self.reply(200, json.dumps(inspect(data), ensure_ascii=False).encode(), 'application/json; charset=utf-8')
        except (RomError, ValueError) as exc:
            self.reply(400, json.dumps({'error': str(exc)}).encode(), 'application/json; charset=utf-8')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8000)
    args = parser.parse_args()
    server = ThreadingHTTPServer((args.host, args.port), Handler)
    print(f'NES LAB listening on port {args.port}', flush=True)
    print(f'Otwórz w przeglądarce na tej maszynie: http://127.0.0.1:{args.port}/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
