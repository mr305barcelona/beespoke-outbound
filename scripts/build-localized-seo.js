const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const origin = "https://outbound-lead-generation.com";
const pages = require(path.join(root, "data", "seo-pages.json"));
const pricingBenchmark = require(path.join(root, "data", "outbound-pricing-benchmark-2026.json"));
const protectedBenchmarkTerms = new Set([...pricingBenchmark.offers.flatMap((offer) => [offer.provider, offer.offer]), "Lead"]);
const translationOverrides = require(path.join(root, "data", "seo-translation-overrides.json"));
const locales = {
  es: { label: "Español", home: "Inicio" },
  ca: { label: "Català", home: "Inici" },
  fr: { label: "Français", home: "Accueil" }
};

const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const localizedPath = (locale, pathname) => `/${locale}${pathname === "/" ? "/" : pathname}`;

function languageLinks(pagePath, active) {
  const ariaLabel = { en: "Language", es: "Idioma", ca: "Idioma", fr: "Langue" }[active];
  const choices = [
    ["en", "English", pagePath],
    ...Object.entries(locales).map(([code, config]) => [code, config.label, localizedPath(code, pagePath)])
  ];
  return `<div class="language-switcher"><button type="button" aria-expanded="false" aria-label="${ariaLabel}">${active.toUpperCase()}</button><div>${choices.map(([code, label, href]) => `<a href="${href}" lang="${code}"${code === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</div></div>`;
}

function hreflang(pagePath) {
  return [
    `<link rel="alternate" hreflang="en" href="${origin}${pagePath}">`,
    ...Object.keys(locales).map((locale) => `<link rel="alternate" hreflang="${locale}" href="${origin}${localizedPath(locale, pagePath)}">`),
    `<link rel="alternate" hreflang="x-default" href="${origin}${pagePath}">`
  ].join("");
}

function translateText(text, dictionary) {
  const leading = text.match(/^\s*/)[0];
  const trailing = text.match(/\s*$/)[0];
  const compact = text.replace(/\s+/g, " ").trim();
  if (!compact || !/[A-Za-z]/.test(compact)) return text;
  if (protectedBenchmarkTerms.has(compact) || (compact.includes("outbound-lead-generation.com") && compact.includes("&lt;"))) return text;
  return `${leading}${dictionary[compact] || compact}${trailing}`;
}

function localizeInternalLinks(html, locale) {
  const known = new Set(pages.map((page) => page.path));
  const localizedDownloads = new Set(["/downloads/beespoke-icp-scorecard/", "/downloads/beespoke-outbound-campaign-brief/"]);
  return html.replace(/href="(\/[^"#?]*)"/g, (full, href) => known.has(href) || localizedDownloads.has(href) ? `href="${localizedPath(locale, href)}"` : full);
}

function localizeSchema(html, page, locale, dictionary) {
  const datasetCopy = {
    es: {
      name: "Benchmark de precios outbound B2B 2026",
      description: "Cuarenta ofertas de precios outbound B2B publicadas por proveedores, con moneda original, unidad de facturación, modelo de prestación, canales, definición del resultado, compromiso y fuente.",
      measurementTechnique: "Recopilación manual a partir de páginas públicas de precios controladas por cada proveedor",
      variableMeasured: ["Precio público", "Unidad de facturación", "Modelo de prestación", "Canales", "Resultado publicado", "Compromiso"],
      spatialCoverage: "Internacional"
    },
    ca: {
      name: "Benchmark de preus outbound B2B 2026",
      description: "Quaranta ofertes de preus outbound B2B publicades per proveïdors, amb moneda original, unitat de facturació, model de prestació, canals, definició del resultat, compromís i font.",
      measurementTechnique: "Recopilació manual a partir de pàgines públiques de preus controlades per cada proveïdor",
      variableMeasured: ["Preu públic", "Unitat de facturació", "Model de prestació", "Canals", "Resultat publicat", "Compromís"],
      spatialCoverage: "Internacional"
    },
    fr: {
      name: "Benchmark 2026 des tarifs outbound B2B",
      description: "Quarante offres tarifaires outbound B2B publiées par des prestataires, avec devise d’origine, unité de facturation, modèle de prestation, canaux, définition du résultat, engagement et source.",
      measurementTechnique: "Collecte manuelle à partir des pages tarifaires publiques contrôlées par chaque prestataire",
      variableMeasured: ["Tarif public", "Unité de facturation", "Modèle de prestation", "Canaux", "Résultat publié", "Engagement"],
      spatialCoverage: "International"
    }
  }[locale];
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (full, raw) => {
    const schema = JSON.parse(raw);
    const localizedUrl = `${origin}${localizedPath(locale, page.path)}`;
    for (const node of schema["@graph"] || []) {
      if (node.url) node.url = localizedUrl;
      if (node["@id"]) {
        const fragment = node["@id"].includes("#") ? node["@id"].split("#").pop() : "page";
        node["@id"] = `${localizedUrl}#${fragment}`;
      }
      if (node.name) node.name = dictionary[node.name] || node.name;
      if (node.description) node.description = dictionary[node.description] || node.description;
      if (node["@type"] === "FAQPage") node.mainEntity?.forEach((question) => {
        if (question.name) question.name = dictionary[question.name] || question.name;
        if (question.acceptedAnswer?.text) question.acceptedAnswer.text = dictionary[question.acceptedAnswer.text] || question.acceptedAnswer.text;
      });
      if (node["@type"] === "Dataset") Object.assign(node, datasetCopy);
      if (node.author?.url) node.author.url = `${origin}${localizedPath(locale, "/about/noah-levy/")}`;
      if (node.itemListElement) node.itemListElement.forEach((item) => {
        if (item.position === 1) {
          item.name = locales[locale].home;
          item.item = `${origin}/${locale}/`;
        }
        if (item.position === 2) { item.name = dictionary[item.name] || item.name; item.item = localizedUrl; }
      });
    }
    return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
  });
}

