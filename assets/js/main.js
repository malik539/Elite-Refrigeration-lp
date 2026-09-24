/* Elite Refrigeration Services Inc. — campaign landing page behaviour (vanilla JS, no dependencies).
   Shared by /refrigeration/ and /hvac/. The page's service comes from <html data-service="…">. */
(function () {
  'use strict';

  var doc = document;
  var service = doc.documentElement.getAttribute('data-service') || 'general';
  var params = new URLSearchParams(location.search);
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(id) { return doc.getElementById(id); }
  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event, service: service };
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

  /* ---------- 2. CTA behaviour: scroll to form, focus first field ---------- */
  var formAnchor = $('request-service');
  doc.querySelectorAll('[data-scroll-to-form]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      track('cta_click', { cta_id: el.id || el.getAttribute('data-cta-label') || '', conversion_type: 'lead' });
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
      track('phone_click', { cta_id: el.id || el.getAttribute('data-cta-label') || '', conversion_type: 'phone' });
    });
  });

  /* ---------- 3. Form validation & submission ---------- */
  var form = $('lead-form');
  var submitBtn = $('form-submit');

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
    var labelEl = fieldWrap(input) && fieldWrap(input).querySelector('label');
    var label = labelEl ? labelEl.textContent.replace('*', '').trim().toLowerCase() : 'this field';
    if (input.required && !v) { showError(input, 'Please enter your ' + label + '.'); return false; }
    if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { showError(input, 'Please enter a valid email address.'); return false; }
    if (input.type === 'tel' && v.replace(/\D/g, '').length < 10) { showError(input, 'Please enter a valid phone number with area code.'); return false; }
    clearError(input);
    return true;
  }

  if (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('input[required]'));
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
      if (!endpoint) {
        // CONNECT EXISTING ELITE REFRIGERATION FORM ENDPOINT HERE (set the form's action attribute in the page HTML).
        // Never fake a successful submission.
        setStatus('Our online request form is not available right now. Please call <a href="tel:9142793818">914-279-3818</a> and we will take your request by phone.');
        if (window.console) console.warn('[Elite LP] Lead form has no endpoint configured. Set the <form action> attribute.');
        return;
      }

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';
      track('form_submit_attempt', {});

      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
        .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); return res; })
        .then(function () {
          form.hidden = true;
          var success = $('form-success');
          if (success) { success.hidden = false; success.focus(); }
          track('generate_lead', { conversion_type: 'lead' });
        })
        .catch(function () {
          setStatus('Something went wrong sending your request. Please try again or call <a href="tel:9142793818">914-279-3818</a>.');
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }

  /* ---------- 4. FAQ accordion ---------- */
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

  /* ---------- 5. Section reveal & header shadow ---------- */
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

  track('landing_page_view', { landing_page: 'elite-offer-' + service });
})();
