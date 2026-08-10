(function(){
  'use strict';
  document.body && document.body.classList.add('h2-ux-v3');

  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safeEscape=(v)=>{try{return typeof escapeHtml==='function'?escapeHtml(v):esc(v)}catch(_){return esc(v)}};
  const norm=(v)=>String(v??'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');

  /* orientation guard */
  function ensureOrientationGate(){
    let gate=document.getElementById('h2OrientationGate');
    if(!gate){
      gate=document.createElement('div');gate.id='h2OrientationGate';gate.className='h2-orientation-gate';gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');
      gate.innerHTML='<div class="h2-orientation-card"><div class="h2-orientation-icon" aria-hidden="true"></div><h2>가로 화면으로 돌려주세요</h2><p>문제와 풀이를 한 화면에서 보기 위한 가로형 학습 화면입니다.</p><button type="button" id="h2TryLandscape">가로모드 시도</button></div>';
      document.body.appendChild(gate);
      gate.querySelector('#h2TryLandscape').addEventListener('click',async()=>{
        try{if(document.documentElement.requestFullscreen&&!document.fullscreenElement)await document.documentElement.requestFullscreen()}catch(_){ }
        try{if(screen.orientation&&screen.orientation.lock)await screen.orientation.lock('landscape')}catch(_){ }
        updateOrientationGate();
      });
    }
    return gate;
  }
  function isTouchPrimary(){return matchMedia('(pointer:coarse)').matches||(navigator.maxTouchPoints||0)>1}
  function updateOrientationGate(){ensureOrientationGate().classList.toggle('show',isTouchPrimary()&&matchMedia('(orientation:portrait)').matches)}
  try{if(matchMedia('(display-mode: standalone)').matches&&screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{})}catch(_){ }
  window.addEventListener('resize',updateOrientationGate,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(updateOrientationGate,80),{passive:true});

  /* learning globals */
  function hasLearningGlobals(){
    try{return typeof COURSE!=='undefined'&&COURSE&&COURSE.previewMap&&Array.isArray(COURSE.previewMap.branches)&&typeof state!=='undefined'&&typeof renderIntro==='function'}catch(_){return false}
  }
  function ensureIntroGateState(){
    if(!state.introGate||typeof state.introGate!=='object')state.introGate={};
    if(!state.introGate.confirmed||typeof state.introGate.confirmed!=='object')state.introGate.confirmed={};
    if(!state.introGate.revealed||typeof state.introGate.revealed!=='object')state.introGate.revealed={};
    if(!state.introGate.recallDone||typeof state.introGate.recallDone!=='object')state.introGate.recallDone={};
    if(typeof state.introGate.selected!=='string')state.introGate.selected='';
    return state.introGate;
  }
  function branchConcepts(branch){
    const all=Array.isArray(COURSE.concepts)?COURSE.concepts:[];
    const found=all.filter(c=>c.branch===branch.id).slice(0,4);
    if(found.length)return found;
    return [{title:branch.label,one:branch.hint||'핵심 개념을 확인합니다.',down:[]}];
  }
  function conceptKeyword(c){
    const down=Array.isArray(c.down)?c.down.filter(Boolean):[];
    return String(down[0]||c.title||c.one||'핵심어').trim();
  }
  function recallTarget(branch){
    const cs=branchConcepts(branch);
    const withDown=cs.find(c=>Array.isArray(c.down)&&c.down.length);
    return conceptKeyword(withDown||cs[0]||{title:branch.label});
  }
  function introSummary(branch,gate){
    if(!branch)return '<section class="h2-focus-drawer empty"><div><b>왼쪽에서 가지를 하나 선택하세요.</b><span>클릭할 때마다 오른쪽으로 핵심어가 한 단계씩 열립니다.</span></div></section>';
    const cs=branchConcepts(branch);
    const shown=Math.min(Number(gate.revealed[branch.id]||0),cs.length);
    const done=!!gate.confirmed[branch.id];
    const items=cs.slice(0,shown).map((c,i)=>{
      const kw=conceptKeyword(c);
      return `<article class="h2-focus-concept ${i===shown-1?'is-new':''}"><span class="h2-focus-num">${i+1}</span><div><b>${safeEscape(kw)}</b><p>${safeEscape(c.one||c.title||branch.hint||'')}</p></div></article>`;
    }).join('');
    let action='';
    if(shown<cs.length){
      action=`<button type="button" class="h2-reveal-next" data-h2-reveal-concept="${safeEscape(branch.id)}">핵심어 ${shown+1} 나타내기</button>`;
    }else if(!done){
      action=`<div class="h2-active-recall"><div class="h2-active-recall-label">방금 본 내용을 꺼내서 쓰기</div><p><b>${safeEscape(branch.label)}</b>에서 본 핵심어 하나를 입력하세요.</p><div class="h2-recall-row"><input type="text" data-h2-recall-input="${safeEscape(branch.id)}" autocomplete="off" spellcheck="false" placeholder="기억나는 핵심어 입력"><button type="button" data-h2-recall-check="${safeEscape(branch.id)}">기억 확인</button></div><div class="h2-recall-msg" data-h2-recall-msg="${safeEscape(branch.id)}"></div></div>`;
    }else{
      action='<div class="h2-branch-done">✓ 이 가지를 기억해서 확인했습니다.</div>';
    }
    return `<section class="h2-focus-drawer"><div class="h2-focus-drawer-head"><div><span>선택한 가지</span><h2>${safeEscape(branch.label)}</h2></div><strong>${shown} / ${cs.length}</strong></div><div class="h2-focus-concepts">${items||'<div class="h2-focus-placeholder">아직 핵심어를 열지 않았습니다.</div>'}</div>${action}</section>`;
  }
  function newRenderIntro(){
    const gate=ensureIntroGateState(),branches=COURSE.previewMap.branches||[];
    if(!gate.selected&&branches[0])gate.selected=branches[0].id;
    const selected=branches.find(b=>b.id===gate.selected)||branches[0]||null;
    const confirmed=branches.filter(b=>gate.confirmed[b.id]).length,total=branches.length,all=total>0&&confirmed===total;
    const branchNodes=branches.map((b,i)=>`<button type="button" class="h2-lr-branch ${selected&&selected.id===b.id?'selected':''} ${gate.confirmed[b.id]?'confirmed':''}" data-h2-branch="${safeEscape(b.id)}"><span>${i+1}</span><b>${safeEscape(b.label)}</b>${gate.confirmed[b.id]?'<em>✓</em>':'<em>›</em>'}</button>`).join('');
    const detailNodes=selected?branchConcepts(selected).map((c,i)=>{
      const shown=Number(gate.revealed[selected.id]||0)>i;
      return `<div class="h2-lr-detail ${shown?'shown':'locked'}" data-h2-detail-index="${i}"><span>${shown?safeEscape(conceptKeyword(c)):'클릭해서 나타내기'}</span></div>`;
    }).join(''):'';
    return `<div class="h2-intro-v3"><header class="h2-intro-v3-head"><div><div class="h2-kicker">오늘 먼저 볼 핵심 지도</div><h1>클릭하며 핵심어를 훑고, 기억해서 입력합니다.</h1></div><div class="h2-intro-progress"><b>${confirmed}</b><span>/ ${total} 가지 완료</span></div></header><section class="h2-lr-map" data-h2-lr-map><svg class="h2-lr-wires" aria-hidden="true"></svg><div class="h2-lr-root"><small>오늘의 중심</small><b>${safeEscape(COURSE.previewMap.root||COURSE.focusMap?.root||'오늘의 지도')}</b></div><div class="h2-lr-branches">${branchNodes}</div><div class="h2-lr-details">${detailNodes}</div></section>${introSummary(selected,gate)}<div class="h2-intro-actions"><button class="primary" id="startStudy" ${all?'':'disabled'}>${all?'문제 시작':`남은 가지 ${total-confirmed}개`}</button><p class="h2-intro-locknote">읽기만 하지 않고, 각 가지의 핵심어를 한 번 직접 입력해야 다음으로 넘어갑니다.</p></div></div>`;
  }
  function installIntroOverride(){
    if(!hasLearningGlobals()||window.__H2_INTRO_V3__)return;
    window.__H2_INTRO_V3__=true;
    try{renderIntro=newRenderIntro}catch(_){return}
    try{if(state.phase==='intro'&&typeof render==='function')render()}catch(_){ }
  }

  function layoutLeftRightMap(){
    document.querySelectorAll('[data-h2-lr-map]').forEach(map=>{
      const svg=map.querySelector('.h2-lr-wires'),root=map.querySelector('.h2-lr-root');
      const branches=[...map.querySelectorAll('.h2-lr-branch')],details=[...map.querySelectorAll('.h2-lr-detail')];
      if(!svg||!root||!branches.length)return;
      const r=map.getBoundingClientRect(),rr=root.getBoundingClientRect();
      const center=(el)=>{const x=el.getBoundingClientRect();return {x:x.left-r.left+x.width/2,y:x.top-r.top+x.height/2}};
      const rc=center(root);svg.setAttribute('viewBox',`0 0 ${Math.max(1,r.width)} ${Math.max(1,r.height)}`);
      const paths=[];
      branches.forEach(b=>{const p=center(b),active=b.classList.contains('selected')||b.classList.contains('confirmed');paths.push(`<path class="${active?'active':''}" d="M ${rc.x} ${rc.y} C ${rc.x+70} ${rc.y}, ${p.x-70} ${p.y}, ${p.x} ${p.y}"/>`)});
      const selected=branches.find(b=>b.classList.contains('selected'));
      if(selected){const s=center(selected);details.forEach(d=>{const p=center(d);paths.push(`<path class="detail ${d.classList.contains('shown')?'active':''}" d="M ${s.x} ${s.y} C ${s.x+70} ${s.y}, ${p.x-70} ${p.y}, ${p.x} ${p.y}"/>`)})}
      svg.innerHTML=paths.join('');
    });
  }

  /* staged explanation reveal */
  function installKeywordOverride(){
    try{
      if(typeof renderCorrectRepair!=='function'||window.__H2_KEYWORD_V3__)return;
      window.__H2_KEYWORD_V3__=true;
      const original=renderCorrectRepair;
      renderCorrectRepair=function(p){
        const w=p&&p.feedback&&p.feedback.correctWhy;
        if(!w||!Array.isArray(w.chain)||!w.chain.length)return original(p);
        const key=String(p.id||'')+':'+String(runtime.feedbackStep||0);
        if(runtime.__h2ChainKey!==key){runtime.__h2ChainKey=key;runtime.__h2ChainShown=1}
        const shown=Math.max(1,Math.min(Number(runtime.__h2ChainShown||1),w.chain.length)),done=shown>=w.chain.length;
        const chain=w.chain.slice(0,shown).map((x,i)=>`${i?'<em>→</em>':''}<span class="h2-chain-item ${i===shown-1?'is-new':''}">${safeEscape(x)}</span>`).join('');
        const next=!done?`<button type="button" class="h2-chain-next" data-h2-chain-next>다음 연결 나타내기 <b>${shown}/${w.chain.length}</b></button>`:'';
        const compare=done?`<div class="compare-grid"><div class="compare-box"><b>${safeEscape(p.feedback.compare.left.title)}</b><p>${safeEscape(p.feedback.compare.left.text)}</p></div><div class="compare-box"><b>${safeEscape(p.feedback.compare.right.title)}</b><p>${safeEscape(p.feedback.compare.right.text)}</p></div></div><div class="repair-tip">${safeEscape(p.feedback.compare.tip)}</div><button class="primary" id="repairNext" data-delay="450">기억해서 직접 입력</button>`:'';
        return `<div class="h2-repair-context">${safeEscape(p.title||'현재 문제')}의 핵심 연결</div><div class="repair-focus-label">정답 핵심</div><h2 class="focus-keyword">${safeEscape(w.title)}</h2><div class="focus-fact">${safeEscape(w.text)}</div><div class="h2-chain-stage"><div class="h2-key-chain">${chain}</div>${next}</div>${compare}`;
      };
    }catch(_){ }
  }

  /* make metacognition screens self-contained, so "이 문제" never appears without context */
  function installContextOverride(){
    try{
      if(window.__H2_CONTEXT_V3__)return;window.__H2_CONTEXT_V3__=true;
      if(typeof renderAnchorRepair==='function'){
        const old=renderAnchorRepair;
        renderAnchorRepair=function(p){return `<div class="h2-repair-context"><b>현재 문제</b> · ${safeEscape(p.title||p.original?.label||p.source||'오답 문제')}</div>`+old(p)};
      }
      if(typeof renderMetacogRepair==='function'){
        const old=renderMetacogRepair;
        renderMetacogRepair=function(p){return `<div class="h2-repair-context"><b>현재 문제</b> · ${safeEscape(p.title||p.original?.label||p.source||'오답 문제')}</div>`+old(p)};
      }
      if(typeof renderSelectedRepair==='function'){
        const old=renderSelectedRepair;
        renderSelectedRepair=function(p){return `<div class="h2-repair-context"><b>현재 문제</b> · ${safeEscape(p.title||p.original?.label||p.source||'오답 문제')}</div>`+old(p)};
      }
    }catch(_){ }
  }

  /* image zoom */
  function openImageZoom(src,alt){
    document.getElementById('h2ImageZoom')?.remove();
    const box=document.createElement('div');box.id='h2ImageZoom';box.className='h2-image-zoom';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
    box.innerHTML=`<div class="h2-image-zoom-head"><button type="button" data-h2-close-zoom>닫기</button></div><div class="h2-image-zoom-body"><img src="${src}" alt="${safeEscape(alt||'문제 원문 크게 보기')}"></div>`;
    document.body.appendChild(box);box.querySelector('button')?.focus();
  }

  function saveAndRender(){try{saveState()}catch(_){ }try{render()}catch(_){ }}

  document.addEventListener('click',e=>{
    const branch=e.target.closest('[data-h2-branch]');
    if(branch&&hasLearningGlobals()){
      const gate=ensureIntroGateState();gate.selected=branch.dataset.h2Branch;saveAndRender();return;
    }
    const reveal=e.target.closest('[data-h2-reveal-concept]');
    if(reveal&&hasLearningGlobals()){
      const gate=ensureIntroGateState(),id=reveal.dataset.h2RevealConcept,b=(COURSE.previewMap.branches||[]).find(x=>x.id===id);if(!b)return;
      const max=branchConcepts(b).length;gate.revealed[id]=Math.min(max,Number(gate.revealed[id]||0)+1);saveAndRender();return;
    }
    const detail=e.target.closest('.h2-lr-detail.locked');
    if(detail&&hasLearningGlobals()){
      const gate=ensureIntroGateState(),id=gate.selected,b=(COURSE.previewMap.branches||[]).find(x=>x.id===id);if(!b)return;
      const max=branchConcepts(b).length;gate.revealed[id]=Math.min(max,Number(gate.revealed[id]||0)+1);saveAndRender();return;
    }
    const check=e.target.closest('[data-h2-recall-check]');
    if(check&&hasLearningGlobals()){
      const id=check.dataset.h2RecallCheck,gate=ensureIntroGateState(),b=(COURSE.previewMap.branches||[]).find(x=>x.id===id);if(!b)return;
      const input=document.querySelector(`[data-h2-recall-input="${CSS.escape(id)}"]`),msg=document.querySelector(`[data-h2-recall-msg="${CSS.escape(id)}"]`);
      const got=norm(input?.value),target=norm(recallTarget(b));
      const ok=got.length>=2&&(got===target||target.includes(got)||got.includes(target));
      if(ok){gate.confirmed[id]=true;gate.recallDone[id]=true;const branches=COURSE.previewMap.branches||[],idx=branches.findIndex(x=>x.id===id),next=branches.find((x,j)=>j>idx&&!gate.confirmed[x.id]);if(next)gate.selected=next.id;saveAndRender()}else{if(msg)msg.textContent='한 번 더 떠올려 보세요. 방금 나타난 핵심어 중 하나를 그대로 입력하면 됩니다.';input?.focus()}
      return;
    }
    const chain=e.target.closest('[data-h2-chain-next]');if(chain){try{runtime.__h2ChainShown=Number(runtime.__h2ChainShown||1)+1;render()}catch(_){ }return}
    const img=e.target.closest('.original-question img');if(img){openImageZoom(img.currentSrc||img.src,img.alt);return}
    if(e.target.closest('[data-h2-close-zoom]')||e.target.id==='h2ImageZoom'){document.getElementById('h2ImageZoom')?.remove();return}
  },true);
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape')document.getElementById('h2ImageZoom')?.remove();
    if(e.key==='Enter'&&e.target.matches('[data-h2-recall-input]'))document.querySelector(`[data-h2-recall-check="${CSS.escape(e.target.dataset.h2RecallInput)}"]`)?.click();
  });

  let raf=0;function enhance(){cancelAnimationFrame(raf);raf=requestAnimationFrame(layoutLeftRightMap)}
  const observer=new MutationObserver(()=>enhance());observer.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('resize',enhance,{passive:true});

  function boot(){document.body.classList.add('h2-ux-v3');updateOrientationGate();installIntroOverride();installKeywordOverride();installContextOverride();enhance()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(()=>{installIntroOverride();installKeywordOverride();installContextOverride();enhance()},0);
})();
