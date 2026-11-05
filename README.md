# RankOrbit — capture-based animated Elementor homepage

Rebuilt from the homepage HTML and assets uploaded on November 5, 2026. This replaces the earlier generic Orbit starter. The package preserves the captured RankOrbit layout, typography, illustrations, video backgrounds, and recovered custom animation code.

## Install — recommended

1. Install and activate the free **Elementor Website Builder** plugin. Enable Flexbox Containers if your Elementor version requires it. **Hello Elementor** is the recommended theme.
2. In WordPress, go to **Plugins → Add New Plugin → Upload Plugin**. Upload **`dist/rankorbit-elementor-plugin.zip`**, install, and activate it. This is the companion plugin, not a theme.
3. Open **Tools → RankOrbit Homepage → Create / open homepage draft**. The plugin creates a new draft page and opens it in Elementor. It does not replace or publish your existing homepage. Repeating this button opens the same page instead of overwriting your edits.
4. In Elementor's Navigator/Structure panel, select a named section and its **RankOrbit — Animated Section** widget. Open **Text**, **Images & videos**, or **Links & testimonial videos** to customize it. Section containers can be reordered or removed.
5. Check the page in a separate frontend preview; scroll animations are most accurately shown outside the editor. Use **Elementor Canvas** to avoid duplicate theme headers and footers.
6. Update the logo, business/contact information, original service-page links, reviews, and the captured expired sale banner. The captured copyright, statistics, testimonials, and payment images are original reference content, not facts about your business.
7. Send a test consultation request after configuring WordPress mail delivery. The form sends to the **Administration Email Address** under **Settings → General**, using your own site's AJAX endpoint. No leads go to RankOrbit's server. Actual mail delivery depends on your host/SMTP setup.
8. Publish only after your review. To make this your homepage, select it under **Settings → Reading → A static page**.

The ZIP is about 32 MB because it bundles the captured videos and fonts. If your hosting upload limit is smaller, extract `rankorbit-elementor/` into `wp-content/plugins/` using your host's file manager, then activate it.

## Standard Elementor JSON import — alternative

Activate the companion plugin **first**. Go to **Templates → Saved Templates → Import Templates** and import **`dist/rankorbit-homepage-elementor.json`**. Create a page, choose Elementor Canvas, open **Edit with Elementor**, insert the template from **My Templates**, and save it.

The JSON requires the companion plugin to supply the custom widgets, local assets, and motion code. Importing it without the plugin will not reproduce the design. No Elementor Pro subscription or original paid addons are required by this integration.

## What is editable

There are **18 named blocks**, covering the header/navigation; hero; what-we-do orbit sequence; technology logos; why-us cards; service introduction and stacked service cards; process; client brands; video testimonials; captured Google reviews; FAQs; consultation; animated closing CTA; offices; footer; back-to-top control; and floating contact tab. Some utility blocks are separate from content sections.

Each block uses a custom Elementor widget containing the captured markup. Text, image/video, and link repeaters expose the content; these are **not hundreds of independent native Heading/Image widgets**. This keeps the original DOM and animation selectors intact. Move whole section containers in Elementor, but keep each original block only once: duplicate animation IDs are unsupported. To customize the internal structure, spacing, colors, or animation choreography, edit the plugin's section markup/styles/scripts. Basic gradient spans and line breaks can be retained in the Text controls.

Use the imported template or one-click setup for prefilled controls. Changing a widget's section selector alone does not populate the different section's controls; insert that section from the template instead.

## Motion and transitions

Recovered from the supplied capture and restored locally:

- Muted looping hero video and its 450 ms fade-in.
- GSAP / ScrollTrigger desktop orbit choreography, including rotation, progress, blur/clip card reveals, easing, and 0.85-second scrub smoothing. The source intentionally uses static service cards on mobile.
- Process-card entrance staggering and desktop pointer parallax.
- Seamless video testimonial marquee, hover behavior, and video lightbox.
- Mobile off-canvas menu and service accordions.
- Closing CTA scroll-driven floating elements, smoothing, and the original two-second hold.
- Footer reveals, button hover transitions, and floating contact smooth scrolling.

