"""Conservative recursive decoding of official 6502 instructions in fixed NROM.

This finds possible code reachable from vectors; it does not recover semantics.
Unknown opcodes and dynamic jumps terminate that path. Unvisited bytes stay raw.
"""
from collections import deque
import struct

ROWS = '''
BRK:i ORA:ix - - - ORA:z ASL:z - PHP:i ORA:m ASL:a - - ORA:w ASL:w -
BPL:r ORA:iy - - - ORA:zx ASL:zx - CLC:i ORA:wy - - - ORA:wx ASL:wx -
JSR:w AND:ix - - BIT:z AND:z ROL:z - PLP:i AND:m ROL:a - BIT:w AND:w ROL:w -
BMI:r AND:iy - - - AND:zx ROL:zx - SEC:i AND:wy - - - AND:wx ROL:wx -
RTI:i EOR:ix - - - EOR:z LSR:z - PHA:i EOR:m LSR:a - JMP:w EOR:w LSR:w -
BVC:r EOR:iy - - - EOR:zx LSR:zx - CLI:i EOR:wy - - - EOR:wx LSR:wx -
RTS:i ADC:ix - - - ADC:z ROR:z - PLA:i ADC:m ROR:a - JMP:ind ADC:w ROR:w -
BVS:r ADC:iy - - - ADC:zx ROR:zx - SEI:i ADC:wy - - - ADC:wx ROR:wx -
- STA:ix - - STY:z STA:z STX:z - DEY:i - TXA:i - STY:w STA:w STX:w -
BCC:r STA:iy - - STY:zx STA:zx STX:zy - TYA:i STA:wy TXS:i - - STA:wx - -
LDY:m LDA:ix LDX:m - LDY:z LDA:z LDX:z - TAY:i LDA:m TAX:i - LDY:w LDA:w LDX:w -
BCS:r LDA:iy - - LDY:zx LDA:zx LDX:zy - CLV:i LDA:wy TSX:i - LDY:wx LDA:wx LDX:wy -
CPY:m CMP:ix - - CPY:z CMP:z DEC:z - INY:i CMP:m DEX:i - CPY:w CMP:w DEC:w -
BNE:r CMP:iy - - - CMP:zx DEC:zx - CLD:i CMP:wy - - - CMP:wx DEC:wx -
CPX:m SBC:ix - - CPX:z SBC:z INC:z - INX:i SBC:m NOP:i - CPX:w SBC:w INC:w -
BEQ:r SBC:iy - - - SBC:zx INC:zx - SED:i SBC:wy - - - SBC:wx INC:wx -
'''.split()
assert len(ROWS) == 256
OPS = {opcode: tuple(token.split(':')) for opcode, token in enumerate(ROWS) if token != '-'}
SIZES = {'i': 1, 'a': 1, 'm': 2, 'z': 2, 'zx': 2, 'zy': 2, 'ix': 2, 'iy': 2, 'r': 2, 'w': 3, 'wx': 3, 'wy': 3, 'ind': 3}


def decode(prg, mapper):
    report = {'method': 'recursive-static-6502', 'instructions': [], 'warnings': [], 'coverage_bytes': 0,
              'scope': 'Kandydaci na kod osiągalny od wektorów. Analiza statyczna nie potwierdza wykonania ani znaczenia danych.'}
    if mapper != 0 or len(prg) not in (16384, 32768):
        report['warnings'].append('Automatyczne śledzenie kodu jest obecnie dostępne tylko dla standardowego NROM 16/32 KiB.')
        return report
    def offset(address):
        return (address - 0x8000) % len(prg) if 0x8000 <= address <= 0xffff else None
    pending = deque(struct.unpack('<HHH', prg[-6:]))
    visited, owners = set(), {}
    while pending:
        pc = pending.popleft()
        while pc not in visited:
            visited.add(pc)
            start = offset(pc)
            if start is None:
                report['warnings'].append(f'Cel ${pc:04X} poza PRG-ROM: możliwy kod w RAM lub błędny wektor.')
                break
            op = OPS.get(prg[start])
            if op is None:
                report['warnings'].append(f'${pc:04X}: nieoficjalny opcode ${prg[start]:02X} lub dane. Ścieżka zatrzymana.')
                break
            mnemonic, mode = op
            size = SIZES[mode]
            if pc + size > 0x10000:
                break
            offsets = [offset(pc + i) for i in range(size)]
            raw = bytes(prg[i] for i in offsets)
            value = int.from_bytes(raw[1:], 'little')
            target = None
            if mode == 'r':
                target = (pc + size + (value if value < 128 else value - 256)) & 0xffff
                operand = f'${target:04X}'
            else:
                operand = {'i': '', 'a': 'A', 'm': f'#${value:02X}', 'z': f'${value:02X}', 'zx': f'${value:02X},X', 'zy': f'${value:02X},Y', 'w': f'${value:04X}', 'wx': f'${value:04X},X', 'wy': f'${value:04X},Y', 'ix': f'(${value:02X},X)', 'iy': f'(${value:02X}),Y', 'ind': f'(${value:04X})'}[mode]
            if any(i in owners and owners[i] != start for i in offsets):
                report['warnings'].append(f'${pc:04X}: nakładające się instrukcje; interpretacja wymaga sprawdzenia.')
            for i in offsets:
                owners.setdefault(i, start)
            report['instructions'].append({'cpu_address': pc, 'prg_offset': start, 'bytes': raw.hex().upper(), 'mnemonic': mnemonic, 'operand': operand})
            if mode == 'r':
                pending.append(target)
            if mnemonic in ('JSR', 'JMP'):
                if mode == 'ind':
                    a, b = offset(value), offset((value & 0xff00) | ((value + 1) & 255))
                    if a is not None and b is not None:
                        pending.append(prg[a] | prg[b] << 8)
                    else:
                        report['warnings'].append(f'${pc:04X}: skok pośredni przez RAM; cel jest zależny od wykonania.')
                else:
                    pending.append(value)
            if mnemonic in ('RTS', 'RTI', 'BRK', 'JMP'):
                break
            pc = (pc + size) & 0xffff
    report['instructions'].sort(key=lambda x: x['cpu_address'])
    report['coverage_bytes'] = len(owners)
    report['warnings'] = list(dict.fromkeys(report['warnings']))
    return report


def listing(report):
    lines = ['; NES LAB — kandydaci na kod 6502, nie odzyskany kod źródłowy.', '; Adres CPU | offset PRG | bajty | instrukcja. Plik diagnostyczny, nie projekt assemblera.']
    for instruction in report['instructions']:
        lines.append(f"${instruction['cpu_address']:04X}  +{instruction['prg_offset']:06X}  {instruction['bytes']:<6}  {instruction['mnemonic']} {instruction['operand']}")
    lines.extend('; UWAGA: ' + warning for warning in report['warnings'])
    return '\n'.join(lines) + '\n'
