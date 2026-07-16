(() => {
  const supportedLocales = ["en", "es", "ca", "fr"];
  const locale = document.documentElement.lang || "en";
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
  switcherButton?.addEventListener("click", () => {
    const open = switcher.classList.toggle("is-open");
    switcherButton.setAttribute("aria-expanded", String(open));
  });
  document.addEventListener("click", (event) => {
    if (switcher?.classList.contains("is-open") && !switcher.contains(event.target)) {
      switcher.classList.remove("is-open");
      switcherButton?.setAttribute("aria-expanded", "false");
    }
  });
  if (locale === "en" && !sessionStorage.getItem("beespoke-language-choice")) {
    const preferred = (navigator.languages || [navigator.language || "en"])
      .map((value) => value.toLowerCase().split("-")[0])
      .find((value) => supportedLocales.includes(value) && value !== "en");
    if (preferred) {
      const localizedLink = document.querySelector(`.language-switcher a[lang="${preferred}"]`);
      if (localizedLink) {
        const banner = document.createElement("aside");
        const names = { es: "Español", ca: "Català", fr: "Français" };
        banner.className = "language-suggestion";
        banner.innerHTML = `<span>View this page in ${names[preferred]}?</span><a href="${localizedLink.getAttribute("href")}">Switch language</a><button type="button" aria-label="Dismiss language suggestion">×</button>`;
        banner.querySelector("button").addEventListener("click", () => { sessionStorage.setItem("beespoke-language-choice", "dismissed"); banner.remove(); });
        document.body.appendChild(banner);
      }
    }
  }
  const progress = document.querySelector(".reading-progress span");
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
    inputs.forEach((input) => input.addEventListener("change", update));
    update();
  };
  bindChecklist("[data-fit]", "[data-fit-score]", "[data-fit-copy]", interactiveCopy?.fit || ["Start by clarifying the buyer and problem before paying for campaign execution.", "The foundations are partly present; close the remaining gaps before scaling.", "The offer appears ready for a focused outbound test, subject to market and proof review."]);
  bindChecklist("[data-qualify]", "[data-qualification-score]", "[data-qualification-copy]", interactiveCopy?.qualify || ["The meeting definition is too loose to support performance pricing.", "Add the missing conditions and write every accepted value and exclusion down.", "The definition covers the core fit, interest and attendance conditions."]);
  bindChecklist("[data-risk]", "[data-risk-score]");
})();
