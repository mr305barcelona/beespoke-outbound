const p=text=>({type:'p',text}),table=(caption,heads,rows)=>({type:'table',caption,heads,rows}),message=(label,text)=>({type:'message',label,text}),list=items=>({type:'list',items});
module.exports={
title:'B2B Sales Prospecting Plan: Template & Worked Example | Beespoke',
description:'Build a B2B sales prospecting plan with a completed example, target-list decisions, realistic capacity, weekly schedule and sales handoff. Adapt the private planner.',
h1:'A B2B sales prospecting plan you can actually run',
resources:'Resources',breadcrumb:'Sales prospecting plan',kicker:'From a target market to an owned programme',
answer:'A B2B sales prospecting plan connects the offer, target accounts and people, evidence, channel, available time, approvals and sales handoff. It should tell an owner what happens next, what must be checked first and when to stop. Start with the completed example below, then adapt the schedule and optional private planner to your own market.',
author:'Written by',updated:'Updated November 2, 2026',fiction:'All businesses, source notes, messages, figures and outcomes in the worked examples are fictional training material. They are not Beespoke or client results.',contents:'On this page',read:'Read the completed plan',review:'Adapt the private planner',sourcesTitle:'Sources, practice and limits',relatedTitle:'Continue with the right guide',
relatedLabels:['Research accounts and buying roles','Write the first cold email','Plan a brief follow-up','Write a LinkedIn approach'],
sections:[
{id:'p-start',label:'The objective',title:'Choose the decision before the activity target',blocks:[
p('A useful plan answers a practical question: can this offer start a relevant conversation with this buyer, and can we handle that conversation properly? A sector list and a weekly send target do not answer it. Write down the offer, market, receiving sales owner and the evidence that would justify continuing.'),
p('<strong>Fictional objective:</strong> over a first four-week cycle, test whether operations owners at multi-site B2B testing firms find a coordination discussion relevant. The commercial owner reviews accepted account samples, actual replies and handoff quality at the end. A booked call is recorded separately from attendance and qualification. The decision is to continue, revise the segment or hold—not to declare success after a target number of sends.'),
p('Keep an aspiration, a commitment and a forecast separate. “We want five qualified calls” is an aspiration. “The owner has approved these research and reply blocks” is a commitment. A forecast needs comparable, mature historical cohorts and honest uncertainty. With no such history, record the forecast as unknown.'),
table('Two owners can need different plans',['Situation','What changes'],[
['Founder handles research and discovery','Protect client work and discovery capacity. Use a smaller reviewed sample; do not schedule the same hour twice.'],
['Researcher and sales owner share the work','Name the list approver, message approver and receiving owner. More research capacity does not remove an approval or handoff bottleneck.']
])]},
{id:'p-plan',label:'Completed plan',title:'See the finished plan before filling anything in',blocks:[
p('This is the one-page brief for our fictional testing-firm example. The sections below show the decisions behind it. Use it as an outline, not a ready-to-launch campaign.'),
table('Completed fictional prospecting plan',['Part of the plan','Decision, owner and limit'],[
['Offer and learning question','Discuss coordination across testing sites. Expansion is a research cue, not proof of a problem. Commercial owner confirms permitted proof.'],
['Period and review','Four-week first cycle; weekly workload checks and an end-of-cycle learning review. Review dates and a named owner belong in the real plan.'],
['Account sample','B2B testing model, multiple operating sites and a relevant role. Hold unclear models; exclude consumer-only firms, current customers and declines. Client judges target fit.'],
['People and first channel','Operations contact first where relevant; approach on LinkedIn when suitable public activity supports that choice, otherwise consider a verified work email and authorized sender.'],
['Reason to write','A specific public expansion note supports a coordination question. Do not claim delays, budget or supplier dissatisfaction.'],
['Message and follow-up','One individualized opening and a brief follow-up where appropriate. A different channel needs a reason and authorization.'],
['Time','600 available minutes; the full allocation below leaves 240 for research. At an assumed 20 minutes per account, that envelope supports 12 accounts.'],
['Reply and handoff','Reply owner preserves actual wording and unknowns. Sales owner accepts the context and handles discovery, proposals and closing.'],
['Launch gates','Target sample, proof, copy, access, exclusions, requirements, reply coverage and calendars must be checked. A completed document is not launch authorization.'],
['Review and stop','Inspect fit, relevant replies, workload and real call outcomes. Hold unsupported messages, uncertain permission, unresolved exclusions or work beyond the available reserve.']
]),
p('For a blank outline, copy the left-hand headings and replace the right-hand decisions. For editable notes and a printable text plan, <a data-jump="p-workbook" data-open href="#p-workbook">open the optional planner</a>. It saves nothing after reload; the complete lesson works without it.') ]},
{id:'p-target',label:'Approve the targets',title:'Make target-list approval a real decision',blocks:[
p('Record the company’s operating model, market and relevant role separately. Keep the source and date beside the fact. A contact-data match can help locate someone; it does not verify buyer fit or a need. In Beespoke’s process, the client’s judgment about whether we are targeting the right people is essential.'),
table('Five fictional rows from a target-review sample',['Evidence and uncertainty','Decision and next owner'],[
['Aster Testing: company site describes B2B testing across three sites; operations role confirmed in a public team page. Need and budget unknown.','Accept for the approved research sample. List approver checks commercial fit before outreach.'],
['Birch Labs: a directory calls it a laboratory; its own site does not establish whether it serves businesses or consumers.','Investigate. Research owner verifies the operating model; do not fill the gap with a guess.'],
['Cedar Health: its own booking pages offer consumer-only appointments, outside this campaign’s scope.','Exclude. Record the account-level reason so a new contact does not reintroduce it.'],
['Dune Testing: relevant model, but CRM records an existing customer relationship.','Exclude from cold acquisition. Account owner decides any separate customer conversation.'],
['Elm Testing: a second employee appears in a new list after the company declined this approach.','Keep the account suppressed for the relevant scope. Resolve the earlier instruction before any fresh approach.']
]),
p('The sample is a check on the targeting logic, not a quality score. Preserve contradictions and unknowns. Use the <a href="/guides/account-based-prospecting/">account-based prospecting guide</a> for the deeper account brief and buying-role research; this plan assigns how that research becomes approved work.') ]},
{id:'p-roles',label:'Map the people',title:'An account is not the same thing as a decision-maker',blocks:[
table('Fictional role map for the same account',['Role','Relevant question','What remains unknown'],[
['Operations contact','How is work coordinated between sites, and is a discussion useful?','Purchasing authority, a live project and budget.'],
['Commercial owner','Who owns a possible supplier evaluation and its next step?','Whether evaluation is planned; a senior title is not proof.'],
['Technical colleague','Which practical constraints would matter if the topic progresses?','Whether this person participates in the decision. Ask rather than label them a blocker.']
]),
p('Assign one account owner and connect every contact to that account. Do not automatically enrol several colleagues in parallel sequences. A referral, correction or decline must reach the people operating the other channels. There is no required stakeholder count. A smaller business may have one person covering several roles.') ]},
{id:'p-context',label:'Research into a message',title:'Show the person why this particular approach makes sense',blocks:[
p('Personalization can come from a public post, relevant location or event, shared professional context, role or company news. It does not have to be an announcement about the company. The connection must be true and useful; a location match does not prove a business problem, and a public detail is not an invitation to be intrusive.'),
table('Keep a short evidence-to-message note',['Observed fictional fact','Reasonable question','Unsupported claim to remove'],[
['A public company note announces another testing site.','Would a comparison of site-coordination approaches be useful?','Your expansion must be causing delays.'],
['An operations lead writes publicly about maintaining handover quality between locations.','Would a short handover outline help with the topic they raised?','You are unhappy with your current supplier.'],
['Both people genuinely attended the same professional event.','Mention that shared context if it helps explain the approach.','Pretend to have met or discussed their business there.']
]),
message('Fictional email — business context','Subject: Coordination between testing sites\n\nHi [First name],\n\nThe note about your next testing site raises a practical question: will the teams coordinate work in the same way as they do now?\n\nWe help specialist service firms put the ownership and handover steps into a short working plan. I do not know whether this is an issue for your team; I wondered whether an outline of the decisions to check would be useful while the new site takes shape.\n\nWould you like me to send that outline?\n\n[Sender]'),
p('<strong>Why this fits the plan:</strong> the opening uses the actual cue, the offer explains a practical contribution, and the question leaves need unconfirmed. The sender must genuinely be able to provide the outline. Replace the structure with individual reasoning, not a mail merge that changes only the company name.'),
message('Fictional LinkedIn message — a public post','Hi [First name], the point in your post about preserving handover quality between locations is a useful one. We work on the ownership and follow-through around that kind of process. Would a short outline of the questions to settle before changing it be useful?'),
p('The second message has a different reason and a shorter format. Neither invents a result, shared relationship or urgency. “I saw” is not automatically wrong and an unusual synonym is not automatically human. Remove vague praise and unnecessary setup; check whether the specific reference and the offer belong together. The <a href="/guides/b2b-cold-email-copywriting/">copywriting guide</a> develops that editing process.') ]},
{id:'p-channel',label:'Choose the first channel',title:'Use the channel that fits this person and the agreed scope',blocks:[
table('First-channel decision',['What you actually know','Possible route and dependency'],[
['Relevant recent public LinkedIn activity; suitable sender access is authorized.','Consider LinkedIn first. A public post can give the message context; activity does not guarantee a reply.'],
['A suitable work email is verified and the approach meets the agreed requirements.','Consider email first. A verified address does not establish inbox placement, interest or blanket permission.'],
['No visible LinkedIn activity, but a relevant work email exists.','Email may be the more practical test. Do not claim the person is inactive or unreachable from what you cannot see.'],
['Calling would be appropriate to the market, but is not in scope.','Hold that channel until its separate scope, cost, language, access and requirements are agreed.'],
['Fit, sender authority or contact requirements remain unclear.','Research or clarify first. Tool availability is not a reason to launch.']
]),
p('Record the audience’s language, working time zone, sender identity, reply owner and permitted alternative. Choose timing from the audience and actual experience; no universal weekday or hour can resolve a weak reason to write.') ]},
{id:'p-sequence',label:'Follow-up and stopping',title:'Plan a short sequence, then respond to what happens',blocks:[
p('Noah’s usual starting approach is an individualized opening and one brief follow-up, often around four days later. That is a working example, not a mandatory interval or a claim that two messages always suffice. Further contact depends on context, relevance and the agreed boundaries.'),
message('Fictional email follow-up','Hi [First name], just checking whether the site-coordination outline would be useful. Happy to send it if so.\n\n[Sender]'),
table('Branch after the first approach',['What happens','Next action'],[
['No response','Send the agreed brief follow-up if still appropriate. Afterwards, consider an authorized alternative channel for a real reason; do not restart indefinitely.'],
['A question or relevant interest','Pause the automated sequence and answer the actual point. The reply owner owns the next action.'],
['Wrong person or a referral','Update the role map and verify the referred person. A referral is not proof of interest or a booked call.'],
['Later timing or out-of-office','Record the actual date/context. A human timing request and an automatic absence message are different; do not count the latter as buying interest.'],
['Decline or opt-out','Apply the appropriate suppression across affected channels and records. Do not route around the instruction through a colleague or another platform.'],
['Unclear or contradictory response','Keep the uncertainty and ask the smallest useful clarification, or hold. Do not rewrite it as enthusiasm.']
]),
p('Long programmed follow-ups often repeat what the recipient can already read. More touches are not inherently better. Use the <a href="/guides/cold-email-follow-up/">follow-up guide</a> for the full editing decisions and the <a href="/guides/linkedin-prospecting-messages/">LinkedIn message guide</a> when that channel is appropriate.') ]},
{id:'p-capacity',label:'Capacity and limits',title:'Budget the work before choosing the volume',blocks:[
p('<strong>Keep the simple research-envelope example:</strong> 600 available weekly minutes minus 180 for reply/review and 120 for coordination leaves 300 for research. At an assumed 20 minutes per account, that means 15 researched accounts; at 30 minutes, it means 10. This deliberately simplified envelope is not an all-in staffing plan: copy, setup and execution must also have time somewhere.'),
table('A second, fully allocated fictional week',['Work','Minutes and assumption'],[
['Coordination','60'],['Target/copy approval','30'],['Individual message preparation','60'],['Setup and access checks','30'],['Outreach execution','30'],['Reply reserve','90'],['Sales handoff','30'],['Learning review','30'],['Research remaining','240 = 600 − 360'],['Total','600']
]),
p('At an assumed 20 research minutes per account, the remaining 240 supports 12 accounts. At 30 minutes, capacity falls to 8. If each account needs another contact and that adds 5 research minutes, use 25 minutes per account: floor(240 ÷ 25) = 9, with 15 minutes left. Copy and reply reserves must still be sufficient for the extra people.'),
p('The reviewer may be the constraint even when a researcher has free time. Three available discovery slots are receiving capacity, not a prediction of three bookings. If actual reply or handoff work exceeds the reserve, reduce new activity and agree coverage. Record required software/data spend separately from internal time; do not assume a licence or extra channel is included.'),
p('The private calculator below starts blank. It calculates a research envelope, not replies, meetings, revenue or a staffing recommendation. Replace every assumption with your own observed workload.') ]},
{id:'p-week',label:'Weekly schedule',title:'Give each block an owner and an output',blocks:[
table('The same fictional 600-minute week',['Day','Work and minutes','Output or dependency'],[
['Monday','Coordination 30; approval 30; research 60; reply reserve 15 = 135','Approved sample before first approach; list owner preserves exclusions.'],
['Tuesday','Research 60; messages 30; setup 30; execution 15; replies 20 = 155','Exact message and sender/access checks completed before sending.'],
['Wednesday','Research 60; messages 30; replies 20 = 110','Individual research and copy remain connected; pause if review is blocked.'],
['Thursday','Research 60; execution 15; replies 20; handoff 15 = 110','Reply context reaches the receiving owner; later follow-up only when due.'],
['Friday','Coordination 30; replies 15; handoff 15; learning review 30 = 90','Review fit, workload and mature outcomes; name next week’s change or hold.']
]),
p('135 + 155 + 110 + 110 + 90 = 600. These are workload blocks, not prescribed sending times. The schedule spans a continuing campaign: a follow-up due the next week stays in that next week’s workload, rather than being squeezed into an arbitrary Friday. The reply owner checks coverage throughout the active window.'),
table('First-cycle rollout, with gates rather than promised results',['Phase','Required output before moving on'],[
['Brief and sample','Offer, receiving owner, exclusions and a small target sample agreed; missing proof or fit keeps the launch on hold.'],
['Preparation','Individual message sample, authorized access, applicable requirements, response routes and calendar availability checked.'],
['Small execution','Run only the approved work within actual capacity. Log corrections, reply questions and workload.'],
['Mature review','Wait for the relevant replies and scheduled calls to mature; distinguish held/qualified outcomes from pending ones. Continue, change one factor, or hold.']
])]},
{id:'p-ready',label:'Launch gates',title:'Make the go-ahead inspectable',blocks:[
p('Use one register rather than spreading approval assumptions across emails. For each row retain the artifact, owner, check date, state and next action. “Provided” means somebody supplied information; it does not mean it is verified or authorized.'),
table('Minimum launch review',['Artifact to check','Responsible owner and hold condition'],[
['Offer and permitted proof','Commercial owner; hold unsupported outcomes or claims.'],
['Target-list sample','Client/list approver; hold uncertain account models or wrong roles.'],
['Sender and access','Account owner; hold missing or unauthorized sender access.'],
['Exact messages','Message approver; hold invented facts or unapproved changes.'],
['Exclusions and suppression','List owner; hold unresolved declines, conflicts or duplicates.'],
['Applicable requirements and platform terms','Responsible owner; resolve what applies to this audience/channel before launch.'],
['Reply coverage','Reply owner; hold unattended responses or unclear escalation.'],
['Booking link and availability','Calendar owner; check the correct event, time zone and real availability without making a dummy booking.'],
['Receiving sales capacity','Sales owner; hold when discovery and follow-through cannot be covered.']
]),
p('<strong>Fictional hold:</strong> the list is approved but the message claims a result nobody can substantiate. Keep the copy gate unresolved, remove the unsupported claim and obtain the actual approver’s decision. A completed workbook or an approved planning brief is not campaign-launch authorization.') ]},
{id:'p-reply',label:'Reply to sales handoff',title:'Carry the actual reply through to a useful next step',blocks:[
message('Fictional reply','I oversee the workflow, but we are not replacing our current supplier. A discussion about the next site might help next quarter.'),
p('Confirmed: the role, the current supplier constraint and suggested timing. Unknown: a project, need, budget and purchasing authority. A useful clarification could be: “Would it be better to send the outline now, or reconnect closer to planning for the next site?” Do not claim they want to switch suppliers.'),
table('Finished fictional handoff',['Field','What sales actually receives'],[
['Account and role','Relevant multi-site testing firm; operations contact. Fit evidence linked to the approved sample.'],
['What was said','Current supplier stays; a future-site conversation may help next quarter. Preserve the necessary context.'],
['Unknowns','Need, budget, authority and whether an evaluation will happen.'],
['Agreed next step','Only the prospect’s actual choice: send the outline or reconnect at the agreed time. No call is counted yet.'],
['Ownership','Reply owner records the action; receiving sales owner accepts the handoff and date.'],
['If a call is genuinely booked later','Keep the original booking identity; update cancelled/rescheduled, held and qualified states separately.']
]),
p('Wrong person: correct the role. Relevant question: answer it before pushing a calendar. Not now: preserve timing. Decline: stop the affected approach. Interest: confirm the useful next step. Unclear: preserve the uncertainty. Budget and authority may be established during discovery; do not invent them to justify an initial call.'),
p('The client handles discovery, proposals and closing. See the <a href="/resources/account-research-handoff-example/">research and handoff example</a> for another complete fictional record.') ]},
{id:'p-record',label:'Minimum record',title:'Give the CRM enough context to prevent repetition',blocks:[
table('Vendor-neutral minimum record',['Fields','Why they belong together'],[
['Account ID and contact ID','Several people can belong to one account without becoming several acquired companies.'],
['Source, date and fit decision','Keep the evidence, contradiction and approver; a scraped title is not a qualification result.'],
['Owner, sender and channel','Identify who acts and which authorized identity they use.'],
['Suppression and relevant requirements','Carry the correct scope across lists and channels; preserve the instruction rather than an invented permission.'],
['Last action; next action/date','Prevent duplicate approaches and forgotten promises.'],
['Reply context and unknowns','Retain only necessary business context; do not turn an inference into a fact.'],
['Handoff and booking identity/status','Connect original creation, reschedules, attendance and qualification without double-counting.']
]),
p('When a contact corrects a role, update the shared record before another operator acts. When ownership changes, transfer the next action and suppression context, not just a name. This guide does not need actual prospect details, a contact upload or CRM access to be useful.') ]},
{id:'p-results',label:'Read a complete cohort',title:'Measure different things with different denominators',blocks:[
p('The following invented cohort shows how to read a report, not what response rate to expect. Suppose research took place October 5–16, booking creation was followed through October 30, and the status check is November 2. A future call remains pending. These dates and outcomes are fictional.'),
table('Reconciled fictional cohort',['Measure','Count and meaning'],[
['Accounts researched','60 = 45 accepted + 8 excluded + 7 on hold.'],
['People and account coverage','60 contacts identified at accepted accounts; 50 first approached across 40 accounts. Ten contacts and five accepted accounts were not started.'],
['Initial email deliveries','50 initial attempts; 2 hard bounces; 48 accepted by receiving servers. This does not prove inbox placement. Follow-ups are not extra unique people.'],
['Human replies','14 distinct contacts: 5 declines + 3 later-timing + 2 wrong-person + 1 question + 3 relevant-interest. Use one latest primary human disposition per contact.'],
['Responding accounts','12 accounts produced those 14 human replies; do not call them 14 companies.'],
['Automatic replies','4 automatic messages, one followed later by a human reply. Do not add them to the 14 unique human responders.'],
['Genuine created bookings','3 original booking identities; one rescheduled without becoming a fourth acquired lead.'],
['Status at review','1 held + 1 future/pending + 1 cancelled = 3 created bookings. One of the held calls was qualified; pending and cancelled calls are not qualified outcomes.']
]),
p('Human-contact reply rate is 14 ÷ 48 = 29.17% of initially delivered contacts. Responding-account rate is 12 ÷ 40 = 30% of approached accounts. Original bookings per initially delivered contact are 3 ÷ 48 = 6.25%. Each answers a different question. One qualified call out of one held call is a very small observation, not evidence of a stable conversion rate.'),
p('Compare complete periods under the same definitions and record material changes in offer, channel, staffing or tracking. A website visit assisted by an outbound message remains outreach-origin where that origin is known. A calendar click or confirmation-page visit is not a booking. Match real booking identity and source evidence where available; keep unknown origin unknown.'),
p('Separate internal test visits from prospect traffic; browser checks do not reconstruct real Analytics sessions. A fictional cohort cannot forecast your campaign or website bookings.') ]},
{id:'p-diagnose',label:'Find the bottleneck',title:'Inspect the evidence before changing the campaign',blocks:[
table('A bounded troubleshooting review',['Symptom','What to inspect','One next test or hold'],[
['Wrong-fit targets','Sample evidence, exclusions, role and operating-model corrections.','Revise one criterion; have the client review a new sample before further outreach.'],
['Delivery or reach unclear','Actual delivery failures, sender/access checks and audience/channel fit.','Resolve the observed fault. Opens alone cannot prove a person read the message.'],
['Few relevant replies','Mature cohort, source quality, actual copy and the offer’s relevance.','Test one reason-to-write change within the same defined segment; retain other conditions.'],
['Replies without useful handoff','Unanswered questions, owner coverage and what the prospect actually requested.','Improve the reply route or clarification; do not assume all interest needs a calendar immediately.'],
['Bookings but little attendance','Correct event/time zone, genuine cancellation reasons, timing and expectation set.','Fix demonstrated friction; keep pending calls separate from missed ones.'],
['Held calls stall later','Fit, discovery notes, stakeholder timing and client follow-through.','Sales owner investigates the actual stage; a slow deal is not automatically a prospecting-copy fault.']
]),
p('A high cost per meeting does not prove a dialer problem. A tiny or immature sample does not establish a winning channel. Fix a confirmed workflow defect promptly; describe a performance explanation as a hypothesis until evidence supports it.'),
p('<strong>Simple experiment note:</strong> record the segment and dates, hypothesis, one changed element, unchanged conditions, owner, outcome definition and review/stop rule. For example, test whether a source-specific coordination question produces more relevant conversations than a generic capabilities opening. Record exclusions, workload and uncertainty, not just the better-looking percentage. If several things changed, say so and avoid a causal claim.') ]},
{id:'p-workbook',label:'Private planner',title:'Adapt the outline when you are ready',blocks:[
p('Use the completed plan manually or open this optional local planner. Its sections follow the same outline. Missing facts stay missing; entered evidence labels are your notes, not independent checks or a launch decision. No account, upload, saved storage or input collection is used. Export the text before leaving: reload clears it.'),
{type:'tool'}
]},
{id:'p-service',label:'When to ask for help',title:'Choose help around the work you need covered',blocks:[
p('Beespoke can research the targets, write individual messages, programme authorized outreach and manage follow-through against agreed criteria. The client’s judgment on the target list matters; sender authority and campaign authorization are still required. The client owns discovery, proposals and closing.'),
{type:'commercial'},
p('A useful provider conversation is specific: which work is covered, who approves the sample, who responds, what access is needed and how sales accepts a handoff. Bring your offer and a few target examples to a <a href="/book/?cta=prospecting-plan-fit">30-minute fit conversation</a>, or <a href="/services/outbound-lead-generation/">review the managed outbound scope</a>. There is no need to complete the planner before speaking.')
]}
],
faqs:[
['What belongs in a B2B sales prospecting plan?','The offer, objective and review period; target account and role criteria; exclusions and evidence; channels and messages; realistic workload; owners and approvals; reply, booking and sales handoff; outcome definitions and stopping conditions.'],
['Is there a free prospecting-plan template?','Yes. The completed one-page example and its headings form an ungated outline. The optional private planner creates editable notes and copyable or printable text without an account. Reloading clears its inputs.'],
['How many accounts should I prospect each week?','Start with observed research, message, approval and reply workload. The fictional 600-minute examples illustrate a calculation, not a recommended volume. Extra contacts and limited sales capacity change what is feasible.'],
['Should LinkedIn or email come first?','Choose from the person’s relevant public activity, suitable reachability, authorized sender access and agreed scope. Neither visible activity nor a verified address guarantees a response or establishes buying intent.'],
['How many follow-ups should the plan include?','Noah commonly starts with an individualized opening and one brief follow-up, often around four days later. Context, responses, suppression and authorization determine any further step; there is no universal touch minimum.'],
['Does completing the planner authorize a launch?','No. The planner records user-entered information and missing dependencies. Provided information is not verified approval; campaign-launch authorization is separate from planning-document approval.'],
['How is this different from account-based prospecting?','Account-based prospecting develops account selection, evidence and buying-role understanding. This operating plan connects that work to workload, approvals, messages, reply handling and sales handoff.'],
['Can this plan guarantee meetings or forecast my results?','No. Capacity is not conversion. A forecast needs comparable mature history and uncertainty; fictional examples and a completed plan do not predict replies, qualified calls or revenue.']
],
sourcesIntro:'Sources checked November 2, 2026. Richardson informs objective/process review; Salesforce and RAIN Group inform research, context and handoffs; RevBoss and the public Storylane/Supademo templates informed the schedule and document comparison. These are method references, not adopted conversion benchmarks. Noah’s described practice informs the short, individual and channel-aware approach. All worked material here is newly fictional; no competitor template, client data or purported result is reproduced.',
sourcesNotes:['Objectives, process and outcomes.','Research, roles, questions and next steps.','Research-to-offer examples and the limits of survey evidence.','A practical weekly and first-cycle structure.','Public plan template, read to its end; generalized rates are not our benchmarks.','Public plan template, read to its end; product claims and fixed cadences are not adopted.']
};
