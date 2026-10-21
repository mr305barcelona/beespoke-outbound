// Public copy only. Focused follow-up to observed Search Console queries.
const localeGrowth=require('./locale-growth-20261015');
const origin='https://outbound-lead-generation.com';
const updated='2026-10-15';
const english={
 '/guides/cold-email-agency/':{
  title:'Cold Email Agency: Pricing, Scope & Hiring Checklist',
  description:'What should a cold email agency include? Compare fees, domain ownership, deliverability responsibilities and reply handling with a practical hiring checklist.',
  h1:'Cold email agency: pricing, responsibilities and a hiring checklist',
  serviceLink:{label:'Review Beespoke’s managed outbound service',href:'/services/outbound-lead-generation/'},
  answer:'A cold email agency can research buyers, prepare messages, run email campaigns, manage replies and arrange sales conversations. A useful proposal states who owns the domains and data, which costs are additional, how replies are handled and what qualifies as an accepted meeting. Use the checklist below to compare that work. Beespoke publishes this buyer’s guide; its standard managed outbound service is LinkedIn-led.',
  secondary:{label:'Compare the proposal checklist',href:'#cold-email-risk-audit'}
 },
 '/guides/outbound-lead-generation-cost/':{
  title:'How Much Do Outbound Agencies Charge? Startup Budget',
  description:'Compare outbound agency retainers, per-meeting fees and startup costs. Build a first-90-day budget and check seven contract questions before signing.',
  h1:'How much do outbound agencies charge, and what does it cost to start?',
  answer:'Outbound agencies typically charge a monthly retainer, a fee per booked or held meeting, or a hybrid. To budget for a launch, add setup, software, data and internal supervision over the same period; then define which meetings count. Beespoke’s LinkedIn-led plan is 1,500 USD per month, without a per-meeting fee; software and third-party data are extra. A 10,000 USD retainer needs a different scope and a defensible return, rather than a bigger promise.',
  secondary:{label:'Build a first-90-day budget',href:'#first-90-day-budget'},
  section:{id:'first-90-day-budget',heading:'How much does it cost to start outbound? Build a 90-day budget',html:`<p>Start with the work your offer and sales team can support. Ask for the initial commitment, setup tasks, recurring service fees, tools, data and the time your team must spend approving targeting and following up. A public monthly fee is only one part of the launch budget.</p><div class="table-wrap" tabindex="0" aria-label="First-90-day outbound budget formula"><table style="min-width:0;table-layout:fixed"><caption>First-90-day budget: replace each input with a written quote</caption><colgroup><col style="width:34%"><col style="width:66%"></colgroup><thead><tr><th scope="col">Budget item</th><th scope="col">How to count it</th></tr></thead><tbody><tr><th scope="row">Agency execution</th><td>Three monthly fees, or the agreed minimum commitment if longer.</td></tr><tr><th scope="row">Software and data</th><td>All recurring licenses and data charges over the same period.</td></tr><tr><th scope="row">Internal time</th><td>Approval, supervision and campaign review hours × your fully loaded hourly cost.</td></tr><tr><th scope="row">Setup</th><td>One-off implementation and onboarding costs; clarify what is refundable.</td></tr><tr><th scope="row">Tax and currency</th><td>Add applicable taxes and state the billing currency; do not silently convert quotes.</td></tr></tbody></table></div><aside class="callout">Illustration only, not a quote or a forecast: 3 × (1,500 USD service + 300 USD tools/data + 400 USD internal time) + 500 USD setup = 7,100 USD before taxes. Only the 1,500 USD service fee reflects Beespoke’s published plan; the other figures are invented assumptions. This example predicts no meetings or revenue and assumes a three-month planning period, not a contractual minimum.</aside><p>Compare the same scope and period. Record qualified meetings actually held and opportunities accepted by sales separately; a booked slot alone does not establish either. With no accepted opportunities, cost per accepted opportunity is undefined.</p><div class="text-links"><a href="/compare/lead-generation-agency-vs-software/">Replace the assumptions in the 90-day software-versus-agency calculator →</a><a href="/downloads/beespoke-outbound-campaign-brief/">Prepare the campaign brief and acceptance criteria →</a></div>`}
 }
};
const spanish={
 '/es/services/linkedin-lead-generation/':{
  locale:'es',title:'Agencia de prospección LinkedIn B2B | Beespoke',
  description:'Prospección LinkedIn B2B con investigación, mensajes, gestión de respuestas y reuniones cualificadas. 1.500 USD/mes; software y datos aparte.',
  h1:'Agencia de prospección LinkedIn para empresas B2B',eyebrow:'Prospección comercial B2B en LinkedIn',
  answer:'Beespoke gestiona una campaña de prospección LinkedIn: selecciona cuentas y decisores, investiga su contexto, prepara los mensajes, gestiona las respuestas y agenda reuniones según criterios acordados. El fundador participa en el enfoque y las decisiones de campaña. El plan estándar cuesta 1.500 USD al mes, sin tarifa por reunión; software y datos de terceros se pagan aparte. Tu equipo dirige las llamadas comerciales, las propuestas y el cierre.',
  primary:'Revisar tu proyecto en una llamada de 30 minutos',secondary:{label:'Ver tareas y precio del servicio',href:'#tareas-y-precio'},
  sections:[
   {id:'tareas-y-precio',heading:'Qué incluye el plan de prospección LinkedIn de 1.500 USD al mes',body:[
    'El servicio convierte un perfil de cliente ideal acordado en una campaña gestionada. La propuesta debe especificar las cuentas, los interlocutores, los mensajes, las responsabilidades y los criterios de reunión. El precio no compra un número garantizado de citas.',
    'El plan estándar no incluye publicidad, un centro de llamadas, envío masivo de cold email, implementación del CRM ni un equipo SDR multicanal dedicado a tiempo completo. Los canales adicionales requieren un alcance separado. Software y datos de terceros se presupuestan aparte.'
   ],table:{caption:'Responsabilidades durante la campaña',headers:['Trabajo','Beespoke','Tu equipo'],rows:[
    ['Segmentación','Investigar cuentas y decisores; proponer inclusiones y exclusiones.','Validar el perfil, los mercados y las cuentas que no deben contactarse.'],
    ['Mensajes','Preparar mensajes y seguimientos con un motivo de contacto defendible.','Aprobar afirmaciones, pruebas y tono.'],
    ['Respuestas','Gestionar conversaciones y comprobar los criterios escritos.','Resolver dudas que requieren conocimiento del producto.'],
    ['Reuniones','Acordar la cita y transmitir el contexto de la conversación.','Asistir, dirigir la llamada comercial, presentar propuestas y hacer seguimiento.'],
    ['Revisión','Analizar respuestas, objeciones y calidad del segmento.','Informar de reuniones celebradas y oportunidades aceptadas.']
   ]},links:[['Ver el precio y las inclusiones de Beespoke','/es/pricing/'],['Comparar costes de agencias LinkedIn','/es/guides/linkedin-lead-generation-agency-cost/']]},
   {id:'cuando-encaja-linkedin',heading:'Cuándo encaja una agencia de prospección LinkedIn',body:[
    'LinkedIn puede servir cuando puedes identificar las empresas y los cargos que compran, explicar un problema específico y aportar una razón creíble para iniciar una conversación. La segmentación importa más que disponer de una lista enorme.',
    'Antes de contratar, comprueba que el comprador utiliza la plataforma, que el valor de un cliente permite investigar con cuidado y que tu equipo puede atender las conversaciones. Si necesitas cubrir teléfono, email y otros canales de forma continua, compara una capacidad SDR diseñada para ese trabajo.'
   ],links:[['Comparar una agencia con un equipo interno','/es/compare/lead-generation-agency-vs-in-house-team/'],['Comparar outsourcing SDR y refuerzo de equipo','/es/compare/sdr-outsourcing-vs-staff-augmentation/']]},
   {id:'criterios-de-reunion',heading:'Una conexión aceptada no es una reunión cualificada',body:[
    'Define por escrito el sector, el tamaño de empresa, el mercado, la función del interlocutor, su responsabilidad y el interés necesario para proponer una reunión. Añade cuentas excluidas y reglas para duplicados, cancelaciones y ausencias.',
    'El informe debe separar conexiones, conversaciones, reservas, reuniones cualificadas celebradas, oportunidades aceptadas y ventas. Solo tu equipo puede confirmar si una reunión se convierte en una oportunidad útil. Ese retorno permite mejorar la campaña sin confundir actividad con resultados comerciales.'
   ],links:[['Comparar precios y criterios de concertación de citas','/es/guides/appointment-setting-pricing/']]},
   {id:'preparar-campana',heading:'Cómo se prepara y revisa la campaña',body:[
    'Primero se revisan la oferta, el comprador, las pruebas disponibles y las exclusiones. Después se preparan un segmento, los mensajes, la gestión de respuestas y la transmisión de contexto a ventas. El calendario depende del acceso a la información y de las validaciones.',
    'Las primeras conversaciones permiten comprobar el problema, el cargo y el motivo de interés. No se presenta el lanzamiento como una promesa de reuniones a una fecha concreta.'
   ],items:['Antes de contactar: aprobar el perfil, las exclusiones y las afirmaciones.','Durante la campaña: revisar respuestas y corregir errores de segmentación.','Después de cada reunión: registrar asistencia, encaje y aceptación comercial.'],links:[['Preparar el brief de campaña','/es/downloads/beespoke-outbound-campaign-brief/']]},
   {id:'pruebas-y-ejemplo',heading:'Qué pruebas pedir y cómo interpretar un ejemplo',body:[
    'Pide lógica de selección de cuentas, ejemplos de mensajes y una explicación de cómo se atienden las respuestas. El caso público de ciberseguridad de Beespoke describe un contexto concreto; no demuestra que otra oferta obtendrá los mismos resultados.',
    'Ejemplo ficticio de método: un proveedor de stands modulares podría investigar empresas que participan en varias ferias al año, comprobar quién coordina los eventos y excluir cuentas con un proveedor incompatible. La participación en una feria justificaría investigar una necesidad; no demostraría presupuesto ni intención de compra. Este ejemplo no afirma resultados de clientes.'
   ],links:[['Leer el caso público de ciberseguridad','/es/case-studies/cybersecurity-linkedin-lead-generation/']]},
   {id:'propiedad-y-controles',heading:'Aclara el acceso a la cuenta y la propiedad del trabajo',body:[
    'Antes de dar acceso, pide que se identifiquen las herramientas, los métodos de acceso, las revisiones humanas y la responsabilidad ante incidentes. Revisa las reglas actuales de LinkedIn en sus fuentes oficiales y conserva el control de tus credenciales.',
    'El contrato debe explicar quién conserva las cuentas, los mensajes, los criterios de segmentación y el historial al terminar. Ninguna agencia debe prometer riesgo cero para la cuenta. Usa la revisión de controles incluida al final de la página para preparar esa conversación.'
   ],links:[['Revisar el acuerdo de usuario de LinkedIn','https://www.linkedin.com/legal/user-agreement'],['Consultar la guía oficial sobre software prohibido','https://www.linkedin.com/help/linkedin/answer/a1341387']]},
   {id:'elegir-modelo',heading:'Elige el modelo según el trabajo que necesitas delegar',body:[
    'Una base de datos o un software no gestiona por sí solo la investigación, los mensajes, las respuestas y el aprendizaje de una campaña. Si mantienes ese trabajo dentro del equipo, inclúyelo en el presupuesto. Si contratas una agencia, exige un responsable claro para cada tarea.'
   ],links:[['Comparar software y agencia con la calculadora','/es/compare/lead-generation-agency-vs-software/'],['Comparar proveedores de prospección LinkedIn','/es/guides/best-linkedin-lead-generation-agencies/']]}
  ],
  faqs:[
   ['¿Cuánto cuesta la agencia de prospección LinkedIn de Beespoke?','El plan outbound estándar cuesta 1.500 USD al mes, sin tarifa por reunión. Incluye la campaña LinkedIn acordada; software y datos de terceros se pagan aparte. Confirma por escrito las tareas, los costes adicionales y las condiciones de contratación.'],
   ['¿La agencia vende contactos o gestiona las conversaciones?','Beespoke gestiona el trabajo acordado de investigación, mensajes, respuestas, seguimientos y reserva de reuniones. Tu equipo valida las afirmaciones y el perfil de comprador, dirige las llamadas comerciales y se ocupa de propuestas y cierre.'],
   ['¿Incluye email, llamadas o anuncios de LinkedIn?','El plan estándar se centra en prospección LinkedIn. No incluye envío masivo de cold email, un centro de llamadas ni presupuesto de publicidad. Cualquier canal o capacidad adicional requiere un alcance y un precio separados.'],
   ['¿Garantizáis reuniones, ventas o una cuenta sin restricciones?','No se garantiza un volumen fijo de reuniones o ventas, ni riesgo cero para la cuenta. Revisa los métodos, las herramientas, las responsabilidades y las reglas actuales de LinkedIn antes de autorizar el trabajo.'],
   ['¿Cómo se comprueba si una reunión está cualificada?','Se acuerdan antes de la campaña criterios de empresa, cargo, responsabilidad e interés. Después se registran por separado la reserva, la reunión celebrada, el encaje y la oportunidad aceptada por ventas. Una conexión aceptada o una reserva no equivale a una venta.']
  ],faqHeading:'Preguntas frecuentes sobre prospección LinkedIn B2B',
  finalHeading:'Define el segmento y el trabajo antes de lanzar la campaña',
  finalCopy:'Trae tu oferta, el perfil de comprador y las pruebas disponibles. Revisaremos si LinkedIn encaja, las responsabilidades de cada equipo y el presupuesto completo.'
 }
};
const esc=s=>s.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
function addServiceLink(html,route){
 const link=english[route]?.serviceLink;
 if(!link)return html;
 const markup=`<div class="text-links" data-service-context-link="${route}"><a href="${link.href}">${esc(link.label)} →</a></div>`;
 if(html.includes(markup))return html;
 if(html.includes('data-service-context-link'))throw new Error('Unexpected existing contextual service link');
 const marker='<section class="faqs"';
 if(!html.includes(marker))throw new Error('FAQ boundary missing for contextual service link');
 return html.replace(marker,markup+marker);
}
function apply(html,pathname,locale){
 const route=locale==='en'?pathname:`/${locale}${pathname}`;
 const config=english[route];
 if(spanish[route]){
  const tool=html.match(/<section class="original-tool checklist-tool" id="linkedin-risk-check">[\s\S]*?<\/section>/)?.[0];
  html=localeGrowth.apply(html,pathname,locale,spanish,{});
  if(tool){
   const reviewed=tool.replace('Consulta la campaña antes de que llegue a tu perfil.','Revisa los controles antes de autorizar la campaña.').replace('Utilice esta lista de verificación','Usa esta lista').replace('Los mensajes son revisados ​​por un humano','Los mensajes se revisan por una persona').replace('El contrato identifica quién corre el riesgo de restricción de cuenta.','El contrato define la responsabilidad ante una restricción de la cuenta.');
   html=html.replace('<section class="faqs"',reviewed+'<section class="faqs"');
   html=html.replace(/<a href="#preguntas-frecuentes">/g,'<a href="#linkedin-risk-check">Revisar los controles de la cuenta</a><a href="#preguntas-frecuentes">');
  }
  return html;
 }
 if(!config)return html;
 html=html.replace(/<title>[^<]*<\/title>/,`<title>${esc(config.title)}</title>`)
  .replace(/(<meta (?:name|property)="(?:description|og:description|twitter:description)" content=")[^"]*(">)/g,(_,a,b)=>a+esc(config.description)+b)
  .replace(/(<meta (?:name|property)="(?:og:title|twitter:title)" content=")[^"]*(">)/g,(_,a,b)=>a+esc(config.title)+b)
  .replace(/<h1>[^<]*<\/h1>/,`<h1>${esc(config.h1)}</h1>`)
  .replace(/<p class="answer">[\s\S]*?<\/p>/,`<p class="answer">${esc(config.answer)}</p>`)
  .replace(/<a class="secondary" href="[^"]*">[\s\S]*?<\/a>/,`<a class="secondary" href="${config.secondary.href}">${esc(config.secondary.label)}</a>`)
  .replace(/(<p class="meta">[\s\S]*? · Updated )[^<]*/,(_,a)=>a+'October 15, 2026');
 if(config.section){
  const s=config.section,markup=`<section id="${s.id}"><h2>${esc(s.heading)}</h2>${s.html}</section>`;
  html=html.replace('<article>','<article>'+markup);
  html=html.replace(/(<aside class="toc"><div class="toc-label">[\s\S]*?<\/div>)/,(_,a)=>a+`<a href="#${s.id}">${esc(s.heading)}</a>`)
   .replace(/(<details class="mobile-toc">[\s\S]*?<nav[^>]*>)/,(_,a)=>a+`<a href="#${s.id}">${esc(s.heading)}</a>`)
   .replace(/(<strong class="current-section">)[\s\S]*?(<\/strong>)/,(_,a,b)=>a+esc(s.heading)+b);
 }
 html=html.replace(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/,(_,text)=>{
  const schema=JSON.parse(text),page=schema['@graph'].find(n=>n['@id']===origin+route+'#page');
  if(page){page.dateModified=updated+'T17:00:00+02:00';page.name=config.h1;page.description=config.description;if(page['@type']==='Article')page.headline=config.h1;}
  return `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g,'\\u003c')}</script>`;
 });
 return addServiceLink(html,route);
}
function lastModifiedFor(route,fallback){return english[route]||spanish[route]?updated:fallback;}
module.exports={english,spanish,apply,addServiceLink,lastModifiedFor,updated};
