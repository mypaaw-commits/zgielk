"""Reproducible, narrowly scoped patch; retain verified upstream distribution."""
import hashlib
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UPSTREAM_SHA256 = '84946f0dae4bcf3b2dfebe84ad3bfeb1dbcb413bd9b1a69e1f45910a95fd7b41'
BEFORE = 'C=1&c?R-1+256:R'
AFTER = 'C=1&c?R+256:R'
NOTICE = '/*! JSNES 2.1.0, Apache-2.0. Modified by NES LAB: fix 8x16 sprite bank-1 base index. See JSNES-PATCHES.txt and JSNES-LICENSE.txt. */\n'


def main():
    vendor = ROOT / 'web/vendor'
    upstream = (vendor / 'jsnes.min.js').read_bytes()
    if hashlib.sha256(upstream).hexdigest() != UPSTREAM_SHA256:
        raise RuntimeError('Unexpected upstream JSNES checksum; do not apply this patch.')
    source = upstream.decode()
    if source.count(BEFORE) != 1:
        raise RuntimeError('Expected exactly one known sprite bank expression.')
    patched = NOTICE + source.replace(BEFORE, AFTER)
    (vendor / 'jsnes-patched.min.js').write_text(patched)
    print('Built JSNES with NES LAB PPU fix 1; upstream file unchanged.')


if __name__ == '__main__':
    main()
