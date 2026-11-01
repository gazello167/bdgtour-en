// Pelacak ringan untuk situs publik. Letakkan di public/t.js (Astro), lalu tambahkan di Layout:
//   <script is:inline src="/en/t.js" defer></script>
// Mengirim: tayangan halaman, klik WhatsApp/telepon/email, dan klik ke situs luar.
// Tombol atau link lain bisa diberi label sendiri: <a href="..." data-track="booking">
(() => {
  'use strict';

  const ENDPOINT = '/en/admin/track.php';   // sesuaikan dengan lokasi track.php di server
  let lastPath = null;

  function send(data) {
    const body = new URLSearchParams(data);
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, body)) return;
    } catch (_) { /* lanjut ke fetch */ }
    try {
      fetch(ENDPOINT, { method: 'POST', body, keepalive: true, credentials: 'same-origin' });
    } catch (_) { /* abaikan */ }
  }

  function pageview() {
    const path = location.pathname;
    if (path === lastPath) return;                      // cegah hitungan ganda
    lastPath = path;
    send({
      t: 'v',
      p: path,
      r: document.referrer || '',
      u: new URLSearchParams(location.search).get('utm_source') || '',
    });
  }

  // tunggu tab terlihat (hindari prerender dan tab latar belakang)
  function whenVisible(fn) {
    if (document.visibilityState === 'visible') { fn(); return; }
    const on = () => {
      if (document.visibilityState === 'visible') {
        document.removeEventListener('visibilitychange', on);
        fn();
      }
    };
    document.addEventListener('visibilitychange', on);
  }

  function labelFor(a) {
    const custom = (a.dataset.track || '').toLowerCase();
    if (/^[a-z0-9_-]{1,40}$/.test(custom)) return custom;
    const href = a.getAttribute('href') || '';
    if (/^tel:/i.test(href)) return 'tel';
    if (/^mailto:/i.test(href)) return 'email';
    let u;
    try { u = new URL(href, location.href); } catch (_) { return ''; }
    if (/(^|\.)wa\.me$/i.test(u.hostname) || /whatsapp\.com$/i.test(u.hostname)) return 'whatsapp';
    if ((u.protocol === 'http:' || u.protocol === 'https:') && u.host !== location.host) return 'outbound:' + u.hostname.toLowerCase().replace(/^www\./, '');
    return '';
  }

  function onClick(e) {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const l = labelFor(a);
    if (l) send({ t: 'c', p: location.pathname, l });
  }

  whenVisible(pageview);
  document.addEventListener('astro:page-load', () => whenVisible(pageview));   // bila memakai View Transitions
  document.addEventListener('click', onClick, true);
  document.addEventListener('auxclick', onClick, true);
})();
