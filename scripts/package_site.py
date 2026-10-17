"""Create a flat static-site ZIP using only the Python standard library."""
from pathlib import Path
import zipfile

root = Path(__file__).resolve().parents[1]
site = root / 'site'
if not (site / 'index.html').is_file():
    raise SystemExit('Expected site/index.html beside this project.')
output = root / 'build' / 'olivia-site.zip'
output.parent.mkdir(parents=True, exist_ok=True)
files = sorted(path for path in site.rglob('*') if path.is_file())
with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
    for path in files:
        if path.is_symlink() or path.name in {'.DS_Store', 'Thumbs.db'}:
            continue
        archive.write(path, path.relative_to(site).as_posix())
print(output)
