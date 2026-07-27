const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const origin = "https://outbound-lead-generation.com";
const locales = ["en", "es", "ca", "fr"];

const copy = {
  en: {
    language: "English",
    back: "Back to the pricing benchmark",
    print: "Print or save as PDF",
    download: "Download blank HTML",
    privacy: "Private by design: this worksheet sends no data to Beespoke or any third party.",
    scorecard: {
      title: "Beespoke ICP scorecard",
      description: "Score the commercial conditions that make a B2B segment ready for focused outbound.",
      eyebrow: "Buyer planning worksheet",
      intro: "Rate every signal from 0 to 3. Use evidence available today, not what the team hopes will become true after launch.",
      scale: [["0","Unknown or absent"],["1","Weak"],["2","Usable"],["3","Strong"]],
      groups: [
        ["Market definition",["We can describe the target company without relying on a broad industry label.","The account universe is large enough for a test but narrow enough to review manually.","We have written exclusions that protect poor-fit accounts."]],
        ["Buying context",["We know which role feels the problem and which role can approve change.","We can name a credible trigger, situation or reason to contact the buyer now.","The sales team can progress a multi-stakeholder conversation."]],
        ["Offer and evidence",["The offer solves a specific, commercially meaningful problem.","Relevant proof, expertise or a defensible point of view supports the claim.","Customer value can support human-led acquisition and sales follow-up."]],
        ["Execution readiness",["A credible sender can participate in the campaign.","Someone owns fast reply handling, discovery and CRM follow-up.","The team can support a 6–12 week learning window without forcing volume."]]
      ],
      total: "Total readiness score",
      tierLow: "0–15: clarify the offer, market and ownership before paying for campaign volume.",
      tierMid: "16–26: a narrow validation campaign may be sensible if the weakest signals are managed explicitly.",
      tierHigh: "27–36: the segment has strong prerequisites for a focused test; results still are not guaranteed.",
      evidence: "Evidence and open questions",
      evidencePrompt: "Record the weakest assumptions, proof available, missing stakeholders and what must be learned first."
    },
    brief: {
      title: "Beespoke outbound campaign brief",
      description: "A structured one-page-plus brief for audience, offer, proof, qualification, ownership and measurement.",
      eyebrow: "Campaign planning worksheet",
      intro: "Complete this before list building or copywriting. The goal is one testable campaign—not a description of every market the company could ever serve.",
      fields: [
        ["Campaign decision","What commercial decision should this test help us make?"],
        ["Target accounts","Company type, size, geography, operating context and explicit exclusions."],
        ["Buying committee","Problem owner, economic buyer, evaluator, champion and likely blockers."],
        ["Problem and consequence","What is happening, why it matters and what the buyer risks by leaving it unchanged?"],
        ["Offer and next step","What specific offer is relevant, and what useful first conversation are we asking for?"],
        ["Proof and credibility","Relevant outcomes, expertise, assets or honest evidence supporting the reason to engage."],
        ["Message hypotheses","Two or three distinct reasons the buyer may respond—without invented personalization."],
        ["Qualification definition","Required company fit, role or responsibility, geography, interest and attendance conditions."],
        ["Channel and sender","Which channel, which real sender, which account or domain, and why this combination fits?"],
        ["Ownership","Who reviews lists, approves copy, handles replies, runs discovery and updates the CRM?"],
        ["Measurement","Separate sent, replied, positive, booked, held, qualified and accepted-opportunity events."],
        ["Stop, revise and scale rules","What evidence triggers a message change, segment change, pause or expansion?"]
      ],
      checklist: "Launch gate",
      checks: ["Target and exclusion rules are written.","Every factual claim has evidence.","Qualification and attendance are defined.","Required tools and third-party costs are named.","Reply and sales follow-up owners are available.","The campaign can stop without losing its data or learning."],
      notes: "Decision notes and approvals"
    }
  },
  es: {
    language: "Español", back: "Volver al benchmark de precios", print: "Imprimir o guardar como PDF", download: "Descargar HTML en blanco", privacy: "Privado por diseño: esta plantilla no envía datos a Beespoke ni a terceros.",
    scorecard: {
      title: "Ficha de puntuación del ICP de Beespoke", description: "Evalúa las condiciones comerciales que hacen que un segmento B2B esté preparado para outbound focalizado.", eyebrow: "Plantilla de planificación", intro: "Puntúa cada señal de 0 a 3. Usa la evidencia disponible hoy, no lo que el equipo espera que sea cierto después del lanzamiento.",
      scale: [["0","Desconocido o ausente"],["1","Débil"],["2","Utilizable"],["3","Sólido"]],
      groups: [
        ["Definición del mercado",["Podemos describir la empresa objetivo sin depender de una etiqueta sectorial amplia.","El universo de cuentas es suficiente para una prueba y lo bastante acotado para revisarlo manualmente.","Hemos escrito exclusiones que protegen las cuentas con poco encaje."]],
        ["Contexto de compra",["Sabemos qué rol vive el problema y cuál puede aprobar el cambio.","Podemos nombrar un desencadenante o una razón creíble para contactar ahora.","El equipo comercial puede avanzar una conversación con varios interlocutores."]],
        ["Oferta y evidencia",["La oferta resuelve un problema específico y comercialmente relevante.","Tenemos pruebas, experiencia o un punto de vista defendible que respalda la propuesta.","El valor del cliente justifica adquisición humana y seguimiento comercial."]],
        ["Preparación operativa",["Un remitente creíble puede participar en la campaña.","Alguien se responsabiliza de respuestas rápidas, diagnóstico y seguimiento en el CRM.","El equipo puede sostener 6–12 semanas de aprendizaje sin forzar volumen."]]
      ],
      total: "Puntuación total", tierLow: "0–15: aclara oferta, mercado y responsables antes de pagar por volumen.", tierMid: "16–26: una prueba muy acotada puede tener sentido si se gestionan las señales débiles.", tierHigh: "27–36: el segmento tiene buenas condiciones para una prueba focalizada; los resultados no están garantizados.", evidence: "Evidencia y preguntas abiertas", evidencePrompt: "Anota los supuestos más débiles, la evidencia disponible, los interlocutores que faltan y lo primero que debe aprenderse."
    },
    brief: {
      title: "Brief de campaña outbound de Beespoke", description: "Un brief estructurado para audiencia, oferta, prueba, cualificación, responsables y medición.", eyebrow: "Plantilla de campaña", intro: "Complétalo antes de crear listas o copy. El objetivo es una campaña comprobable, no describir todos los mercados posibles.",
      fields: [
        ["Decisión de campaña","¿Qué decisión comercial debe ayudarnos a tomar esta prueba?"],["Cuentas objetivo","Tipo de empresa, tamaño, geografía, contexto operativo y exclusiones."],["Comité de compra","Responsable del problema, comprador económico, evaluador, promotor y bloqueadores."],["Problema y consecuencia","¿Qué ocurre, por qué importa y qué arriesga el comprador si no cambia?"],["Oferta y siguiente paso","¿Qué oferta concreta es relevante y qué primera conversación útil proponemos?"],["Prueba y credibilidad","Resultados, experiencia, activos o evidencia honesta que respaldan el contacto."],["Hipótesis de mensaje","Dos o tres razones distintas para responder, sin personalización inventada."],["Definición de cualificación","Condiciones de empresa, rol, geografía, interés y asistencia."],["Canal y remitente","Qué canal, remitente real, cuenta o dominio y por qué encaja."],["Responsables","Quién revisa listas, aprueba copy, responde, hace diagnóstico y actualiza el CRM."],["Medición","Separa enviados, respuestas, positivos, reservas, celebradas, cualificadas y oportunidades aceptadas."],["Reglas para parar, revisar o escalar","Qué evidencia activa un cambio, una pausa o una ampliación."]
      ],
      checklist: "Control previo al lanzamiento", checks: ["Target y exclusiones por escrito.","Cada afirmación factual tiene respaldo.","Cualificación y asistencia definidas.","Herramientas y costes externos identificados.","Responsables de respuestas y seguimiento disponibles.","Los datos y aprendizajes siguen siendo accesibles al parar."], notes: "Notas de decisión y aprobaciones"
    }
  },
  ca: {
    language: "Català", back: "Tornar al benchmark de preus", print: "Imprimir o desar com a PDF", download: "Descarregar l’HTML en blanc", privacy: "Privat per disseny: aquesta plantilla no envia dades a Beespoke ni a tercers.",
    scorecard: {
      title: "Fitxa de puntuació de l’ICP de Beespoke", description: "Avalua les condicions comercials que fan que un segment B2B estigui preparat per a outbound focalitzat.", eyebrow: "Plantilla de planificació", intro: "Puntua cada senyal de 0 a 3. Fes servir l’evidència disponible avui, no allò que l’equip espera que sigui cert després del llançament.",
      scale: [["0","Desconegut o absent"],["1","Feble"],["2","Utilitzable"],["3","Sòlid"]],
      groups: [
        ["Definició del mercat",["Podem descriure l’empresa objectiu sense dependre d’una etiqueta sectorial massa àmplia.","L’univers de comptes és prou gran per a una prova i prou acotat per revisar-lo manualment.","Hem escrit exclusions que protegeixen els comptes amb poc encaix."]],
        ["Context de compra",["Sabem quin rol viu el problema i quin pot aprovar el canvi.","Podem identificar un desencadenant o una raó creïble per contactar ara.","L’equip comercial pot avançar una conversa amb diversos interlocutors."]],
        ["Oferta i evidència",["L’oferta resol un problema específic i comercialment rellevant.","Tenim proves, experiència o un punt de vista defensable que dona suport a la proposta.","El valor del client justifica adquisició humana i seguiment comercial."]],
        ["Preparació operativa",["Un remitent creïble pot participar en la campanya.","Algú és responsable de les respostes ràpides, el diagnòstic i el seguiment al CRM.","L’equip pot sostenir 6–12 setmanes d’aprenentatge sense forçar volum."]]
      ],
      total: "Puntuació total", tierLow: "0–15: aclareix l’oferta, el mercat i els responsables abans de pagar per volum.", tierMid: "16–26: una prova molt acotada pot tenir sentit si es gestionen els senyals febles.", tierHigh: "27–36: el segment té bones condicions per a una prova focalitzada; els resultats no estan garantits.", evidence: "Evidència i preguntes obertes", evidencePrompt: "Anota els supòsits més febles, l’evidència disponible, els interlocutors que falten i què cal aprendre primer."
    },
    brief: {
      title: "Brief de campanya outbound de Beespoke", description: "Un brief estructurat per a audiència, oferta, prova, qualificació, responsables i mesura.", eyebrow: "Plantilla de campanya", intro: "Completa’l abans de crear llistes o copy. L’objectiu és una campanya comprovable, no descriure tots els mercats possibles.",
      fields: [
        ["Decisió de campanya","Quina decisió comercial ens ha d’ajudar a prendre aquesta prova?"],["Comptes objectiu","Tipus d’empresa, mida, geografia, context operatiu i exclusions."],["Comitè de compra","Responsable del problema, comprador econòmic, avaluador, promotor i bloquejadors."],["Problema i conseqüència","Què passa, per què importa i què arrisca el comprador si no canvia?"],["Oferta i pas següent","Quina oferta concreta és rellevant i quina primera conversa útil proposem?"],["Prova i credibilitat","Resultats, experiència, actius o evidència honesta que justifiquen el contacte."],["Hipòtesis de missatge","Dues o tres raons diferents per respondre, sense personalització inventada."],["Definició de qualificació","Condicions d’empresa, rol, geografia, interès i assistència."],["Canal i remitent","Quin canal, remitent real, compte o domini i per què encaixa."],["Responsables","Qui revisa llistes, aprova copy, respon, fa diagnòstic i actualitza el CRM."],["Mesura","Separa enviats, respostes, positius, reserves, celebrades, qualificades i oportunitats acceptades."],["Regles per aturar, revisar o escalar","Quina evidència activa un canvi, una pausa o una ampliació."]
      ],
      checklist: "Control abans del llançament", checks: ["Target i exclusions per escrit.","Cada afirmació factual té suport.","Qualificació i assistència definides.","Eines i costos externs identificats.","Responsables de respostes i seguiment disponibles.","Les dades i els aprenentatges continuen accessibles en aturar-se."], notes: "Notes de decisió i aprovacions"
    }
  },
  fr: {
    language: "Français", back: "Retour au benchmark tarifaire", print: "Imprimer ou enregistrer en PDF", download: "Télécharger le HTML vierge", privacy: "Confidentiel par conception : cette fiche n’envoie aucune donnée à Beespoke ni à un tiers.",
    scorecard: {
      title: "Grille d’évaluation de l’ICP Beespoke", description: "Évaluez les conditions commerciales qui rendent un segment B2B prêt pour une campagne outbound ciblée.", eyebrow: "Fiche de planification", intro: "Notez chaque signal de 0 à 3. Appuyez-vous sur les preuves disponibles aujourd’hui, pas sur ce que l’équipe espère obtenir après le lancement.",
      scale: [["0","Inconnu ou absent"],["1","Faible"],["2","Exploitable"],["3","Solide"]],
      groups: [
        ["Définition du marché",["Nous pouvons décrire l’entreprise cible sans nous limiter à une catégorie sectorielle trop large.","Le nombre de comptes permet un test tout en restant assez limité pour une revue manuelle.","Des exclusions écrites protègent les comptes mal adaptés."]],
        ["Contexte d’achat",["Nous savons qui ressent le problème et qui peut approuver le changement.","Nous pouvons nommer un déclencheur ou une raison crédible de contacter maintenant.","L’équipe commerciale peut faire progresser une conversation multipartite."]],
        ["Offre et preuves",["L’offre résout un problème précis et commercialement important.","Des preuves, une expertise ou un point de vue défendable soutiennent la proposition.","La valeur client justifie une acquisition humaine et un suivi commercial."]],
        ["Préparation opérationnelle",["Un expéditeur crédible peut participer à la campagne.","Une personne est responsable des réponses rapides, du diagnostic et du suivi CRM.","L’équipe peut soutenir 6 à 12 semaines d’apprentissage sans forcer le volume."]]
      ],
      total: "Score total de préparation", tierLow: "0–15 : clarifiez l’offre, le marché et les responsabilités avant d’acheter du volume.", tierMid: "16–26 : un test très ciblé peut être pertinent si les signaux faibles sont gérés explicitement.", tierHigh: "27–36 : le segment présente de bonnes conditions pour un test ciblé ; les résultats ne sont pas garantis.", evidence: "Preuves et questions ouvertes", evidencePrompt: "Notez les hypothèses les plus faibles, les preuves disponibles, les parties prenantes manquantes et le premier apprentissage attendu."
    },
    brief: {
      title: "Brief de campagne outbound Beespoke", description: "Un brief structuré pour l’audience, l’offre, les preuves, la qualification, les responsabilités et la mesure.", eyebrow: "Fiche de campagne", intro: "Complétez-le avant la création des listes ou du copy. L’objectif est une campagne testable, pas la description de tous les marchés possibles.",
      fields: [
        ["Décision de campagne","Quelle décision commerciale ce test doit-il nous aider à prendre ?"],["Comptes cibles","Type d’entreprise, taille, géographie, contexte opérationnel et exclusions."],["Comité d’achat","Responsable du problème, décideur économique, évaluateur, promoteur et freins."],["Problème et conséquence","Que se passe-t-il, pourquoi est-ce important et quel est le risque de l’inaction ?"],["Offre et prochaine étape","Quelle offre précise est pertinente et quelle première conversation utile proposons-nous ?"],["Preuves et crédibilité","Résultats, expertise, ressources ou preuves honnêtes qui justifient la prise de contact."],["Hypothèses de message","Deux ou trois raisons distinctes de répondre, sans personnalisation inventée."],["Définition de la qualification","Critères d’entreprise, rôle, géographie, intérêt et présence au rendez-vous."],["Canal et expéditeur","Quel canal, quel expéditeur réel, quel compte ou domaine, et pourquoi ?"],["Responsabilités","Qui vérifie les listes, approuve le copy, répond, mène le diagnostic et met à jour le CRM ?"],["Mesure","Séparez envois, réponses, positives, réservations, tenues, qualifiées et opportunités acceptées."],["Règles d’arrêt, de révision et d’expansion","Quelles preuves déclenchent un changement, une pause ou une expansion ?"]
      ],
      checklist: "Contrôle avant lancement", checks: ["Cible et exclusions écrites.","Chaque affirmation factuelle est étayée.","Qualification et présence définies.","Outils et coûts externes identifiés.","Responsables des réponses et du suivi disponibles.","Les données et apprentissages restent accessibles à l’arrêt."], notes: "Notes de décision et validations"
    }
  }
};

