/* Small adapters for scripts whose blob URLs were not recoverable in the capture.
   Original orbit, process, footer, menu, video and CTA scripts are loaded separately. */
(function () {
  'use strict';
  const config = window.ROCapture || {};
  // Normalize publicUrl: original hero script appends /assets/.
  if (config.publicUrl) config.publicUrl = config.publicUrl.replace(/\/$/, '');
  function ready() {
    document.querySelectorAll('.elementor-invisible').forEach(el => el.classList.remove('elementor-invisible'));
    // Restore continuous logo carousel without the source site's unavailable Swiper bundle.
    document.querySelectorAll('.elementor-image-carousel').forEach(track => {
      if (track.dataset.roReady) return;
      track.dataset.roReady = '1';
      const viewport = track.parentElement;
      const originals = Array.from(track.children);
      originals.forEach(slide => { const copy = slide.cloneNode(true); copy.setAttribute('aria-hidden', 'true'); copy.setAttribute('inert', ''); track.appendChild(copy); });
      const count = originals.length;
      let pos = 0, last = 0, paused = false;
      const reduced = matchMedia('(prefers-reduced-motion: reduce)');
      viewport.addEventListener('mouseenter', () => paused = true);
      viewport.addEventListener('mouseleave', () => paused = false);
      viewport.addEventListener('focusin', () => paused = true);
      viewport.addEventListener('focusout', () => paused = false);
      const step = () => originals[0] ? originals[0].getBoundingClientRect().width + 56 : 0;
      function animate(now) {
        const distance = step() * count;
        if (last && !paused && !reduced.matches && distance) {
          pos = (pos + Math.min(now - last, 60) * step() / 9000) % distance;
          track.style.transform = 'translate3d(' + (-pos) + 'px,0,0)';
        }
        last = now; requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
      viewport.querySelectorAll('.elementor-swiper-button').forEach(btn => btn.addEventListener('click', () => {
        const distance=step()*count;
        if(distance) {pos=(pos+(btn.classList.contains('elementor-swiper-button-prev')?-step():step())+distance)%distance;track.style.transform='translate3d('+(-pos)+'px,0,0)';}
      }));
    });
    // Stacked cards use captured sticky CSS; scale/dimming is reconstructed.
    const stacks = Array.from(document.querySelectorAll('.ali-sc-wrap'));
    let queued = false;
    function updateStacks() {
      queued = false;
      if (innerWidth <= 767) return;
      stacks.forEach(stack => {
        const cards = Array.from(stack.querySelectorAll('.ali-sc-card'));
        cards.forEach((card,i) => {
          const next = cards[i+1]; if (!next) return;
          const gap = next.getBoundingClientRect().top - card.getBoundingClientRect().top;
          const p = Math.max(0,Math.min(1,1-gap/Math.max(1,card.offsetHeight)));
          card.style.transform = 'scale('+(1-p*.045)+')';
          card.style.filter = 'brightness('+(1-p*.1)+')';
        });
      });
    }
    addEventListener('scroll',()=>{if(!queued){queued=true;requestAnimationFrame(updateStacks);}},{passive:true});
    addEventListener('resize',updateStacks);updateStacks();
    document.querySelectorAll('.e-n-accordion').forEach(accordion => {
      accordion.querySelectorAll(':scope > details').forEach(detail => {
        detail.addEventListener('toggle',()=>{
          const summary=detail.querySelector(':scope > summary'); if(summary) summary.setAttribute('aria-expanded',String(detail.open));
          if(detail.open) accordion.querySelectorAll(':scope > details').forEach(other=>{if(other!==detail)other.open=false;});
        });
      });
    });
    document.querySelectorAll('.ti-controls .ti-next,.ti-controls .ti-prev').forEach(btn=>btn.addEventListener('click',()=>{
      const widget=btn.closest('.ti-widget');const track=widget&&widget.querySelector('.ti-reviews-container-wrapper');
      if(track)track.scrollBy({left:(btn.classList.contains('ti-prev')?-1:1)*track.clientWidth*.75,behavior:'smooth'});
    }));
    document.querySelectorAll('.wpr-back-to-top').forEach(btn=>btn.addEventListener('click',event=>{event.preventDefault();scrollTo({top:0,behavior:'smooth'});}));
    // Use only the destination WordPress handler. No captured API nonce or URL is used.
    document.querySelectorAll('form[data-ro-contact]').forEach(form=>{
      form.addEventListener('submit',async event=>{
        event.preventDefault();
        if(!form.reportValidity())return;
        const status=form.querySelector('.ro-form-status');
        if(config.preview||!config.ajaxUrl){status.textContent='Preview only. On WordPress this form sends to the site administrator.';return;}
        const button=form.querySelector('[type=submit]');button.disabled=true;status.textContent='Sending…';
        const data=new FormData(form);data.set('action','ro_capture_contact');data.set('nonce',config.nonce);
        try {
          const response=await fetch(config.ajaxUrl,{method:'POST',body:data,credentials:'same-origin'});
          const result=await response.json();status.textContent=result.data&&result.data.message||'Unable to send. Please try again.';
          if(result.success)form.reset();
        } catch(error) {status.textContent='Unable to send. Please try again or use the contact details shown.';}
        finally {button.disabled=false;}
      });
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
