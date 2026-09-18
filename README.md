# Elite Refrigeration Services Inc. — Google Ads Landing Page

One conversion-focused landing page that serves two Google Ads campaigns (Commercial Refrigeration and Commercial HVAC) from a single codebase.

```
index.html                 The landing page
assets/css/styles.css      Styles (brand palette sampled from the logo)
assets/js/main.js          Vanilla JS: attribution capture, campaign personalization, form logic, FAQ, reveals
assets/images/             Logo + supplied photos as JPG and WebP, 420w and 555w variants
```

No build step. Upload the folder to any static web server (the existing `go.eliterefrigeration.com/elite-offer/` path is the canonical URL in the `<head>`; change it if the page is hosted elsewhere).

## Before going live

1. **Connect the lead form endpoint.** Search `index.html` for `CONNECT EXISTING ELITE REFRIGERATION FORM ENDPOINT HERE` and set the `<form action="">` attribute to the existing lead handler (WordPress form processor, CRM webhook, Zapier, etc.). `main.js` POSTs the fields with `fetch()` and shows the thank-you panel on any 2xx response. With no action set, visitors see a message asking them to call; the page never fakes a successful submission.
   Fields posted: `first_name, last_name, email, phone, service_needed, company_website (honeypot, must be empty), utm_source, utm_medium, utm_campaign, utm_term, utm_content, gclid, gbraid, wbraid, service_interest (refrigeration|hvac|general), offer_selected (refrigeration|hvac|""), landing_page (elite-offer), page_url`.
2. **Bot protection.** A honeypot field is included. Replace it with reCAPTCHA / hCaptcha / Turnstile if the existing form requires one.
3. **Tracking.** Paste the GTM container snippet (or gtag.js) where the placeholder comments are in `<head>` and just after `<body>`. No IDs are hard-coded.
4. **Address, hours and privacy policy.** The official website could not be reached from the build environment, so no street address, business hours or service area are displayed. Placeholders are commented in the Contact section and footer. Add them only after verifying on eliterefrigeration.com.

## Campaign personalization

The page reads `utm_campaign`, `utm_term`, `utm_content` (and an optional `service=` override):

| URL signal | Result |
| --- | --- |
| refrig / cooler / freezer / walk-in / cold storage | `data-campaign-context="refrigeration"`: Refrigeration named first in the H1, refrigeration offer card and service section first, "Commercial Refrigeration" preselected, refrigeration hero image |
| hvac / heat pump / ductless / mini split / air conditioning / heating / furnace / rooftop | `data-campaign-context="hvac"`: HVAC named first in the H1, HVAC offer card and section first, "Commercial HVAC" preselected |
| none / both | `general`: balanced default |

Test URLs:

```
index.html?utm_campaign=Commercial+Refrigeration&utm_term=walk+in+cooler+repair&gclid=TEST
index.html?utm_campaign=Commercial_HVAC&utm_term=commercial+hvac+repair&gclid=TEST
```

Both offer CTAs scroll to the same form, preselect the matching service, show "Refrigeration Offer Selected" / "HVAC Offer Selected" above the form and relabel the submit button.

## dataLayer events (for GTM triggers)

`landing_page_view`, `cta_click` (cta_id, conversion_type, service), `phone_click` (cta_id, service), `form_submit_attempt`, `generate_lead` (service, offer). Every conversion element also has a stable ID and `data-conversion-type` / `data-service` attributes: `header-phone, hero-request-service, hero-phone, refrigeration-offer-cta, refrigeration-service-cta, refrigeration-phone, hvac-offer-cta, hvac-service-cta, hvac-phone, form-submit, form-phone, mid-request-service, mid-phone, contact-phone, final-request-service, final-phone, mobile-call, mobile-request-service`.

## Facts used and their source

Every claim on the page comes from the supplied content Markdown (the current elite-offer page copy): owner operated; over 40 combined years of HVAC/R experience; customers ranging from supermarkets, cold storage warehouses and restaurants; continuously educated and trained technicians; the descriptors professional, affordable, knowledgeable, trustworthy, honest, dependable, timely and quick to respond; service categories Maintenance & Repair, HVAC, Refrigeration, Emergency; equipment warranty and maintenance guarantee offered; creative, affordable troubleshooting; the two 10% offers with the "subject to equipment selection" disclaimer; the two Google reviews (Jordan Hahn, Yeudy Herrera); the PPC number 914-279-3818; the "Discover True Service" motto.

Not used because they could not be verified: street address, hours, service areas, licensing/insurance, 24/7 availability, response-time guarantees, review counts or star ratings (the supplied star graphic's meaning was ambiguous, so it was left out).

## Local QA performed

Playwright checks at 320, 375, 390, 430, 768, 1024, 1366, 1440 and 1920 px in all three campaign contexts: no horizontal overflow, no tap target under 44 px, personalization, offer preselection, validation, FAQ ARIA states and keyboard navigation verified. Lighthouse (local server, no gzip): mobile 99 / 100 / 100 / 100, desktop 96 / 100 / 100 / 100 (Performance / Accessibility / Best Practices / SEO). Enable gzip/brotli and long cache headers on the production server for the remaining gains.
