const old=require('../lead-generation-audit-copy-20261027'),all=require('./content'),evidence=require('./cases'),{labels}=require('./tool');
const p=text=>({type:'p',text}),table=(caption,heads,rows)=>({type:'table',caption,heads,rows});
module.exports=function(l){const a=old.page(l),c=all[l],u=labels[l],e=evidence[l],body=i=>a.sections[i].body.map(p),s=(id,title,blocks)=>({id,title,label:title,blocks});return {
 title:c.title,description:c.description,h1:a.h1,answer:a.answer,resources:{en:'Resources',es:'Recursos',ca:'Recursos',fr:'Ressources'}[l],breadcrumb:a.h1,kicker:a.eyebrow,read:c.webTitle,review:c.workbookTitle,author:{en:'By',es:'Por',ca:'Per',fr:'Par'}[l],updated:{en:'Updated November 3, 2026',es:'Actualizado el 3 de noviembre de 2026',ca:'Actualitzat el 3 de novembre de 2026',fr:'Mis à jour le 3 novembre 2026'}[l],fiction:u.fiction,contents:{en:'Contents',es:'Contenido',ca:'Continguts',fr:'Sommaire'}[l],
 sections:[
 s('d-start',c.start,[p(c.intro),{type:'list',items:c.deliverables},p(c.boundary)]),
 s('d-web',c.webTitle,[p(c.webIntro),p(e.window),...body(5),p(e.webDecision)]),
 s('d-cohort',c.contractTitle,[...body(0),table(c.contractTitle,c.contractHeads,c.contract)]),
 s('d-evidence',c.coverageTitle,[...body(1),table(c.coverageTitle,c.coverageHeads,c.coverage),p(e.owners)]),
 s('d-bookings',c.bookingTitle,[table(c.bookingTitle,c.bookingHeads,c.bookings)]),
 s('d-units',c.unitTitle,[p(c.unitText),p(c.unitNote),table(e.unitsTitle,e.unitsHeads,e.units)]),
 s('d-outbound',c.outTitle,[p(c.outText),p(c.outNote),p(e.outboundDecision)]),
 s('d-diagnose',c.diagnoseTitle,[...body(2),table(a.sections[2].heading,a.sections[2].table.headers||a.sections[2].table.headings,a.sections[2].table.rows),table(c.diagnoseTitle,c.diagnoseHeads,c.diagnose),p(e.dropDetail)]),
 s('d-execution',c.executionTitle,[...body(3),p(c.executionText),{type:'message',label:c.messageTitle,text:c.message},table(c.messageTitle,[u.stage,u.result],c.messageNotes),p(c.practice),p('<a href="/guides/b2b-cold-email-copywriting/">'+c.relatedLabels[1]+'</a> · <a href="/guides/linkedin-prospecting-messages/">'+c.relatedLabels[3]+'</a>')]),
 s('d-handoff',c.handoffTitle,[table(c.handoffTitle,c.handoffHeads,c.handoff),p(e.handoffDetail)]),
 s('d-calendar',c.calendarTitle,[...body(4),table(c.calendarTitle,c.calendarHeads,c.calendar),table(e.ticketTitle,e.ticketHeads,e.ticket)]),
 s('d-pages',c.pagesTitle,[table(c.pagesTitle,c.pagesHeads,c.pages),p(c.pagesNote)]),
 s('d-actions',c.actionsTitle,[...body(6),...a.decisionGuide.body.map(p),{type:'list',items:a.decisionGuide.items},table(c.actionsTitle,c.actionsHeads,[e.queueFirst,...c.actions.slice(1)]),p(c.reviewText),table(e.logTitle,e.logHeads,e.log),p(e.priority)]),
 s('d-scenarios',c.scenarioTitle,[p(c.scenarioText),p(c.scenarioLimit)]),
 s('d-service',c.serviceTitle,[{type:'commercial'},p('<a href="/services/outbound-lead-generation/">'+c.serviceTitle+'</a> · <a href="/book/?cta=audit-guide">'+({en:'Discuss the evidence',es:'Comenta las pruebas',ca:'Comenta les proves',fr:'Échanger sur les preuves'}[l])+'</a>')]),
 s('d-workbook',c.workbookTitle,[p(c.workbookText),{type:'tool'}])
 ].map((x,i)=>({...x,label:e.short[i]})),faqs:[...a.faqs.map(f=>[f.question,f.answer]),...c.extraFaqs],sourcesTitle:c.sourcesTitle,sourcesIntro:c.sourcesIntro,sourcesNotes:c.sourcesNotes,relatedTitle:c.relatedTitle,relatedLabels:c.relatedLabels
};};
