"""Export each homepage block as its own Elementor section template."""
from pathlib import Path
from copy import deepcopy
from zipfile import ZipFile, ZIP_DEFLATED
import json

NAMES = [
    '01-header-navigation',
    '02-hero',
    '03-what-we-do-orbit',
    '04-technology-logo-carousel',
    '05-why-choose-us',
    '06-services-introduction',
    '07-stacked-service-cards',
    '08-our-process',
    '09-client-brands',
    '10-video-testimonials',
    '11-google-reviews',
    '12-frequently-asked-questions',
    '13-free-consultation',
    '14-animated-closing-cta',
    '15-office-addresses',
    '16-footer-payment-logos',
    '17-back-to-top',
    '18-floating-get-started-tab',
]

def export_sections(root):
    out = root / 'dist' / 'sections'
    out.mkdir(parents=True, exist_ok=True)
    homepage = json.loads((root / 'dist/rankorbit-homepage-elementor.json').read_text())
    assert len(homepage['content']) == len(NAMES), 'Update section filenames when the homepage changes.'
    rows = []
    for name, container in zip(NAMES, homepage['content']):
        title = container['settings']['_title']
        section = {
            'version': '0.4',
            'title': 'RankOrbit — ' + title,
            'type': 'section',
            'page_settings': {},
            'content': [deepcopy(container)],
        }
        path = out / (name + '.json')
        path.write_text(json.dumps(section, indent=2) + '\n')
        saved = json.loads(path.read_text())
        assert saved['type'] == 'section' and saved['content'] == [container]
        assert saved['page_settings'] == {}, 'Section import must not replace page settings.'
        rows.append(f'| `{path.name}` | {title} |')
    instructions = '''# Individual Elementor section templates

Each JSON imports one section, independently of the full homepage.

## Import and insert

1. Install and activate Elementor and `rankorbit-elementor-plugin.zip` first. The companion plugin supplies the custom section widget, bundled assets, and animation scripts. **These JSON files require that plugin.** Elementor Pro is not required.
2. Extract `rankorbit-sections.zip` on your computer.
3. In WordPress, open **Templates → Saved Templates → Import Templates** and choose the individual `.json` you want. Import additional JSON files as needed. Do not upload this ZIP as an Elementor website kit.
4. Open the destination page in Elementor. Click the template library folder icon, open **My Templates**, and insert the imported section. Repeat for other sections.
5. Use Elementor's Structure/Navigator panel to arrange the sections. Select the **RankOrbit — Animated Section** widget inside a section to edit its Text, Images & videos, and Links controls.

Importing a section leaves the destination page settings unchanged. For a full homepage that includes the captured header/footer, choose **Elementor Canvas** to avoid duplicate theme navigation. For isolated body sections, keep your existing page layout.

Keep each original section only once per page: the recovered animation code uses its original IDs. The Services introduction and Stacked service cards are separate files and can be inserted together. The floating Get Started tab targets the Free consultation section's `#contact` anchor; insert that section or change the link. The floating tab and Back to top are utility controls, not full-height content sections.

These templates preserve the capture-based implementation. They are custom section widgets, rather than independent native Heading/Image widgets. The logo carousel and stacked-card runtime were reconstructed; testimonial video files and the mobile-specific hero video were absent from the capture. See the main installation instructions for all limitations. Section structure/content were validated locally; a live WordPress/Elementor import remains untested.

## Files

| JSON file | Section |
| --- | --- |
'''+ '\n'.join(rows)+'\n'
    (out / 'README.md').write_text(instructions)
    with ZipFile(root / 'dist/rankorbit-sections.zip', 'w', ZIP_DEFLATED) as archive:
        for name in NAMES:
            path = out / (name + '.json')
            archive.write(path, path.name)
        archive.write(out / 'README.md', 'README.md')
    print(f'PASS: exported {len(NAMES)} individual Elementor section JSON files with unchanged content and no page-setting overrides.')

if __name__ == '__main__':
    export_sections(Path(__file__).resolve().parents[1])
