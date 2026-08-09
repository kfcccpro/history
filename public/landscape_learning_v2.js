(function(){
  'use strict';
  document.body && document.body.classList.add('h2-ux-v2');

  const esc = (v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const safeEscape = (v)=>{ try{return typeof escapeHtml==='function'?escapeHtml(v):esc(v)}catch(_){return esc(v)} };

  /* ---------- landscape guard ---------- */
  function ensureOrientationGate(){
    let gate=document.getElementById('h2OrientationGate');
    if(!gate){
      gate=document.createElement('div');gate.id='h2OrientationGate';gate.className='h2-orientation-gate';gate.setAttribute('role','dialog');gate.setAttribute('aria-modal','true');
      gate.innerHTML='<div class="h2-orientation-card"><div class="h2-orientation-icon" aria-hidden="true"></div><h2>가로 화면으로 돌려주세요</h2><p>이 학습앱은 문제와 풀이를 한 화면에서 보기 위해 가로 화면을 기준으로 배치했습니다. 기기를 가로로 돌리면 바로 이어집니다.</p><button type="button" id="h2TryLandscape">가로모드 시도</button></div>';
      document.body.appendChild(gate);
      gate.querySelector('#h2TryLandscape').addEventListener('click',async()=>{
        try{ if(document.documentElement.requestFullscreen && !document.fullscreenElement) await document.documentElement.requestFullscreen(); }catch(_){ }
        try{ if(screen.orientation && screen.orientation.lock) await screen.orientation.lock('landscape'); }catch(_){ }
        updateOrientationGate();
      });
    }
    return gate;
  }
  function isTouchPrimary(){return matchMedia('(pointer:coarse)').matches || (navigator.maxTouchPoints||0)>1}
  function updateOrientationGate(){
    const gate=ensureOrientationGate();
    const portrait=matchMedia('(orientation:portrait)').matches;
    const touch=isTouchPrimary();
    gate.classList.toggle('show',touch&&portrait);
  }
  try{
    if(matchMedia('(display-mode: standalone)').matches && screen.orientation && screen.orientation.lock){screen.orientation.lock('landscape').catch(()=>{});}
  }catch(_){ }
  window.addEventListener('resize',updateOrientationGate,{passive:true});
  window.addEventListener('orientationchange',()=>setTimeout(updateOrientationGate,80),{passive:true});

  /* ---------- intro mind-map gate ---------- */
  function hasLearningGlobals(){
    try{return typeof COURSE!=='undefined' && COURSE && COURSE.previewMap && Array.isArray(COURSE.previewMap.branches) && typeof state!=='undefined' && typeof renderIntro==='function'}catch(_){return false}
  }
  function ensureIntroGateState(){
    if(!state.introGate || typeof state.introGate!=='object')state.introGate={confirmed:{},selected:''};
    if(!state.introGate.confirmed || typeof state.introGate.confirmed!=='object')state.introGate.confirmed={};
    return state.introGate;
  }
  function branchConcepts(branch){
    const all=Array.isArray(COURSE.concepts)?COURSE.concepts:[];
    return all.filter(c=>c.branch===branch.id).slice(0,6);
  }
  function renderConceptDrawer(branch,gate){
    if(!branch)return '<section class="h2-concept-drawer"><div class="h2-concept-empty">마인드맵의 가지를 하나 눌러보세요.<br>눌러야 아래에 연결 개념이 나타납니다.</div></section>';
    const items=branchConcepts(branch);
    const done=!!gate.confirmed[branch.id];
    const body=items.length?items.map((c,i)=>{
      const chips=(Array.isArray(c.down)?c.down:[]).slice(0,3).map(x=>`<span class="h2-concept-chip">${safeEscape(x)}</span>`).join('');
      return `<article class="h2-concept-item" style="animation-delay:${i*45}ms"><b>${safeEscape(c.title||c.one||branch.label)}</b><p>${safeEscape(c.one||branch.hint||'')}</p>${chips}</article>`;
    }).join(''):`<article class="h2-concept-item"><b>${safeEscape(branch.label)}</b><p>${safeEscape(branch.hint||'이 가지의 핵심 개념을 확인합니다.')}</p></article>`;
    return `<section class="h2-concept-drawer"><div class="h2-concept-head"><div><h2>${safeEscape(branch.label)}</h2><p>${safeEscape(branch.hint||'아래 연결 개념을 읽고 확인하세요.')}</p></div><button type="button" class="h2-branch-confirm ${done?'done':''}" data-h2-confirm-branch="${safeEscape(branch.id)}">${done?'✓ 확인 완료':'이 가지 확인 완료'}</button></div><div class="h2-concept-list">${body}</div></section>`;
  }
  function newRenderIntro(){
    const gate=ensureIntroGateState(),branches=COURSE.previewMap.branches||[],selected=branches.find(b=>b.id===gate.selected)||null;
    const confirmed=branches.filter(b=>gate.confirmed[b.id]).length,total=branches.length,all=total>0&&confirmed===total;
    const nodes=branches.map((b,i)=>`<button type="button" class="h2-map-branch ${gate.selected===b.id?'selected':''} ${gate.confirmed[b.id]?'confirmed':''}" data-h2-branch="${safeEscape(b.id)}" data-h2-map-index="${i}" aria-pressed="${gate.selected===b.id?'true':'false'}">${safeEscape(b.label)}${gate.confirmed[b.id]?'<span class="h2-check">✓</span>':''}</button>`).join('');
    return `<div class="h2-intro-v2"><div class="h2-intro-head"><div><h1 class="screen-title">오늘의 개념 지도</h1><p class="screen-sub">가지를 눌러 연결 개념을 직접 확인해야 문제 풀이가 열립니다.</p></div><div class="h2-intro-progress"><span>필수 확인</span><strong>${confirmed} / ${total}</strong></div></div><section class="h2-map-card"><div class="h2-map-canvas" data-h2-intro-map><svg class="h2-map-wires" aria-hidden="true"></svg><div class="h2-map-root"><b>${safeEscape(COURSE.previewMap.root||COURSE.focusMap?.root||'오늘의 지도')}</b><span>중심 개념</span></div>${nodes}<div class="h2-map-hint">가지를 클릭 → 하단 개념 확인</div></div></section>${renderConceptDrawer(selected,gate)}<div class="h2-intro-actions"><button class="primary" id="startStudy" ${all?'':'disabled'}>${all?'문제 시작':`개념 ${total-confirmed}가지 더 확인`}</button>${all?'':'<p class="h2-intro-locknote">모든 가지를 직접 확인하면 문제 시작 버튼이 열립니다.</p>'}</div></div>`;
  }
  function installIntroOverride(){
    if(!hasLearningGlobals() || window.__H2_INTRO_OVERRIDE__)return;
    window.__H2_INTRO_OVERRIDE__=true;
    try{renderIntro=newRenderIntro;}catch(_){return}
    try{if(state.phase==='intro' && typeof render==='function')render();}catch(_){ }
  }
  function layoutIntroMindmap(){
    document.querySelectorAll('[data-h2-intro-map]').forEach(canvas=>{
      const root=canvas.querySelector('.h2-map-root'),nodes=[...canvas.querySelectorAll('.h2-map-branch')],svg=canvas.querySelector('.h2-map-wires');
      if(!root||!svg||!nodes.length)return;
      const w=canvas.clientWidth,h=canvas.clientHeight,cx=w/2,cy=h/2;
      const rx=Math.max(150,w*.38),ry=Math.max(92,h*.34);
      nodes.forEach((node,i)=>{
        const angle=(-Math.PI/2)+(Math.PI*2*i/nodes.length);
        let x=cx+Math.cos(angle)*rx,y=cy+Math.sin(angle)*ry;
        const halfW=Math.min(95,w*.125),halfH=32;
        x=Math.max(halfW+10,Math.min(w-halfW-10,x));y=Math.max(halfH+10,Math.min(h-halfH-16,y));
        node.style.left=x+'px';node.style.top=y+'px';
      });
      const r=canvas.getBoundingClientRect(),rr=root.getBoundingClientRect();
      const rxc=rr.left-r.left+rr.width/2,ryc=rr.top-r.top+rr.height/2;
      svg.setAttribute('viewBox',`0 0 ${w} ${h}`);
      svg.innerHTML=nodes.map(node=>{
        const nr=node.getBoundingClientRect(),nx=nr.left-r.left+nr.width/2,ny=nr.top-r.top+nr.height/2;
        const mx=(rxc+nx)/2,cls=['h2-map-wire',node.classList.contains('selected')?'selected':'',node.classList.contains('confirmed')?'confirmed':''].filter(Boolean).join(' ');
        return `<path class="${cls}" d="M ${rxc.toFixed(1)} ${ryc.toFixed(1)} C ${mx.toFixed(1)} ${ryc.toFixed(1)}, ${mx.toFixed(1)} ${ny.toFixed(1)}, ${nx.toFixed(1)} ${ny.toFixed(1)}"></path>`;
      }).join('');
    });
  }

  /* ---------- staged keyword chain ---------- */
  function installKeywordOverride(){
    try{
      if(typeof renderCorrectRepair!=='function' || window.__H2_KEYWORD_OVERRIDE__)return;
      window.__H2_KEYWORD_OVERRIDE__=true;
      const original=renderCorrectRepair;
      renderCorrectRepair=function(p){
        const w=p&&p.feedback&&p.feedback.correctWhy;
        if(!w||!Array.isArray(w.chain)||!w.chain.length)return original(p);
        const key=String(p.id||'')+':'+String(runtime.feedbackStep||0);
        if(runtime.__h2ChainKey!==key){runtime.__h2ChainKey=key;runtime.__h2ChainShown=1;}
        const shown=Math.max(1,Math.min(Number(runtime.__h2ChainShown||1),w.chain.length)),done=shown>=w.chain.length;
        const chain=w.chain.slice(0,shown).map((x,i)=>`${i?'<em>→</em>':''}<span class="h2-chain-item ${i===shown-1&&shown>1?'is-new':''}">${safeEscape(x)}</span>`).join('');
        const next=!done?`<button type="button" class="h2-chain-next" data-h2-chain-next>다음 연결 나타내기 · ${shown} / ${w.chain.length}</button>`:'';
        const compare=done?`<div class="compare-grid"><div class="compare-box"><b>${safeEscape(p.feedback.compare.left.title)}</b><p>${safeEscape(p.feedback.compare.left.text)}</p></div><div class="compare-box"><b>${safeEscape(p.feedback.compare.right.title)}</b><p>${safeEscape(p.feedback.compare.right.text)}</p></div></div><div class="repair-tip">${safeEscape(p.feedback.compare.tip)}</div><button class="primary" id="repairNext" data-delay="650">키워드 직접 입력</button>`:'';
        return `<div class="repair-focus-label">정답 핵심</div><h2 class="focus-keyword">${safeEscape(w.title)}</h2><div class="focus-fact">${safeEscape(w.text)}</div><div class="h2-chain-stage"><div class="h2-key-chain">${chain}</div>${next}</div>${compare}`;
      };
    }catch(_){ }
  }

  /* ---------- original image zoom ---------- */
  function openImageZoom(src,alt){
    const old=document.getElementById('h2ImageZoom');if(old)old.remove();
    const box=document.createElement('div');box.id='h2ImageZoom';box.className='h2-image-zoom';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');
    box.innerHTML=`<div class="h2-image-zoom-head"><button type="button" data-h2-close-zoom aria-label="문제 크게 보기 닫기">닫기</button></div><div class="h2-image-zoom-body"><img src="${src}" alt="${safeEscape(alt||'문제 원문 크게 보기')}"></div>`;
    document.body.appendChild(box);box.querySelector('[data-h2-close-zoom]').focus();
  }

  /* ---------- global interactions ---------- */
  document.addEventListener('click',e=>{
    const branch=e.target.closest('[data-h2-branch]');
    if(branch&&hasLearningGlobals()){
      const gate=ensureIntroGateState();gate.selected=branch.dataset.h2Branch;try{saveState(false)}catch(_){try{localStorage.setItem('history2-intro-gate-temp',JSON.stringify(gate))}catch(__){}};try{render()}catch(_){ }return;
    }
    const confirm=e.target.closest('[data-h2-confirm-branch]');
    if(confirm&&hasLearningGlobals()){
      const gate=ensureIntroGateState();gate.confirmed[confirm.dataset.h2ConfirmBranch]=true;gate.selected=confirm.dataset.h2ConfirmBranch;try{saveState()}catch(_){ };try{render()}catch(_){ }return;
    }
    const chain=e.target.closest('[data-h2-chain-next]');
    if(chain){try{runtime.__h2ChainShown=Number(runtime.__h2ChainShown||1)+1;render()}catch(_){ }return;}
    const img=e.target.closest('.original-question img');if(img){openImageZoom(img.currentSrc||img.src,img.alt);return;}
    if(e.target.closest('[data-h2-close-zoom]')||e.target.id==='h2ImageZoom'){document.getElementById('h2ImageZoom')?.remove();return;}
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape')document.getElementById('h2ImageZoom')?.remove()});

  let raf=0;function enhance(){cancelAnimationFrame(raf);raf=requestAnimationFrame(()=>{layoutIntroMindmap();});}
  const observer=new MutationObserver(ms=>{if(ms.some(m=>{const t=m.target;return !(t&&t.nodeType===1&&t.closest&&t.closest('.h2-map-wires'));}))enhance();});observer.observe(document.documentElement,{subtree:true,childList:true});
  window.addEventListener('resize',enhance,{passive:true});

  function boot(){
    document.body.classList.add('h2-ux-v2');updateOrientationGate();installIntroOverride();installKeywordOverride();enhance();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  setTimeout(()=>{installIntroOverride();installKeywordOverride();enhance();},0);
})();
