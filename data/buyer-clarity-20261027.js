const terms={
 en:'The standard outbound plan covers cold email and/or cold LinkedIn at USD 1,500 per month, or EUR 1,500 per month in Europe, with a three-month minimum and no per-meeting fee. Required software, data and other third-party costs are separate unless included in the written scope. Cold calling is quoted separately according to the target market. Your team handles discovery, proposals and closing.',
 es:'El plan outbound estándar cubre cold email y/o prospección en frío por LinkedIn por 1.500 USD al mes, o 1.500 EUR al mes en Europa, con un compromiso mínimo de tres meses y sin tarifa por reunión. El software, los datos y otros costes de terceros se facturan aparte salvo inclusión en el alcance escrito. Las llamadas en frío se presupuestan por separado según el mercado objetivo. Tu equipo dirige las llamadas de descubrimiento, las propuestas y el cierre.',
 ca:'El pla outbound estàndard inclou cold email i/o prospecció en fred per LinkedIn per 1.500 USD al mes, o 1.500 EUR al mes a Europa, amb un compromís mínim de tres mesos i sense tarifa per reunió. El programari, les dades i altres costos de tercers es facturen a part, llevat que s’incloguin en l’abast escrit. Les trucades en fred es pressuposten per separat segons el mercat objectiu. El teu equip dirigeix les converses de descoberta, les propostes i el tancament.',
 fr:'Le forfait outbound standard couvre le cold email et/ou la prospection à froid sur LinkedIn : 1 500 USD par mois, ou 1 500 EUR par mois en Europe, avec un engagement minimum de trois mois et sans frais par rendez-vous. Les logiciels, les données et les autres coûts de tiers sont facturés en supplément, sauf inclusion dans le périmètre écrit. Les appels à froid font l’objet d’un devis distinct selon le marché ciblé. Votre équipe mène les entretiens de découverte, les propositions et la conclusion des ventes.'
};
const scope={
 en:'Beespoke runs founder-led managed cold email and/or LinkedIn campaigns. Cold calling is separately quoted by target market; a full-time SDR or call-center seat is not included.',
 es:'Beespoke gestiona campañas de cold email y/o prospección por LinkedIn dirigidas por su fundador. Las llamadas en frío se presupuestan por separado según el mercado; el servicio no incluye un SDR a tiempo completo ni un puesto de call center.',
 ca:'Beespoke gestiona campanyes de cold email i/o prospecció per LinkedIn dirigides pel fundador. Les trucades en fred es pressuposten per separat segons el mercat; el servei no inclou un SDR a temps complet ni un lloc de centre de trucades.',
 fr:'Beespoke gère des campagnes de cold email et/ou de prospection sur LinkedIn sous la direction de son fondateur. Les appels à froid font l’objet d’un devis distinct selon le marché ; le forfait n’inclut ni SDR à temps plein ni poste de centre d’appels.'
};
const linkedinAnswers={
 en:'Beespoke manages B2B LinkedIn outreach: account and buyer research, messages, follow-ups, replies, qualification and meeting booking against agreed criteria. The wider outbound plan can cover cold email and/or LinkedIn for USD 1,500/month, or EUR 1,500/month in Europe, with a three-month minimum. Required tools and data are separate; calling is separately quoted. Your team leads discovery and closing.',
 es:"Beespoke gestiona una campaña de prospección LinkedIn: selecciona cuentas y decisores, investiga su contexto, prepara los mensajes, gestiona las respuestas y agenda reuniones según criterios acordados. El fundador participa en el enfoque y las decisiones de campaña. El plan outbound estándar puede cubrir cold email y/o LinkedIn por 1.500 USD al mes, o 1.500 EUR al mes en Europa, con un mínimo de tres meses y sin tarifa por reunión; software y datos de terceros se pagan aparte. Tu equipo dirige las llamadas comerciales, las propuestas y el cierre.",
 ca:'Beespoke gestiona la prospecció B2B a LinkedIn: recerca de comptes i decisors, missatges, seguiments, respostes, qualificació i reserva de reunions segons criteris acordats. El pla outbound pot incloure cold email i/o LinkedIn per 1.500 USD/mes, o 1.500 EUR/mes a Europa, amb un mínim de tres mesos. Eines i dades a part; trucades segons pressupost. El teu equip dirigeix les converses de descoberta i el tancament.',
 fr:'Beespoke gère la prospection B2B sur LinkedIn : recherche de comptes et de décideurs, messages, relances, réponses, qualification et prise de rendez-vous selon les critères convenus. Le forfait outbound peut couvrir le cold email et/ou LinkedIn pour 1 500 USD/mois, ou 1 500 EUR/mois en Europe, avec un minimum de trois mois. Outils et données en supplément ; appels sur devis. Votre équipe mène la découverte et la conclusion des ventes.'
};
const priceAnswers={
 en:'Compare the same scope, currency, setup, tools, data, client time and qualification rules before comparing agency fees. '+terms.en,
 es:'Compara el mismo alcance, moneda, puesta en marcha, herramientas, datos, tiempo del cliente y criterios de cualificación antes de comparar las tarifas de las agencias. '+terms.es,
 ca:'Compara el mateix abast, moneda, posada en marxa, eines, dades, temps del client i criteris de qualificació abans de comparar les tarifes de les agències. '+terms.ca,
 fr:'Comparez un même périmètre, une même devise, les frais de démarrage, les outils, les données, le temps client et les critères de qualification avant de comparer les honoraires des agences. '+terms.fr
};
const metadata={
 '/fr/services/outsourced-sdr/':{title:'SDR externalisé : prospection B2B email et LinkedIn | Beespoke',h1:'SDR externalisé : une campagne de prospection B2B gérée'},
 '/fr/guides/outbound-lead-generation-cost/':{title:'Tarifs d’une agence de prospection B2B : budget et périmètre',h1:'Tarifs d’une agence de prospection B2B : comparer le budget et le périmètre'},
 '/services/linkedin-lead-generation/':{title:'LinkedIn Outreach Agency for B2B Lead Generation | Beespoke',h1:'LinkedIn outreach agency for targeted B2B conversations'},
 '/compare/lead-generation-agency-vs-in-house-team/':{title:'Lead Generation Agency vs In-House: Costs, Control & Fit',h1:'Lead generation agency vs in-house: compare cost, control and fit'}
};
const routes=[];for(const prefix of ['', '/es','/ca','/fr'])for(const stem of ['/services/linkedin-lead-generation/','/guides/best-linkedin-lead-generation-agencies/','/guides/outbound-call-center-pricing/'])routes.push(prefix+stem);routes.push('/fr/services/outsourced-sdr/','/compare/lead-generation-agency-vs-in-house-team/','/fr/guides/outbound-lead-generation-cost/');
const descriptions={
 '/services/linkedin-lead-generation/':'Founder-led LinkedIn outreach for B2B teams. Compare scope, responsibilities, qualification and current terms before booking a fit call.',
 '/fr/services/outsourced-sdr/':'Un SDR externalisé sous forme de campagne gérée : périmètre, responsabilités, brief et tarifs. Email et/ou LinkedIn ; appels sur devis.',
 '/compare/lead-generation-agency-vs-in-house-team/':'Compare agency and in-house lead generation over the same scope and time period. Model your costs, retained work, ownership and handover.',
 '/fr/guides/outbound-lead-generation-cost/':'Comparez les tarifs de prospection B2B : périmètre, coûts annexes et rendez-vous qualifiés. Distinguez les observations historiques du forfait actuel.'
};for(const [p,d]of Object.entries(descriptions))metadata[p].description=d;
module.exports={terms,scope,linkedinAnswers,priceAnswers,metadata,routes};
