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
  function recallTargets(branch){
    const cs=branchConcepts(branch);
    return cs.map(conceptKeyword).filter(Boolean);
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
      const got=norm(input?.value),targets=recallTargets(b).map(norm).filter(Boolean);
      const ok=got.length>=2&&targets.includes(got);
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

/* History2 Focus UX v4: question viewport and transparent resume context */
(function(){
  'use strict';
  function esc4(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function learningReady(){try{return typeof COURSE!=='undefined'&&COURSE&&Array.isArray(COURSE.problems)&&typeof state!=='undefined'&&typeof currentProblem==='function'}catch(_){return false}}
  function sourceLabel4(p){return p?.original?.label||p?.source||p?.title||'현재 문제'}
  function isQuestionMode4(){try{return state?.phase==='learn'&&runtime?.mode==='question'}catch(_){return false}}
  function enhanceQuestion4(){
    if(!learningReady()||!isQuestionMode4())return;
    document.body.classList.add('h2-ux-v4');
    const panel=document.querySelector('.question-panel');if(!panel)return;
    const p=currentProblem();if(!p)return;
    const original=panel.querySelector('.original-question');
    if(original){original.classList.toggle('h2-multi-image',original.querySelectorAll('img').length>1)}
    let dock=panel.querySelector('.h2-answer-dock');
    if(!dock){
      dock=document.createElement('aside');dock.className='h2-answer-dock';dock.setAttribute('aria-label','정답 입력 영역');
      const guide=panel.querySelector('.answer-guide');
      const answer=panel.querySelector('.number-choice-grid,.essay-input,.fill-input');
      const action=panel.querySelector('.action-area');
      if(guide)panel.insertBefore(dock,guide);else if(action)panel.insertBefore(dock,action);else panel.appendChild(dock);
      const context=document.createElement('div');context.className='h2-q-context';dock.appendChild(context);
      [guide,answer,action].forEach(x=>{if(x)dock.appendChild(x)});
    }
    const ctx=dock.querySelector('.h2-q-context');
    if(ctx)ctx.innerHTML=`<b>${esc4(sourceLabel4(p))}</b><span>${esc4(p.title||'')} · 오늘 학습 ${Number(state.problemIndex||0)+1}/${COURSE.problems.length}</span>`;
    if(Number(state.problemIndex||0)>0&&!dock.querySelector('.h2-resume-note')){
      const note=document.createElement('div');note.className='h2-resume-note';
      note.innerHTML=`<span>저장된 학습 기록을 이어서 <b>${Number(state.problemIndex)+1}번째 문항</b>부터 시작했습니다.</span><button type="button" data-h2-start-first>1번부터 다시 풀기</button>`;
      dock.insertBefore(note,ctx?.nextSibling||dock.firstChild);
    }
  }
  document.addEventListener('click',e=>{
    const b=e.target.closest('[data-h2-start-first]');if(!b||!learningReady())return;
    try{
      state.phase='learn';state.problemIndex=0;
      if(typeof resetRuntimeForQuestion==='function')resetRuntimeForQuestion();else{runtime.mode='question';runtime.answer=null}
      if(typeof saveState==='function')saveState();
      if(typeof render==='function')render();
    }catch(_){ }
  },true);
  let pending=0;function schedule(){cancelAnimationFrame(pending);pending=requestAnimationFrame(enhanceQuestion4)}
  const obs=new MutationObserver(schedule);obs.observe(document.documentElement,{childList:true,subtree:true});
  window.addEventListener('resize',schedule,{passive:true});
  function boot4(){document.body.classList.add('h2-ux-v4');schedule()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot4,{once:true});else boot4();
  setTimeout(schedule,0);
})();

/* History2 Focus UX v5: development QA mode. Final release mode is untouched. */
(function(){
  'use strict';
  const CFG=window.HISTORY2_APP_CONFIG||{};
  const params=new URLSearchParams(location.search);
  const devBuild=CFG.buildMode==='development';
  const devRequested=params.get('dev')==='1'||sessionStorage.getItem('history2-dev-mode')==='1';
  if(!devBuild)return;
  if(devRequested){sessionStorage.setItem('history2-dev-mode','1');document.body && document.body.classList.add('h2-dev-mode');}

  function ready5(){try{return typeof COURSE!=='undefined'&&COURSE&&Array.isArray(COURSE.problems)&&typeof state!=='undefined'&&typeof runtime!=='undefined'&&typeof render==='function'&&typeof defaultState==='function'}catch(_){return false}}
  function source5(p){return p?.original?.label||p?.source||p?.title||p?.id||'현재 문항'}
  function clamp5(n,a,b){return Math.max(a,Math.min(b,n))}
  function currentIndex5(){try{return clamp5(Number(state.problemIndex||0),0,Math.max(0,COURSE.problems.length-1))}catch(_){return 0}}
  function resetQuestion5(){try{if(typeof resetRuntimeForQuestion==='function')resetRuntimeForQuestion();else{runtime.mode='question';runtime.answer=null;runtime.feedbackStep=0}}catch(_){}}
  function setPhase5(mode){
    if(!ready5())return;
    const p=COURSE.problems[currentIndex5()];
    state.phase=mode==='intro'?'intro':'learn';
    if(mode==='intro'){try{state.introGate={confirmed:{},revealed:{},recallDone:{},selected:''}}catch(_){};render();return}
    if(mode==='question'){resetQuestion5();render();return}
    if(mode==='correct'){resetQuestion5();runtime.mode='correct';render();return}
    if(mode==='wrong'){
      resetQuestion5();
      let wrong;
      if(p.type==='single')wrong=(Array.isArray(p.options)?p.options:[]).findIndex((_,i)=>Number(i)!==Number(p.answer));
      else if(p.type==='multi')wrong=[(Array.isArray(p.options)?p.options:[]).findIndex((_,i)=>!p.answer.includes(i))].filter(i=>i>=0);
      else wrong='개발용 오답';
      if(wrong===-1)wrong=0;
      runtime.answer=wrong;
      try{runtime.lastDiagnosis=typeof diagnosisFor==='function'?diagnosisFor(p,wrong):{depth:'개발 테스트',message:'오답 복구 화면 확인'}}catch(_){runtime.lastDiagnosis={depth:'개발 테스트',message:'오답 복구 화면 확인'}}
      runtime.feedbackStep=0;
      try{if(typeof resetRepairInteraction==='function')resetRepairInteraction()}catch(_){}
      try{if(typeof ensureWrongNote==='function')ensureWrongNote(p,wrong,runtime.lastDiagnosis)}catch(_){}
      runtime.mode='explain';render();return;
    }
  }
  function setIndex5(i,mode){if(!ready5())return;state.problemIndex=clamp5(Number(i||0),0,COURSE.problems.length-1);setPhase5(mode||'question')}
  function repairMove5(delta){
    if(!ready5())return;
    if(runtime.mode!=='explain')setPhase5('wrong');
    try{const steps=typeof explanationSteps==='function'?explanationSteps(COURSE.problems[currentIndex5()]):[];runtime.feedbackStep=clamp5(Number(runtime.feedbackStep||0)+delta,0,Math.max(0,steps.length-1));if(typeof resetRepairInteraction==='function')resetRepairInteraction();render()}catch(_){render()}
  }
  function disablePersistence5(){
    try{state.sync={...(state.sync||{}),enabled:false};runtime.firebase=null}catch(_){}
    try{if(typeof saveState==='function'&&!window.__H2_DEV_ORIG_SAVE){window.__H2_DEV_ORIG_SAVE=saveState;saveState=function(){return state}}}catch(_){}
    try{if(typeof remotePatch==='function'&&!window.__H2_DEV_ORIG_REMOTE_PATCH){window.__H2_DEV_ORIG_REMOTE_PATCH=remotePatch;remotePatch=async function(){}}}catch(_){}
    try{if(typeof remoteArrayUnion==='function'&&!window.__H2_DEV_ORIG_REMOTE_ARRAY){window.__H2_DEV_ORIG_REMOTE_ARRAY=remoteArrayUnion;remoteArrayUnion=async function(){}}}catch(_){}
  }
  function freshState5(){
    if(!ready5())return;
    try{state=defaultState()}catch(_){try{const f=defaultState();Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,f)}catch(__){}}
    try{state.sync={...(state.sync||{}),enabled:false}}catch(_){}
    const pid=params.get('problem');let idx=Number(params.get('index'));
    if(pid){const found=COURSE.problems.findIndex(p=>p.id===pid);if(found>=0)idx=found}
    if(!Number.isFinite(idx))idx=0;
    state.problemIndex=clamp5(idx,0,COURSE.problems.length-1);
    const start=params.get('devmode')||'question';
    setPhase5(start);
  }
  function day5(){const m=String(COURSE?.meta?.id||'').match(/day(\d+)/i);return m?Number(m[1]):''}
  function toolbar5(){
    if(!ready5())return;
    let bar=document.getElementById('h2DevToolbar');
    const i=currentIndex5(),p=COURSE.problems[i],d=day5();
    if(!bar){bar=document.createElement('div');bar.id='h2DevToolbar';bar.className='h2-dev-toolbar';bar.innerHTML='<div class="h2-dev-badge"><b>개발 테스트</b><span>저장 OFF</span></div><div class="h2-dev-group"><button data-h2-dev-prev>이전</button><select data-h2-dev-select></select><button data-h2-dev-next>다음</button></div><div class="h2-dev-group"><button data-h2-dev-mode="intro">마인드맵</button><button data-h2-dev-mode="question">문제</button><button data-h2-dev-mode="wrong">오답</button><button data-h2-dev-repair-prev>복구−</button><button data-h2-dev-repair-next>복구＋</button><button data-h2-dev-mode="correct">정답</button></div><div class="h2-dev-spacer"></div><div class="h2-dev-source"></div><div class="h2-dev-saveoff">진도·이력 미저장</div><button data-h2-dev-home>콘솔</button>';document.body.appendChild(bar)}
    const select=bar.querySelector('[data-h2-dev-select]');
    if(select){const stamp=`${d}:${COURSE.problems.length}`;if(select.dataset.stamp!==stamp){select.dataset.stamp=stamp;select.innerHTML=COURSE.problems.map((x,j)=>`<option value="${j}">${j+1}. ${source5(x)}</option>`).join('')}select.value=String(i)}
    const src=bar.querySelector('.h2-dev-source');if(src)src.textContent=`DAY ${d} · ${i+1}/${COURSE.problems.length} · ${source5(p)}`;
    bar.querySelectorAll('[data-h2-dev-mode]').forEach(b=>b.classList.toggle('active',(b.dataset.h2DevMode==='question'&&runtime.mode==='question'&&state.phase==='learn')||(b.dataset.h2DevMode==='wrong'&&runtime.mode==='explain')||(b.dataset.h2DevMode==='correct'&&runtime.mode==='correct')||(b.dataset.h2DevMode==='intro'&&state.phase==='intro')));
  }
  document.addEventListener('click',e=>{
    const bar=e.target.closest('#h2DevToolbar');if(!bar)return;
    if(e.target.closest('[data-h2-dev-prev]')){setIndex5(currentIndex5()-1,'question');return}
    if(e.target.closest('[data-h2-dev-next]')){setIndex5(currentIndex5()+1,'question');return}
    const m=e.target.closest('[data-h2-dev-mode]');if(m){setPhase5(m.dataset.h2DevMode);return}
    if(e.target.closest('[data-h2-dev-repair-prev]')){repairMove5(-1);return}
    if(e.target.closest('[data-h2-dev-repair-next]')){repairMove5(1);return}
    if(e.target.closest('[data-h2-dev-home]')){location.href='dev.html';return}
  },true);
  document.addEventListener('change',e=>{if(e.target.matches('#h2DevToolbar [data-h2-dev-select]'))setIndex5(Number(e.target.value),'question')},true);
  let mo=null;if(devRequested){mo=new MutationObserver(()=>toolbar5());mo.observe(document.documentElement,{subtree:true,childList:true})}
  function freshStudent5(){
    if(!ready5())return;
    try{state=defaultState()}catch(_){try{const f=defaultState();Object.keys(state).forEach(k=>delete state[k]);Object.assign(state,f)}catch(__){}}
    try{state.sync={...(state.sync||{}),enabled:false};runtime.firebase=null;resetQuestion5();state.phase='intro';render()}catch(_){}
  }
  function boot5(){if(!ready5())return;disablePersistence5();if(devRequested){freshState5();toolbar5()}else freshStudent5()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot5,{once:true});else setTimeout(boot5,0);
})();

/* History2 Focus UX v6.2: full-canvas, left-to-right active-recall map. */
(function(){
  'use strict';
  window.__H2_FOCUS_UX_VERSION__='6.2';
  const esc6=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safe6=(v)=>{try{return typeof escapeHtml==='function'?escapeHtml(v):esc6(v)}catch(_){return esc6(v)}};
  const norm6=(v)=>String(v??'').toLowerCase().replace(/[^0-9a-z가-힣]/g,'');
  function ready6(){try{return typeof COURSE!=='undefined'&&COURSE&&COURSE.previewMap&&Array.isArray(COURSE.previewMap.branches)&&typeof state!=='undefined'}catch(_){return false}}
  function gate6(){
    if(!state.introGate||typeof state.introGate!=='object')state.introGate={};
    for(const k of ['confirmed','revealed','recallDone'])if(!state.introGate[k]||typeof state.introGate[k]!=='object')state.introGate[k]={};
    if(typeof state.introGate.selected!=='string')state.introGate.selected='';
    return state.introGate;
  }
  function concepts6(branch){
    const all=Array.isArray(COURSE.concepts)?COURSE.concepts:[];
    const found=all.filter(c=>c.branch===branch.id).slice(0,4);
    return found.length?found:[{title:branch.label,one:branch.hint||'핵심 개념을 확인합니다.',down:[]}];
  }
  function keyword6(c){const d=Array.isArray(c?.down)?c.down.filter(Boolean):[];return String(d[0]||c?.title||c?.one||'핵심어').trim()}
  function target6(branch){const cs=concepts6(branch),c=cs.find(x=>Array.isArray(x.down)&&x.down.length)||cs[0];return keyword6(c)}
  function focus6(branch,g){
    if(!branch)return `<div class="h2-v6-focus-card empty"><div class="eyebrow">3. 핵심 확인</div><h2>가지를 선택하세요.</h2><div class="fact">왼쪽에서 오른쪽으로 한 경로만 따라갑니다.</div></div>`;
    const cs=concepts6(branch),shown=Math.min(Number(g.revealed[branch.id]||0),cs.length),done=!!g.confirmed[branch.id];
    if(!shown)return `<div class="h2-v6-focus-card empty"><div class="eyebrow">3 → 4. 핵심 확인</div><h2>${safe6(branch.label)}</h2><div class="fact">왼쪽 3열의 <b>첫 핵심어 나타내기</b>를 누르세요. 나타난 핵심어의 설명이 바로 이 자리로 이어집니다.</div></div>`;
    const current=cs[Math.max(0,shown-1)],kw=keyword6(current);
    if(shown<cs.length)return `<div class="h2-v6-focus-card"><div class="eyebrow">${shown} / ${cs.length} · 지금 볼 핵심</div><h2>${safe6(kw)}</h2><div class="fact">${safe6(current.one||current.title||branch.hint||'')}</div><button type="button" class="reveal" data-h2-reveal-concept="${safe6(branch.id)}">다음 핵심어 나타내기 →</button></div>`;
    if(!done)return `<div class="h2-v6-focus-card"><div class="eyebrow">4. 기억해서 출력</div><h2>${safe6(kw)}</h2><div class="fact">${safe6(current.one||current.title||branch.hint||'')}</div><div class="h2-v6-recall"><label>${safe6(branch.label)}에서 방금 본 핵심어 하나를 기억해서 입력하세요.</label><div class="h2-v6-recall-row"><input type="text" data-h2-recall-input="${safe6(branch.id)}" autocomplete="off" spellcheck="false" placeholder="핵심어 입력"><button type="button" data-h2-recall-check="${safe6(branch.id)}">기억 확인</button></div><div class="h2-v6-recall-msg" data-h2-recall-msg="${safe6(branch.id)}"></div></div></div>`;
    return `<div class="h2-v6-focus-card"><div class="eyebrow">4. 기억 확인 완료</div><h2>${safe6(branch.label)}</h2><div class="h2-v6-done">✓ 직접 입력까지 완료했습니다.</div><div class="fact">다음 가지가 자동 선택됩니다. 계속 왼쪽 → 오른쪽으로 진행하세요.</div></div>`;
  }
  function render6(){
    const g=gate6(),branches=COURSE.previewMap.branches||[];
    if(!g.selected&&branches[0])g.selected=branches[0].id;
    const selected=branches.find(b=>b.id===g.selected)||branches[0]||null;
    const confirmed=branches.filter(b=>g.confirmed[b.id]).length,total=branches.length,all=total>0&&confirmed===total;
    const branchNodes=branches.map((b,i)=>`<button type="button" class="h2-v6-branch ${selected?.id===b.id?'selected':''} ${g.confirmed[b.id]?'confirmed':''}" data-h2-branch="${safe6(b.id)}"><span class="num">${i+1}</span><b>${safe6(b.label)}</b><em class="state">${g.confirmed[b.id]?'✓':'›'}</em></button>`).join('');
    const cs=selected?concepts6(selected):[],shown=selected?Math.min(Number(g.revealed[selected.id]||0),cs.length):0;
    const keyNodes=cs.map((c,i)=>{
      const on=shown>i,cur=on&&i===shown-1,ready=shown===0&&i===0,future=!on&&!ready;
      const label=on?safe6(keyword6(c)):(ready?'첫 핵심어 나타내기 →':'다음 단계에서 열림');
      return `<button type="button" class="h2-v6-key ${on?'shown':''} ${cur?'current':''} ${ready?'ready':''} ${future?'future':''}" ${(on||future)?'disabled':''} data-h2-detail-index="${i}"><span class="num">${i+1}</span><b>${label}</b></button>`;
    }).join('');
    return `<div class="h2-intro-v6"><header class="h2-v6-head"><div class="h2-v6-headcopy"><div class="h2-v6-kicker">오늘 먼저 볼 핵심 지도</div><h1>한 방향으로 보고, 기억해서 직접 입력합니다.</h1></div><div class="h2-v6-progress"><b>${confirmed}</b><span>/ ${total} 가지 완료</span></div></header><section class="h2-v6-map" data-h2-v6-map><svg class="h2-v6-guide" aria-hidden="true"></svg><section class="h2-v6-col"><div class="h2-v6-col-label">1. 오늘의 중심</div><div class="h2-v6-root-wrap"><div class="h2-v6-root"><small>오늘의 중심</small><b>${safe6(COURSE.previewMap.root||COURSE.focusMap?.root||'오늘의 지도')}</b></div></div></section><section class="h2-v6-col"><div class="h2-v6-col-label">2. 큰 가지</div><div class="h2-v6-branches">${branchNodes}</div></section><section class="h2-v6-col"><div class="h2-v6-col-label">3. 핵심어</div><div class="h2-v6-keys">${keyNodes}</div></section><section class="h2-v6-col"><div class="h2-v6-col-label">4. 설명 → 직접 입력</div><div class="h2-v6-focus">${focus6(selected,g)}</div></section></section><div class="h2-v6-actions"><button class="primary" id="startStudy" ${all?'':'disabled'}>${all?'문제 시작':`남은 가지 ${total-confirmed}개`}</button><p class="h2-v6-locknote">모든 가지에서 핵심어를 확인하고 한 번 직접 입력하면 문제로 넘어갑니다.</p></div></div>`;
  }
  function wire6(){
    document.querySelectorAll('[data-h2-v6-map]').forEach(map=>{
      const svg=map.querySelector('.h2-v6-guide'),root=map.querySelector('.h2-v6-root'),branch=map.querySelector('.h2-v6-branch.selected'),key=map.querySelector('.h2-v6-key.current')||[...map.querySelectorAll('.h2-v6-key.shown')].pop(),focus=map.querySelector('.h2-v6-focus-card');if(!svg||!root||!branch)return;
      const mr=map.getBoundingClientRect(),point=(el,side)=>{const r=el.getBoundingClientRect();return{x:(side==='r'?r.right:r.left)-mr.left,y:r.top-mr.top+r.height/2}};
      const path=(a,b,cls='')=>`<path class="${cls}" d="M ${a.x} ${a.y} C ${a.x+52} ${a.y}, ${b.x-52} ${b.y}, ${b.x} ${b.y}"/>`;
      const ps=[path(point(root,'r'),point(branch,'l'),'active')];if(key)ps.push(path(point(branch,'r'),point(key,'l'),'active deep'));if(key&&focus)ps.push(path(point(key,'r'),point(focus,'l'),'deep'));
      svg.setAttribute('viewBox',`0 0 ${Math.max(1,mr.width)} ${Math.max(1,mr.height)}`);svg.innerHTML=ps.join('');
    });
  }
  function settle6(){
    document.querySelectorAll('[data-h2-v6-map]').forEach(map=>{
      const centerIn=(el,box)=>{if(!el||!box)return;const er=el.getBoundingClientRect(),br=box.getBoundingClientRect();if(er.top<br.top||er.bottom>br.bottom){box.scrollTop+=er.top-br.top-(br.height-er.height)/2}};
      const branch=map.querySelector('.h2-v6-branch.selected'),key=map.querySelector('.h2-v6-key.current');
      centerIn(branch,map.querySelector('.h2-v6-branches'));centerIn(key,map.querySelector('.h2-v6-keys'));
      const input=map.querySelector('[data-h2-recall-input]');
      if(input&&document.activeElement!==input){try{input.focus({preventScroll:true})}catch(_){input.focus()}}
    });
  }
  function sync6(){requestAnimationFrame(()=>{wire6();settle6()})}
  function saveRender6(){try{if(typeof saveState==='function')saveState()}catch(_){ }try{if(typeof render==='function')render()}catch(_){ }}
  document.addEventListener('click',e=>{
    if(!ready6())return;
    const ready=e.target.closest('.h2-v6-key.ready');if(ready){const g=gate6(),id=g.selected,b=(COURSE.previewMap.branches||[]).find(x=>x.id===id);if(!b)return;g.revealed[id]=Math.min(concepts6(b).length,Number(g.revealed[id]||0)+1);saveRender6();return}
  },true);
  function install6(){
    if(!ready6())return false;
    document.body.classList.add('h2-ux-v6');
    try{renderIntro=render6;window.__H2_INTRO_V6__=true}catch(_){return false}
    try{if(state.phase==='intro'&&typeof render==='function')render()}catch(_){ }
    sync6();return true;
  }
  let tries=0;function boot6(){if(install6())return;if(++tries<80)setTimeout(boot6,50)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot6,{once:true});else boot6();
  const mo=new MutationObserver(ms=>{const meaningful=ms.some(m=>!(m.target instanceof Element&&m.target.closest('.h2-v6-guide')));if(meaningful)sync6()});mo.observe(document.documentElement,{subtree:true,childList:true});window.addEventListener('resize',sync6,{passive:true});
})();
