from pathlib import Path
from zipfile import ZipFile,ZIP_DEFLATED
import shutil
from export_sections import export_sections
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'dist';OUT.mkdir(exist_ok=True)
export_sections(ROOT)
with ZipFile(OUT/'rankorbit-elementor-plugin.zip','w',ZIP_DEFLATED) as z:
    for p in sorted((ROOT/'rankorbit-elementor').rglob('*')):
        if p.is_file():z.write(p,p.relative_to(ROOT))
shutil.copyfile(ROOT/'README.md',OUT/'INSTALLATION.md')
print('Packaged plugin:',round((OUT/'rankorbit-elementor-plugin.zip').stat().st_size/1024/1024,2),'MiB')
