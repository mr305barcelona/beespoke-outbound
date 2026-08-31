const path = require("path");

const moduleRoot = process.env.CODEX_NODE_MODULES;
const { chromium } = moduleRoot
  ? require(path.join(moduleRoot, "playwright"))
  : require("playwright");

const base = process.env.QA_BASE_URL || "http://127.0.0.1:4173";
const pages = [
  {
    path: "/services/linkedin-lead-generation/",
    title: "LinkedIn Lead Generation Agency: B2B Outreach | Beespoke",
    h1: "LinkedIn lead generation agency for credible B2B conversations",
    faqCount: 3
  },
  {
    path: "/services/outsourced-sdr/",
    title: "Outsourced SDR Services: Models, Costs & Fit | Beespoke",
    h1: "Outsourced SDR services: models, costs, fit and tradeoffs",
    faqCount: 4
  }
];

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const failures = [];

  for (const viewport of [{ width: 390, height: 844 }, { width: 1440, height: 1000 }]) {
    const context = await browser.newContext({ viewport });
    await context.route(/googletagmanager\.com/, (route) => route.abort());
    for (const expected of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${base}${expected.path}`, { waitUntil: "domcontentloaded" });
      const result = await page.evaluate(() => ({
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
        h1: document.querySelector("h1")?.textContent.trim(),
        faqCount: document.querySelectorAll(".faqs details").length,
        faqSchema: [...document.querySelectorAll('script[type="application/ld+json"]')].some((script) => script.textContent.includes('"FAQPage"')),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
      }));
      if (result.title !== expected.title) failures.push(`${expected.path}: unexpected title ${result.title}`);
      if (result.h1 !== expected.h1) failures.push(`${expected.path}: unexpected H1 ${result.h1}`);
      if (!result.description || result.description.length < 120 || result.description.length > 160) failures.push(`${expected.path}: meta description length ${result.description?.length}`);
      if (result.faqCount !== expected.faqCount || !result.faqSchema) failures.push(`${expected.path}: FAQ content/schema mismatch`);
      if (result.overflow > 2) failures.push(`${expected.path}: ${result.overflow}px horizontal overflow at ${viewport.width}px`);
      if (errors.length) failures.push(`${expected.path}: ${errors.join(" | ")}`);
      await page.close();
    }
    await context.close();
  }

  const context = await browser.newContext({ locale: "es-ES", viewport: { width: 390, height: 844 } });
  await context.route(/googletagmanager\.com/, (route) => route.abort());
  await context.route("https://assets.calendly.com/assets/external/widget.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: "window.Calendly={initInlineWidget:function(options){window.__beespokeCalendlyUrl=options.url;}};"
  }));
  await context.route("https://assets.calendly.com/assets/external/widget.css", (route) => route.fulfill({ contentType: "text/css", body: "" }));
  const page = await context.newPage();
  await page.goto(`${base}/services/linkedin-lead-generation/?utm_source=chatgpt&utm_medium=ai-assistant&utm_campaign=seo_attribution`, { waitUntil: "domcontentloaded" });
  const clickState = await page.evaluate(() => {
    document.addEventListener("click", (event) => event.preventDefault(), true);
    const link = document.querySelector('a[href*="calendly.com"]');
    link.click();
    const events = window.dataLayer.filter((entry) => entry?.[0] === "event").map((entry) => ({ name: entry[1], parameters: entry[2] }));
    return { href: link.href, target: link.getAttribute("target"), events, journey: JSON.parse(localStorage.getItem("beespoke-booking-journey-v1") || "null") };
  });
  const clickEvent = clickState.events.find((event) => event.name === "calendly_click");
  if (!clickEvent) failures.push("Attribution: calendly_click was not emitted");
  if (!clickState.href.endsWith("/book/?cta=navigation")) failures.push(`Attribution: Calendly CTA did not route through the first-party booking page (${clickState.href})`);
  if (clickState.target !== null) failures.push("Attribution: first-party booking page should stay in the current tab");
  if (clickState.journey?.attribution?.source !== "chatgpt" || clickState.journey?.attribution?.landingPage !== "/services/linkedin-lead-generation/") failures.push("Attribution: booking journey did not preserve first touch");
  if (!clickState.journey?.calendlyUrl?.includes("utm_source=chatgpt") || !clickState.journey?.calendlyUrl?.includes("utm_medium=ai-assistant")) failures.push("Attribution: stored Calendly URL did not inherit source and medium");

  await page.goto(`${base}/book/`, { waitUntil: "domcontentloaded" });
  const bookingState = await page.evaluate(() => ({
    lang: document.documentElement.lang,
    heading: document.querySelector("[data-booking-heading]")?.textContent,
    embedUrl: window.__beespokeCalendlyUrl,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth
  }));
  if (bookingState.lang !== "es" || !bookingState.heading?.includes("horario")) failures.push("Booking page: Spanish device localization failed");
  if (!bookingState.embedUrl?.includes("utm_source=chatgpt") || !bookingState.embedUrl?.includes("utm_medium=ai-assistant")) failures.push("Booking page: Calendly embed lost first-touch attribution");
  if (bookingState.overflow > 2) failures.push(`Booking page: ${bookingState.overflow}px horizontal overflow at 390px`);

  await page.evaluate(() => window.dispatchEvent(new MessageEvent("message", {
    origin: "https://calendly.com",
    data: { event: "calendly.event_scheduled", payload: { event: { uri: "https://api.calendly.com/scheduled_events/test" } } }
  })));
  const confirmationState = await page.evaluate(() => ({
    successVisible: !document.querySelector("[data-booking-success]")?.hidden,
    events: window.dataLayer.filter((entry) => entry?.[0] === "event").map((entry) => ({ name: entry[1], parameters: entry[2] }))
  }));
  const generated = confirmationState.events.filter((event) => event.name === "generate_lead");
  if (generated.length !== 1) failures.push(`Attribution: expected one embed-confirmed generate_lead event, received ${generated.length}`);
  if (generated[0]?.parameters?.first_touch_source !== "chatgpt" || generated[0]?.parameters?.intent_stage !== "booking_confirmed") failures.push("Attribution: confirmed booking lost first-touch or stage data");
  if (generated[0]?.parameters?.booking_event_source !== "calendly_embed_message") failures.push("Attribution: confirmed booking did not identify the verified embed source");
  if (!confirmationState.successVisible) failures.push("Booking page: accessible confirmation message was not revealed");

  await page.evaluate(() => window.dispatchEvent(new MessageEvent("message", { origin: "https://calendly.com", data: { event: "calendly.event_scheduled" } })));
  const duplicateEvents = await page.evaluate(() => window.dataLayer.filter((entry) => entry?.[0] === "event" && entry[1] === "generate_lead").length);
  if (duplicateEvents !== 1) failures.push("Attribution: duplicate Calendly messages produced duplicate generate_lead events");
  await context.close();

  const directContext = await browser.newContext();
  await directContext.route(/googletagmanager\.com/, (route) => route.abort());
  await directContext.route("https://assets.calendly.com/assets/external/widget.js", (route) => route.fulfill({
    contentType: "application/javascript",
    body: "window.Calendly={initInlineWidget:function(options){window.__beespokeCalendlyUrl=options.url;}};"
  }));
  const directPage = await directContext.newPage();
  await directPage.goto(`${base}/book/`, { waitUntil: "domcontentloaded" });
  await directPage.evaluate(() => window.dispatchEvent(new MessageEvent("message", { origin: "https://example.com", data: { event: "calendly.event_scheduled" } })));
  const directEvents = await directPage.evaluate(() => window.dataLayer.filter((entry) => entry?.[0] === "event" && entry[1] === "generate_lead").length);
  if (directEvents !== 0) failures.push("Attribution: an untrusted message produced a false confirmed booking");
  await directContext.close();

  await browser.close();
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log("Browser attribution QA passed for SEO metadata, localization, Calendly UTMs, trusted completion messages and confirmed-booking deduplication.");
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