function localizeHomepageSchema(html, locale, dictionary) {
  const copy = {
    es: { description: "Beespoke ayuda a empresas B2B a generar pipeline reservando reuniones cualificadas con clientes ideales mediante campañas outbound focalizadas.", area: "Internacional", services: ["Generación de leads outbound", "Concertación de citas B2B", "Prospección outbound en LinkedIn", "Generación de pipeline comercial", "Reserva de reuniones cualificadas"] },
    ca: { description: "Beespoke ajuda empreses B2B a generar pipeline reservant reunions qualificades amb clients ideals mitjançant campanyes outbound focalitzades.", area: "Internacional", services: ["Generació de leads outbound", "Concertació de reunions B2B", "Prospecció outbound a LinkedIn", "Generació de pipeline comercial", "Reserva de reunions qualificades"] },
    fr: { description: "Beespoke aide les entreprises B2B à générer du pipeline en obtenant des rendez-vous qualifiés avec leurs clients idéaux grâce à des campagnes outbound ciblées.", area: "International", services: ["Génération de leads outbound", "Prise de rendez-vous B2B", "Prospection outbound sur LinkedIn", "Génération de pipeline commercial", "Prise de rendez-vous qualifiés"] }
  }[locale];
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (full, raw) => {
    const schema = JSON.parse(raw);
    schema.url = `${origin}/${locale}/`;
    schema.description = copy.description;
    schema.areaServed = copy.area;
    schema.serviceType = copy.services;
    return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, "\\u003c")}</script>`;
  });
}

function localizeHtml(source, page, locale, dictionary) {
  const localizedUrl = `${origin}${localizedPath(locale, page.path)}`;
  let html = source
    .replace(/<link rel="alternate"[^>]+>/g, "")
    .replace('<html lang="en">', `<html lang="${locale}">`)
    .replace(/<link rel="canonical" href="[^"]+">/, `<link rel="canonical" href="${localizedUrl}">${hreflang(page.path)}`)
    .replace(/<meta property="og:url" content="[^"]+">/, `<meta property="og:url" content="${localizedUrl}">`)
    .replace(/(<meta (?:name|property)="(?:description|og:title|og:description|og:image:alt|twitter:title|twitter:description|twitter:image:alt)" content=")([^"]+)(">)/g, (all, before, value, after) => `${before}${escapeHtml(dictionary[value] || value)}${after}`)
    .replace(/<title>([^<]+)<\/title>/, (all, value) => `<title>${escapeHtml(dictionary[value] || value)}</title>`);
  html = localizeSchema(html, page, locale, dictionary);
  html = html.replace(/(<script[\s\S]*?<\/script>|<[^>]+>|[^<]+)/gi, (token) => token.startsWith("<") ? token : translateText(token, dictionary));
  html = localizeInternalLinks(html, locale);
  html = html.replace(/<div class="language-switcher">[\s\S]*?<\/div><\/div>/, languageLinks(page.path, locale));
  html = html.replace(
    'aria-label="Scrollable outbound pricing comparison table"',
    `aria-label="${{ es: "Tabla comparativa de precios outbound con desplazamiento horizontal", ca: "Taula comparativa de preus outbound amb desplaçament horitzontal", fr: "Tableau comparatif des tarifs outbound à défilement horizontal" }[locale]}"`
  );
  const terminology = {
    es: [
      [/\$10,000/g, "10.000 $"],
      [/Generación de leads outbound a medida \| Agencia de reserva de reuniones B2B/g, "Beespoke Outbound | Agencia de concertación de reuniones B2B"],
      [/Beespoke ayuda a las empresas B2B a generar canales de ventas identificando a los tomadores de decisiones adecuados, creando un alcance convincente y reservando reuniones calificadas directamente en su calendario\./g, "Beespoke ayuda a empresas B2B a generar pipeline identificando a los responsables adecuados, creando mensajes de prospección convincentes y reservando reuniones cualificadas directamente en su calendario."],
      [/\bcanales de ventas\b/gi, "pipeline comercial"], [/\breuniones calificadas\b/gi, "reuniones cualificadas"],
      [/^como funciona$/gim, "Cómo funciona"], [/Cree la lista de objetivos adecuada/g, "Crea la lista de cuentas objetivo adecuada"],
      [/Cree un alcance que genere respuestas/g, "Crea mensajes de prospección que generen respuestas"],
      [/Victorias salientes recientes/g, "Resultados outbound recientes"], [/Plana Mensual/g, "Plan mensual"],
      [/Boutique outbound desde Barcelona/g, "Agencia outbound boutique desde Barcelona"],
      [/¿Cuánto cuesta la outbound\?/g, "¿Cuánto cuesta el outbound?"], [/SDR subcontratados frente a agencia/g, "SDR externalizado vs agencia"],
      [/Planos transparentes a medida/g, "Planes transparentes de Beespoke"], [/Servicios SDR subcontratados/g, "Servicios SDR externalizados"],
      [/Precios para concertar citas/g, "Precios de concertación de citas"], [/envíanos whatsapp/gi, "Escríbenos por WhatsApp"],
      [/Servicios SDR subcontratados para salidas B2B enfocadas/g, "Servicios SDR externalizados para outbound B2B focalizado"],
      [/Servicios de SDR subcontratados: alcance, adecuación y compensaciones/g, "Servicios SDR externalizados: alcance, encaje y limitaciones"],
      [/salidas B2B/gi, "outbound B2B"],
      [/\bDEG\b/g, "SDR"], [/generación de leads de fabricación/gi, "generación de leads para fabricantes"],
      [/\| a medida/g, "| Beespoke"], [/Saliente a medida/g, "Beespoke Outbound"], [/Noé Levy/g, "Noah Levy"],
      [/Precios a medida/g, "Precios de Beespoke"], [/generación-de-leads-salientes\.com/g, "outbound-lead-generation.com"], [/\bHogar\b/g, "Inicio"],
      [/Generación de leads salientes/g, "Generación de leads outbound"], [/generación de leads salientes/g, "generación de leads outbound"],
      [/Generación de leads de salida/g, "Generación de leads outbound"], [/generación de leads de salida/g, "generación de leads outbound"],
      [/Salida B2B gestionada/g, "Outbound B2B gestionado"], [/campaña saliente/g, "campaña outbound"], [/salidas salientes/g, "outbound"],
      [/Reserve una llamada de ajuste de 30 minutos/g, "Reserva una llamada de evaluación de 30 minutos"],
      [/Reserva una llamada de ajuste de 30 minutos/g, "Reserva una llamada de evaluación de 30 minutos"],
      [/llamada de ajuste/g, "llamada de evaluación"], [/Comprobación de ajuste/g, "Evaluación de encaje"], [/comprobación de ajuste/g, "evaluación de encaje"],
      [/¿Ya es apropiado gestionar las outbound\?/g, "¿Está tu empresa preparada para un programa outbound gestionado?"],
      [/crea alcance/g, "crea mensajes de prospección"], [/alcance previo/g, "prospección anterior"], [/alcance de LinkedIn/g, "campaña de prospección en LinkedIn"],
      [/actividades de divulgación/g, "acciones de prospección"], [/divulgación/gi, "prospección"],
      [/envío saliente/g, "outbound"], [/Precios de salida/g, "Precios outbound"], [/precios de salida/g, "precios outbound"], [/servicio saliente/g, "servicio outbound"],
      [/campaña saliente/g, "campaña outbound"], [/agencias salientes/g, "agencias outbound"], [/agencia saliente/g, "agencia outbound"],
      [/agencias emisoras/gi, "agencias outbound"], [/agencia emisora/gi, "agencia outbound"], [/sistema de salida/gi, "sistema outbound"],
      [/ajuste del ICP/gi, "encaje con el ICP"], [/ajuste del PCI/gi, "encaje con el ICP"], [/ajuste del comprador/gi, "encaje del comprador"], [/ajuste/gi, "encaje"],
      [/\bPIC\b/g, "ICP"], [/\bPCI\b/g, "ICP"], [/copia privada/g, "copy privado"], [/la copia/g, "el copy"], [/soporte de copia/g, "apoyo de copy"], [/copias/g, "materiales"],
      [/llamada de descubrimiento/g, "llamada de diagnóstico"], [/realizar el descubrimiento/g, "realizar el diagnóstico comercial"],
      [/Configuración de citas/g, "Concertación de citas"], [/configuración de citas/g, "concertación de citas"], [/Fijación de citas/g, "Concertación de citas"], [/fijación de citas/g, "concertación de citas"],
      [/Constructor de calificaciones/g, "Definición de reuniones cualificadas"], [/Definición de fuerza/g, "Solidez de la definición"], [/temporización requerida/g, "momento requerido"],
      [/un nombre aún no está en trámite/g, "un contacto todavía no es pipeline"], [/anticipo fijo/g, "cuota mensual fija"], [/Un retenedor/g, "Una cuota mensual"], [/retenedor/gi, "cuota mensual"],
      [/riesgo de producción/g, "riesgo ligado a los resultados"], [/lo que informamos/g, "Qué incluimos en los informes"], [/Lo que informamos/g, "Qué incluimos en los informes"],
      [/movimiento de ventas/g, "modelo comercial"], [/respuesta fuerte/g, "Buena respuesta"], [/señal de advertencia/g, "Señal de alerta"],
      [/Donde se sienta Beespoke/g, "Dónde se sitúa Beespoke"], [/Escenarios de costos trabajados/g, "Escenarios de costes"],
      [/celebró la reunión del ICP/g, "reunión celebrada con el ICP"], [/celebró la reunión del PCI/g, "reunión celebrada con el ICP"],
      [/riesgo de salida/g, "riesgo ligado a los resultados"], [/modelos de retención/g, "modelos de cuota mensual"], [/Mayor retención/g, "Mayor cuota mensual"],
      [/precios a medida/g, "precios de Beespoke"], [/Descubrimiento/g, "Diagnóstico comercial"], [/descubrimiento/g, "diagnóstico comercial"], [/copia/g, "copy"], [/Noé/g, "Noah"],
      [/\bfit\b/gi, "encaje"], [/cartera actual/g, "pipeline actual"], [/cartera de proyectos/g, "pipeline"], [/canalización/g, "pipeline"],
      [/coste completamente cargado/gi, "coste total"], [/costo completamente cargado/gi, "coste total"], [/costos completamente cargados/gi, "costes totales"],
      [/módulo SDR/g, "equipo SDR"], [/Pod SDR/g, "Equipo SDR"], [/pod SDR/g, "equipo SDR"],
      [/prospección de LinkedIn para compradores senior de ciberseguridad/gi, "Prospección en LinkedIn dirigida a responsables de ciberseguridad"],
      [/Precios outbound simples vinculados al trabajo y las reuniones\./g, "Precios outbound transparentes, vinculados al trabajo y a las reuniones"],
      [/Concertación de citas B2B con las reglas de calificación definidas primero/g, "Concertación de citas B2B con criterios de cualificación definidos desde el inicio"],
      [/Generación de leads en LinkedIn que suena como una conversación humana creíble/g, "Prospección en LinkedIn que genera conversaciones creíbles"],
      [/Generación de leads outbound basada en reuniones calificadas/g, "Generación de leads outbound orientada a reuniones cualificadas"],
      [/\bSalida\b/g, "Outbound"], [/\bsalida\b/g, "outbound"], [/\bSaliente\b/g, "Outbound"], [/\bsaliente\b/g, "outbound"],
      [/Reserva una conversación/g, "Reservar una conversación"], [/guía de artículos/g, "Guía del artículo"], [/guía de decisión del comprador/g, "Guía de decisión del comprador"],
      [/Generación de leads outbound a medida \| Agencia de reserva de reuniones B2B/g, "Beespoke Outbound | Agencia de concertación de reuniones B2B"],
      [/Generación de leads outbound que reserva reuniones reales con tus clientes ideales/g, "Generación de leads outbound que consigue reuniones reales con tus clientes ideales"],
      [/correo electrónico en frío/gi, "cold email"], [/correo electrónico frío/gi, "cold email"], [/correos electrónicos fríos/gi, "emails en frío"],
      [/ventas salientes/gi, "ventas outbound"], [/venta saliente/gi, "venta outbound"],
      [/clientes potenciales calificados/gi, "leads cualificados"], [/cliente potencial calificado/gi, "lead cualificado"],
      [/reuniones calificadas/gi, "reuniones cualificadas"], [/reunión calificada/gi, "reunión cualificada"],
      [/completamente cargad[oa]s?/gi, "total"],
      [/data-encaje/g, "data-fit"],
      [/>como funciona</gi, ">Cómo funciona<"],
      [/mapa de activación outbound/gi, "mapa de señales outbound"],
      [/Razonar ahora/g, "Motivo para actuar ahora"],
      [/Llega al grupo de compras completo/g, "Llega a todo el grupo de compra"],
      [/Califique para la adaptación al servicio, no para la curiosidad/g, "Cualifica el encaje con el servicio, no la simple curiosidad"],
      [/Donde cabe Beespoke/g, "Dónde puede encajar Beespoke"],
      [/Cambio de contratación pública/g, "Señal pública de contratación"],
      [/Mapear el grupo de compra de contratación/g, "Mapea el grupo de compra de la contratación"],
      [/cliente potencial de contratación calificado/gi, "lead cualificado para servicios de selección"],
      [/Definir el servicio TI y la brecha comercial/g, "Define el servicio IT y el ángulo comercial"],
      [/servicios de TI basados/gi, "servicios IT basada"],
      [/Denominador calificado retenido/g, "Reuniones cualificadas celebradas"],
      [/Construya un costo mensual total/g, "Calcula el coste mensual total"],
      [/Precios personalizados en contexto/g, "Precios de Beespoke en contexto"],
      [/Una persona capaz es dueña de la ejecución diaria\./g, "Una persona competente se responsabiliza de la ejecución diaria."],
      [/El software gana cuando el sistema operativo ya existe/g, "El software encaja cuando el sistema operativo ya existe"],
      [/Una agencia gana cuando la ejecución es el cuello de botella/g, "Una agencia encaja cuando la ejecución es el cuello de botella"],
      [/Cuestión de control y propiedad una vez finalizado el contrato/g, "El control y la propiedad importan cuando termina el contrato"],
      [/Calificación de prueba y transferencia de ventas/g, "Prueba la cualificación y el traspaso a ventas"],
      [/Enlaces de proveedores y prospección comercial/g, "Enlaces de proveedores y transparencia comercial"],
      [/Enlaces de proveedores y prospección/g, "Enlaces de proveedores y transparencia"],
      [/alcance, adecuación y compensaciones/gi, "alcance, encaje y limitaciones"],
      [/problema comprable/gi, "problema por el que un cliente pagaría"],
      [/desencadenantes como pistas de investigación/gi, "señales como pistas de investigación"],
      [/conocimiento privado/gi, "información privada"],
      [/Calificar encaje económico y de entrega/g, "Cualifica el encaje económico y operativo"],
      [/Poner a prueba una brecha entre las agencias de marketing/g, "Pon a prueba el ángulo de una agencia de marketing"],
      [/grupo de compradores detrás del informe/g, "grupo de compra detrás del brief"],
      [/inspeccionar el trabajo/g, "Revisar el trabajo"],
      [/interiorizar/gi, "internalizar"],
      [/libro de jugadas/gi, "playbook"],
      [/aumento de personal/gi, "ampliación de personal"],
      [/costo y la rampa total/gi, "coste total y el tiempo de puesta en marcha"],
      [/Seguridad, propiedad, economía y outbound/g, "Seguridad, propiedad, economía y condiciones de rescisión"],
      [/Auditar una muestra real del trabajo/g, "Audita una muestra real del trabajo"],
      [/Verifique la referencia del modelo de entrega y luego contrate una prueba/g, "Comprueba referencias del modelo de prestación y después contrata una prueba"],
      [/énfasis descrito públicamente/gi, "enfoque descrito públicamente"]
    ],
    ca: [
      [/\$10,000/g, "10.000 $"], [/agències sortints/gi, "agències outbound"], [/On s'asseu Beespoke/g, "On se situa Beespoke"],
      [/generació de leads outbound de beesspoke \| Agència de reserves de reunions B2B/gi, "Beespoke Outbound | Agència de concertació de reunions B2B"],
      [/Beespoke ajuda a les empreses B2B a crear un canal de vendes identificant els qui prenen decisions adequats, creant una difusió atractiva i reservant reunions qualificades directament al vostre calendari\./g, "Beespoke ajuda empreses B2B a generar pipeline identificant els responsables adequats, creant missatges de prospecció convincents i reservant reunions qualificades directament al vostre calendari."],
      [/\bcanal de vendes\b/gi, "pipeline comercial"], [/\bcanonada\b/gi, "pipeline"], [/\bdifusió\b/gi, "prospecció"],
      [/Creeu una prospecció que obtingui respostes/g, "Crea missatges de prospecció que generin respostes"],
      [/Un equip magre en lloc d'un altre lloguer car/g, "Un equip àgil en lloc d'una altra contractació costosa"],
      [/Mensual plana/g, "Pla mensual"], [/Què costa la outbound\?/g, "Quant costa l'outbound?"],
      [/Generació de leads de fabricació/g, "Generació de leads per a fabricants"], [/Preu de fixació de cita/g, "Preus de concertació de reunions"],
      [/Estàs preparat per crear més cartera de vendes\?/g, "Preparat per generar més pipeline comercial?"],
      [/beesspoke/gi, "Beespoke"],
      [/Serveis SDR externalitzats per a sortides B2B enfocades/g, "Serveis SDR externalitzats per a outbound B2B focalitzat"],
      [/Serveis de SDR externalitzats: abast, encaix i compensacions/g, "Serveis SDR externalitzats: abast, encaix i limitacions"],
      [/\bDEG\b/g, "SDR"], [/sortides B2B/gi, "outbound B2B"], [/\bsortides\b/gi, "outbound"], [/>agència outbound/g, ">Agència outbound"],
      [/generació de clients potencials/gi, "generació de leads"], [/generació de contactes de fabricació/gi, "generació de leads per a fabricants"],
      [/\| Va dir abelles/g, "| Beespoke"], [/Sortida d'abelles/g, "Beespoke Outbound"], [/Beesspoke/g, "Beespoke"], [/Preus Beespoke/g, "Preus de Beespoke"], [/\bCasa\b/g, "Inici"],
      [/Generació de leads de sortida/g, "Generació de leads outbound"], [/generació de leads de sortida/g, "generació de leads outbound"],
      [/Generació de contactes de sortida/g, "Generació de contactes outbound"], [/generació de contactes de sortida/g, "generació de contactes outbound"],
      [/Sortida B2B gestionada/g, "Outbound B2B gestionat"], [/campanya de sortida/g, "campanya outbound"],
      [/Reserveu una trucada de fit de 30 minuts/g, "Reserva una trucada d'avaluació de 30 minuts"], [/trucada de fit/g, "trucada d'avaluació"],
      [/Comprovació d'ajust/g, "Avaluació de l'encaix"], [/comprovació d'ajust/g, "avaluació de l'encaix"], [/ajust/gi, "encaix"],
      [/La sortida gestionada encara és adequada\?/g, "La teva empresa està preparada per a un programa outbound gestionat?"],
      [/Sortida B2B/g, "Outbound B2B"], [/sortida B2B/g, "outbound B2B"], [/campanya de sortida/g, "campanya outbound"], [/servei de sortida/g, "servei outbound"],
      [/Preus de sortida/g, "Preus outbound"], [/preus de sortida/g, "preus outbound"], [/agències de sortida/gi, "agències outbound"], [/agència de sortida/gi, "agència outbound"], [/sistema de sortida/gi, "sistema outbound"],
      [/divulgació/gi, "prospecció"], [/abast anterior/g, "prospecció anterior"], [/abast de LinkedIn/g, "campanya de prospecció a LinkedIn"],
      [/còpia privada/g, "copy privat"], [/la còpia/g, "el copy"], [/suport de còpia/g, "suport de copy"], [/còpia/g, "copy"],
      [/trucada de descobriment/g, "trucada de diagnòstic"], [/executar el descobriment/g, "fer el diagnòstic comercial"],
      [/Configuració de cites/g, "Concertació de reunions"], [/configuració de cites/g, "concertació de reunions"], [/fixació de cites/g, "concertació de reunions"],
      [/Constructor de qualificacions/g, "Definició de reunions qualificades"], [/Definició de força/g, "Solidesa de la definició"],
      [/un nom encara no està en procés/g, "un contacte encara no és pipeline"], [/bestreta fixa/g, "quota mensual fixa"], [/retenedor/gi, "quota mensual"],
      [/risc de producció/g, "risc vinculat als resultats"], [/què informem/g, "Què inclouen els informes"], [/moviment de vendes/g, "model comercial"],
      [/resposta contundent/g, "Bona resposta"], [/senyal d'advertència/g, "Senyal d'alerta"], [/On es troba Beespoke/g, "On se situa Beespoke"],
      [/Escenaris de costos treballats/g, "Escenaris de costos"], [/va celebrar la reunió de l'ICP/g, "reunió celebrada amb l'ICP"],
      [/risc de sortida/g, "risc vinculat als resultats"], [/les copia/g, "el copy"],
      [/\bPCI\b/g, "ICP"],
      [/\bfit\b/gi, "encaix"], [/cost completament carregat/gi, "cost total"], [/costos completament carregats/gi, "costos totals"],
      [/mòdul SDR/g, "equip SDR"], [/Pod SDR/g, "Equip SDR"], [/pod SDR/g, "equip SDR"], [/canalització/g, "pipeline"],
      [/Difusió de LinkedIn a compradors sèniors de ciberseguretat/g, "Prospecció a LinkedIn dirigida a responsables de ciberseguretat"],
      [/Preus outbound senzills lligats a la feina i a les reunions/g, "Preus outbound transparents, vinculats a la feina i a les reunions"],
      [/Concertació de reunions B2B amb les regles de qualificació definides primer/g, "Concertació de reunions B2B amb criteris de qualificació definits des del principi"],
      [/Generació de contactes de LinkedIn que sona com una conversa humana creïble/g, "Prospecció a LinkedIn que genera converses creïbles"],
      [/Generació de leads outbound basada en reunions qualificades/g, "Generació de leads outbound orientada a reunions qualificades"],
      [/\bSortida\b/g, "Outbound"], [/\bsortida\b/g, "outbound"], [/\bSortint\b/g, "Outbound"], [/\bsortint\b/g, "outbound"],
      [/Guia d'articles/g, "Guia de l'article"],
      [/generació de leads outbound de Beespoke \| Agència de reserves de reunions B2B/gi, "Beespoke Outbound | Agència de concertació de reunions B2B"],
      [/Generació de leads outbound que reserva reunions reals amb els vostres clients ideals/g, "Generació de leads outbound que genera reunions reals amb els teus clients ideals"]
      ,[/correu electrònic en fred/gi, "cold email"], [/correu electrònic fred/gi, "cold email"], [/correus electrònics freds/gi, "emails en fred"],
      [/generació de contactes/gi, "generació de leads"], [/vendes sortints/gi, "vendes outbound"], [/venda sortint/gi, "venda outbound"],
      [/completament carregat/gi, "total"], [/completament carregada/gi, "total"], [/data-encaix/g, "data-fit"],
      [/mapa activador de outbound/gi, "mapa de senyals outbound"],
      [/Raona ara/g, "Motiu per actuar ara"],
      [/Arribeu al grup de compra complet/g, "Arriba a tot el grup de compra"],
      [/Qualifica per a un servei adequat, no curiositat/g, "Qualifica l’encaix amb el servei, no la simple curiositat"],
      [/On Beespoke pot cabre/g, "On pot encaixar Beespoke"],
      [/Canvi de contractació pública/g, "Senyal públic de contractació"],
      [/grup de compra de lloguer/gi, "grup de compra de la contractació"],
      [/cap de contractació qualificat/gi, "lead qualificat de serveis de selecció"],
      [/Definir el servei informàtic i la falca comercial/g, "Defineix el servei IT i l’angle comercial"],
      [/falca/gi, "angle"],
      [/Manté el denominador qualificat/g, "Reunions qualificades celebrades"],
      [/Creeu un cost mensual total/g, "Calcula el cost mensual total"],
      [/Preus a mida en context/g, "Preus de Beespoke en context"],
      [/Una persona capaç és propietària de l'execució diària/g, "Una persona competent assumeix l’execució diària"],
      [/El programari guanya quan el sistema operatiu ja existeix/g, "El programari encaixa quan el sistema operatiu ja existeix"],
      [/Una agència guanya quan l'execució és el coll d'ampolla/g, "Una agència encaixa quan l’execució és el coll d’ampolla"],
      [/Modeleu l'economia plenament carregada/g, "Modela el cost total"],
      [/Llista de proveïdors per la feina a realitzar/g, "Selecciona proveïdors segons la feina que cal fer"],
      [/Prova de qualificació i lliurament de vendes/g, "Prova la qualificació i el traspàs a vendes"],
      [/Enllaços de proveïdors i prospecció comercial/g, "Enllaços de proveïdors i transparència comercial"],
      [/Enllaços de proveïdors i prospecció/g, "Enllaços de proveïdors i transparència"],
      [/compensacions/gi, "limitacions"],
      [/problema comprable/gi, "problema pel qual un client compraria"],
      [/activadors com a pistes de recerca/gi, "senyals com a pistes de recerca"],
      [/coneixement privat/gi, "informació privada"],
      [/Qualificar econòmic i en forma de lliurament/g, "Qualifica l’encaix econòmic i operatiu"],
      [/grup de compra darrere del resum/gi, "grup de compra darrere del brief"],
      [/Inspeccioneu l'obra/g, "Revisa la feina"],
      [/interioritzar/gi, "internalitzar"],
      [/llibre de jocs/gi, "playbook"],
      [/augment de personal/gi, "ampliació de personal"],
      [/cost i la rampa totals/gi, "cost total i el temps de posada en marxa"],
      [/Seguretat, propietat, economia i outbound/g, "Seguretat, propietat, economia i condicions de finalització"],
      [/Auditoria una mostra real del treball/g, "Audita una mostra real de la feina"],
      [/Referència: comproveu el model de lliurament i, a continuació, contracteu una prova/g, "Comprova referències del model de prestació i després contracta una prova"],
      [/accent descrit públicament/gi, "enfocament descrit públicament"],
      [/tarifa de titular/gi, "preu anunciat"],
      [/cost carregat completament/gi, "cost total"],
      [/missatgeria/gi, "missatges"]
    ],
    fr: [
      [/\$10,000/g, "10 000 $"],
      [/Beespoke aide les entreprises B2B à créer un pipeline de ventes en identifiant les bons décideurs, en créant une prospection convaincante et en réservant des réunions qualifiées directement dans votre calendrier\./g, "Beespoke aide les entreprises B2B à générer du pipeline en identifiant les bons décideurs, en créant des messages de prospection convaincants et en réservant des rendez-vous qualifiés directement dans votre calendrier."],
      [/Victoires sortantes récentes/g, "Résultats outbound récents"], [/Boutique au départ de Barcelone/g, "Agence outbound boutique à Barcelone"],
      [/Quel est le coût des outbound \?/g, "Quel est le coût de l'outbound ?"], [/Génération de leads de fabrication/g, "Génération de leads pour l'industrie"],
      [/Tarifs sur rendez-vous/g, "Tarification de la prise de rendez-vous"], [/WhatsApp nous/g, "Écrivez-nous sur WhatsApp"],
      [/Services SDR externalisés pour les sorties B2B ciblées/g, "Services SDR externalisés pour une prospection B2B ciblée"],
      [/\bDTS\b/g, "SDR"], [/Sorties industrielles et manufacturières/g, "Prospection industrielle et manufacturière"], [/sorties B2B/gi, "prospection B2B"], [/\bsorties\b/gi, "outbound"], [/>agence outbound/g, ">Agence outbound"],
      [/support aux ventes fractionnées/gi, "direction commerciale à temps partagé"], [/génération de leads pour la fabrication/gi, "génération de leads pour l'industrie"],
      [/Beespoke sortant/g, "Beespoke Outbound"], [/Tarification sur mesure/g, "Tarifs Beespoke"], [/Noah Lévy/g, "Noah Levy"], [/Noé Levy/g, "Noah Levy"], [/\bMaison\b/g, "Accueil"],
      [/Génération de leads sortants/g, "Génération de leads outbound"], [/génération de leads sortants/g, "génération de leads outbound"],
      [/Gestion sortante B2B/g, "Prospection outbound B2B"], [/campagne sortante/g, "campagne outbound"],
      [/Réservez un appel d'ajustement de 30 minutes/g, "Réserver un appel d'évaluation de 30 minutes"], [/appel d'ajustement/g, "appel d'évaluation"],
      [/Vérification de l'ajustement/g, "Évaluation de l'adéquation"], [/vérification de l'ajustement/g, "évaluation de l'adéquation"], [/ajustement/gi, "adéquation"],
      [/La gestion des sorties sortantes est-elle déjà appropriée \?/g, "Votre entreprise est-elle prête pour un programme outbound géré ?"],
      [/Gestion sortante B2B/g, "Prospection outbound B2B"], [/campagne sortante/g, "campagne outbound"], [/service sortant/g, "service outbound"],
      [/Tarification sortante/g, "Tarification outbound"], [/tarification sortante/g, "tarification outbound"], [/agences sortantes/gi, "agences outbound"], [/agence sortante/gi, "agence outbound"], [/système sortant/gi, "système outbound"],
      [/sensibilisation/gi, "prospection"], [/portée précédente/g, "prospection précédente"], [/portée LinkedIn/g, "campagne de prospection LinkedIn"],
      [/copie privée/g, "copy privé"], [/la copie/g, "le copy"], [/support de copie/g, "accompagnement rédactionnel"], [/copie/g, "copy"],
      [/appel de découverte/g, "appel de diagnostic"], [/exécuter la découverte/g, "mener le diagnostic commercial"],
      [/Configuration des rendez-vous/g, "Prise de rendez-vous"], [/configuration des rendez-vous/g, "prise de rendez-vous"],
      [/Générateur de qualifications/g, "Définition des rendez-vous qualifiés"], [/Définition de la force/g, "Solidité de la définition"],
      [/un nom n'est pas encore en préparation/g, "un contact n'est pas encore une opportunité"], [/acompte fixe/g, "forfait mensuel fixe"], [/dispositif de retenue/g, "forfait mensuel"], [/retenue/g, "forfait mensuel"],
      [/risque de production/g, "risque lié aux résultats"], [/ce que nous rapportons/g, "Ce que couvrent les rapports"], [/mouvement de vente/g, "modèle commercial"],
      [/Réponse forte/g, "Bonne réponse"], [/Panneau d'avertissement/g, "Signal d'alerte"], [/Où se trouve Beespoke/g, "Positionnement de Beespoke"],
      [/Scénarios de coûts travaillés/g, "Scénarios de coûts"], [/a tenu une réunion du PCI/g, "rendez-vous tenu avec l'ICP"],
      [/Plan standard sur mesure/g, "Plan standard Beespoke"], [/Ajuster/g, "Adapter"],
      [/\bPCI\b/g, "ICP"],
      [/\bfit\b/gi, "adéquation"], [/coût entièrement chargé/gi, "coût total"], [/coûts entièrement chargés/gi, "coûts totaux"],
      [/module SDR/g, "équipe SDR"], [/Pod SDR/g, "Équipe SDR"], [/pod SDR/g, "équipe SDR"],
      [/prospection de LinkedIn aux acheteurs seniors en cybersécurité/gi, "Prospection LinkedIn auprès de décideurs en cybersécurité"],
      [/Tarification outbound simple liée au travail et aux réunions/g, "Tarification outbound transparente, liée au travail réalisé et aux rendez-vous"],
      [/Prise de rendez-vous B2B avec les règles de qualification définies en premier/g, "Prise de rendez-vous B2B avec des critères de qualification définis dès le départ"],
      [/Génération de leads LinkedIn qui ressemble à une conversation humaine crédible/g, "Prospection LinkedIn qui génère des conversations crédibles"],
      [/Génération de leads outbound construite autour de rendez-vous qualifiés/g, "Génération de leads outbound axée sur des rendez-vous qualifiés"],
      [/\bSortante\b/g, "Outbound"], [/\bsortante\b/g, "outbound"], [/\bSortant\b/g, "Outbound"], [/\bsortant\b/g, "outbound"],
      [/Guide des articles/g, "Guide de l'article"],
      [/Beespoke aide les entreprises B2B à créer un pipeline de ventes en identifiant les bons décideurs, en créant une prospection convaincante et en réservant des réunions qualifiées directement dans votre calendrier\./g, "Beespoke aide les entreprises B2B à générer du pipeline en identifiant les bons décideurs, en créant des messages de prospection convaincants et en réservant des rendez-vous qualifiés directement dans votre calendrier."],
      [/Génération de leads outbound Beespoke \| Agence de réservation de réunions B2B/g, "Beespoke Outbound | Agence de prise de rendez-vous B2B"],
      [/Génération de leads outbound qui réserve de véritables réunions avec vos clients idéaux/g, "Génération de leads outbound qui obtient de vrais rendez-vous avec vos clients idéaux"]
      ,[/courrier électronique froid/gi, "cold email"], [/e-mail froid/gi, "cold email"], [/email froid/gi, "cold email"],
      [/ventes sortantes/gi, "ventes outbound"], [/vente sortante/gi, "vente outbound"],
      [/entièrement chargé/gi, "total"], [/entièrement chargée/gi, "totale"], [/data-adéquation/g, "data-fit"],
      [/trafic outbound/gi, "prospection outbound"],
      [/communications sortantes ciblées/gi, "prospection outbound ciblée"],
      [/carte de déclenchement outbound/gi, "carte des signaux outbound"],
      [/Raison maintenant/g, "Motif d’agir maintenant"],
      [/Qualifiez-vous pour l'adéquation du service, pas pour la curiosité/g, "Qualifiez l’adéquation au service, pas la simple curiosité"],
      [/Changement d'embauche publique/g, "Signal public de recrutement"],
      [/groupe d'achat d'embauche/gi, "groupe d’achat du recrutement"],
      [/Définir le service informatique et le coin commercial/g, "Définir le service IT et l’angle commercial"],
      [/coin d'agence de marketing/gi, "angle d’agence marketing"],
      [/Dénominateur qualifié détenu/g, "Rendez-vous qualifiés tenus"],
      [/Construisez un coût mensuel complet/g, "Calculez le coût mensuel total"],
      [/Une personne capable possède l'exécution quotidienne/g, "Une personne compétente pilote l’exécution quotidienne"],
      [/Le logiciel gagne lorsque le système d'exploitation existe déjà/g, "Le logiciel convient lorsque le système opérationnel existe déjà"],
      [/Une agence gagne lorsque l'exécution est le goulot d'étranglement/g, "Une agence convient lorsque l’exécution est le goulot d’étranglement"],
      [/Modélisez l’économie à pleine charge/g, "Modélisez le coût total"],
      [/Présélectionner les prestataires par travail à effectuer/g, "Présélectionner les prestataires selon le travail à réaliser"],
      [/Qualification des tests et transfert des ventes/g, "Tester la qualification et le transfert aux ventes"],
      [/Liens vers les fournisseurs et divulgation commerciale/g, "Liens vers les prestataires et transparence commerciale"],
      [/Liens vers les fournisseurs et divulgation/g, "Liens vers les prestataires et transparence"],
      [/problème achetable/gi, "problème pour lequel un client achèterait"],
      [/déclencheurs comme indices de recherche/gi, "signaux comme pistes de recherche"],
      [/connaissances privées/gi, "informations privées"],
      [/Qualifier l’adéquation économique et de livraison/g, "Qualifier l’adéquation économique et opérationnelle"],
      [/Tableau de bord de préparation à l'envoi de services professionnels/g, "Grille de préparation à l’outbound pour les services professionnels"],
      [/Testez sous contrainte un coin d'agence de marketing/g, "Évaluez l’angle d’une agence marketing"],
      [/Exécutez un examen externalisé des preuves SDR de 30 minutes/g, "Menez une revue de 30 minutes des preuves de l’équipe SDR externalisée"],
      [/augmentation du personnel/gi, "renfort de personnel"],
      [/coût et la rampe à pleine charge/gi, "coût total et le temps de mise en œuvre"],
      [/Vérifiez les références du modèle de livraison, puis contractez un test/g, "Vérifiez les références du modèle de prestation, puis contractualisez un test"],
      [/accent décrit publiquement/gi, "positionnement décrit publiquement"]
    ]
  };
  for (const [pattern, replacement] of terminology[locale]) html = html.replace(pattern, replacement);
  return html;
}

for (const [locale] of Object.entries(locales)) {
  const dictionary = { ...require(path.join(root, "data", `seo-translations.${locale}.json`)), ...(translationOverrides[locale] || {}) };
  for (const page of pages) {
    const source = fs.readFileSync(path.join(root, page.path.replace(/^\//, ""), "index.html"), "utf8");
    const output = path.join(root, localizedPath(locale, page.path).replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, localizeHtml(source, page, locale, dictionary));
  }
  const homepageSource = fs.readFileSync(path.join(root, "index.html"), "utf8")
    .replace(/<(meta|link)([^>]*?)\s*\/>/g, "<$1$2>")
    .replace(/src="(?!\/|https?:|data:)([^"]+)"/g, 'src="/$1"');
  const localizedHomepage = localizeHomepageSchema(localizeHtml(homepageSource, { path: "/" }, locale, dictionary), locale, dictionary);
  fs.writeFileSync(path.join(root, locale, "index.html"), localizedHomepage);
}

console.log(`Built ${(pages.length + 1) * Object.keys(locales).length} localized pages, including homepages.`);
