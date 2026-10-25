"""Start a loopback-only server and open its browser interface."""
import webbrowser
from http.server import ThreadingHTTPServer
from .server import Handler


def main():
    # An automatically chosen port avoids conflicts with other local applications.
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    address = f'http://127.0.0.1:{server.server_port}/'
    print('NES ROOM — jeszcze jedna runda', flush=True)
    print(f'Otwórz w przeglądarce: {address}', flush=True)
    print('Pozostaw to okno otwarte. Ctrl+C zatrzymuje aplikację.', flush=True)
    try:
        webbrowser.open(address)
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
