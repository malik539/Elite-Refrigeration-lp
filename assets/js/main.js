/* Elite Refrigeration Services Inc. — PPC landing page behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';

  var doc = document;
  var html = doc.documentElement;
  var params = new URLSearchParams(location.search);
  var context = html.getAttribute('data-campaign-context') || 'general';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var LABELS = {
    refrigeration: { service: 'Commercial Refrigeration', offer: 'Refrigeration Offer Selected', submit: 'Claim Refrigeration Offer' },
    hvac: { service: 'Commercial HVAC', offer: 'HVAC Offer Selected', submit: 'Claim HVAC Offer' }
  };

  function $(id) { return doc.getElementById(id); }
  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event, campaign_context: context };
    for (var k in data) if (Object.prototype.hasOwnProperty.call(data, k)) payload[k] = data[k];
    window.dataLayer.push(payload);
  }

  /* ---------- 1. Google Ads attribution → hidden fields ---------- */
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid'].forEach(function (key) {
    var field = $('f-' + key);
    var value = params.get(key);
    if (field && value) field.value = value.slice(0, 500);
  });
  var pageUrl = $('f-page_url');
  if (pageUrl) pageUrl.value = location.href.slice(0, 1000);

  /* ---------- 2. Campaign-context personalization ---------- */
  var form = $('lead-form');
  var select = $('service_needed');
  var serviceInterest = $('f-service_interest');
  var offerSelected = $('f-offer_selected');
  var offerContext = $('form-offer-context');
  var submitLabel = $('form-submit-label');
  var submitBtn = $('form-submit');

  function setService(service, source) {
    if (!LABELS[service]) return;
    if (select) {
      select.value = LABELS[service].service;
      clearError(select);
    }
    if (serviceInterest) serviceInterest.value = service;
    if (submitBtn) submitBtn.setAttribute('data-service', service);
    if (source !== 'offer') clearOffer();
  }

  function setOffer(service) {
    if (!LABELS[service]) return;
    setService(service, 'offer');
    if (offerSelected) offerSelected.value = service;
    if (offerContext) {
      offerContext.textContent = LABELS[service].offer;
      offerContext.classList.toggle('form-offer-context--hvac', service === 'hvac');
      offerContext.hidden = false;
    }
    if (submitLabel) submitLabel.textContent = LABELS[service].submit;
  }

  function clearOffer() {
    if (offerSelected) offerSelected.value = '';
    if (offerContext) { offerContext.hidden = true; offerContext.textContent = ''; }
    if (submitLabel) submitLabel.textContent = 'Request Service';
  }

  if (context === 'refrigeration' || context === 'hvac') {
    // Reorder DOM so reading order matches the visual emphasis (CSS `order` already prevents any flash).
    var offersGrid = $('offers-grid');
    var firstOffer = $('offer-' + context);
    if (offersGrid && firstOffer && offersGrid.firstElementChild !== firstOffer) offersGrid.insertBefore(firstOffer, offersGrid.firstElementChild);

    var wrap = $('services-wrap');
    var firstSection = $(context + '-services');
    if (wrap && firstSection && wrap.firstElementChild !== firstSection) wrap.insertBefore(firstSection, wrap.firstElementChild);

    var offerList = doc.querySelector('.hero__offer-list');
    var firstItem = doc.querySelector('[data-offer-item="' + context + '"]');
    if (offerList && firstItem && offerList.firstElementChild !== firstItem) offerList.insertBefore(firstItem, offerList.firstElementChild);

    // H1 keeps BOTH services; the campaign's service is simply named first.
    if (context === 'hvac') {
      var a = doc.querySelector('[data-svc-a]'), b = doc.querySelector('[data-svc-b]');
      if (a && b) { a.textContent = 'Commercial HVAC'; a.className = 'hero__svc hero__svc--hvac'; b.textContent = 'Refrigeration'; b.className = 'hero__svc hero__svc--refrigeration'; }
    }

    setService(context);
  }

  if (select) {
    select.addEventListener('change', function () {
      var service = select.value === LABELS.hvac.service ? 'hvac' : select.value === LABELS.refrigeration.service ? 'refrigeration' : 'general';
      if (serviceInterest) serviceInterest.value = service;
      if (submitBtn) submitBtn.setAttribute('data-service', service);
      if (offerSelected && offerSelected.value && offerSelected.value !== service) clearOffer();
      clearError(select);
    });
  }

  /* ---------- 3. CTA behaviour: scroll to form, preselect service / offer ---------- */
  var formAnchor = $('request-service');
  doc.querySelectorAll('[data-scroll-to-form]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      var offer = el.getAttribute('data-offer');
      var service = el.getAttribute('data-service');
      if (offer) setOffer(offer);
      else if (service && LABELS[service]) setService(service);
      track('cta_click', { cta_id: el.id || el.getAttribute('data-cta-label') || '', conversion_type: 'lead', service: service || 'general' });
      if (!formAnchor) return;
      e.preventDefault();
      formAnchor.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      var first = $('first_name');
      if (first && !first.value) {
        window.setTimeout(function () { try { first.focus({ preventScroll: true }); } catch (err) { first.focus(); } }, reduceMotion ? 0 : 450);
      }
    });
  });

  doc.querySelectorAll('a[href^="tel:"]').forEach(function (el) {
    el.addEventListener('click', function () {
      track('phone_click', { cta_id: el.id || el.getAttribute('data-cta-label') || '', conversion_type: 'phone', service: el.getAttribute('data-service') || 'general' });
    });
  });

  var claim = $('hero-claim-offer');
  if (claim) claim.addEventListener('click', function () { track('cta_click', { cta_id: 'hero-claim-offer', conversion_type: 'offer_view', service: 'general' }); });

  /* ---------- 4. Form validation & submission ---------- */
  function fieldWrap(input) { return input.closest('.field'); }
  function showError(input, msg) {
    var wrap = fieldWrap(input); var err = $(input.id + '-error');
    if (wrap) wrap.classList.add('is-invalid');
    if (err) err.textContent = msg;
    input.setAttribute('aria-invalid', 'true');
  }
  function clearError(input) {
    var wrap = fieldWrap(input); var err = $(input.id + '-error');
    if (wrap) wrap.classList.remove('is-invalid');
    if (err) err.textContent = '';
    input.removeAttribute('aria-invalid');
  }
  function validateField(input) {
    var v = input.value.trim();
    var label = (fieldWrap(input) && fieldWrap(input).querySelector('label')) ? fieldWrap(input).querySelector('label').textContent.replace('*', '').trim() : 'This field';
    if (input.required && !v) { showError(input, input.tagName === 'SELECT' ? 'Please choose Commercial Refrigeration or Commercial HVAC.' : 'Please enter your ' + label.toLowerCase() + '.'); return false; }
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { showError(input, 'Please enter a valid email address.'); return false; }
    if (input.type === 'tel' && v.replace(/\D/g, '').length < 10) { showError(input, 'Please enter a valid phone number with area code.'); return false; }
    clearError(input);
    return true;
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('input[required], select[required]'));
    fields.forEach(function (input) {
      input.addEventListener('blur', function () { if (input.value) validateField(input); });
      input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) validateField(input); });
    });

    var status = $('form-status');
    function setStatus(msgHtml) { if (!status) return; status.innerHTML = msgHtml; status.hidden = false; }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.hidden = true;
      var ok = true, firstBad = null;
      fields.forEach(function (input) { if (!validateField(input)) { ok = false; if (!firstBad) firstBad = input; } });
      if (!ok) { if (firstBad) firstBad.focus(); return; }

      var hp = $('company_website');
      if (hp && hp.value) return; // silently drop bot submissions

      var endpoint = (form.getAttribute('action') || '').trim();
      var service = serviceInterest ? serviceInterest.value : 'general';

      if (!endpoint) {
        // CONNECT EXISTING ELITE REFRIGERATION FORM ENDPOINT HERE (set the form's action attribute in index.html).
        // Never fake a successful submission.
        setStatus('Our online request form is not available right now. Please call <a href="tel:9142793818">914-279-3818</a> and we will take your request by phone.');
        if (window.console) console.warn('[Elite LP] Lead form has no endpoint configured. Set the <form action> attribute.');
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitLabel ? submitLabel.textContent : '';
      if (submitLabel) submitLabel.textContent = 'Sending…';
      track('form_submit_attempt', { service: service, offer: offerSelected ? offerSelected.value : '' });

      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res; })
        .then(function () {
          form.hidden = true;
          var success = $('form-success');
          if (success) { success.hidden = false; success.focus(); }
          track('generate_lead', { service: service, offer: offerSelected ? offerSelected.value : '', conversion_type: 'lead' });
        })
        .catch(function () {
          setStatus('Something went wrong sending your request. Please try again or call <a href="tel:9142793818">914-279-3818</a>.');
          submitBtn.disabled = false;
          if (submitLabel) submitLabel.textContent = originalLabel;
        });
    });
  }

  /* ---------- 5. FAQ accordion ---------- */
  var faqButtons = doc.querySelectorAll('.faq__q button[aria-controls]');
  function togglePanel(btn, open) {
    var panel = $(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { panel.hidden = false; requestAnimationFrame(function () { panel.classList.add('is-open'); }); }
    else {
      panel.classList.remove('is-open');
      if (reduceMotion) panel.hidden = true;
      else panel.addEventListener('transitionend', function handler() { panel.hidden = true; panel.removeEventListener('transitionend', handler); }, { once: true });
    }
  }
  faqButtons.forEach(function (btn, i) {
    btn.addEventListener('click', function () { togglePanel(btn, btn.getAttribute('aria-expanded') !== 'true'); });
    btn.addEventListener('keydown', function (e) {
      var next;
      if (e.key === 'ArrowDown') next = faqButtons[i + 1] || faqButtons[0];
      else if (e.key === 'ArrowUp') next = faqButtons[i - 1] || faqButtons[faqButtons.length - 1];
      else if (e.key === 'Home') next = faqButtons[0];
      else if (e.key === 'End') next = faqButtons[faqButtons.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  /* ---------- 6. Section reveal & header shadow ---------- */
  var reveals = doc.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  var header = $('site-header');
  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); ticking = false; });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var year = $('footer-year');
  if (year) year.textContent = String(new Date().getFullYear());

  track('landing_page_view', { landing_page: 'elite-offer' });
})();
