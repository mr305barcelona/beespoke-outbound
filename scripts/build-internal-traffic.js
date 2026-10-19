const fs = require('node:fs');
const path = require('node:path');
const assetUrl = require('./asset-version');
const root = path.resolve(__dirname, '..');
const guard = `<script id="beespoke-internal-traffic-guard">(()=>{try{if(localStorage.getItem('beespoke-internal-traffic-v1')==='exclude'){window.beespokeInternalTraffic=true;const tag=document.currentScript.nextElementSibling;const id=new URL(tag.src,location.href).searchParams.get('id');if(/^G-[A-Z0-9]+$/.test(id||''))window['ga-disable-'+id]=true}}catch{}})();</script>`;
function applyGuard(html) {
  const tag = /<script\s+async\s+src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-[A-Z0-9]+"><\/script>/;
  if (!tag.test(html)) return html;
  if (html.includes('id="beespoke-internal-traffic-guard"')) {
    if (!html.includes(guard)) throw new Error('Unexpected existing internal traffic guard');
    return html;
  }
  return html.replace(tag, match => guard + match);
}
function build() {
  const file = path.join(root, 'analytics-settings/index.html');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,follow"><link rel="canonical" href="https://outbound-lead-generation.com/analytics-settings/"><title>Analytics settings for this browser | Beespoke</title><link rel="icon" href="/favicon.png"><style>body{margin:0;background:#f8fafc;color:#101828;font:16px/1.65 system-ui,sans-serif}main{box-sizing:border-box;max-width:720px;margin:0 auto;padding:32px 20px 64px}a{color:#143d59}h1{font-size:clamp(1.8rem,5vw,2.5rem);line-height:1.2}section{padding:24px;border:1px solid #d0d5dd;border-radius:16px;background:#fff}button{min-height:44px;max-width:100%;padding:12px 18px;margin:8px 8px 8px 0;border:1px solid #143d59;border-radius:8px;background:#143d59;color:#fff;font:inherit;cursor:pointer}button.secondary{background:#fff;color:#143d59}button:disabled{opacity:.65;cursor:default}:focus-visible{outline:3px solid #9a6500;outline-offset:4px}#analytics-status{font-weight:700;color:#143d59}.note{color:#475467}</style></head><body><main><a href="/">Beespoke Outbound — home</a><h1>Analytics settings for this browser</h1><p>Use this control on a work or audit browser to keep its visits out of this website's Google Analytics measurement.</p><section aria-labelledby="browser-setting"><h2 id="browser-setting">This browser profile</h2><p id="analytics-status" role="status" aria-live="polite" aria-atomic="true">Checking the current setting…</p><button type="button" id="exclude-analytics">Exclude this browser</button><button type="button" class="secondary" id="restore-analytics">Restore analytics for this browser</button><p id="analytics-detail" class="note"></p></section><p>This setting is saved on this website in this browser profile. Other devices and browsers keep their own settings. Clearing site storage removes the preference.</p><p>Restoring analytics takes effect on your next page load. Booking links and the rest of the website continue to work.</p><p><a href="/">Return to the website</a></p></main><script src="${assetUrl('/internal-traffic-control.js')}" defer></script></body></html>`);
}
module.exports = { applyGuard, build, guard };
