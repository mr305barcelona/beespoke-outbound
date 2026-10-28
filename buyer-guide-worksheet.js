(() => {
  'use strict';
  document.querySelectorAll('[data-buyer-worksheet]').forEach(root => {
    const config = JSON.parse(root.querySelector('[data-worksheet-config]').textContent);
    const status = root.querySelector('[data-worksheet-status]');
    const report = root.querySelector('[data-worksheet-report]');
    const holder = root.querySelector('[data-worksheet-rows]');
    const template = root.querySelector('template');
    const rows = () => [...holder.querySelectorAll('[data-worksheet-row]')];
    let serial = rows().length;
    const write = text => {status.textContent = text;};
    const read = () => rows().map(row => ({values:[...row.querySelectorAll('textarea')].map(x=>x.value.trim()),state:row.querySelector('select').value})).filter(r=>r.values.some(Boolean));
    const invalidate = () => {report.hidden=true;write(config.changed);};
    const rename = () => rows().forEach((row,i) => {row.querySelector('[data-row-label]').textContent=config.row+' '+(i+1);});
    const add = data => {
      if(rows().length>=50){write(config.limit);return null;}
      const row=template.content.firstElementChild.cloneNode(true);serial++;
      row.querySelectorAll('[id]').forEach(el=>{const before=el.id;el.id=before.replace('row-template','row-'+serial);const label=row.querySelector('label[for="'+before+'"]');if(label)label.htmlFor=el.id;});
      holder.appendChild(row);rename();
      if(data){row.querySelectorAll('textarea').forEach((f,i)=>{f.value=data.values[i]||'';});row.querySelector('select').value=data.state||'unknown';row.open=false;}
      row.querySelectorAll('button').forEach(b=>{b.disabled=false;});
      return row;
    };
    const allowReplace=()=>!read().length||window.confirm(config.replace);
    root.querySelector('[data-worksheet-add]').addEventListener('click',()=>{const row=add();if(row){invalidate();row.open=true;row.querySelector('textarea').focus();}});
    holder.addEventListener('click',event=>{const button=event.target.closest('[data-worksheet-remove]');if(!button)return;const row=button.closest('[data-worksheet-row]');if([...row.querySelectorAll('textarea')].some(x=>x.value.trim())&&!window.confirm(config.removeConfirm))return;row.remove();if(!rows().length)add();rename();invalidate();});
    const summarize = () => {
      const entries=read();report.replaceChildren();
      if(!entries.length){report.hidden=true;write(config.empty);return false;}
      const counts={unknown:0,observed:0,inferred:0,fictional:0};entries.forEach(x=>counts[x.state]++);
      write(config.summary.replace('{rows}',entries.length).replace('{observed}',counts.observed).replace('{inferred}',counts.inferred).replace('{unknown}',counts.unknown).replace('{fictional}',counts.fictional));
      const title=document.createElement('h3');title.textContent=config.reportTitle;report.append(title);
      const note=document.createElement('p');note.textContent=config.reportNote;report.append(note);
      entries.forEach((row,i)=>{const wrap=document.createElement('section'),h=document.createElement('h4'),dl=document.createElement('dl');h.textContent=config.row+' '+(i+1)+' · '+config.options[config.states.indexOf(row.state)];wrap.append(h,dl);config.fields.forEach((label,j)=>{const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=label;dd.textContent=row.values[j]||config.unknownValue;dl.append(dt,dd);});report.append(wrap);});
      report.hidden=false;return true;
    };
    root.querySelector('[data-worksheet-summary]').addEventListener('click',summarize);
    root.querySelector('[data-worksheet-sample]').addEventListener('click',()=>{if(!allowReplace())return;holder.replaceChildren();config.samples.forEach(add);if(rows()[0])rows()[0].open=true;report.hidden=true;write(config.fiction);});
    root.querySelector('[data-worksheet-reset]').addEventListener('click',()=>{if(!allowReplace())return;holder.replaceChildren();add();report.hidden=true;write(config.empty);});
    const csvCell=value=>'"'+(/^[\s]*[=+\-@]/.test(value)?"'":'')+value.replace(/"/g,'""')+'"';
    root.querySelector('[data-worksheet-export]').addEventListener('click',()=>{
      const entries=read();if(!entries.length){write(config.empty);return;}
      const csv=[config.fields.concat(config.state),...entries.map(r=>r.values.concat(config.options[config.states.indexOf(r.state)]))].map(row=>row.map(csvCell).join(',')).join('\r\n');
      const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=config.filename;a.hidden=true;root.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);write(config.exported);
    });
    root.querySelector('[data-worksheet-print]').addEventListener('click',()=>{
      if(!summarize())return;
      document.body.setAttribute('data-workbook-print','');root.setAttribute('data-workbook-print-target','');
      try{window.print();}finally{document.body.removeAttribute('data-workbook-print');root.removeAttribute('data-workbook-print-target');}
    });
    root.addEventListener('input',invalidate);root.addEventListener('change',invalidate);
    root.querySelectorAll('button').forEach(button=>{button.disabled=false;});
    if(!rows().length)add();
  });
})();