The original logo-carousel runtime and stacked-card addon JavaScript were saved as **unrecoverable browser blob URLs**. Their behavior is reconstructed using the captured markup, settings, and CSS: continuous logos with hover/focus pause and controls; sticky stacked service cards with scale/dimming. They are not verified byte-for-byte matches to the missing scripts. FAQ single-open behavior uses the captured 400 ms duration.

## Capture gaps

- The mobile-specific hero file `rankorbit.mp4` was not included. The bundled desktop hero video is used on mobile, cropped by the source's mobile styles.
- Five testimonial video files were not downloaded by the capture. Their original URLs remain editable under **Links & testimonial videos**. Upload your own MP4 files and replace those URLs for self-contained playback. See `dist/reference-inventory.json` for the list. The marquee and lightbox work; offline playback of those missing videos does not.
- `FAQs.mp4` exceeded the capture limit. The available `FAQs-2.mp4` is used for the FAQ visual, fixing the capture's MP4-as-image reference.
- Google reviews are a **static snapshot**, with local horizontal navigation; they do not refresh from Google. The source site's AI onboarding/payment popup and checkout are not part of this homepage integration. Product/service links remain editable destinations rather than recreated interior pages.
- Analytics, performance-plugin loaders, original backend/nonces, and browser-extension dimming styles were excluded. The expired sale content is preserved in its original captured header block so it can be edited or removed.

## Validation

Passed in standalone Chromium at 1440×1000 and 390×844: local asset loading, no horizontal overflow, no JavaScript runtime errors, original desktop orbit initialization and changing states, four process reveals, FAQ single-open behavior, and mobile-menu opening/closing. Additional browser checks cover the lightbox, logo movement/pause, CTA movement, and preview form behavior.

PHP 8.3 syntax checks pass. The renderer was exercised for all 18 blocks with **real WordPress HTML/URL sanitizers**: content edits, local asset resolution, token expansion, unsafe-URL stripping, and section-path allowlisting pass. Elementor hook registration/base class were stubbed for this check.

**A complete live WordPress/Elementor import and mail delivery have not been tested.** The official compiled Elementor download was blocked by this environment's network policy; GitHub source lacks the compiled frontend/vendor bundle. Do not treat the standalone preview as proof of a successful WordPress import. Test on a staging site before publishing.

## Files and maintenance

- `rankorbit-elementor/`: plugin source, section fragments, captured local assets, and motion.
- `dist/rankorbit-elementor-plugin.zip`: WordPress plugin upload.
- `dist/rankorbit-homepage-elementor.json`: optional Elementor import.
- `dist/rankorbit-preview.html`: local browser preview; serve `dist/` over HTTP.
- `dist/rankorbit-desktop-hero.png` and `dist/rankorbit-mobile-hero.png`: preview images.
- `dist/reference-inventory.json`: editable-block counts and capture limitations.

Generate from the uploaded capture staged in the ignored `reference/` directory (requires Python 3 and lxml):

```sh
python3 tools/build_reference.py
python3 tools/validate_reference.py
python3 tools/package_reference.py
```

The generator verifies the bundled upstream GSAP tarball against its official npm integrity metadata before extracting distribution files. Upstream headers and notices are retained. Only this project’s integration code is newly authored; captured site assets and third-party files retain their respective licenses.

Optional visual checks require Playwright and system Chromium:

```sh
python3 tools/check_reference.py
```

The isolated PHP renderer check in `tools/check_plugin.php` expects WordPress `formatting.php` and `kses.php` mounted at `/wp-check`, and this repository mounted at `/work`. It is a targeted renderer/sanitization check, not a substitute for a full Elementor installation.
