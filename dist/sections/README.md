# Individual Elementor section templates

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
| `01-header-navigation.json` | Header & navigation |
| `02-hero.json` | Hero |
| `03-what-we-do-orbit.json` | What we do — scroll-driven orbit |
| `04-technology-logo-carousel.json` | Technology logo carousel |
| `05-why-choose-us.json` | Why choose us |
| `06-services-introduction.json` | Services introduction |
| `07-stacked-service-cards.json` | Stacked service cards |
| `08-our-process.json` | Our process |
| `09-client-brands.json` | Brands we have served |
| `10-video-testimonials.json` | Video testimonials |
| `11-google-reviews.json` | Google reviews |
| `12-frequently-asked-questions.json` | Frequently asked questions |
| `13-free-consultation.json` | Free consultation |
| `14-animated-closing-cta.json` | Animated closing call to action |
| `15-office-addresses.json` | Office addresses |
| `16-footer-payment-logos.json` | Footer & payment logos |
| `17-back-to-top.json` | Back to top |
| `18-floating-get-started-tab.json` | Floating Get Started tab |