const esc = (value = "") => String(value).replace(/[&<>"]/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;" }[char]));
const localizedPath = (locale, base) => locale === "en" ? base : `/${locale}${base}`;

function alternates(base) {
  return [...locales.map((locale) => `<link rel="alternate" hreflang="${locale}" href="${origin}${localizedPath(locale, base)}">`), `<link rel="alternate" hreflang="x-default" href="${origin}${base}">`].join("");
}

function styles() {
  return `<style>:root{--ink:#101828;--muted:#596579;--line:#e2e8ef;--paper:#fff;--soft:#f6f8fb;--navy:#143d59;--teal:#2b7a78;--honey:#f0b429}*{box-sizing:border-box}body{margin:0;color:var(--ink);background:radial-gradient(circle at 8% 0,rgba(240,180,41,.16),transparent 28rem),linear-gradient(#fffdf8,#f6f8fb);font:16px/1.55 Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}a{color:var(--navy)}.shell{width:min(calc(100% - 32px),980px);margin:auto;padding:34px 0 72px}.top{display:flex;align-items:center;justify-content:space-between;gap:18px;margin-bottom:46px}.brand{display:flex;align-items:center;gap:11px;color:var(--ink);font-weight:850;text-decoration:none}.brand span{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;background:linear-gradient(145deg,#ffd86a,#e29a17);color:#2b1b00;font-size:20px}.langs{display:flex;gap:5px;flex-wrap:wrap}.langs a{padding:7px 10px;border-radius:999px;text-decoration:none;font-size:12px;font-weight:750}.langs a[aria-current]{background:var(--navy);color:#fff}.eyebrow{margin:0 0 10px;color:#a86b08;font-size:12px;font-weight:850;letter-spacing:.12em;text-transform:uppercase}h1{max-width:760px;margin:0;font-size:clamp(40px,7vw,72px);line-height:.98;letter-spacing:-.055em}.intro{max-width:760px;color:#405065;font-size:19px}.actions{display:flex;flex-wrap:wrap;gap:10px;margin:26px 0 34px}.button{border:0;border-radius:999px;padding:13px 18px;background:linear-gradient(135deg,#101828,var(--navy));color:#fff;font:inherit;font-weight:780;text-decoration:none;cursor:pointer}.button.secondary{border:1px solid var(--line);background:#fff;color:var(--ink)}.privacy{padding:13px 16px;border-left:4px solid var(--teal);border-radius:0 12px 12px 0;background:#edf8f7;color:#355d5e;font-size:13px}.card{margin:22px 0;padding:28px;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.94);box-shadow:0 18px 50px rgba(16,24,40,.06)}h2{margin:0 0 18px;font-size:26px;letter-spacing:-.03em}.scale{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.scale div{padding:12px;border:1px solid var(--line);border-radius:13px;background:var(--soft)}.scale strong{display:block;color:var(--navy);font-size:22px}.score-row{display:grid;grid-template-columns:1fr 76px;gap:14px;align-items:center;padding:14px 0;border-top:1px solid var(--line)}.score-row:first-of-type{border-top:0}.score-row label{color:#344054}.score-row input{width:100%;min-height:44px;border:1px solid #bdc8d4;border-radius:11px;text-align:center;font:800 18px/1 inherit}.score-total{display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center}.score-total strong{display:grid;place-items:center;width:110px;height:110px;border-radius:30px;background:linear-gradient(145deg,#ffd86a,#f0b429);color:#2b1b00;font-size:36px}.score-total p{margin:0;color:#405065}textarea,input[type=text]{width:100%;border:1px solid #c8d1dc;border-radius:12px;background:#fff;padding:12px;font:inherit}.brief-field{margin:16px 0}.brief-field label{display:block;margin-bottom:5px;font-weight:800}.brief-field small{display:block;margin-bottom:9px;color:var(--muted)}.checklist{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.checklist label{display:flex;gap:10px;padding:13px;border:1px solid var(--line);border-radius:12px;background:var(--soft)}.checklist input{width:18px;height:18px;accent-color:var(--teal)}footer{margin-top:34px;padding-top:24px;border-top:1px solid var(--line);color:var(--muted);font-size:13px}@media(max-width:680px){.top{align-items:flex-start;flex-direction:column}.scale,.checklist{grid-template-columns:1fr 1fr}.card{padding:20px}.score-total{grid-template-columns:1fr}.score-total strong{width:100%;height:80px}}@media print{body{background:#fff}.shell{width:100%;padding:0}.top,.actions,.privacy,footer{display:none}.card{break-inside:avoid;box-shadow:none}.brief-field textarea{min-height:115px}.score-row{padding:9px 0}h1{font-size:42px}.intro{font-size:15px}}</style>`;
}

