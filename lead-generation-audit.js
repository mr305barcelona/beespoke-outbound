// Local-only arithmetic. Never reads or writes storage, URLs, Analytics, or network APIs.
(function(){
  "use strict";
  const limit=1000000000;
  function calculate(values,target=""){
    if(values.length!==5||values.some(v=>v===null||v===undefined||String(v).trim()===""))return {error:"empty"};
    const counts=values.map(Number),goal=String(target).trim()===""?null:Number(target);
    if(counts.some(v=>!Number.isSafeInteger(v)||v<0||v>limit)||counts.some((v,i)=>i>0&&v>counts[i-1])||(goal!==null&&(!Number.isSafeInteger(goal)||goal<0||goal>limit)))return {error:"invalid"};
    const rates=counts.slice(1).map((v,i)=>counts[i]>0?v/counts[i]:null);
    const bookingRate=counts[0]>0?counts[2]/counts[0]:null;
    const needed=goal===null?null:goal===0?0:bookingRate>0?Math.ceil(goal/bookingRate):null;
    return {counts,rates,bookingRate,goal,needed};
  }
  if(typeof module!=="undefined"&&module.exports)module.exports={calculate};
  if(typeof document==="undefined")return;
  function init(){
    const form=document.querySelector("[data-audit-calculator]"),config=document.getElementById("audit-config");
    if(!form||!config)return;
    const c=JSON.parse(config.textContent),mode=form.querySelector("[data-audit-mode]"),inputs=[...form.querySelectorAll("[data-audit-count]")],labels=[...form.querySelectorAll("[data-audit-label]")],target=form.querySelector("[data-audit-target]"),status=form.querySelector("[data-audit-status]"),output=form.querySelector("[data-audit-output]"),tbody=form.querySelector("[data-audit-rows]");
    const fmt=new Intl.NumberFormat(document.documentElement.lang,{maximumFractionDigits:1}),pct=n=>n===null?c.unavailable:fmt.format(n*100)+"%";
    const modeLabels=()=>mode.value==="outbound"?c.outboundLabels:c.webLabels;
    function hide(){output.hidden=true;status.textContent="";}
    function render(message){
      const r=calculate(inputs.map(x=>x.value),target.value);
      if(r.error){output.hidden=true;status.textContent=c[r.error];return;}
      tbody.replaceChildren();const names=modeLabels();
      r.rates.forEach((rate,i)=>{const row=document.createElement("tr"),name=document.createElement("th"),value=document.createElement("td");name.scope="row";name.textContent=names[i+1];value.textContent=pct(rate);row.append(name,value);tbody.append(row);});
      form.querySelector("[data-audit-overall]").textContent=pct(r.bookingRate);
      const scenario=form.querySelector("[data-audit-scenario]");scenario.hidden=r.goal===null;
      form.querySelector("[data-audit-needed]").textContent=r.needed===null?c.targetLimit:fmt.format(r.needed)+" · "+names[0];
      output.hidden=false;status.textContent=message||c.calculated;
    }
    function clear(){inputs.forEach(x=>x.value="");target.value="";hide();status.textContent=c.empty;}
    mode.addEventListener("change",()=>{const names=modeLabels();labels.forEach((x,i)=>x.textContent=names[i]);clear();});
    form.addEventListener("submit",event=>{event.preventDefault();render();});
    inputs.concat(target).forEach(input=>input.addEventListener("input",hide));
    form.querySelector("[data-audit-reset]").addEventListener("click",clear);
    form.querySelector("[data-audit-sample]").addEventListener("click",()=>{const sample=mode.value==="outbound"?[100,10,4,3,1]:[200,20,8,6,3];inputs.forEach((input,i)=>input.value=String(sample[i]));target.value="10";render(c.fiction);});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init,{once:true});else init();
})();
