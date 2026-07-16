const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const origin = "https://outbound-lead-generation.com";
const pages = require(path.join(root, "data", "seo-pages.json"));
const locales = {
  es: { label: "Español", home: "Inicio" },
  ca: { label: "Català", home: "Inici" },
  fr: { label: "Français", home: "Accueil" }
};

const escapeHtml = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const localizedPath = (locale, pathname) => `/${locale}${pathname === "/" ? "/" : pathname}`;

function languageLinks(pagePath, active) {
  const choices = [
    ["en", "English", pagePath],
    ...Object.entries(locales).map(([code, config]) => [code, config.label, localizedPath(code, pagePath)])
  ];
  return `<div class="language-switcher"><button type="button" aria-expanded="false" aria-label="Language">${active.toUpperCase()}</button><div>${choices.map(([code, label, href]) => `<a href="${href}" lang="${code}"${code === active ? ' aria-current="page"' : ""}>${label}</a>`).join("")}</div></div>`;
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
  return `${leading}${dictionary[compact] || compact}${trailing}`;
}

function localizeInternalLinks(html, locale) {
  const known = new Set(pages.map((page) => page.path));
  return html.replace(/href="(\/[^"#?]*)"/g, (full, href) => known.has(href) ? `href="${localizedPath(locale, href)}"` : full);
}

function localizeSchema(html, page, locale, dictionary) {
  return html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/, (full, raw) => {
    const schema = JSON.parse(raw);
    const localizedUrl = `${origin}${localizedPath(locale, page.path)}`;
    for (const node of schema["@graph"] || []) {
      if (node.url) node.url = localizedUrl;
      if (node["@id"]) node["@id"] = `${localizedUrl}#page`;
      if (node.name) node.name = dictionary[node.name] || node.name;
      if (node.description) node.description = dictionary[node.description] || node.description;
      if (node.author?.url) node.author.url = `${origin}${localizedPath(locale, "/about/noah-levy/")}`;
      if (node.itemListElement) node.itemListElement.forEach((item) => {
        if (item.position === 1) item.name = locales[locale].home;
        if (item.position === 2) { item.name = dictionary[item.name] || item.name; item.item = localizedUrl; }
      });
    }
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
    .replace(/(<meta (?:name|property)="(?:description|og:title|og:description)" content=")([^"]+)(">)/g, (all, before, value, after) => `${before}${escapeHtml(dictionary[value] || value)}${after}`)
    .replace(/<title>([^<]+)<\/title>/, (all, value) => `<title>${escapeHtml(dictionary[value] || value)}</title>`);
  html = localizeSchema(html, page, locale, dictionary);
  html = html.replace(/(<script[\s\S]*?<\/script>|<[^>]+>|[^<]+)/gi, (token) => token.startsWith("<") ? token : translateText(token, dictionary));
  html = localizeInternalLinks(html, locale);
  html = html.replace(/<div class="language-switcher">[\s\S]*?<\/div><\/div>/, languageLinks(page.path, locale));
  const terminology = {
    es: [
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
      [/Reserva una conversación/g, "Reservar una conversación"], [/guía de artículos/g, "Guía del artículo"], [/guía de decisión del comprador/g, "Guía de decisión del comprador"]
    ],
    ca: [
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
      [/Guia d'articles/g, "Guia de l'article"]
    ],
    fr: [
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
      [/Guide des articles/g, "Guide de l'article"]
    ]
  };
  for (const [pattern, replacement] of terminology[locale]) html = html.replace(pattern, replacement);
  return html;
}

for (const [locale] of Object.entries(locales)) {
  const dictionary = require(path.join(root, "data", `seo-translations.${locale}.json`));
  for (const page of pages) {
    const source = fs.readFileSync(path.join(root, page.path.replace(/^\//, ""), "index.html"), "utf8");
    const output = path.join(root, localizedPath(locale, page.path).replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, localizeHtml(source, page, locale, dictionary));
  }
}

console.log(`Built ${pages.length * Object.keys(locales).length} localized SEO pages.`);
