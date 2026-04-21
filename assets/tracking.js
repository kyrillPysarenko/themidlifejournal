/* ============================================
   The Midlife Journal — Tracking & Attribution
   ============================================

   All-in-one: Meta Pixel + Microsoft Clarity +
   UTM relay + scroll depth + CTA click events.

   Tracks the full funnel:
     Meta Ad → Journal → CTA → Reprieve PDP → Purchase

   Config via global `window.MLJ_CONFIG` if needed
   (set before this script loads). Defaults below.
*/
(function () {
  'use strict';

  var CONFIG = Object.assign({
    metaPixelId:    '1835127594111086',  // same pixel as Reprieve = unified attribution
    clarityId:      'wfdna0fsn0',         // Microsoft Clarity project
    brandDomain:    'reprievehealth.com', // where CTAs ultimately route
    defaultSource:  'midlifejournal',
    defaultMedium:  'listicle'
  }, window.MLJ_CONFIG || {});

  // ---------- 1. Capture incoming params (UTM + fbclid + gclid) ----------
  var qs = new URLSearchParams(window.location.search);
  var incoming = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
   'fbclid', 'gclid', 'ttclid', 'msclkid'].forEach(function (k) {
    if (qs.has(k)) incoming[k] = qs.get(k);
  });
  if (Object.keys(incoming).length) {
    try { sessionStorage.setItem('mlj_incoming', JSON.stringify(incoming)); } catch (e) {}
  } else {
    try {
      var stored = sessionStorage.getItem('mlj_incoming');
      if (stored) incoming = JSON.parse(stored);
    } catch (e) {}
  }

  // ---------- 2. Meta Pixel bootstrap ----------
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return;
    n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
    if (!f._fbq) f._fbq = n;
    n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
    t = b.createElement(e); t.async = !0; t.src = v;
    s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', CONFIG.metaPixelId);
  fbq('track', 'PageView');

  // Fire ViewContent with article metadata for smart audience building
  var contentMeta = {
    content_name: document.title,
    content_category: (document.querySelector('.article__kicker, .section-header__kicker, .home-hero__kicker') || {}).innerText || 'Homepage',
    content_type: 'article'
  };
  fbq('track', 'ViewContent', contentMeta);

  // ---------- 3. Scroll-depth events (50% + 80%) ----------
  var scrollFired = { 50: false, 80: false };
  function onScroll() {
    var h = document.documentElement;
    var scrolled = (h.scrollTop || document.body.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
    [50, 80].forEach(function (threshold) {
      if (!scrollFired[threshold] && scrolled >= threshold) {
        scrollFired[threshold] = true;
        fbq('trackCustom', 'ArticleScroll' + threshold, contentMeta);
      }
    });
    if (scrollFired[50] && scrollFired[80]) window.removeEventListener('scroll', onScroll);
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- 4. CTA click — UTM relay + Meta event ----------
  // Any link to reprievehealth.com gets the full attribution trail appended.
  function enhanceCTALinks() {
    var links = document.querySelectorAll('a[href*="' + CONFIG.brandDomain + '"]');
    links.forEach(function (a) {
      if (a.dataset.mljEnhanced) return;
      a.dataset.mljEnhanced = '1';

      // Merge: existing link UTMs take precedence; we add any incoming params that aren't already on the link.
      try {
        var url = new URL(a.href);
        // Ensure default attribution source if link has none
        if (!url.searchParams.has('utm_source')) url.searchParams.set('utm_source', CONFIG.defaultSource);
        if (!url.searchParams.has('utm_medium')) url.searchParams.set('utm_medium', CONFIG.defaultMedium);
        // Relay incoming click IDs so Reprieve Pixel can match
        ['fbclid', 'gclid', 'ttclid', 'msclkid'].forEach(function (k) {
          if (incoming[k] && !url.searchParams.has(k)) url.searchParams.set(k, incoming[k]);
        });
        // Relay upstream campaign so we can attribute which Meta ad → sale
        if (incoming.utm_campaign && !url.searchParams.has('mlj_src_campaign')) {
          url.searchParams.set('mlj_src_campaign', incoming.utm_campaign);
        }
        if (incoming.utm_source && !url.searchParams.has('mlj_src_channel')) {
          url.searchParams.set('mlj_src_channel', incoming.utm_source);
        }
        a.href = url.toString();
      } catch (e) {}

      // Fire event on click
      a.addEventListener('click', function () {
        fbq('trackCustom', 'OutboundLead', Object.assign({
          destination: a.href,
          position: a.closest('.cta-box') ? 'cta-box' :
                    a.closest('.article__disclosure') ? 'footer-disclosure' : 'inline'
        }, contentMeta));
      }, { passive: true });
    });
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceCTALinks);
  } else {
    enhanceCTALinks();
  }

  // ---------- 5. Microsoft Clarity (heatmap + recordings) ----------
  if (CONFIG.clarityId) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CONFIG.clarityId);
  }

  // ---------- 6. Vercel Analytics + Speed Insights ----------
  // Auto-active on any Vercel deployment. Enable in Vercel Project → Analytics tab.
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
  var vaScript = document.createElement('script');
  vaScript.defer = true;
  vaScript.src = '/_vercel/insights/script.js';
  document.head.appendChild(vaScript);

  window.si = window.si || function () { (window.siq = window.siq || []).push(arguments); };
  var siScript = document.createElement('script');
  siScript.defer = true;
  siScript.src = '/_vercel/speed-insights/script.js';
  document.head.appendChild(siScript);

  // Custom Vercel Analytics event: OutboundLead fires also to Vercel
  function vaTrack(name, props) {
    if (window.va) window.va('event', { name: name, data: props || {} });
  }
  // Wire it into the existing CTA hook (augment the earlier click handler)
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href*="' + CONFIG.brandDomain + '"]');
    if (a) {
      vaTrack('outbound_cta', {
        href: a.href,
        article: contentMeta.content_name
      });
    }
  }, { passive: true, capture: true });

  // Expose tiny debug helper
  window.mljDebug = function () {
    console.log('MLJ tracking:', {
      pixel: CONFIG.metaPixelId,
      clarity: CONFIG.clarityId || '(not set)',
      incoming: incoming,
      content: contentMeta,
      scrolled: scrollFired
    });
  };
})();
