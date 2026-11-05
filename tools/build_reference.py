"""Build a capture-based Elementor template, companion plugin, and offline preview.
The uploaded archive is data: no captured tracking, checkout or submission code executes.
"""
from pathlib import Path
from lxml import html, etree
import json, re, shutil, hashlib, base64, tarfile, copy

ROOT=Path(__file__).resolve().parents[1]
REF=ROOT/'reference'
PLUGIN=ROOT/'rankorbit-elementor'
PUB=PLUGIN/'public'
PUB.mkdir(parents=True,exist_ok=True)
(PLUGIN/'sections').mkdir(exist_ok=True)
OUT=ROOT/'dist'
A=PUB/'assets'; A.mkdir(exist_ok=True)
for p in (REF/'assets').iterdir():
    if p.suffix!='.js': shutil.copyfile(p,A/p.name)
shutil.copyfile(REF/'assets/0078-css',A/'captured-fonts.css')
# Verify the official package before using its distribution files.
meta=json.loads((REF/'vendor/gsap-3.12.5-metadata.json').read_text())
raw=(REF/'vendor/gsap-3.12.5.tgz').read_bytes()
algo,expected=meta['dist']['integrity'].split('-',1)
assert base64.b64encode(hashlib.new(algo,raw).digest()).decode()==expected
with tarfile.open(REF/'vendor/gsap-3.12.5.tgz') as t:
    for f in ['gsap.min.js','ScrollTrigger.min.js']:
        (PUB/f).write_bytes(t.extractfile('package/dist/'+f).read())
    (PLUGIN/'GSAP-NOTICE.txt').write_text('GSAP 3.12.5\n'+meta['license']+'\nDistribution files retain their upstream license headers.\n')
    (PLUGIN/'GSAP-README.md').write_bytes(t.extractfile('package/README.md').read())

doc=html.parse(str(REF/'index.html'))
# All local assets, including lazy-loaded <noscript> images, already have captured names.
byname={p.name.split('-',1)[-1]:p.name for p in A.iterdir()}
missing=set()
def local_url(value):
    if not value:return value
    if value.startswith('assets/'):return '__RO_PUBLIC__/'+value
    if value.startswith(('https://','http://')):
        name=value.split('?',1)[0].rsplit('/',1)[-1]
        if name in byname:return '__RO_PUBLIC__/assets/'+byname[name]
    return value

