# Elite Refrigeration Services Inc. — Google Ads Landing Pages

Two focused landing pages, one per campaign, sharing one stylesheet, one script and one image set.

```
refrigeration/index.html   Commercial Refrigeration campaign page
hvac/index.html            Commercial HVAC campaign page
index.html                 Lightweight router: forwards stray root visits (query string intact) to the matching page
assets/css/styles.css      Shared styles (brand palette sampled from the logo)
assets/js/main.js          Shared vanilla JS: attribution capture, scroll-to-form, validation, FAQ, reveals
assets/images/             Logo + supplied photos as JPG and WebP, 420w and 555w variants
```

No build step. Upload the folder to any static web server. Point each Google Ads campaign's final URL directly at its page:

| Campaign | Final URL |
| --- | --- |
| Commercial Refrigeration | `https://go.eliterefrigeration.com/elite-offer/refrigeration/` |
| Commercial HVAC | `https://go.eliterefrigeration.com/elite-offer/hvac/` |

Update the `<link rel="canonical">` and `og:url` tags in each page if the pages are hosted at a different path.

## Page structure (both pages)

1. Header: logo + click-to-call
2. Hero: keyword-matched H1, three proof points, single offer block, lead form beside the copy (desktop) or directly under the CTAs (mobile)
3. Trust strip: Owner Operated · 40+ Combined Years · Commercial Focus · Continuously Trained Technicians
4. Services: intro, image, six service cards
5. Why Elite + both Google reviews
6. Five service-specific FAQs
7. Final CTA with the offer restated once
8. Footer with a single cross-link to the other page

Each page has five conversion elements on desktop (header phone, hero phone, form submit, final request, final phone) plus the mobile-only sticky bar and the hero "Request Service" button that appears only when the form is not beside the copy. The offer appears twice per page: the hero and the final CTA.

## Before going live

1. **Connect the lead form endpoint.** In both pages search for `CONNECT EXISTING ELITE REFRIGERATION FORM ENDPOINT HERE` and set the `<form action="">` attribute to the existing lead handler. `main.js` POSTs the fields with `fetch()` and shows the thank-you panel on any 2xx response. With no action set, visitors see a message asking them to call; the page never fakes a successful submission.
   Fields posted: `first_name, last_name, email, phone, company_website (honeypot, must be empty), service_needed (Commercial Refrigeration | Commercial HVAC), service_interest (refrigeration | hvac), landing_page (elite-offer-refrigeration | elite-offer-hvac), utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, gbraid, wbraid, page_url`.
2. **Bot protection.** A honeypot field is included. Replace it with reCAPTCHA / hCaptcha / Turnstile if the existing form requires one.
3. **Tracking.** Paste the GTM container snippet (or gtag.js) where the placeholder comments are in each page's `<head>` and just after `<body>`. No IDs are hard-coded.
4. **Address, hours and privacy policy.** The official website could not be reached from the build environment, so no street address, business hours or service area are displayed. Placeholders are commented in the footer. Add them only after verifying on eliterefrigeration.com.

## dataLayer events (for GTM triggers)

`landing_page_view` (landing_page), `cta_click` (cta_id), `phone_click` (cta_id), `form_submit_attempt`, `generate_lead`. Every event carries `service: refrigeration | hvac`. Conversion element IDs: `header-phone, hero-phone, hero-request-service, form-submit, final-request-service, final-phone, footer-phone, mobile-call, mobile-request-service`, each with `data-conversion-type="lead|phone"` and `data-service`.

## Facts used and their source

Every claim comes from the supplied content Markdown (the current elite-offer page copy): owner operated; over 40 combined years of HVAC/R experience; customers ranging from supermarkets, cold storage warehouses and restaurants; continuously educated and trained technicians; the descriptors professional, affordable, knowledgeable, trustworthy, honest, dependable, timely and quick to respond; service categories Maintenance & Repair, HVAC, Refrigeration, Emergency; equipment warranty and maintenance guarantee offered; creative, affordable troubleshooting; the two 10% offers with the "subject to equipment selection" disclaimer; the two Google reviews (Jordan Hahn, Yeudy Herrera); the PPC number 914-279-3818; the "Discover True Service" motto.

Not used because they could not be verified: street address, hours, service areas, licensing/insurance, 24/7 availability, response-time guarantees, review counts or star ratings.

## Editing

The two pages are plain HTML and are intentionally near-identical in structure. When changing shared sections (trust strip, why Elite, reviews, footer), apply the same edit to both files.

## Local QA performed

Playwright checks at 320, 375, 390, 430, 768, 1024, 1366, 1440 and 1920 px on both pages: no horizontal overflow, no tap target under 44 px, attribution capture, scroll-to-form, validation, FAQ ARIA states and the root router verified. Lighthouse on a local server without gzip: see the commit message for the latest scores. Enable gzip/brotli and long cache headers on the production server.
