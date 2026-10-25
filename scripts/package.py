"""Package only tool sources and launchers, never input ROMs or user exports."""
from pathlib import Path
import argparse
import zipfile

ROOT = Path(__file__).resolve().parent.parent


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--output',type=Path,default=Path('/workspace/artifacts/NES-LAB-v0.3.zip'))
    args=parser.parse_args()
    files=[ROOT/name for name in ('README.md','START-TUTAJ.txt','START-WINDOWS.bat','START-MAC-LINUX.command')]
    for folder in ('neslab','web','tests','scripts'):
        files.extend(path for path in (ROOT/folder).rglob('*') if path.is_file()
            and '__pycache__' not in path.parts and path.suffix.lower() in ('.py','.js','.css','.html','.txt','.md'))
    args.output.parent.mkdir(parents=True,exist_ok=True)
    with zipfile.ZipFile(args.output,'w',zipfile.ZIP_DEFLATED) as archive:
        for path in sorted(files):
            name='NES-LAB/'+path.relative_to(ROOT).as_posix()
            if path.suffix=='.bat':
                archive.writestr(name,path.read_text().replace('\n','\r\n'))
            else:
                archive.write(path,name)
    with zipfile.ZipFile(args.output) as archive:
        if archive.testzip():
            raise RuntimeError('Archive checksum verification failed')
    print(f'{args.output}: {args.output.stat().st_size} bytes')


if __name__=='__main__':main()