# Remove dead, captured runtime state so the real scripts initialize again.
def clean(node):
    node=copy.deepcopy(node)
    for e in node.xpath('.//script|.//noscript|.//iframe|.//link'):
        if e.tag=='noscript':
            nxt=e.getnext()
            imgs=e.xpath('.//img')
            if nxt is not None and nxt.tag=='img' and imgs:
                nxt.set('src',imgs[0].get('src',''))
        e.drop_tree()
    for e in node.iter():
        if not isinstance(e.tag,str):continue
        for k in list(e.attrib):
            if k.startswith('on') or k in ['data-initialized','data-ali-ready','data-ali-mobile-ready','data-roc-ready','data-ali-sc-init','data--r-o1-initialized','data--r-o1-bound','data--r-o1-escape-bound']:
                e.attrib.pop(k,None)
        classes=e.get('class','').split()
        classes=[c for c in classes if c not in ['two_elementor_element','ro8-playing','ro-active','ro-show','rnkft-visible','swiper-initialized','swiper-horizontal','swiper-pointer-events']]
        if classes:e.set('class',' '.join(classes))
        for attr in ['src','poster']:
            if e.get(attr):e.set(attr,local_url(e.get(attr)))
        if e.tag=='img':
            src=e.get('src','')
            if src.startswith('data:') and e.get('data-src'):e.set('src',local_url(e.get('data-src')))
            if e.get('src','').lower().endswith('.mp4'):
                # The sibling background video is already captured; discard invalid MP4-as-img.
                e.drop_tree()
                continue
            for k in ['data-src','data-srcset','srcset','data-ll-status']:e.attrib.pop(k,None)
        if e.tag=='svg' and 'viewbox' in e.attrib:e.set('viewBox',e.attrib.pop('viewbox'))
        for k in ['style']:
            if e.get(k):e.set(k,re.sub(r'url\([\"\x27]?(assets/[^)\"\x27]+)[\"\x27]?\)',lambda m:'url('+local_url(m[1])+')',e.get(k)))
        if 'ali-orbit-' in e.get('class','') and any(x in e.get('class','').split() for x in ['ali-orbit-main','ali-orbit-service','ali-orbit-rings','ali-orbit-progress','ali-orbit-progress-fill','ali-orbit-service-image','ali-orbit-content-wrap']):
            e.attrib.pop('style',None)
        if 'elementor-background-video-hosted' in e.get('class',''):e.attrib.pop('style',None)
    # Undo duplicates created by scripts at capture time.
    for e in node.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," swiper-slide-duplicate ")]'):e.drop_tree()
    for track in node.xpath('.//*[contains(concat(" ",normalize-space(@class)," ")," RO1-video-marquee-track ")]'):
        groups=track.xpath('./div[contains(@class,"RO1-video-marquee-group")]')
        for g in groups[1:]:g.drop_tree()
    for e in node.xpath('.//*[contains(@class,"swiper-wrapper") or contains(@class,"swiper-slide")]'):e.attrib.pop('style',None)
    # Captured form has a remote handler and stripped submit value. Never reuse it.
    for f in node.xpath('.//form'):
        f.set('action','#');f.set('data-ro-contact','1');f.attrib.pop('novalidate',None)
        for field in f.xpath('.//input[@type="hidden"]'):field.drop_tree()
        for x in f.xpath('.//*[@aria-required="true"]'):x.set('required','')
        for x in f.xpath('.//select/option[1]'):
            if not x.get('value'):x.set('value',x.text_content())
        for x in f.xpath('.//input[@type="submit"]'):x.set('value','Send Message')
        status=html.Element('p',{'class':'ro-form-status','role':'status','aria-live':'polite'});f.append(status)
    return node

def inner(e):
    return (e.text or '')+''.join(html.tostring(x,encoding='unicode',with_tail=True) for x in e)

def setinner(e,value):
    for c in list(e):e.remove(c)
    e.text=value

