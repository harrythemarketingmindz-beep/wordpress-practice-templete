from pathlib import Path
import json,re
from lxml import html
ROOT=Path(__file__).resolve().parents[1]
template=json.loads((ROOT/'dist/rankorbit-homepage-elementor.json').read_text())
manifest=json.loads((ROOT/'rankorbit-elementor/sections.json').read_text())
assert template['version']=='0.4' and template['type']=='page'
assert template['page_settings']['template']=='elementor_canvas'
assert len(template['content'])==len(manifest)==18
ids=set();seen=[]
for container in template['content']:
    assert container['elType']=='container' and len(container['elements'])==1
    widget=container['elements'][0]
    assert widget['widgetType']=='rankorbit_capture'
    for e in [container,widget]:
        assert re.fullmatch('[a-f0-9]{7}',e['id']) and e['id'] not in ids
        ids.add(e['id'])
    fields=widget['settings'];key=fields['section_key'];seen.append(key)
    assert key in manifest
    markup=(ROOT/'rankorbit-elementor/sections'/f'{key}.html').read_text()
    assert not html.fromstring(markup).xpath('.//script|.//*[@onclick]|.//iframe')
    tokens={x['token'] for group in ['text_items','media_items','link_items'] for x in fields[group]}
    for x in fields['text_items']:
        assert set(re.findall(r'__RO_(?:LINK|MEDIA)_\d+__',x['copy']))<=tokens
        markup=markup.replace(x['token'],x['copy'])
    for group,field in [('media_items','file'),('link_items','target')]:
        for x in fields[group]:markup=markup.replace(x['token'],x[field]['url'])
    assert not re.search('__RO_(TEXT|MEDIA|LINK)_',markup),key
    for asset in re.findall(r'__RO_PUBLIC__/([^\s"\x27<>]+)',markup):
        assert (ROOT/'rankorbit-elementor/public'/asset).is_file(),asset
assert len(set(seen))==18
assert '<script' not in (ROOT/'rankorbit-elementor/sections/home-12.html').read_text()
assert 'wp-admin/admin-ajax.php' not in (ROOT/'rankorbit-elementor/public/captured-motion.js').read_text()
print('PASS: 18 sections, 36 unique Elementor IDs, supported container/widget structure, complete tokens and local media, no captured executable scripts or submission endpoints.')
