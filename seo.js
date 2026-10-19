(() => {
  const internalTrafficKey = 'beespoke-internal-traffic-v1';
  const internalTrafficExcluded = () => {
    try { return localStorage.getItem(internalTrafficKey) === 'exclude'; }
    catch { return window.beespokeInternalTraffic === true; }
  };
  const refreshInternalTraffic = () => {
    const excluded = internalTrafficExcluded();
    window.beespokeInternalTraffic = excluded;
    try {
      const tag = document.querySelector('script[src*="www.googletagmanager.com/gtag/js"]');
      const id = tag && new URL(tag.src, location.href).searchParams.get('id');
      if (/^G-[A-Z0-9]+$/.test(id || '')) window['ga-disable-' + id] = excluded;
    } catch { /* A missing tag does not change normal page behavior. */ }
  };
  refreshInternalTraffic();
  addEventListener('storage', event => { if (event.key === internalTrafficKey) refreshInternalTraffic(); });
  const supportedLocales = ["en", "es", "ca", "fr"];
  const locale = document.documentElement.lang || "en";
  const attributionKey = "beespoke-session-attribution-v1";
  const firstTouchKey = "beespoke-first-touch-attribution-v1";
  const bookingJourneyKey = "beespoke-booking-journey-v1";
  const bookingConfirmedKey = "beespoke-booking-confirmed-v2";
  const confirmedBookingTtl = 30 * 24 * 60 * 60 * 1000;
  const confirmedThisPage = new Set();
  const bookingJourneyTtl = 24 * 60 * 60 * 1000;
  const firstTouchTtl = 90 * 24 * 60 * 60 * 1000;
  const limited = (value, length = 100) => String(value || "").slice(0, length);
  const hostMatches = (host, domain) => host === domain || host.endsWith(`.${domain}`);
  const aiSources = [
    ["chatgpt.com", "chatgpt"],
    ["chat.openai.com", "chatgpt"],
    ["perplexity.ai", "perplexity"],
    ["claude.ai", "claude"],
    ["gemini.google.com", "gemini"],
    ["copilot.microsoft.com", "microsoft-copilot"],
    ["grok.com", "grok"],
    ["x.ai", "grok"],
    ["you.com", "you.com"]
  ];
  const searchSources = [
    ["google.com", "google"],
    ["google.es", "google"],
    ["google.fr", "google"],
    ["bing.com", "bing"],
    ["duckduckgo.com", "duckduckgo"],
    ["yahoo.com", "yahoo"]
  ];
  const readStoredAttribution = () => {
    try { return JSON.parse(sessionStorage.getItem(attributionKey) || "null"); }
    catch { return null; }
  };
  const readFirstTouchAttribution = () => {
    try {
      const record = JSON.parse(localStorage.getItem(firstTouchKey) || "null");
      if (!record?.createdAt || !record?.attribution || Date.now() - record.createdAt > firstTouchTtl) {
        localStorage.removeItem(firstTouchKey);
        return null;
      }
      return record.attribution;
    } catch {
      return null;
    }
  };
  const readBookingJourney = () => {
    try {
      const journey = JSON.parse(localStorage.getItem(bookingJourneyKey) || "null");
      if (!journey?.createdAt || Date.now() - journey.createdAt > bookingJourneyTtl) {
        localStorage.removeItem(bookingJourneyKey);
        return null;
      }
      return journey;
    } catch {
      return null;
    }
  };
  const buildAttribution = () => {
    const query = new URLSearchParams(location.search);
    let referrerHost = "";
    try { referrerHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, "") : ""; }
    catch { referrerHost = ""; }
    const ownHost = location.hostname.replace(/^www\./, "");
    if (referrerHost === ownHost) referrerHost = "";
    const ai = aiSources.find(([domain]) => hostMatches(referrerHost, domain));
    const search = searchSources.find(([domain]) => hostMatches(referrerHost, domain)) || (/^google\.[a-z.]+$/i.test(referrerHost) ? [referrerHost, "google"] : null);
    const source = query.get("utm_source") || ai?.[1] || search?.[1] || referrerHost || "(direct)";
    const medium = query.get("utm_medium") || (ai ? "ai-assistant" : search ? "organic" : referrerHost ? "referral" : "(none)");
    return {
      source: limited(source),
      medium: limited(medium),
      campaign: limited(query.get("utm_campaign")),
      content: limited(query.get("utm_content")),
      term: limited(query.get("utm_term")),
      // Store only the path. Arbitrary query strings can contain data that should
      // never be copied into analytics or a third-party booking URL.
      landingPage: limited(location.pathname),
      referrerHost: limited(referrerHost)
    };
  };
  const bookingJourney = readBookingJourney();
  const currentAttribution = buildAttribution();
  const storedFirstTouch = readFirstTouchAttribution();
  const isDirect = (value) => !value || value.source === "(direct)";
  const firstTouchAttribution = bookingJourney?.firstTouchAttribution || bookingJourney?.attribution
    || ((!storedFirstTouch || (isDirect(storedFirstTouch) && !isDirect(currentAttribution))) ? currentAttribution : storedFirstTouch);
  if (!storedFirstTouch || (isDirect(storedFirstTouch) && !isDirect(currentAttribution))) {
    try { localStorage.setItem(firstTouchKey, JSON.stringify({ createdAt: Date.now(), attribution: firstTouchAttribution })); }
    catch { /* Session attribution still works when persistent storage is unavailable. */ }
  }
  const attribution = readStoredAttribution()
    || (["/book/", "/booking-confirmed/"].includes(location.pathname) ? bookingJourney?.attribution : null)
    || currentAttribution;
  try { sessionStorage.setItem(attributionKey, JSON.stringify(attribution)); }
  catch { /* Tracking still works when storage is unavailable. */ }
  const attributionParameters = {
    first_touch_source: firstTouchAttribution.source,
    first_touch_medium: firstTouchAttribution.medium,
    first_touch_campaign: firstTouchAttribution.campaign || "(not set)",
    first_touch_content: firstTouchAttribution.content || "(not set)",
    first_touch_term: firstTouchAttribution.term || "(not set)",
    first_touch_landing_page: firstTouchAttribution.landingPage,
    first_touch_referrer_host: firstTouchAttribution.referrerHost || "(direct)",
    session_touch_source: attribution.source,
    session_touch_medium: attribution.medium,
    session_touch_campaign: attribution.campaign || "(not set)",
    session_touch_landing_page: attribution.landingPage
  };
  const track = (eventName, parameters = {}) => {
    if (internalTrafficExcluded()) return;
    const payload = { page_path: location.pathname, page_language: locale, ...attributionParameters, ...parameters };
    if (typeof window.gtag === "function") window.gtag("event", eventName, payload);
    else { window.dataLayer = window.dataLayer || []; window.dataLayer.push({ event: eventName, ...payload }); }
  };
  const enrichCalendlyLink = (link, ctaLocation) => {
    try {
      const url = new URL(link.href);
      const campaign = attribution.campaign || "website-calendly";
      const values = {
        utm_source: attribution.source === "(direct)" ? "beespoke-site" : attribution.source,
        utm_medium: attribution.medium === "(none)" ? "website" : attribution.medium,
        utm_campaign: campaign,
        utm_content: `${ctaLocation}:${location.pathname}`,
        utm_term: attribution.term
      };
      Object.entries(values).forEach(([key, value]) => {
        if (value && !url.searchParams.has(key)) url.searchParams.set(key, limited(value));
      });
      link.href = url.toString();
    } catch { /* Leave the original booking URL intact if parsing fails. */ }
    return link.href;
  };
  const internalBookingUrl = (ctaLocation) => {
    const url = new URL("/book/", location.origin);
    url.searchParams.set("cta", limited(ctaLocation, 30));
    return url.toString();
  };
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;
    const href = link.getAttribute("href") || "";
    const ctaLocation = link.closest(".hero") ? "hero" : link.closest(".inline-cta") ? "article" : link.closest(".final-cta") ? "final" : link.closest("footer") ? "footer" : "navigation";
    if (href.includes("calendly.com")) {
      const destinationUrl = enrichCalendlyLink(link, ctaLocation);
      const parameters = { cta_text: link.textContent.trim(), cta_location: ctaLocation, link_url: destinationUrl };
      try { localStorage.setItem(bookingJourneyKey, JSON.stringify({ createdAt: Date.now(), attribution, firstTouchAttribution, calendlyUrl: destinationUrl, ctaLocation })); }
      catch { /* The embedded success message can still identify a booking. */ }
      track("calendly_click", parameters);
      track("contact_intent", { ...parameters, contact_method: "calendly", intent_stage: "calendar_opened" });
      // Keep the direct Calendly URL as the no-JavaScript fallback, but route
      // active visitors through our first-party embed so a completed booking can
      // be measured from Calendly's verified event_scheduled message.
      if (link.dataset.calendlyDirect !== "true") {
        link.href = internalBookingUrl(ctaLocation);
        link.removeAttribute("target");
        link.removeAttribute("rel");
      }
    }
    if (href.includes("wa.me/")) {
      const parameters = { cta_text: link.textContent.trim(), cta_location: ctaLocation, link_url: link.href };
      track("whatsapp_click", parameters);
      track("contact_intent", { ...parameters, contact_method: "whatsapp", intent_stage: "conversation_started" });
    }
    if (link.closest(".language-switcher")) {
      if (supportedLocales.includes(link.lang)) localStorage.setItem("beespoke-language-choice", link.lang);
      track("language_switch", { destination_language: link.lang || "unknown", destination_path: href });
    }
    if (link.classList.contains("secondary") || link.classList.contains("related-card")) track("internal_cta_click", { link_text: link.textContent.trim(), destination_path: href });
  });
  // A confirmation-page visit, referrer, URL parameter or earlier calendar click
  // cannot establish that Calendly created a booking. Only the embedded success
  // message below can create this browser's generate_lead event. Direct Calendly
  // bookings remain in Calendly's ledger until server-side reconciliation exists.
  const bookingEmbed = document.querySelector("#calendly-embed");
  if (bookingEmbed) {
    const storedJourney = readBookingJourney();
    let calendlyUrl = "https://calendly.com/noahlevybuilds/30min";
    try {
      const storedUrl = new URL(storedJourney?.calendlyUrl || calendlyUrl);
      if (hostMatches(storedUrl.hostname.replace(/^www\./, ""), "calendly.com")) calendlyUrl = storedUrl.toString();
    } catch { /* Use the known public scheduling URL. */ }
    try {
      const url = new URL(calendlyUrl);
      const values = {
        utm_source: attribution.source === "(direct)" ? "beespoke-site" : attribution.source,
        utm_medium: attribution.medium === "(none)" ? "website" : attribution.medium,
        utm_campaign: attribution.campaign || "website-calendly",
        utm_content: storedJourney?.ctaLocation ? `${storedJourney.ctaLocation}:${attribution.landingPage}` : `booking-page:${attribution.landingPage}`,
        utm_term: attribution.term
      };
      Object.entries(values).forEach(([key, value]) => {
        if (value && !url.searchParams.has(key)) url.searchParams.set(key, limited(value));
      });
      calendlyUrl = url.toString();
    } catch { /* The base URL above remains a valid fallback. */ }

    // Always offer the standalone calendar, including when an embed renders but
    // its date/time controls stop responding. Reuse exactly the attributed URL.
    const fallback = document.querySelector("[data-calendly-fallback]");
    if (fallback) fallback.href = calendlyUrl;
    addEventListener("message", (event) => {
      const frame = bookingEmbed.querySelector("iframe");
      if (event.origin !== "https://calendly.com" || !frame || event.source !== frame.contentWindow || event.data?.event !== "calendly.event_scheduled") return;
      let bookingId;
      try {
        const uri = new URL(event.data.payload.event.uri);
        const match = uri.pathname.match(/^\/scheduled_events\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i);
        if (uri.origin !== "https://api.calendly.com" || !match) return;
        bookingId = match[1].toLowerCase();
      } catch { return; }
      const success = document.querySelector("[data-booking-success]");
      if (success) success.hidden = false;
      // Deduplicate this event, not every booking made during the session.
      // Keep only opaque IDs and timestamps, never invitee names/emails or URIs.
      let confirmed = [];
      for (const storageName of ["localStorage", "sessionStorage"]) {
        try {
          const storage = window[storageName];
          const records = JSON.parse(storage.getItem(bookingConfirmedKey) || "[]");
          if (Array.isArray(records)) confirmed.push(...records.filter(record => typeof record?.id === "string" && Number.isFinite(record.at) && Date.now() - record.at < confirmedBookingTtl));
        } catch { /* Memory still deduplicates repeated messages on this page. */ }
      }
      if (confirmedThisPage.has(bookingId) || confirmed.some(record => record.id === bookingId)) return;
      confirmedThisPage.add(bookingId);
      confirmed.push({id:bookingId,at:Date.now()});
      for (const storageName of ["localStorage", "sessionStorage"]) {
        try { window[storageName].setItem(bookingConfirmedKey, JSON.stringify(confirmed.slice(-100))); }
        catch { /* Event delivery does not depend on persistent storage. */ }
      }
      track("generate_lead", {
        contact_method: "calendly",
        intent_stage: "booking_confirmed",
        booking_status: "scheduled",
        booking_event_source: "calendly_embed_message",
        booking_event_id: bookingId
      });
      track("contact_intent", {
        contact_method: "calendly",
        intent_stage: "booking_confirmed",
        booking_status: "scheduled",
        booking_event_source: "calendly_embed_message",
        booking_event_id: bookingId
      });
      try {
        localStorage.removeItem(bookingJourneyKey);
      } catch { /* Event delivery does not depend on storage cleanup. */ }
    });
    // Install the listener before initialization so a fast widget cannot race it.
    if (window.Calendly?.initInlineWidget) {
      try { window.Calendly.initInlineWidget({ url: calendlyUrl, parentElement: bookingEmbed }); }
      catch { bookingEmbed.hidden = true; }
    } else bookingEmbed.hidden = true;
  }
  const reached = new Set();
  addEventListener("scroll", () => {
    const scrollable = document.documentElement.scrollHeight - innerHeight;
    if (scrollable <= 0) return;
    const depth = Math.round((scrollY / scrollable) * 100);
    [25, 50, 75, 90].forEach((mark) => { if (depth >= mark && !reached.has(mark)) { reached.add(mark); track("reading_depth", { percent_scrolled: mark }); } });
  }, { passive: true });
  const interactiveCopy = {
    en: {
      fit: ["Start by clarifying the buyer and problem before paying for campaign execution.", "The foundations are partly present; close the remaining gaps before scaling.", "The offer appears ready for a focused outbound test, subject to market and proof review."],
      qualify: ["The meeting definition is too loose to support performance pricing.", "Add the missing conditions and write every accepted value and exclusion down.", "The definition covers the core fit, interest and attendance conditions."],
      of: "of", conditions: "conditions defined", signals: "signals"
    },
    es: {
      fit: ["Aclara primero el comprador y el problema antes de pagar la ejecución de una campaña.", "La base existe parcialmente; resuelve los puntos pendientes antes de escalar.", "La oferta parece preparada para una prueba outbound enfocada, sujeta a revisar el mercado y las pruebas."],
      qualify: ["La definición de reunión es demasiado imprecisa para aplicar precios por rendimiento.", "Añade las condiciones que faltan y deja por escrito cada valor aceptado y cada exclusión.", "La definición cubre las condiciones esenciales de encaje, interés y asistencia."],
      of: "de", conditions: "condiciones definidas", signals: "señales"
    },
    ca: {
      fit: ["Aclareix primer el comprador i el problema abans de pagar l'execució d'una campanya.", "La base hi és parcialment; resol els punts pendents abans d'escalar.", "L'oferta sembla preparada per a una prova outbound enfocada, subjecta a revisar el mercat i les proves."],
      qualify: ["La definició de reunió és massa imprecisa per aplicar preus per rendiment.", "Afegeix les condicions que falten i deixa per escrit cada valor acceptat i cada exclusió.", "La definició cobreix les condicions essencials d'encaix, interès i assistència."],
      of: "de", conditions: "condicions definides", signals: "senyals"
    },
    fr: {
      fit: ["Clarifiez d'abord l'acheteur et le problème avant de financer l'exécution d'une campagne.", "Les bases sont partiellement en place ; corrigez les lacunes avant de passer à l'échelle.", "L'offre semble prête pour un test outbound ciblé, sous réserve d'une revue du marché et des preuves."],
      qualify: ["La définition d'un rendez-vous est trop vague pour une tarification à la performance.", "Ajoutez les conditions manquantes et consignez chaque valeur acceptée et chaque exclusion.", "La définition couvre les conditions essentielles d'adéquation, d'intérêt et de présence."],
      of: "sur", conditions: "conditions définies", signals: "signaux"
    }
  }[locale] || null;
  const switcher = document.querySelector(".language-switcher");
  const switcherButton = switcher?.querySelector("button");
  const switcherPanel = switcherButton?.nextElementSibling;
  if (switcherPanel) {
    switcherPanel.id ||= "language-options";
    switcherButton.setAttribute("aria-controls", switcherPanel.id);
  }
  const closeLanguageSwitcher = (returnFocus = false) => {
    switcher?.classList.remove("is-open");
    switcherButton?.setAttribute("aria-expanded", "false");
    if (returnFocus) switcherButton?.focus();
  };
  const fitLanguageSwitcher = () => {
    if (!switcherPanel || !switcher.classList.contains("is-open")) return;
    switcherPanel.style.removeProperty("--language-panel-shift");
    switcherPanel.style.removeProperty("--language-panel-shift-x");
    const viewportHeight = window.innerHeight;
    const panel = switcherPanel.getBoundingClientRect();
    const panelTop = panel.top;
    // Keep a usable row visible even when native zoom leaves a short viewport.
    const shift = Math.min(0, Math.max(8, viewportHeight - 72) - panelTop);
    const shiftX = Math.max(8 - panel.left, Math.min(0, window.innerWidth - panel.right - 8));
    switcherPanel.style.setProperty("--language-panel-shift", `${shift}px`);
    switcherPanel.style.setProperty("--language-panel-shift-x", `${shiftX}px`);
    switcherPanel.style.setProperty("--language-panel-space", `${Math.max(0, viewportHeight - panelTop - shift - 8)}px`);
    if (switcherPanel.contains(document.activeElement)) {
      document.activeElement.scrollIntoView({block: "nearest", inline: "nearest"});
    }
  };
  switcherButton?.addEventListener("click", () => {
    const open = switcher.classList.toggle("is-open");
    switcherButton.setAttribute("aria-expanded", String(open));
    if (open) fitLanguageSwitcher();
  });
  addEventListener("resize", fitLanguageSwitcher);
  document.addEventListener("click", (event) => {
    if (switcher?.classList.contains("is-open") && !switcher.contains(event.target)) {
      closeLanguageSwitcher();
    }
  });
  switcher?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && switcher.classList.contains("is-open")) {
      event.preventDefault();
      closeLanguageSwitcher(true);
    }
  });
  switcher?.addEventListener("focusout", (event) => {
    if (!switcher.contains(event.relatedTarget)) closeLanguageSwitcher();
  });
  let languageSuggestionDismissed = false;
  let savedLocale = null;
  try { languageSuggestionDismissed = sessionStorage.getItem("beespoke-language-suggestion-dismissed"); savedLocale = localStorage.getItem("beespoke-language-choice"); }
  catch { /* Language suggestions are optional when browser storage is blocked. */ }
  if (locale === "en" && !languageSuggestionDismissed) {
    const preferred = (supportedLocales.includes(savedLocale) ? [savedLocale] : (navigator.languages || [navigator.language || "en"]))
      .map((value) => value.toLowerCase().split("-")[0])
      .find((value) => supportedLocales.includes(value) && value !== "en");
    if (preferred) {
      const localizedLink = document.querySelector(`.language-switcher a[lang="${preferred}"]`);
      if (localizedLink) {
        const banner = document.createElement("aside");
        const names = { es: "Español", ca: "Català", fr: "Français" };
        banner.className = "language-suggestion";
        banner.innerHTML = `<span>View this page in ${names[preferred]}?</span><a href="${localizedLink.getAttribute("href")}" lang="${preferred}">Switch language</a><button type="button" aria-label="Dismiss language suggestion">×</button>`;
        banner.querySelector("a").addEventListener("click", () => localStorage.setItem("beespoke-language-choice", preferred));
        banner.querySelector("button").addEventListener("click", () => { sessionStorage.setItem("beespoke-language-suggestion-dismissed", "true"); banner.remove(); });
        document.body.appendChild(banner);
      }
    }
  }
  const progress = document.querySelector(".reading-progress span");
  const siteHeader = document.querySelector(".site-header");
  if (siteHeader && typeof ResizeObserver === "function") {
    new ResizeObserver(() => {
      document.documentElement.style.setProperty("--header", `${Math.ceil(siteHeader.getBoundingClientRect().height)}px`);
    }).observe(siteHeader);
  }
  const railProgress = document.querySelector(".toc-progress span");
  const sections = [...document.querySelectorAll(".article-grid article > section[id]")];
  const tocLinks = [...document.querySelectorAll(".toc a, .mobile-toc a")];
  const currentSection = document.querySelector(".current-section");
  const mobileToc = document.querySelector(".mobile-toc");
  let ticking = false;

  const setProgress = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const value = Math.min(1, Math.max(0, scrollY / scrollable));
    if (progress) progress.style.transform = `scaleX(${value})`;
    if (railProgress) railProgress.style.transform = `scaleY(${value})`;
    ticking = false;
  };

  addEventListener("scroll", () => {
    if (!ticking) requestAnimationFrame(setProgress);
    ticking = true;
  }, { passive: true });
  addEventListener("resize", setProgress, { passive: true });
  setProgress();

  const linksById = new Map();
  tocLinks.forEach((link) => {
    const id = decodeURIComponent((link.hash || "").slice(1));
    if (!linksById.has(id)) linksById.set(id, []);
    linksById.get(id).push(link);
    link.addEventListener("click", () => {
      if (mobileToc) mobileToc.open = false;
    });
  });

  const activate = (id) => {
    tocLinks.forEach((link) => link.classList.remove("is-active"));
    (linksById.get(id) || []).forEach((link) => link.classList.add("is-active"));
    const section = sections.find((item) => item.id === id);
    const heading = section?.querySelector("h2")?.textContent;
    if (heading && currentSection) currentSection.textContent = heading;
  };

  if (sections.length) {
    activate(sections[0].id);
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) activate(visible[0].target.id);
    }, { rootMargin: "-22% 0px -62% 0px", threshold: [0, 0.1, 0.5] });
    sections.forEach((section) => observer.observe(section));
  }

  document.addEventListener("click", (event) => {
    if (mobileToc?.open && !mobileToc.contains(event.target)) mobileToc.open = false;
  });
  mobileToc?.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && mobileToc.open) {
      event.preventDefault();
      mobileToc.open = false;
      mobileToc.querySelector("summary")?.focus();
    }
  });

  // Make horizontal tables discoverable and keyboard-scrollable only while
  // they overflow. No cell values or tool inputs are read or sent anywhere.
  const tableHints = {
    en: "Scroll sideways to read every column. Use the left and right arrow keys when the table is focused.",
    es: "Desplázate hacia los lados para ver todas las columnas. Con la tabla enfocada, usa las flechas izquierda y derecha.",
    ca: "Desplaça't cap als costats per veure totes les columnes. Amb la taula enfocada, fes servir les fletxes esquerra i dreta.",
    fr: "Faites défiler le tableau horizontalement pour lire toutes les colonnes. Lorsqu’il a le focus, utilisez les flèches gauche et droite."
  };
  document.querySelectorAll(".table-wrap").forEach((wrapper, index) => {
    const hint = document.createElement("p");
    hint.className = "table-keyboard-hint";
    hint.id = `table-keyboard-hint-${index + 1}`;
    hint.textContent = tableHints[locale] || tableHints.en;
    hint.hidden = true;
    wrapper.before(hint);
    const existingTabindex = wrapper.getAttribute("tabindex");
    const existingDescription = wrapper.getAttribute("aria-describedby");
    const existingRole = wrapper.getAttribute("role");
    const existingLabelledBy = wrapper.getAttribute("aria-labelledby");
    const caption = wrapper.querySelector("caption");
    if (caption) caption.id ||= `scrollable-table-caption-${index + 1}`;
    const updateTableAccess = () => {
      const overflow = wrapper.scrollWidth > wrapper.clientWidth + 1;
      hint.hidden = !overflow;
      if (overflow) {
        wrapper.tabIndex = 0;
        wrapper.setAttribute("aria-describedby", [existingDescription, hint.id].filter(Boolean).join(" "));
        if (!existingRole) wrapper.setAttribute("role", "region");
        if (caption && !existingLabelledBy && !wrapper.hasAttribute("aria-label")) wrapper.setAttribute("aria-labelledby", caption.id);
      } else {
        if (existingTabindex === null) wrapper.removeAttribute("tabindex");
        else wrapper.setAttribute("tabindex", existingTabindex);
        if (existingDescription === null) wrapper.removeAttribute("aria-describedby");
        else wrapper.setAttribute("aria-describedby", existingDescription);
        if (existingRole === null) wrapper.removeAttribute("role");
        if (existingLabelledBy === null) wrapper.removeAttribute("aria-labelledby");
      }
    };
    updateTableAccess();
    if (typeof ResizeObserver === "function") new ResizeObserver(updateTableAccess).observe(wrapper);
    else addEventListener("resize", updateTableAccess, { passive: true });
  });

  const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const calculator = document.querySelector(".calculator");
  if (calculator) {
    const calculate = () => {
      const value = (name) => Math.max(0, Number(calculator.querySelector(`[data-calc="${name}"]`)?.value) || 0);
      const cost = value("cost");
      const meetings = value("meetings");
      const oppRate = value("oppRate") / 100;
      const winRate = value("winRate") / 100;
      const revenue = value("revenue");
      const margin = value("margin") / 100;
      const customers = meetings * oppRate * winRate;
      const profit = customers * revenue * margin;
      const profitPerMeeting = oppRate * winRate * revenue * margin;
      const set = (name, content) => { const node = calculator.querySelector(`[data-result="${name}"]`); if (node) node.textContent = content; };
      set("customers", customers.toFixed(2));
      set("profit", money.format(profit));
      set("roi", cost ? `${(profit / cost).toFixed(1)}×` : "—");
      set("breakEven", profitPerMeeting ? (cost / profitPerMeeting).toFixed(1) : "—");
    };
    calculator.querySelectorAll("input").forEach((input) => input.addEventListener("input", calculate));
    calculate();
  }

  const bindChecklist = (selector, scoreSelector, copySelector, messages) => {
    const inputs = [...document.querySelectorAll(selector)];
    const score = document.querySelector(scoreSelector);
    const copy = copySelector ? document.querySelector(copySelector) : null;
    if (!inputs.length || !score) return;
    const update = () => {
      const checked = inputs.filter((input) => input.checked).length;
      const wording = interactiveCopy || { of: "of", conditions: "conditions defined", signals: "signals" };
      score.textContent = `${checked} ${wording.of} ${inputs.length}${scoreSelector.includes("qualification") ? ` ${wording.conditions}` : scoreSelector.includes("fit") ? ` ${wording.signals}` : ""}`;
      if (copy && messages) copy.textContent = checked >= 7 ? messages[2] : checked >= 4 ? messages[1] : messages[0];
    };
    inputs.forEach((input) => input.addEventListener("change", () => { update(); track("interactive_tool_use", { tool: scoreSelector.replace(/\[|\]|data-|-/g, " ").trim() }); }));
    update();
  };
  bindChecklist("[data-fit]", "[data-fit-score]", "[data-fit-copy]", interactiveCopy?.fit || ["Start by clarifying the buyer and problem before paying for campaign execution.", "The foundations are partly present; close the remaining gaps before scaling.", "The offer appears ready for a focused outbound test, subject to market and proof review."]);
  bindChecklist("[data-qualify]", "[data-qualification-score]", "[data-qualification-copy]", interactiveCopy?.qualify || ["The meeting definition is too loose to support performance pricing.", "Add the missing conditions and write every accepted value and exclusion down.", "The definition covers the core fit, interest and attendance conditions."]);
  bindChecklist("[data-risk]", "[data-risk-score]");
})();