header=doc.xpath('//*[@data-elementor-id="10"]')[0]
main=doc.xpath('//*[@data-elementor-id="63"]')[0]
footer=doc.xpath('//*[@data-elementor-id="38"]')[0]
items=[('header','Header & navigation',header)]
names=['Hero','What we do — scroll-driven orbit','Technology logo carousel','Why choose us','Services introduction','Stacked service cards','Our process','Brands we have served','Video testimonials','Google reviews','Frequently asked questions','Free consultation']
items += [(f'home-{i+1:02d}',name,e) for i,(name,e) in enumerate(zip(names,list(main)))]
footer_names=['Animated closing call to action','Office addresses','Footer & payment logos','Back to top']
items += [(f'footer-{i+1}',name,e) for i,(name,e) in enumerate(zip(footer_names,list(footer)))]
floating=doc.xpath('//*[@id="ro-floating-started"]')[0]
items.append(('floating','Floating Get Started tab',floating))
manifest={};content=[];rendered=[]
for idx,(key,title,node) in enumerate(items):
    node=clean(node)
    scope='elementor-10' if key=='header' else ('elementor-38' if key.startswith('footer') else 'elementor-63')
    # Preserve original page scopes and global typography inside each movable Elementor section.
    wrapper=html.Element('div',{'class':f'ro-reference-scope elementor elementor-kit-6 {scope}'})
    wrapper.append(node)
    texts=[];media=[];links=[]
    # Keep nested rich spans intact while exposing the outer text to Elementor.
    candidates=wrapper.xpath('.//h1|.//h2|.//h3|.//h4|.//p|.//li|.//summary|.//div[not(*)]|.//span[not(*)]|.//a[not(*)]|.//label[not(*)]')
    selected=[]
    for e in candidates:
        if not e.text_content().strip() or len(e.xpath('.//input|.//select|.//textarea|.//button|.//details|.//svg|.//img|.//video')):continue
        if e.tag=='summary':continue  # nested accordion icon markup remains intact
        if any(a in selected for a in e.iterancestors()):continue
        if e.tag=='li' and len(e.xpath('.//h1|.//h2|.//h3|.//p')):continue
        selected.append(e)
    # Links must be tokenized before extracting rich text, so edits stay independent.
    for e in wrapper.xpath('.//*[@href]|.//*[@data-ro1-video]'):
        attr='href' if e.get('href') is not None else 'data-ro1-video'
        val=e.get(attr)
        if val in ['https://rankorbit.com/','https://rankorbit.com']:val='#'
        if val in ['https://rankorbit.com/#contact','https://rankorbit.com/contact-us/']:val='#contact'
        if not val or val.startswith(('javascript:','blob:')):continue
        n=len(links); token=f'__RO_LINK_{n}__'
        label=' '.join(e.text_content().split())[:70] or ('Video review' if attr!='href' else 'Link')
        links.append({'_id':f'{idx:02x}l{n:04x}','label':label,'token':token,'target':{'url':val}})
        e.set(attr,token)
        if attr=='data-ro1-video':missing.add(val)
    for e in wrapper.xpath('.//img[@src]|.//video[@src]|.//source[@src]'):
        val=e.get('src'); n=len(media);token=f'__RO_MEDIA_{n}__'
        media.append({'_id':f'{idx:02x}m{n:04x}','label':(e.get('alt') or e.get('class') or 'Image / video')[:70], 'token':token, 'file':{'url':val}})
        e.set('src',token)
    for e in selected:
        n=len(texts);token=f'__RO_TEXT_{n}__'
        value=inner(e)
        label=' '.join(e.text_content().split())[:70]
        texts.append({'_id':f'{idx:02x}t{n:04x}','label':label,'token':token,'copy':value})
        setinner(e,token)
    markup=html.tostring(wrapper,encoding='unicode')
    # lxml preserves literal token strings; replacement happens server-side on render.
    (PLUGIN/'sections'/f'{key}.html').write_text(markup)
    fields={'section_key':key,'text_items':texts,'media_items':media,'link_items':links}
    manifest[key]={'title':title,'settings':fields}
    content.append({'id':f'b{idx:06x}','elType':'container','isInner':False,'settings':{'_title':title,'content_width':'full','flex_direction':'column','flex_gap':{'unit':'px','column':'0','row':'0'},'padding':{'unit':'px','top':'0','right':'0','bottom':'0','left':'0','isLinked':True},'css_classes':'ro-capture-container'},'elements':[{'id':f'a{idx:06x}','elType':'widget','widgetType':'rankorbit_capture','settings':fields,'elements':[]}]})
    value=markup
    for x in texts:value=value.replace(x['token'],x['copy'])
    for x in links:value=value.replace(x['token'],x['target']['url'].replace('&','&amp;'))
    for x in media:value=value.replace(x['token'],x['file']['url'])
    value=value.replace('__RO_PUBLIC__','rankorbit-elementor/public')
    rendered.append(f'<div class="elementor-element elementor-element-b{idx:06x} ro-capture-container e-con-full e-flex e-con e-parent"><div class="elementor-element elementor-element-a{idx:06x} elementor-widget elementor-widget-rankorbit_capture"><div class="elementor-widget-container">{value}</div></div></div>')

