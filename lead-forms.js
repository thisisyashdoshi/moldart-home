'use strict';

(function () {
  var RESOURCE_ACCESS_KEY = 'moldart-resource-access-v2';

  function getField(form, name) {
    return form && form.elements ? form.elements[name] : null;
  }

  function setStatus(form, message, tone) {
    var status = form.querySelector('[data-lead-form-status]');
    if (!status) {
      status = document.createElement('p');
      status.setAttribute('data-lead-form-status', '');
      status.setAttribute('role', 'status');
      status.className = 'lead-form-status';
      form.appendChild(status);
    }
    status.setAttribute('role', tone === 'error' ? 'alert' : 'status');
    status.setAttribute('aria-live', tone === 'error' ? 'assertive' : 'polite');
    status.setAttribute('aria-atomic', 'true');
    status.className = 'lead-form-status is-' + (tone || 'neutral');
    status.textContent = message;
  }

  function setSubmitting(form, submitting) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;
    if (!button.dataset.defaultText) button.dataset.defaultText = button.textContent;
    button.disabled = Boolean(submitting);
    button.textContent = submitting ? 'Submitting...' : button.dataset.defaultText;
  }

  function safeJson(response) {
    return response.text().then(function (text) {
      if (!text) return {};
      try {
        return JSON.parse(text);
      } catch (_) {
        return {};
      }
    });
  }

  function errorMessage(json, fallback) {
    if (json && Array.isArray(json.errors) && json.errors.length) return json.errors.join(' ');
    return fallback;
  }

  function closeResourceGate() {
    var gate = document.getElementById('resource-gate');
    if (!gate) return;
    gate.classList.remove('is-open');
    gate.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('scroll-locked');
  }

  function submitLead(form) {
    var action = form.getAttribute('action') || '/api/lead-intake';
    return fetch(action, {
      method: 'POST',
      body: new FormData(form),
      credentials: 'same-origin',
      headers: { Accept: 'application/json' },
    }).then(function (response) {
      return safeJson(response).then(function (json) {
        if (!response.ok || !json.ok) {
          throw new Error(
            errorMessage(
              json,
              'The request could not be submitted. Please email info@moldartindia.com or use WhatsApp.'
            )
          );
        }
        return json;
      });
    });
  }

  function storeResourceAccess(form, leadId) {
    try {
      localStorage.setItem(
        RESOURCE_ACCESS_KEY,
        JSON.stringify({
          name: getField(form, 'name')?.value || '',
          company: getField(form, 'company')?.value || '',
          email: getField(form, 'email')?.value || '',
          phone: getField(form, 'phone')?.value || '',
          leadId: leadId || '',
          unlockedAt: new Date().toISOString(),
        })
      );
    } catch (_) {}
  }

  document.addEventListener(
    'click',
    function (event) {
      var link = event.target.closest('a[data-gated-download]');
      if (!link) return;
      var selected = document.getElementById('resource-download-selected-title');
      if (selected) selected.textContent = link.dataset.downloadTitle || 'Selected document';
    },
    true
  );

  document.addEventListener(
    'submit',
    function (event) {
      var form = event.target.closest('form[data-lead-form]');
      if (!form) return;

      event.preventDefault();
      event.stopImmediatePropagation();

      if (typeof form.reportValidity === 'function' && !form.reportValidity()) return;

      var isResourceGate = form.id === 'resource-gate-form';
      var downloadUrl = getField(form, 'download_url')?.value || '';
      var nextUrl = getField(form, 'next')?.value || '';

      setSubmitting(form, true);
      setStatus(form, isResourceGate ? 'Submitting access details...' : 'Submitting inquiry...', 'neutral');

      submitLead(form)
        .then(function (json) {
          if (isResourceGate) {
            storeResourceAccess(form, json.leadId);
            setStatus(form, 'Access confirmed. Download starting now.', 'success');
            window.setTimeout(function () {
              if (downloadUrl) window.location.href = downloadUrl;
              closeResourceGate();
              setSubmitting(form, false);
            }, 550);
            return;
          }

          setStatus(form, 'Inquiry received. Redirecting...', 'success');
          window.setTimeout(function () {
            window.location.href = nextUrl && nextUrl.charAt(0) === '/' ? nextUrl : '/contact/?submitted=true';
          }, 350);
        })
        .catch(function (error) {
          setSubmitting(form, false);
          setStatus(
            form,
            error.message || 'The request could not be submitted. Please email info@moldartindia.com or use WhatsApp.',
            'error'
          );
        });
    },
    true
  );

  function renderTurnstile() {
    var siteKey =
      window.MOLDART_TURNSTILE_SITE_KEY ||
      document.querySelector('meta[name="moldart-turnstile-site-key"]')?.getAttribute('content') ||
      '';
    if (!siteKey || !window.turnstile) return;
    document.querySelectorAll('[data-turnstile-slot]').forEach(function (slot) {
      if (slot.dataset.rendered === 'true') return;
      var form = slot.closest('form');
      if (!form) return;
      slot.dataset.rendered = 'true';
      window.turnstile.render(slot, {
        sitekey: siteKey,
        callback: function (token) {
          var field = getField(form, 'cf-turnstile-response') || getField(form, 'turnstile_token');
          if (field) field.value = token;
        },
        'expired-callback': function () {
          var field = getField(form, 'cf-turnstile-response') || getField(form, 'turnstile_token');
          if (field) field.value = '';
        },
      });
    });
  }

  function initTurnstile() {
    var siteKey =
      window.MOLDART_TURNSTILE_SITE_KEY ||
      document.querySelector('meta[name="moldart-turnstile-site-key"]')?.getAttribute('content') ||
      '';
    if (!siteKey || !document.querySelector('[data-turnstile-slot]')) return;
    if (window.turnstile) {
      renderTurnstile();
      return;
    }
    window.moldartRenderTurnstile = renderTurnstile;
    var script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?onload=moldartRenderTurnstile&render=explicit';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTurnstile, { once: true });
  } else {
    initTurnstile();
  }
})();