function head(locale, base, title, description) {
  const canonical = `${origin}${localizedPath(locale, base)}`;
  return `<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><meta name="description" content="${esc(description)}"><meta name="robots" content="noindex,follow"><link rel="canonical" href="${canonical}">${alternates(base)}<link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'%3E%3Crect x='18' y='18' width='92' height='92' rx='28' fill='%23F0B429'/%3E%3Ctext x='64' y='78' text-anchor='middle' font-family='Arial' font-size='48' font-weight='900' fill='%232B1B00'%3EB%3C/text%3E%3C/svg%3E"><meta property="og:type" content="website"><meta property="og:url" content="${canonical}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:image" content="${origin}/assets/social/beespoke-og.png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="${origin}/assets/social/beespoke-og.png">${styles()}</head>`;
}

function chrome(locale, base, item) {
  const c = copy[locale];
  return `<div class="top"><a class="brand" href="${localizedPath(locale, "/")}"><span>B</span>Beespoke Outbound</a><nav class="langs" aria-label="Language">${locales.map((code) => `<a href="${localizedPath(code, base)}" lang="${code}"${code === locale ? ' aria-current="page"' : ""}>${copy[code].language}</a>`).join("")}</nav></div><a href="${localizedPath(locale, "/research/2026-b2b-outbound-pricing-benchmark/")}">← ${esc(c.back)}</a><header><p class="eyebrow">${esc(item.eyebrow)}</p><h1>${esc(item.title)}</h1><p class="intro">${esc(item.intro)}</p></header><div class="actions"><button class="button" type="button" onclick="window.print()">${esc(c.print)}</button><a class="button secondary" href="index.html" download>${esc(c.download)}</a></div><p class="privacy">${esc(c.privacy)}</p>`;
}

