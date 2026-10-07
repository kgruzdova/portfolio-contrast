const config = window.PORTFOLIO;
const $ = s => document.querySelector(s);
const escapeHTML = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeURL = value => { try {const u = new URL(value); return ['https:','http:'].includes(u.protocol) ? u.href : '';} catch {return '';}};
const labels = {site:'Сайты',prototype:'Приложения',visual:'Визуалы',bot:'Чат-боты'};
const assetURL = value => /^assets\/[a-zA-Z0-9_./-]+$/.test(value || '') ? value : safeURL(value);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
function preview(p) {
 const cover=assetURL(p.cover);
 return '<div class="case-stage stage-'+escapeHTML(p.id)+'"><div class="stage-caption"><span>'+escapeHTML(p.format)+'</span><span>'+escapeHTML(p.number)+' / 05</span></div><div class="screen-surface">'+(cover?'<img src="'+escapeHTML(cover)+'" alt="'+escapeHTML(p.coverCaption)+'" loading="lazy" decoding="async">':'<span>Превью пока недоступно</span>')+'</div><span class="stage-statement">'+escapeHTML(p.coverLabel)+'</span><span class="stage-open">Смотреть кейс <span aria-hidden="true">↗</span></span></div>';
}
let projectObserver;
function animateProjects(){
 projectObserver?.disconnect();
 const cards=document.querySelectorAll('.project,.upcoming-card');
 if(!('IntersectionObserver' in window)||reducedMotion.matches){cards.forEach(c=>c.classList.add('in-view'));return;}
 projectObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in-view');projectObserver.unobserve(e.target);}}),{threshold:.08});
 cards.forEach(c=>projectObserver.observe(c));
 document.querySelectorAll('.case-stage').forEach(stage=>{
   stage.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||reducedMotion.matches)return;const r=stage.getBoundingClientRect();stage.style.setProperty('--tilt-x',((e.clientX-r.left)/r.width-.5)*3+'deg');stage.style.setProperty('--tilt-y',((e.clientY-r.top)/r.height-.5)*-3+'deg');});
   stage.addEventListener('pointerleave',()=>{stage.style.setProperty('--tilt-x','0deg');stage.style.setProperty('--tilt-y','0deg');});
 });
}
function renderProjects(filter='all') {
 const list=config.projects.filter(p=>filter==='all'||p.category===filter);
 const upcoming=(config.upcoming||[]).filter(p=>filter==='all'||p.category===filter);
 $('#projects').innerHTML=list.map(p=>'<article class="project '+(p.id==='coffee'?'project-featured':'')+'"><button class="project-link" data-case="'+escapeHTML(p.id)+'" aria-label="Смотреть кейс: '+escapeHTML(p.name)+'">'+preview(p)+'<div class="project-info"><span class="project-number">'+escapeHTML(p.number)+'</span><div class="project-summary"><div class="project-title"><h3>'+escapeHTML(p.name)+'</h3><span aria-hidden="true">↗</span></div><p>'+escapeHTML(p.description)+'</p><div class="project-tags">'+p.tags.map(t=>'<span>'+escapeHTML(t)+'</span>').join('')+'</div><div class="project-meta"><span>'+escapeHTML(p.status)+'</span><span>'+escapeHTML(p.role)+'</span></div></div></div></button></article>').join('');
 $('#upcoming').innerHTML=upcoming.length?'<div class="upcoming-heading"><span class="eyebrow">Следующие главы</span><span>Кейсы готовятся к публикации</span></div><div class="upcoming-grid">'+upcoming.map(p=>'<article class="upcoming-card upcoming-'+escapeHTML(p.id)+'"><div class="upcoming-top"><span>'+escapeHTML(p.number)+'</span><span class="coming-soon">Скоро</span></div><div class="upcoming-art" aria-hidden="true">'+(p.category==='bot'?'<span class="chat-mark">Привет<span class="typing-dots"><i></i><i></i><i></i></span></span>':'<span class="product-mark">Форма.<br><em>Содержание.</em></span>')+'</div><span class="upcoming-placeholder">'+escapeHTML(p.placeholder)+'</span><h3>'+escapeHTML(p.name)+'</h3><p>'+escapeHTML(p.description)+'</p><small>Обложка · задача · мой вклад · результат · ссылка</small></article>').join('')+'</div>':'';
 $('#empty').hidden=list.length>0||upcoming.length>0;
 $('#work-count').textContent=String(list.length).padStart(2,'0')+' '+(list.length===1?'кейс':'кейсов')+(upcoming.length?' / '+upcoming.length+' скоро':'');
 document.querySelectorAll('[data-case]').forEach(el=>el.onclick=()=>openCase(el.dataset.case));
 document.querySelectorAll('.screen-surface img').forEach(img=>img.onerror=()=>{img.parentElement.textContent='Превью недоступно. Описание и ссылка — внутри кейса.';});
 animateProjects();
}
function setFilter(value){document.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.filter===value));renderProjects(value);}
document.querySelectorAll('[data-filter]').forEach(b=>b.onclick=()=>setFilter(b.dataset.filter));
$('#reset-filter').onclick=()=>setFilter('all');
const dialog=$('#case-dialog');
function openCase(id){
 const p=config.projects.find(p=>p.id===id);if(!p)return;
 const url=safeURL(p.url),repo=safeURL(p.repository), cover=assetURL(p.cover);
 $('#case-content').innerHTML='<article class="case-detail"><div class="case-intro"><span class="eyebrow">Кейс '+escapeHTML(p.number)+' / '+escapeHTML(p.status)+'</span><h2 id="case-title" tabindex="-1">'+escapeHTML(p.name)+'</h2><p class="case-subtitle">'+escapeHTML(p.subtitle)+'</p><div class="case-actions">'+(url?'<a class="button primary" href="'+escapeHTML(url)+'" target="_blank" rel="noopener">'+escapeHTML(p.linkLabel)+'</a>':'')+(repo?'<a class="button secondary" href="'+escapeHTML(repo)+'" target="_blank" rel="noopener">Исходники на GitHub</a>':'')+'</div></div><figure class="case-image"><img src="'+escapeHTML(cover)+'" alt="'+escapeHTML(p.coverCaption)+'"><figcaption>'+escapeHTML(p.coverCaption)+'</figcaption></figure><div class="case-facts"><span><small>Формат</small>'+escapeHTML(p.format)+'</span><span><small>Мой вклад</small>'+escapeHTML(p.role)+'</span>'+(p.duration?'<span><small>Время по авторскому кейсу</small>'+escapeHTML(p.duration)+'</span>':'')+'</div><section class="case-chapter"><span class="chapter-number">01 / Контекст</span><div><h3>Задача</h3><p>'+escapeHTML(p.task)+'</p></div></section><section class="case-chapter"><span class="chapter-number">02 / Решение</span><div><h3>Как это устроено</h3>'+p.approach.map((s,i)=>'<div class="case-step"><span>0'+(i+1)+'</span><div><h4>'+escapeHTML(s.title)+'</h4><p>'+escapeHTML(s.text)+'</p></div></div>').join('')+'</div></section>'+(p.gallery||[]).map(g=>'<figure class="case-image"><img loading="lazy" src="'+escapeHTML(assetURL(g.src))+'" alt="'+escapeHTML(g.caption)+'"><figcaption>'+escapeHTML(g.caption)+'</figcaption></figure>').join('')+'<section class="case-chapter"><span class="chapter-number">03 / Результат</span><div><h3>Что получилось</h3><p>'+escapeHTML(p.result)+'</p><p class="case-note">'+escapeHTML(p.note)+'</p><div class="project-tags">'+p.stack.map(t=>'<span>'+escapeHTML(t)+'</span>').join('')+'</div></div></section><div class="case-footer"><h3>Вашей идее тоже<br><em>нужна форма.</em></h3><a href="#contact" class="button primary" id="case-contact">Обсудить задачу</a></div></article>';
 dialog.dataset.project=p.id;
 dialog.showModal();dialog.scrollTop=0;document.body.style.overflow='hidden';
 $('#case-title').focus({preventScroll:true});
 $('#case-contact').onclick=()=>dialog.close();
}
$('.close').onclick=()=>dialog.close();dialog.addEventListener('close',()=>document.body.style.overflow='');dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const telegram=safeURL(config.telegram), social=safeURL(config.social), email=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(config.email)?config.email:'';
$('#contact-links').innerHTML=[telegram?`<a href="${escapeHTML(telegram)}" target="_blank" rel="noopener">Написать в Telegram ↗</a>`:'<span>[Добавьте ссылку на Telegram]</span>',email?`<a href="mailto:${escapeHTML(email)}">${escapeHTML(email)} ↗</a>`:'<span>Email: [добавьте адрес]</span>',social?`<a href="${escapeHTML(social)}" target="_blank" rel="noopener">Соцсети ↗</a>`:'<span>Соцсети: [добавьте ссылку]</span>'].join('');
const form=$('#brief');
if(!config.formEndpoint)$('#form-hint').textContent='Демо-форма: отправка будет доступна после подключения обработчика. Сейчас можно заполнить и скачать заявку.';
document.querySelectorAll('[data-service]').forEach(a=>a.onclick=()=>{form.elements.service.value=a.dataset.service;});
function validate(){let first=null;['name','reply','service','task','url'].forEach(name=>{const field=form.elements[name],v=field.value.trim();let error='';if(field.required&&!v)error='Заполните это поле.';else if(name==='reply'&&v&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)&&!/^@[a-zA-Z0-9_]{5,32}$/.test(v)&&!/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,32}\/?$/.test(v))error='Укажите email, @username или ссылку https://t.me/…';else if(name==='url'&&v&&!safeURL(v))error='Добавьте полную ссылку: https://…';$('#error-'+name).textContent=error;field.setAttribute('aria-invalid',!!error);field.setAttribute('aria-describedby','error-'+name);if(error&&!first)first=field;});if(first)first.focus();return !first;}
form.addEventListener('input',e=>{if(e.target.getAttribute('aria-invalid')==='true'){e.target.removeAttribute('aria-invalid');const error=$('#error-'+e.target.name);if(error)error.textContent='';}$('#form-status').textContent='';});
form.addEventListener('submit',async e=>{e.preventDefault();$('#form-status').textContent='';if(!validate())return;const endpoint=safeURL(config.formEndpoint);if(!endpoint){$('#form-status').textContent='Заявка не отправлена: приём заявок пока не подключён. Вы можете скачать её и передать после добавления контактов.';$('#download-brief').hidden=false;return;}const submit=form.querySelector('[type=submit]');submit.disabled=true;submit.textContent='Отправляем…';const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),15000);try{const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(new FormData(form))),signal:controller.signal});if(!response.ok)throw new Error('request');$('#form-status').textContent='Спасибо, заявка отправлена. Отвечу по указанному контакту и предложу время для обсуждения.';form.reset();$('#download-brief').hidden=true;}catch{$('#form-status').textContent='Не удалось отправить заявку. Проверьте соединение и попробуйте ещё раз. Ваши данные остались в форме.';$('#download-brief').hidden=false;}finally{clearTimeout(timer);submit.disabled=false;submit.innerHTML='Записаться на обсуждение <span>↗</span>';}});
$('#download-brief').onclick=()=>{if(!validate())return;const titles={name:'Имя',reply:'Контакт',service:'Формат',task:'Задача',url:'Материалы',deadline:'Желаемый срок'};const text=Object.entries(Object.fromEntries(new FormData(form))).map(([k,v])=>`${titles[k]}: ${v}`).join('\n\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='Заявка-на-проект.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
let toastTimer;function notify(text){const toast=$('.toast');toast.textContent=text;toast.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.hidden=true,2500);}
let step=0;document.querySelectorAll('[data-experiment]').forEach(b=>b.onclick=()=>{if(b.dataset.experiment==='flow'){step=(step+1)%4;const steps=['Идея → Запуск','Задача → Концепция','Концепция → Создание','Создание → Запуск'];b.querySelector('strong').textContent=steps[step];}else b.classList.toggle('alternate');});
$('#year').textContent=new Date().getFullYear();renderProjects();
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){document.body.classList.add('motion');const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target);}}),{threshold:.08});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
