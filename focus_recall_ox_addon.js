/* History2 Focus Recall OX addon — shared Day 1–6 intro UX. */
(function(){
  'use strict';
  if(window.__H2_FOCUS_OX_ADDON_LOADED__)return;
  window.__H2_FOCUS_OX_ADDON_LOADED__=true;
  const css=String.raw`/* History2 Focus UX: reversible review + lightweight O/X judgment, 2026-08-11. */
body.h2-ux-v6 .h2-v6-key.pending{cursor:pointer}
body.h2-ux-v6 .h2-v6-key.pending:hover{border-color:#74a9cf;background:#f6fbff;color:#37536f}
body.h2-ux-v6 .h2-v6-key.shown{cursor:pointer;animation:none}
body.h2-ux-v6 .h2-v6-key.shown:hover{border-color:#4d9c82;background:#ecf8f2;transform:translateX(2px)}
body.h2-ux-v6 .h2-v6-key.current{border-color:#36a17b;background:#edf9f3;box-shadow:0 0 0 3px rgba(24,130,93,.12)}
body.h2-ux-v6 .h2-v6-key.shown b{font-weight:950}
body.h2-ux-v6 .h2-v6-answer-key{display:inline-block;color:#08745b;font-weight:1000;background:#e5f6ef;border-radius:10px;padding:3px 9px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
body.h2-ux-v6 .h2-v6-keyword{display:inline;font-weight:1000;color:#08745b;background:linear-gradient(transparent 64%,#cceee1 64%)}
body.h2-ux-v6 .h2-v6-focus-card{gap:12px;overflow:hidden}
body.h2-ux-v6 .h2-v6-focus-card .eyebrow{animation:h2V6RevealUnit .28s ease both}
body.h2-ux-v6 .h2-v6-focus-title{animation:h2V6RevealUnit .32s .10s ease both}
body.h2-ux-v6 .h2-v6-fact-copy{display:inline;animation:h2V6RevealUnit .34s .22s ease both}
body.h2-ux-v6 .h2-v6-focus-card .reveal{animation:h2V6RevealUnit .32s .38s ease both}
body.h2-ux-v6 .h2-v6-judge{display:grid;gap:10px;border-top:1px solid #d9e3ec;padding-top:13px;animation:h2V6RevealUnit .34s .40s ease both}
body.h2-ux-v6 .h2-v6-judge-label{font-size:15px;font-weight:900;color:#536b85}
body.h2-ux-v6 .h2-v6-judge-statement{font-size:20px;line-height:1.45;font-weight:850;color:#142c49;word-break:keep-all;background:#fff;border:1px solid #d8e3ec;border-radius:14px;padding:13px 15px}
body.h2-ux-v6 .h2-v6-judge-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px}
body.h2-ux-v6 .h2-v6-judge-actions button{min-height:64px;border-radius:15px;border:2px solid #cfdce7;background:#fff;color:#15304d;display:flex;align-items:center;justify-content:center;gap:10px;font-weight:950;transition:transform .16s ease,border-color .16s ease,background .16s ease}
body.h2-ux-v6 .h2-v6-judge-actions button:hover{transform:translateY(-1px);border-color:#7ba8c7;background:#f6fbff}
body.h2-ux-v6 .h2-v6-judge-actions button strong{font-size:29px;line-height:1}
body.h2-ux-v6 .h2-v6-judge-actions button span{font-size:17px}
body.h2-ux-v6 .h2-v6-judge-actions .yes strong{color:#08745b}
body.h2-ux-v6 .h2-v6-judge-actions .no strong{color:#9f2f2f}
body.h2-ux-v6 .h2-v6-judge-msg{font-size:15px;line-height:1.4;font-weight:900;color:#b42318}
body.h2-ux-v6 .h2-v6-focus-card.is-review .h2-v6-done{animation:h2V6RevealUnit .3s .35s ease both}
body.h2-ux-v6 .h2-v6-actions{grid-template-columns:minmax(320px,720px);justify-content:center}
@keyframes h2V6RevealUnit{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}
@media (max-width:1180px) and (orientation:landscape){
  body.h2-ux-v6 .h2-v6-judge-statement{font-size:17px;padding:10px 12px}
  body.h2-ux-v6 .h2-v6-judge-actions button{min-height:55px}
  body.h2-ux-v6 .h2-v6-answer-key{padding:2px 7px}
}
@media (max-height:700px) and (orientation:landscape){
  body.h2-ux-v6 .h2-v6-judge{gap:7px;padding-top:9px}
  body.h2-ux-v6 .h2-v6-judge-statement{font-size:16px;line-height:1.35;padding:9px 11px}
  body.h2-ux-v6 .h2-v6-judge-actions button{min-height:48px}
  body.h2-ux-v6 .h2-v6-judge-actions button strong{font-size:24px}
  body.h2-ux-v6 .h2-v6-judge-actions button span{font-size:15px}
}
@media (prefers-reduced-motion:reduce){
  body.h2-ux-v6 .h2-v6-focus-card .eyebrow,body.h2-ux-v6 .h2-v6-focus-title,body.h2-ux-v6 .h2-v6-fact-copy,body.h2-ux-v6 .h2-v6-focus-card .reveal,body.h2-ux-v6 .h2-v6-judge,body.h2-ux-v6 .h2-v6-focus-card.is-review .h2-v6-done{animation:none!important}
}
`;
  const tag=document.createElement('style');
  tag.id='h2-focus-ox-addon-style';
  tag.textContent=css;
  document.head.appendChild(tag);
})();

