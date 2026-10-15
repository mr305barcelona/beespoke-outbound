// Exercises the real shared script without a browser or analytics network calls.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync(require('node:path').join(__dirname, '..', 'seo.js'), 'utf8');
const firstId = '00000000-0000-4000-8000-000000000001';
const secondId = '00000000-0000-4000-8000-000000000002';
function storage(initial = {}) {
  const entries = new Map(Object.entries(initial));
  return {getItem:key=>entries.get(key) ?? null,setItem:(key,value)=>entries.set(key,value),removeItem:key=>entries.delete(key)};
}
function page({path='/book/',referrer='',persistent=storage(),session=storage(),blocked=false}={}) {
  const handlers = new Map();
  const events = [];
  const frameWindow = {};
  const frame = {contentWindow:frameWindow};
  const embed = {querySelector:s=>s==='iframe'?frame:null,hidden:false};
  const fallback = {};
  const success = {hidden:true};
  const doc = {
    documentElement:{lang:'en',scrollHeight:844}, referrer,
    querySelector:s=>({'#calendly-embed':path==='/book/'?embed:null,'[data-calendly-fallback]':fallback,'[data-booking-success]':success}[s] || null),
    querySelectorAll:()=>[], addEventListener:()=>{}
  };
  const window = {gtag:(...args)=>events.push(args),Calendly:{initInlineWidget:options=>{window.options=options;}}};
  const context = {document:doc,location:{pathname:path,search:'',hostname:'outbound-lead-generation.com',origin:'https://outbound-lead-generation.com'},navigator:{languages:['en']},URL,URLSearchParams,Intl,Date,Set,Map,innerHeight:844,scrollY:0,requestAnimationFrame:fn=>fn(),window,addEventListener:(type,fn)=>{if(!handlers.has(type))handlers.set(type,[]);handlers.get(type).push(fn);}};
  for (const [key,value] of [['localStorage',persistent],['sessionStorage',session]]) {
    if(blocked) { Object.defineProperty(context,key,{get(){throw Error('storage blocked');}});Object.defineProperty(window,key,{get(){throw Error('storage blocked');}}); }
    else { context[key]=value;window[key]=value; }
  }
  vm.runInNewContext(source,context);
  const emit = (id,overrides={}) => {
    const message = {origin:'https://calendly.com',source:frameWindow,data:{event:'calendly.event_scheduled',payload:{event:{uri:`https://api.calendly.com/scheduled_events/${id}`}}},...overrides};
    for(const listener of handlers.get('message') || []) listener(message);
  };
  return {emit,events,leads:()=>events.filter(e=>e[1]==='generate_lead'),success,fallback,window,persistent};
}
const journey = JSON.stringify({createdAt:Date.now(),attribution:{source:'duckduckgo',medium:'organic',landingPage:'/pricing/'},calendlyUrl:'https://calendly.com/noahlevybuilds/30min?utm_source=duckduckgo&utm_medium=organic&utm_content=final%3A%2Fpricing%2F'});
for(const referrer of ['', 'https://calendly.com/noahlevybuilds/30min']) {
  const confirmation = page({path:'/booking-confirmed/',referrer,persistent:storage({'beespoke-booking-journey-v1':journey})});
  assert.equal(confirmation.leads().length,0,'Page visits/referrers/click journeys must not count bookings');
}
const p = page({persistent:storage({'beespoke-booking-journey-v1':journey}),session:storage({'beespoke-booking-confirmed-v1':'true'})});
assert.match(p.fallback.href,/utm_source=duckduckgo/,'Direct fallback must preserve attribution');
assert.equal(p.window.options.resize,undefined,'Preserve the existing Calendly sizing behavior');
p.emit(firstId,{origin:'https://calendly.com.attacker.example'});
p.emit(firstId,{origin:'https://evil.calendly.com'});
p.emit(firstId,{source:{}});
p.emit('not-an-event-id');
p.emit(firstId,{data:{event:'calendly.event_scheduled',payload:{event:{uri:`https://attacker.example/scheduled_events/${firstId}`}}}});
p.emit(firstId,{data:{event:'calendly.date_and_time_selected'}});
assert.equal(p.leads().length,0,'Untrusted, unrelated or incomplete messages must be ignored');
p.emit(firstId);p.emit(firstId);
assert.equal(p.leads().length,1,'Repeated messages for one booking must deduplicate');
assert.equal(p.success.hidden,false);
assert.equal(p.leads()[0][2].booking_event_id,firstId);
assert.equal(p.leads()[0][2].first_touch_source,'duckduckgo');
p.emit(secondId);
assert.equal(p.leads().length,2,'A distinct booking must not be suppressed by a session-wide flag');
const reloaded = page({persistent:p.persistent});reloaded.emit(firstId);
assert.equal(reloaded.leads().length,0,'A reload/new tab must not recount a known booking');
const blocked = page({blocked:true});blocked.emit(firstId);blocked.emit(firstId);blocked.emit(secondId);
assert.equal(blocked.leads().length,2,'Storage restrictions must retain in-page deduplication and distinct bookings');
console.log('Booking proof QA passed: no false page conversions, trusted frame + event identity, event-level dedupe, storage restrictions and attributed fallback.');