function scorecard(locale) {
  const base = "/downloads/beespoke-icp-scorecard/";
  const c = copy[locale];
  const item = c.scorecard;
  let index = 0;
  const groups = item.groups.map(([heading, signals]) => `<section class="card"><h2>${esc(heading)}</h2>${signals.map((signal) => `<div class="score-row"><label for="score-${index}">${esc(signal)}</label><input id="score-${index++}" data-score type="number" min="0" max="3" step="1" value="0" inputmode="numeric" aria-label="${esc(signal)}"></div>`).join("")}</section>`).join("");
  return `<!doctype html><html lang="${locale}">${head(locale, base, item.title, item.description)}<body><main class="shell">${chrome(locale, base, item)}<section class="card"><h2>0–3</h2><div class="scale">${item.scale.map(([score, label]) => `<div><strong>${score}</strong>${esc(label)}</div>`).join("")}</div></section>${groups}<section class="card score-total"><strong><span data-total>0</span>/36</strong><div><h2>${esc(item.total)}</h2><p data-tier>${esc(item.tierLow)}</p></div></section><section class="card"><h2>${esc(item.evidence)}</h2><textarea rows="8" placeholder="${esc(item.evidencePrompt)}"></textarea></section><footer>© 2026 Beespoke Outbound Lead Generation · <a href="${origin}">outbound-lead-generation.com</a></footer></main><script>(()=>{const inputs=[...document.querySelectorAll('[data-score]')],total=document.querySelector('[data-total]'),tier=document.querySelector('[data-tier]'),copy=${JSON.stringify([item.tierLow,item.tierMid,item.tierHigh])};function update(){const score=inputs.reduce((sum,input)=>sum+Math.min(3,Math.max(0,Number(input.value)||0)),0);total.textContent=score;tier.textContent=score<16?copy[0]:score<27?copy[1]:copy[2]}inputs.forEach(input=>input.addEventListener('input',update));update()})()</script></body></html>`;
}