/* History2 Focus UX: reversible concept review + lightweight O/X judgment. */
(function(){
  'use strict';
  const esc6=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safe6=(v)=>{try{return typeof escapeHtml==='function'?escapeHtml(v):esc6(v)}catch(_){return esc6(v)}};
  const reEsc6=(v)=>String(v??'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function ready6(){try{return typeof COURSE!=='undefined'&&COURSE&&COURSE.previewMap&&Array.isArray(COURSE.previewMap.branches)&&typeof state!=='undefined'}catch(_){return false}}
  function gate6(){
    if(!state.introGate||typeof state.introGate!=='object')state.introGate={};
    for(const k of ['confirmed','revealed','recallDone','focused','oxWrong'])if(!state.introGate[k]||typeof state.introGate[k]!=='object')state.introGate[k]={};
    if(typeof state.introGate.selected!=='string')state.introGate.selected='';
    return state.introGate;
  }
  function concepts6(branch){
    const all=Array.isArray(COURSE.concepts)?COURSE.concepts:[];
    const found=all.filter(c=>c.branch===branch.id).slice(0,4);
    return found.length?found:[{id:'fallback',title:branch.label,one:branch.hint||'핵심 개념을 확인합니다.',down:[]}];
  }
  function keyword6(c){const d=Array.isArray(c?.down)?c.down.filter(Boolean):[];return String(d[0]||c?.title||c?.one||'핵심어').trim()}
  function answerWords6(c){
    const words=[keyword6(c),...(Array.isArray(c?.down)?c.down:[])];
    try{
      (COURSE.problems||[]).filter(p=>p.concept===c.id).forEach(p=>(p.memoryChecks||[]).forEach(m=>words.push(m.keyword,m.answer)));
    }catch(_){ }
    return [...new Set(words.map(x=>String(x||'').trim()).filter(x=>x.length>=2))].sort((a,b)=>b.length-a.length).slice(0,12);
  }
  function markText6(text,c){
    const raw=String(text||''),words=answerWords6(c).filter(w=>raw.includes(w));
    if(!words.length)return safe6(raw);
    const re=new RegExp('('+words.map(reEsc6).join('|')+')','g');
    return raw.split(re).map(part=>words.includes(part)?`<strong class="h2-v6-keyword">${safe6(part)}</strong>`:safe6(part)).join('');
  }
  function declarative6(question,option){
    const q=String(question||'').trim().replace(/[?？]+$/,'');
    const o=String(option||'').trim();
    if(!q||!o)return '';
    if(/어떻게 되었나$/.test(q))return q.replace(/어떻게 되었나$/,'')+o+'하였다.';
    if(/^(증가|감소|확대|축소|강화|약화|폐지|허용|금지)$/.test(o)&&/[은는이가]$/.test(q))return `${q} ${o}하였다.`;
    if(/[은는이가]$/.test(q))return `${q} ${o}이다.`;
    if(/어디$/.test(q))return `${q} ${o}이다.`;
    return '';
  }
  function negate6(text){
    const t=String(text||'').trim();if(!t)return '';
    const rules=[
      [/실행하지 못했다\.$/,'실행했다.'],
      [/하지 못했다\.$/,'했다.'],
      [/되지 않았다\.$/,'되었다.'],
      [/하지 않았다\.$/,'했다.'],
      [/하였다\.$/,'하지 않았다.'],
      [/했다\.$/,'하지 않았다.'],
      [/되었다\.$/,'되지 않았다.'],
      [/이었다\.$/,'이 아니었다.'],
      [/이다\.$/,'이 아니다.'],
      [/있다\.$/,'없다.'],
      [/없다\.$/,'있다.']
    ];
    for(const [re,rep] of rules)if(re.test(t))return t.replace(re,rep);
    return '';
  }
  function falseStatement6(c){
    try{
      const p=(COURSE.problems||[]).find(x=>x.concept===c.id&&x.micro&&Array.isArray(x.micro.options)&&Number.isInteger(x.micro.answer));
      if(p){
        const q=p.micro,wrong=q.options.find((x,i)=>i!==q.answer&&String(x||'').trim()&&String(x).trim()!=='관련 없는 설명');
        if(wrong&&String(wrong).length<=32){const d=declarative6(q.question,wrong);if(d)return d}
      }
    }catch(_){ }
    return negate6(c.one||'');
  }
  function judgment6(branch,c){
    const branches=COURSE.previewMap.branches||[],bi=Math.max(0,branches.findIndex(b=>b.id===branch.id));
    if(bi%2===0){const f=falseStatement6(c);if(f&&f!==String(c.one||''))return{text:f,correct:false}}
    return{text:String(c.one||c.title||branch.hint||''),correct:true};
  }
  function focusIndex6(branch,g,shown,cs){
    if(!shown)return -1;
    let idx=Number(g.focused[branch.id]);
    if(!Number.isInteger(idx)||idx<0||idx>=shown)idx=shown-1;
    idx=Math.min(idx,cs.length-1);g.focused[branch.id]=idx;return idx;
  }
  function focus6(branch,g){
    if(!branch)return `<div class="h2-v6-focus-card empty"><h2>가지를 선택하세요.</h2></div>`;
    const cs=concepts6(branch),shown=Math.min(Number(g.revealed[branch.id]||0),cs.length),done=!!g.confirmed[branch.id];
    if(!shown)return `<div class="h2-v6-focus-card empty"><div class="eyebrow">${safe6(branch.label)}</div><button type="button" class="reveal" data-h2-v6-reveal="${safe6(branch.id)}">첫 핵심어 보기 →</button></div>`;
    const idx=focusIndex6(branch,g,shown,cs),current=cs[idx],kw=keyword6(current),fact=markText6(current.one||current.title||branch.hint||'',current);
    const head=`<div class="eyebrow">${idx+1} / ${cs.length} · 문제 핵심어</div><h2 class="h2-v6-focus-title"><span class="h2-v6-answer-key">${safe6(kw)}</span></h2><div class="fact"><span class="h2-v6-fact-copy">${fact}</span></div>`;
    if(done)return `<div class="h2-v6-focus-card is-review">${head}<div class="h2-v6-done">✓ 확인 완료</div></div>`;
    if(shown<cs.length)return `<div class="h2-v6-focus-card">${head}<button type="button" class="reveal" data-h2-v6-reveal="${safe6(branch.id)}">다음 핵심어 보기 →</button></div>`;
    const j=judgment6(branch,current),wrong=!!g.oxWrong[branch.id];
    return `<div class="h2-v6-focus-card is-judge">${head}<div class="h2-v6-judge"><div class="h2-v6-judge-label">맞는 내용인가?</div><div class="h2-v6-judge-statement">${safe6(j.text)}</div><div class="h2-v6-judge-actions"><button type="button" class="yes" data-h2-v6-ox="1" data-h2-v6-ox-branch="${safe6(branch.id)}"><strong>O</strong><span>맞다</span></button><button type="button" class="no" data-h2-v6-ox="0" data-h2-v6-ox-branch="${safe6(branch.id)}"><strong>X</strong><span>아니다</span></button></div>${wrong?'<div class="h2-v6-judge-msg">핵심어와 문장을 한 번 더 연결해 보세요.</div>':''}</div></div>`;
  }
  function render6(){
    const g=gate6(),branches=COURSE.previewMap.branches||[];
    if(!g.selected&&branches[0])g.selected=branches[0].id;
    const selected=branches.find(b=>b.id===g.selected)||branches[0]||null;
    const confirmed=branches.filter(b=>g.confirmed[b.id]).length,total=branches.length,all=total>0&&confirmed===total;
    const branchNodes=branches.map((b,i)=>`<button type="button" class="h2-v6-branch ${selected?.id===b.id?'selected':''} ${g.confirmed[b.id]?'confirmed':''}" data-h2-v6-branch="${safe6(b.id)}"><span class="num">${i+1}</span><b>${safe6(b.label)}</b><em class="state">${g.confirmed[b.id]?'✓':'›'}</em></button>`).join('');
    const cs=selected?concepts6(selected):[],shown=selected?Math.min(Number(g.revealed[selected.id]||0),cs.length):0,focusIdx=selected?focusIndex6(selected,g,shown,cs):-1;
    const keyNodes=cs.map((c,i)=>{
      if(i>shown)return '';
      if(i===shown&&shown<cs.length)return `<button type="button" class="h2-v6-key pending" data-h2-v6-reveal-index="${i}"><span class="num">${i+1}</span><b>${i===0?'첫 핵심어 보기':'다음 핵심어 보기'}</b></button>`;
      return `<button type="button" class="h2-v6-key shown ${i===focusIdx?'current':''}" data-h2-v6-key-index="${i}"><span class="num">${i+1}</span><b>${safe6(keyword6(c))}</b></button>`;
    }).join('');
    return `<div class="h2-intro-v6"><header class="h2-v6-head"><div class="h2-v6-headcopy"><div class="h2-v6-kicker">오늘 먼저 볼 핵심 지도</div><h1>핵심어를 하나씩 보고, 바로 판단합니다.</h1></div><div class="h2-v6-progress"><b>${confirmed}</b><span>/ ${total} 가지 완료</span></div></header><section class="h2-v6-map" data-h2-v6-map><svg class="h2-v6-guide" aria-hidden="true"></svg><section class="h2-v6-col"><div class="h2-v6-col-label">1. 오늘의 중심</div><div class="h2-v6-root-wrap"><div class="h2-v6-root"><b>${safe6(COURSE.previewMap.root||COURSE.focusMap?.root||'오늘의 지도')}</b></div></div></section><section class="h2-v6-col"><div class="h2-v6-col-label">2. 큰 가지</div><div class="h2-v6-branches">${branchNodes}</div></section><section class="h2-v6-col"><div class="h2-v6-col-label">3. 핵심어</div><div class="h2-v6-keys">${keyNodes}</div></section><section class="h2-v6-col"><div class="h2-v6-col-label">4. 핵심 판단</div><div class="h2-v6-focus">${focus6(selected,g)}</div></section></section><div class="h2-v6-actions"><button class="primary" id="startStudy" ${all?'':'disabled'}>${all?'문제 시작':`남은 가지 ${total-confirmed}개`}</button></div></div>`;
  }
  function wire6(){
    document.querySelectorAll('[data-h2-v6-map]').forEach(map=>{
      const svg=map.querySelector('.h2-v6-guide'),root=map.querySelector('.h2-v6-root'),branch=map.querySelector('.h2-v6-branch.selected'),key=map.querySelector('.h2-v6-key.current'),focus=map.querySelector('.h2-v6-focus-card');if(!svg||!root||!branch)return;
      const mr=map.getBoundingClientRect(),point=(el,side)=>{const r=el.getBoundingClientRect();return{x:(side==='r'?r.right:r.left)-mr.left,y:r.top-mr.top+r.height/2}};
      const path=(a,b,cls='')=>`<path class="${cls}" d="M ${a.x} ${a.y} C ${a.x+52} ${a.y}, ${b.x-52} ${b.y}, ${b.x} ${b.y}"/>`;
      const ps=[path(point(root,'r'),point(branch,'l'),'active')];if(key)ps.push(path(point(branch,'r'),point(key,'l'),'active deep'));if(key&&focus)ps.push(path(point(key,'r'),point(focus,'l'),'deep'));
      svg.setAttribute('viewBox',`0 0 ${Math.max(1,mr.width)} ${Math.max(1,mr.height)}`);svg.innerHTML=ps.join('');
    });
  }
  function saveRender6(){try{if(typeof saveState==='function')saveState()}catch(_){ }try{if(typeof render==='function')render()}catch(_){ }}
  function revealNext6(id){
    const g=gate6(),b=(COURSE.previewMap.branches||[]).find(x=>x.id===id);if(!b)return;
    const cs=concepts6(b),next=Math.min(cs.length,Number(g.revealed[id]||0));
    if(next>=cs.length)return;g.revealed[id]=next+1;g.focused[id]=next;g.oxWrong[id]=false;saveRender6();
  }
  document.addEventListener('click',e=>{
    if(!ready6())return;
    const branch=e.target.closest('[data-h2-v6-branch]');if(branch){const g=gate6();g.selected=branch.dataset.h2V6Branch;g.oxWrong[g.selected]=false;saveRender6();return}
    const key=e.target.closest('[data-h2-v6-key-index]');if(key){const g=gate6(),id=g.selected;g.focused[id]=Number(key.dataset.h2V6KeyIndex);g.oxWrong[id]=false;saveRender6();return}
    const locked=e.target.closest('[data-h2-v6-reveal-index]');if(locked){const g=gate6();revealNext6(g.selected);return}
    const reveal=e.target.closest('[data-h2-v6-reveal]');if(reveal){revealNext6(reveal.dataset.h2V6Reveal);return}
    const ox=e.target.closest('[data-h2-v6-ox]');if(ox){
      const g=gate6(),id=ox.dataset.h2V6OxBranch,b=(COURSE.previewMap.branches||[]).find(x=>x.id===id);if(!b)return;
      const cs=concepts6(b),shown=Math.min(Number(g.revealed[id]||0),cs.length),idx=focusIndex6(b,g,shown,cs),c=cs[idx],j=judgment6(b,c),picked=ox.dataset.h2V6Ox==='1';
      if(picked===j.correct){g.confirmed[id]=true;g.recallDone[id]=true;g.oxWrong[id]=false;const branches=COURSE.previewMap.branches||[],start=branches.findIndex(x=>x.id===id),next=branches.find((x,i)=>i>start&&!g.confirmed[x.id])||branches.find(x=>!g.confirmed[x.id]);if(next)g.selected=next.id;saveRender6()}else{g.oxWrong[id]=true;saveRender6()}
      return;
    }
  },true);
  function install6(){
    if(!ready6())return false;
    document.body.classList.add('h2-ux-v6');
    try{renderIntro=render6;window.__H2_INTRO_V6__=true}catch(_){return false}
    try{if(state.phase==='intro'&&typeof render==='function')render()}catch(_){ }
    requestAnimationFrame(wire6);return true;
  }
  let tries=0;function boot6(){if(install6())return;if(++tries<80)setTimeout(boot6,50)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot6,{once:true});else boot6();
  const mo=new MutationObserver(()=>requestAnimationFrame(wire6));mo.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('resize',()=>requestAnimationFrame(wire6),{passive:true});
})();
