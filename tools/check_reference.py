from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
import threading,json,shutil
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
class Quiet(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass
    def copyfile(self,source,outputfile):
        try: super().copyfile(source,outputfile)
        except (BrokenPipeError,ConnectionResetError): pass
server=ThreadingHTTPServer(('127.0.0.1',0),partial(Quiet,directory=str(ROOT/'dist')))
threading.Thread(target=server.serve_forever,daemon=True).start()
url=f'http://127.0.0.1:{server.server_port}/rankorbit-preview.html'
results=[]
with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=shutil.which('chromium'),headless=True,args=['--no-sandbox'])
    for name,width,height in [('desktop',1440,1000),('mobile',390,844)]:
        page=browser.new_page(viewport={'width':width,'height':height})
        errors=[];failed=[];remote=[]
        page.on('pageerror',lambda e:errors.append(str(e)))
        page.on('response',lambda r:failed.append([r.status,r.url]) if r.status>=400 else None)
        def route(r):
            if r.request.url.startswith(('http://127.0.0.1:','data:','blob:')):r.continue_()
            else:remote.append(r.request.url);r.abort()
        page.route('**/*',route)
        page.goto(url,wait_until='load')
        page.wait_for_timeout(1500)
        page.screenshot(path=str(ROOT/f'dist/rankorbit-{name}-hero.png'))
        print(name,'loaded. Height:',page.evaluate('document.body.scrollHeight'),'overflow:',page.evaluate('document.documentElement.scrollWidth-innerWidth'),'errors:',errors,'failed:',failed[:8],'remote:',remote[:8])
        assert not errors, errors
        assert not failed, failed
        assert not remote, remote
        assert page.locator('.ro-reference-scope').count()==18
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        assert 'Launch Your Brand' in page.locator('h1').first.inner_text()
        assert page.locator('.ro8-video').evaluate('(v)=>v.readyState>=2 && !v.paused')
        track=page.locator('.elementor-image-carousel').first
        before=track.evaluate('(e)=>getComputedStyle(e).transform')
        page.wait_for_timeout(200)
        assert before!=track.evaluate('(e)=>getComputedStyle(e).transform'), 'Logo carousel is static'
        print('HERO and local video playback: PASS; logo movement: PASS')
        # The original orbit animation has a 0.85s scrub delay.
        orbit=page.locator('.ali-orbit-scroll').first
        bounds=orbit.bounding_box()
        if name=='desktop':
            page.evaluate('(y)=>scrollTo(0,y)',bounds['y']+bounds['height']*.30)
            page.wait_for_timeout(1400)
            assert orbit.get_attribute('data-ali-ready')=='true'
            assert page.locator('.ali-orbit-service').evaluate_all('(es)=>es.some(e=>Number(getComputedStyle(e).opacity)>.9)')
            print('Original orbit initializes and reveals a service: PASS')
            page.screenshot(path=str(ROOT/'dist/rankorbit-desktop-orbit.png'))
        process=page.locator('.ro-space-process')
        process.scroll_into_view_if_needed();page.wait_for_timeout(1000)
        assert page.locator('.ro-process-card.ro-show').count()==4
        print('Four process-card reveals: PASS')
        page.screenshot(path=str(ROOT/f'dist/rankorbit-{name}-process.png'))
        details=page.locator('.e-n-accordion details')
        if details.count()>1:
            details.nth(1).locator('summary').click();page.wait_for_timeout(500)
            assert details.nth(1).get_attribute('open') is not None
            assert details.first.get_attribute('open') is None
            print('FAQ single-open behavior: PASS')
        if name=='mobile':
            page.evaluate('scrollTo(0,0)');page.wait_for_timeout(300)
            trigger=page.locator('.ro-menu-trigger').first
            print('mobile trigger',trigger.count(),trigger.is_visible())
            if trigger.is_visible():
                trigger.click();page.wait_for_timeout(500)
                assert 'ro-active' in page.locator('#roOffcanvas').get_attribute('class')
                page.keyboard.press('Escape');page.wait_for_timeout(500)
                assert 'ro-active' not in page.locator('#roOffcanvas').get_attribute('class')
                print('Mobile menu opens and closes with Escape: PASS')
        # Inspect the recovered lightbox without claiming playback of missing videos.
        marquee=page.locator('.RO1-video-marquee')
        marquee.scroll_into_view_if_needed();page.wait_for_timeout(700);marquee.hover();page.wait_for_timeout(200)
        index=page.locator('.RO1-video-card').evaluate_all('(es)=>{const v=document.querySelector(".RO1-video-marquee-viewport").getBoundingClientRect();return es.findIndex(e=>{const r=e.getBoundingClientRect();return r.x>=Math.max(0,v.x)&&r.right<=Math.min(innerWidth,v.right);});}')
        assert index>=0, 'No visible testimonial card'
        page.locator('.RO1-video-card').nth(index).click();page.wait_for_timeout(250)
        assert page.locator('#RO1-video-lightbox').get_attribute('aria-hidden')=='false'
        page.keyboard.press('Escape');page.wait_for_timeout(300)
        assert page.locator('#RO1-video-lightbox').get_attribute('aria-hidden')=='true'
        print('Testimonial lightbox open/Escape close: PASS (video files are missing from capture)')
        form=page.locator('form[data-ro-contact]')
        for field,value in [('first-name','Preview Test'),('phone-number','5550100'),('email-address','preview@example.com'),('message','Local preview validation only.')]:
            form.locator('[name="'+field+'"]').fill(value)
        form.locator('[type=submit]').click();page.wait_for_timeout(100)
        assert 'Preview only' in form.locator('.ro-form-status').inner_text()
        print('Form preview prevents remote submission: PASS')
        zone=page.locator('.roc-scroll-zone');zone.scroll_into_view_if_needed();page.wait_for_timeout(2300)
        b=zone.bounding_box();initial=page.locator('.roc-float').first.evaluate('(e)=>e.style.transform')
        page.evaluate('(y)=>scrollTo({top:y,behavior:"instant"})',page.evaluate('scrollY')+b['y']+max(0,(b['height']-height)*.65))
        page.wait_for_timeout(800)
        if b['height']>height+5:
            assert initial!=page.locator('.roc-float').first.evaluate('(e)=>e.style.transform')
            print('Closing CTA scroll-driven movement: PASS')
        else:
            assert page.locator('.roc-float').first.evaluate('(e)=>Number(e.style.opacity)>.9')
            print('Closing CTA source mobile static end state: PASS')
        page.evaluate('document.documentElement.style.scrollBehavior="auto";scrollTo({top:0,behavior:"instant"})')
        page.wait_for_timeout(200)
        assert not errors,errors
        assert not failed,failed
        assert page.evaluate('document.documentElement.scrollWidth<=innerWidth')
        page.screenshot(path=str(ROOT/f'dist/rankorbit-{name}-full.png'),full_page=True)
        results.append({'viewport':name,'page_errors':errors,'http_errors':failed,'remote_requests_blocked':sorted(set(remote)),'horizontal_overflow':page.evaluate('document.documentElement.scrollWidth-innerWidth')})
        page.close()
    browser.close()
server.shutdown()
(ROOT/'dist/browser-validation.json').write_text(json.dumps(results,indent=2))