(PLUGIN/'sections.json').write_text(json.dumps(manifest,indent=2))
template={'version':'0.4','title':'RankOrbit — Capture-based Animated Homepage','type':'page','page_settings':{'template':'elementor_canvas','hide_title':'yes'},'content':content}
(OUT/'rankorbit-homepage-elementor.json').write_text(json.dumps(template,indent=2))
# Combine captured styles in their original cascade order, with local URL references.
styles=[]
# style-0 is a browser-extension dimming overlay, not site design.
for n in [1,2]:
    s=(REF/f'style-{n}.css').read_text()
    # This invalid legacy EOT URL is a known capture 404; modern fonts are bundled.
    s=re.sub(r'https://rankorbit\.com/[^)\"\x27\s]+themify\.eot\?[^)\"\x27\s]*','assets/0093-themify.eot',s)
    s=s.replace('assets/','')
    styles.append(s)
(A/'capture-inline.css').write_text('\n'.join(styles))
# Original custom animation scripts recovered from the performance plugin's JSON registry.
parts=[]
for n in [8,9,10,11,12,14,15,17]:
    s=(REF/'scripts'/f'{n:02d}.js').read_text()
    if n==9:
        # Mobile-specific video was not captured; same local desktop video is used.
        for remote in ['https://rankorbit.com/wp-content/uploads/2026/07/Hero-Section-Video-Rank-Orbit.mp4','https://rankorbit.com/wp-content/uploads/2026/10/rankorbit.mp4']:
            s=s.replace('"'+remote+'"','(video.getAttribute("src") || window.ROCapture.publicUrl + "/assets/0010-Hero-Section-Video-Rank-Orbit.mp4")')
    parts.append(f'\n/* Recovered original homepage script {n:02d}. */\n'+s)
(PUB/'captured-motion.js').write_text('\n'.join(parts))
css=['assets/captured-fonts.css','assets/capture-inline.css','assets/0079-two_front_page_aggregated_5031697833a1b266bf9fe4d7a52cf38e_delay.min.css','assets/0083-trustindex-google-widget.css','assets/0084-two_front_page_minified_trustindex-google-widget.min.css','compatibility.css']
head=''.join(f'<link rel="stylesheet" href="rankorbit-elementor/public/{x}">' for x in css)
scripts=''.join(f'<script defer src="rankorbit-elementor/public/{x}"></script>' for x in ['gsap.min.js','ScrollTrigger.min.js','compatibility.js','captured-motion.js'])
preview='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>RankOrbit — capture-based animation preview</title>'+head+'<script>window.ROCapture={publicUrl:"rankorbit-elementor/public",preview:true};</script>'+scripts+'</head><body class="elementor-default elementor-page elementor-kit-6 ro-capture-page">'+''.join(rendered)+'</body></html>'
(OUT/'rankorbit-preview.html').write_text(preview)
(OUT/'reference-inventory.json').write_text(json.dumps({'sections':[{'key':k,'title':v['title'],'editable_texts':len(v['settings']['text_items']),'editable_media':len(v['settings']['media_items']),'editable_links':len(v['settings']['link_items'])} for k,v in manifest.items()], 'missing_video_sources':sorted(missing),'source':'User-uploaded rankorbit.com capture, 2026-11-05','known_differences':['Mobile-specific hero video not included; captured desktop video used on mobile.','Stacked card runtime and logo carousel runtime were blob URLs not included; reconstructed from captured CSS and markup.','Testimonial video URLs were not downloaded by the capture.','Live Google-review loading and AI checkout/onboarding are not copied; review content is a static snapshot.','Consultation form uses the destination WordPress admin email, not the original site backend.']},indent=2))
# Preview uses the exact same assets and section renderer, linked locally to avoid copies.
link=OUT/'rankorbit-elementor'
if not link.exists():link.symlink_to('../rankorbit-elementor',target_is_directory=True)
print('Built',len(content),'editable sections;',sum(len(v['settings']['text_items']) for v in manifest.values()),'text controls;',sum(len(v['settings']['media_items']) for v in manifest.values()),'media controls.')
