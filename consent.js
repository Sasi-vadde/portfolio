// Consent gate: Google Analytics loads only after the visitor clicks Accept.
// The choice lives in localStorage ('ga-consent' = 'granted' | 'denied').
// Any element with [data-consent-reset] reopens the banner so a visitor can change or withdraw consent.
(function () {
  var KEY = 'ga-consent', GA_ID = 'G-0ZYSKMET75';
  var de = (document.documentElement.lang || navigator.language || '').toLowerCase().indexOf('de') === 0;
  var text = de
    ? { msg: 'Darf ich Google Analytics nutzen, um zu sehen, wie oft diese Seite besucht wird? Es wird erst nach Ihrer Zustimmung geladen.', yes: 'Akzeptieren', no: 'Ablehnen', more: 'Datenschutz', label: 'Cookie-Einwilligung' }
    : { msg: 'May I use Google Analytics to see how often this site is visited? It only loads after you accept.', yes: 'Accept', no: 'Decline', more: 'Privacy', label: 'Cookie consent' };

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) { /* storage blocked: ask again next visit */ } }

  function loadGA() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function clearGACookies() {
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (name.indexOf('_ga') === 0) {
        document.cookie = name + '=; Max-Age=0; path=/';
        document.cookie = name + '=; Max-Age=0; path=/; domain=' + location.hostname;
      }
    });
  }

  function showBanner() {
    if (document.querySelector('.consent')) return;
    var box = document.createElement('div');
    box.className = 'consent';
    box.setAttribute('role', 'region');
    box.setAttribute('aria-label', text.label);
    box.innerHTML = '<p>' + text.msg + ' <a href="datenschutz.html">' + text.more + '</a></p>' +
      '<div class="consent-actions">' +
      '<button type="button" class="btn btn-primary" data-choice="granted">' + text.yes + '</button>' +
      '<button type="button" class="btn btn-ghost" data-choice="denied">' + text.no + '</button></div>';
    box.addEventListener('click', function (e) {
      var choice = e.target.getAttribute('data-choice');
      if (!choice) return;
      var wasLoaded = !!window.gtag;
      save(choice);
      box.remove();
      if (choice === 'granted') loadGA();
      else if (wasLoaded) { clearGACookies(); location.reload(); }
      else clearGACookies();
    });
    document.body.appendChild(box);
  }

  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-consent-reset]')) showBanner();
  });

  var choice = read();
  if (choice === 'granted') loadGA();
  else if (choice !== 'denied') {
    if (document.body) showBanner();
    else document.addEventListener('DOMContentLoaded', showBanner);
  }
})();
