import config from './analytics-config.js';
const key = 'lessavio.web.analytics.v1';
const id = config.measurementId;
const configured = Boolean(config.apiKey && config.projectId && config.appId && /^G-[A-Z0-9]+$/.test(id || ''));
const production = !['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && location.protocol === 'https:';
let consent = 'denied', sdk, instance, starting;
try { consent = localStorage.getItem(key) || 'unknown'; } catch {}
const allowed = () => consent === 'granted' && configured && production;
const adsDenied = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' };
function stop() {
  window[`ga-disable-${id}`] = true;
  if (sdk) { sdk.setConsent({ ...adsDenied, analytics_storage: 'denied' }); if (instance) sdk.setAnalyticsCollectionEnabled(instance, false); }
  // Remove this site's analytics cookies when consent is withdrawn.
  for (const cookie of document.cookie.split(';')) {
    const name = cookie.split('=')[0].trim();
    if (name === '_ga' || name.startsWith('_ga_')) document.cookie = `${name}=; Max-Age=0; path=/`;
  }
}
async function start() {
  if (!allowed()) return;
  if (starting) return starting;
  starting = (async () => {
    const [app, analytics] = await Promise.all([
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js'),
      import('https://www.gstatic.com/firebasejs/13.1.0/firebase-analytics.js')
    ]);
    if (!allowed() || !await analytics.isSupported() || !allowed()) return;
    sdk = analytics;
    sdk.setConsent({ ...adsDenied, analytics_storage: 'granted' });
    window[`ga-disable-${id}`] = false;
    const page = { page_location: location.origin + location.pathname, page_referrer: '', page_title: document.title };
    instance ||= sdk.initializeAnalytics(app.initializeApp(config, 'lessavio-website'), { config: {
      ...page, send_page_view: false, allow_google_signals: false,
      allow_ad_personalization_signals: false, cookie_domain: 'none', cookie_expires: 60 * 60 * 24 * 365
    }});
    sdk.setAnalyticsCollectionEnabled(instance, true);
    let timeout;
    try {
      await Promise.race([sdk.getGoogleAnalyticsClientId(instance), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error('Analytics timeout')), 15000); })]);
    } finally { clearTimeout(timeout); }
    if (allowed()) sdk.logEvent(instance, 'page_view', { ...page, app_surface: 'marketing_web' });
  })().catch(() => { stop(); }).finally(() => { starting = null; });
  return starting;
}
const panel = document.createElement('section');
panel.className = 'analytics-panel'; panel.hidden = true;
panel.setAttribute('aria-label', 'Website analytics preferences');
panel.innerHTML = `<strong>A little insight. Your choice.</strong><p>Allow optional Google Analytics to help improve this website? It measures page visits and download clicks. No advertising. <a href="privacy.html">Privacy Policy</a></p><div><button type="button" data-choice="denied">Decline</button><button type="button" data-choice="granted">Allow analytics</button></div><p role="status" class="analytics-status"></p>`;
document.body.append(panel);
const settings = document.createElement('button'); settings.type = 'button'; settings.className = 'analytics-settings'; settings.textContent = 'Analytics settings';
(document.querySelector('.footer-links') || document.querySelector('footer')).append(settings);
settings.addEventListener('click', () => { panel.hidden = false; panel.querySelector('button').focus(); });
panel.addEventListener('click', event => {
  const choice = event.target.closest('[data-choice]')?.dataset.choice;
  if (!choice) return;
  consent = 'denied'; stop();
  try { localStorage.setItem(key, choice); consent = choice; }
  catch { panel.querySelector('[role="status"]').textContent = 'Your preference could not be saved. Analytics remain off.'; return; }
  panel.hidden = true;
  if (allowed()) void start();
});
document.addEventListener('click', event => {
  const link = event.target.closest('a[href]');
  if (!link || !allowed() || !sdk || !instance || starting) return;
  const path = new URL(link.href).pathname;
  const platform = path.endsWith('/Lessavio-macOS.dmg') ? 'macos' : path.endsWith('/Lessavio-Windows-Setup.exe') ? 'windows' : null;
  if (platform) sdk.logEvent(instance, 'desktop_download_click', { platform, app_surface: 'marketing_web' });
});
window.addEventListener('storage', event => {
  if (event.key !== key && event.key !== null) return;
  consent = event.newValue === 'granted' ? 'granted' : 'denied';
  if (allowed()) void start(); else stop();
});
if (configured && production && consent === 'unknown') panel.hidden = false;
if (allowed()) void start(); else stop();