function brief(locale) {
  const base = "/downloads/beespoke-outbound-campaign-brief/";
  const c = copy[locale];
  const item = c.brief;
  return `<!doctype html><html lang="${locale}">${head(locale, base, item.title, item.description)}<body><main class="shell">${chrome(locale, base, item)}<section class="card">${item.fields.map(([label, prompt], index) => `<div class="brief-field"><label for="brief-${index}">${esc(label)}</label><small>${esc(prompt)}</small><textarea id="brief-${index}" rows="4"></textarea></div>`).join("")}</section><section class="card"><h2>${esc(item.checklist)}</h2><div class="checklist">${item.checks.map((check) => `<label><input type="checkbox">${esc(check)}</label>`).join("")}</div></section><section class="card"><h2>${esc(item.notes)}</h2><textarea rows="9"></textarea></section><footer>© 2026 Beespoke Outbound Lead Generation · <a href="${origin}">outbound-lead-generation.com</a></footer></main></body></html>`;
}

for (const locale of locales) {
  for (const [base, html] of [["/downloads/beespoke-icp-scorecard/", scorecard(locale)], ["/downloads/beespoke-outbound-campaign-brief/", brief(locale)]]) {
    const output = path.join(root, localizedPath(locale, base).replace(/^\//, ""), "index.html");
    fs.mkdirSync(path.dirname(output), { recursive: true });
    fs.writeFileSync(output, html);
  }
}

console.log("Built 8 localized planning-resource pages.");
