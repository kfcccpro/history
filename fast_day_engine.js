(function(){
  'use strict';
  const app=document.getElementById('app');
  const params=new URLSearchParams(location.search);
  const day=String(params.get('day')||'7').replace(/[^0-9]/g,'')||'7';
  const dayNum=Number(day);
  const sourceFile=dayNum===11
    ? 'korean_history2_day11_summary_fast_content.js'
    : (dayNum>=12&&dayNum<=18
      ? `korean_history2_day${dayNum-1}_fast_content.js`
      : `korean_history2_day${day}_fast_content.js`);
  const script=document.createElement('script');
  script.src=sourceFile;
  script.onload=boot;
  script.onerror=()=>fatal(`Day ${day} 콘텐츠를 불러오지 못했습니다.`);
  document.head.appendChild(script);

  function fatal(msg){app.innerHTML=`<div class="shell"><div></div><section class="card"><h1 class="title">${esc(msg)}</h1><button class="primary" id="goHub">전체 목록</button></section><div></div></div>`;const b=document.getElementById('goHub');if(b)b.onclick=()=>location.href='fast_index.html'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]))}

  function ensureDiagnosisStyles(){
    if(document.getElementById('fastDepthDiagnosisStyles'))return;
    const st=document.createElement('style');
    st.id='fastDepthDiagnosisStyles';
    st.textContent=`
      .fast-diagnosis{display:grid;gap:13px;padding:19px 21px;border:1px solid #d7e4ee;border-radius:19px;background:#f7fafc}
      .fast-diagnosis-head{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
      .fast-diagnosis-kicker{font-size:18px;font-weight:1000;color:#b42318;letter-spacing:.01em}
      .fast-diagnosis-depth{display:inline-flex;align-items:center;gap:7px;border-radius:999px;padding:8px 12px;background:#eaf4fc;color:#225f91;font-size:17px;font-weight:1000}
      .fast-diagnosis-main{font-size:clamp(21px,1.8vw,27px);line-height:1.5;font-weight:950;color:#233e5c;word-break:keep-all}
      .fast-diagnosis-picked{font-size:18px;line-height:1.5;font-weight:820;color:#61758b;word-break:keep-all}
      .fast-depth-ladder{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:9px}
      .fast-depth-step{min-height:62px;border:2px solid #e0e8ef;border-radius:14px;background:#fff;color:#718297;display:grid;place-items:center;text-align:center;padding:8px;font-size:16px;line-height:1.3;font-weight:950;word-break:keep-all}
      .fast-depth-step.on{border-color:#6fa8cf;background:#eaf4fc;color:#1e6498;box-shadow:0 0 0 3px rgba(67,151,214,.07)}
      .fast-depth-step.before{background:#f2f6f9;color:#5f7389}
      .fast-repair-focus{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;padding:15px 17px;border-radius:16px;background:#fff8e8;border:1px solid #efd69e}
      .fast-repair-focus b{font-size:17px;color:#8a5b18;white-space:nowrap}.fast-repair-focus span{font-size:19px;line-height:1.5;font-weight:900;color:#674c22;word-break:keep-all}
      @media(max-width:820px){.fast-depth-ladder{grid-template-columns:1fr 1fr}.fast-diagnosis-main{font-size:21px}.fast-diagnosis-picked{font-size:17px}.fast-repair-focus{grid-template-columns:1fr;gap:5px}}
      @media(orientation:landscape) and (max-height:700px){.fast-diagnosis{gap:8px;padding:13px 15px}.fast-diagnosis-kicker{font-size:16px}.fast-diagnosis-depth{font-size:15px;padding:6px 9px}.fast-diagnosis-main{font-size:18px}.fast-diagnosis-picked{font-size:16px}.fast-depth-step{min-height:48px;font-size:14px}.fast-repair-focus{padding:10px 12px}.fast-repair-focus b{font-size:15px}.fast-repair-focus span{font-size:17px}}
    `;
    document.head.appendChild(st);
  }

  function boot(){
    ensureDiagnosisStyles();
    const C=window.HISTORY2_FAST_CONTENT;
    if(!C||!Array.isArray(C.questions)||!C.questions.length)return fatal('콘텐츠 형식이 올바르지 않습니다.');
    const key=`history2-fast-day-${day}`;
    const emptyState=()=>({phase:'intro',index:0,wrong:{},needsRetry:false,repairOxMiss:false,answered:null,history:[],repairLog:[],lastDiagnosis:null,updatedAt:0,lastQuestionId:null,finishedAt:0});
    let state=load()||emptyState();
    normalize();
    if(state.index>=C.questions.length){state.phase='done';state.index=C.questions.length;if(!state.finishedAt)state.finishedAt=Date.now()}

    function normalize(){
      if(!state||typeof state!=='object')state=emptyState();
      state.wrong=state.wrong&&typeof state.wrong==='object'?state.wrong:{};
      state.history=Array.isArray(state.history)?state.history:[];
      state.repairLog=Array.isArray(state.repairLog)?state.repairLog:[];
      state.lastDiagnosis=state.lastDiagnosis&&typeof state.lastDiagnosis==='object'?state.lastDiagnosis:null;
      state.updatedAt=Number(state.updatedAt||0);
      state.finishedAt=Number(state.finishedAt||0);
      if(typeof state.needsRetry!=='boolean')state.needsRetry=false;
      if(typeof state.repairOxMiss!=='boolean')state.repairOxMiss=false;
      if(!Number.isInteger(state.index)||state.index<0)state.index=0;
    }
    function load(){try{return JSON.parse(localStorage.getItem(key)||'null')}catch(_){return null}}
    function save(){
      try{
        state.updatedAt=Date.now();
        const item=q();state.lastQuestionId=item&&item.id?item.id:null;
        localStorage.setItem(key,JSON.stringify(state));
      }catch(_){ }
    }
    function reset(){try{localStorage.removeItem(key)}catch(_){} state=emptyState();render()}
    function q(){return C.questions[state.index]}
    function progress(){return Math.min(state.index,C.questions.length)}
    function eventId(kind,item){return `${kind}-${day}-${item&&item.id?item.id:'q'}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`}
    function shell(content){
      return `<div class="shell"><header class="top"><div><div class="kicker">${esc(C.unit)} · Day ${dayNum}</div><h1 class="title">${esc(C.title)}</h1></div><div class="progress"><b>${progress()}</b> / ${C.questions.length}</div></header>${content}<footer class="foot">빠른 학습 모드 · 필요한 내용만</footer></div>`;
    }

    function diagnosisFor(item,pickedIndex){
      const quality=window.History2FastQuestionQuality;
      if(quality&&typeof quality.diagnose==='function')return quality.diagnose(item,pickedIndex);
      const text=`${item.q||''} ${item.concept||''}`;
      let depth='D3',skill='개념과 보기 연결',label='관계 연결';
      if(/옳지 않은|아닌 것은|잘못|구별|해당하지/.test(text)){
        depth='D4';skill='비슷한 보기 구별';label='보기 구별·문제 적용';
      }else if(/연도|시기|순서|직후|이후|이전|먼저|나중|몇 년|언제/.test(text)){
        depth='D3';skill='시기·순서 연결';label='관계·순서 연결';
      }else if(/결과|배경|원인|영향|이어|계기|때문/.test(text)){
        depth='D3';skill='원인·결과 연결';label='관계·순서 연결';
      }else if(/인물|누가|중심|주도|이끈|조합/.test(text)){
        depth='D3';skill='인물·활동 연결';label='관계·순서 연결';
      }else if(/단체|기관|회의|정책|제도|사건|운동|무엇|특징|설명/.test(text)){
        depth='D2';skill='핵심 개념·특징 확인';label='뜻·핵심 사실';
      }
      const picked=String(item.options&&item.options[pickedIndex]||'').trim();
      const correct=String(item.options&&item.options[item.answer]||'').trim();
      const focus=String(item.recovery&&item.recovery.path&&item.recovery.path[item.recovery.path.length-1]||item.concept||'핵심 개념').trim();
      return {
        depth,skill,label,picked,correct,focus,
        message:`${item.concept}에서 ${skill} 단계가 흔들린 것으로 보입니다. 지금은 이 부분만 복구합니다.`
      };
    }

    function depthRank(depth){return {D1:1,D2:2,D3:3,D4:4}[depth]||3}
    function diagnosisHtml(d){
      const rank=depthRank(d&&d.depth);
      const steps=[
        ['D1','대상 알아보기'],
        ['D2','뜻·핵심 사실'],
        ['D3','관계·순서 연결'],
        ['D4','보기 구별·문제 적용']
      ];
      const ladder=steps.map((s,i)=>`<div class="fast-depth-step ${i+1===rank?'on':(i+1<rank?'before':'')}">${esc(s[0])}<br>${esc(s[1])}</div>`).join('');
      return `<div class="fast-diagnosis"><div class="fast-diagnosis-head"><div class="fast-diagnosis-kicker">오답 진단 · 어디서 막혔는지</div><div class="fast-diagnosis-depth">${esc(d.depth)} · ${esc(d.label)}</div></div><div class="fast-diagnosis-main">${esc(d.message)}</div>${d.picked?`<div class="fast-diagnosis-picked">내가 고른 보기 · ${esc(d.picked)}</div>`:''}<div class="fast-depth-ladder">${ladder}</div></div><div class="fast-repair-focus"><b>이번에 복구할 것</b><span>${esc(d.focus)}</span></div>`;
    }

    function render(){
      if(state.phase==='intro')return renderIntro();
      if(state.phase==='repair')return renderRepair();
      if(state.phase==='done')return renderDone();
      renderQuestion();
    }
    function renderIntro(){
      const branches=(C.branches||[]).map((b,i)=>`<div class="branch"><em>${i+1}</em>${esc(b)}</div>`).join('');
      app.innerHTML=shell(`<section class="card intro-card"><div class="intro-lead">큰 흐름만 보고 바로 문제로 들어갑니다.</div><div class="branches">${branches}</div><div class="intro-note">틀린 문제만 짧게 복구하고 다시 풉니다.</div><button class="primary" id="start">문제 시작</button><button class="small" id="hub">전체 Day 목록</button></section>`);
      app.querySelector('#start').onclick=()=>{state.phase='question';save();render()};
      app.querySelector('#hub').onclick=()=>location.href='fast_index.html';
    }
    function renderQuestion(){
      const item=q(); if(!item){state.phase='done';if(!state.finishedAt)state.finishedAt=Date.now();save();return render()}
      const answered=state.answered;
      const choices=item.options.map((o,i)=>{
        const cls=answered===null||answered===undefined?'':(i===item.answer?' correct':(i===answered?' wrong':''));
        return `<button class="choice${cls}" data-i="${i}" ${answered!==null&&answered!==undefined?'disabled':''}><span class="n">${i+1}</span><span>${esc(o)}</span></button>`;
      }).join('');
      let fb='';
      if(answered!==null&&answered!==undefined){
        const good=answered===item.answer;
        fb=`<div class="feedback ${good?'good':'bad'}"><strong>${good?'정답':'어디서 막혔는지 확인합니다'}</strong><span>${esc(good?item.why:(state.lastDiagnosis&&state.lastDiagnosis.message||item.recovery.clue))}</span></div>${good?'<button class="next" id="next">다음 →</button>':''}`;
      }
      app.innerHTML=shell(`<section class="card question-card"><div class="qmeta"><span class="concept">${esc(item.branch)} · ${esc(item.concept)}</span><span>${state.index+1} / ${C.questions.length}</span></div><div class="qtext">${esc(item.q)}</div><div class="choices">${choices}</div>${fb}</section>`);
      app.querySelectorAll('.choice').forEach(btn=>btn.onclick=()=>answer(Number(btn.dataset.i)));
      const next=app.querySelector('#next');if(next)next.onclick=advance;
      if(answered!==null&&answered!==undefined&&answered!==item.answer)setTimeout(()=>{state.phase='repair';state.answered=null;save();render()},650);
    }
    function answer(i){
      const item=q();if(!item)return;
      const wasRepair=!!state.needsRetry;
      state.answered=i;
      const correct=i===item.answer;
      if(!correct)state.lastDiagnosis=diagnosisFor(item,i);else state.lastDiagnosis=null;
      state.history.push({id:eventId('a',item),questionId:item.id,branch:item.branch,concept:item.concept,choice:i,correct,afterRepair:wasRepair,diagnosis:correct?null:state.lastDiagnosis,at:Date.now()});
      if(!correct){state.wrong[item.branch]=(state.wrong[item.branch]||0)+1;state.needsRetry=true}
      save();render();
    }
    function advance(){
      state.index++;state.answered=null;state.needsRetry=false;state.repairOxMiss=false;state.lastDiagnosis=null;
      state.phase=state.index>=C.questions.length?'done':'question';
      if(state.phase==='done'&&!state.finishedAt)state.finishedAt=Date.now();
      save();render();
    }
    function renderRepair(){
      const item=q();const r=item.recovery;const path=(r.path||[]).map((p,i)=>`${i?'<i>→</i>':''}<span>${esc(p)}</span>`).join('');
      const miss=state.repairOxMiss;
      const d=state.lastDiagnosis||diagnosisFor(item,-1);
      app.innerHTML=shell(`<section class="card repair-card">${diagnosisHtml(d)}<div class="repair-title">필요한 개념만 다시 봅니다.</div><div class="path">${path}</div><div class="clue">${esc(r.clue)}</div><div class="judge"><div class="judge-label">이제 핵심을 이해했는지 O/X로 확인</div><div class="judge-statement">${esc(r.ox.text)}</div><div class="ox"><button class="o" data-v="1"><strong>O</strong>맞다</button><button class="x" data-v="0"><strong>X</strong>아니다</button></div>${miss?`<div class="correction">${esc(r.ox.correction||r.clue)}</div><div class="repair-help">이 부분이 아직 흔들립니다. 설명을 보고 한 번 더 판단하세요.</div>`:''}</div></section>`);
      app.querySelectorAll('[data-v]').forEach(btn=>btn.onclick=()=>judge(btn.dataset.v==='1'));
    }
    function judge(v){
      const item=q();if(!item)return;
      const correct=v===!!item.recovery.ox.answer;
      state.repairLog.push({id:eventId('r',item),questionId:item.id,branch:item.branch,concept:item.concept,picked:v,correct,diagnosis:state.lastDiagnosis,at:Date.now()});
      if(correct){state.phase='question';state.answered=null;state.repairOxMiss=false;save();render()}
      else{state.repairOxMiss=true;save();render()}
    }
    function renderDone(){
      if(!state.finishedAt){state.finishedAt=Date.now();save()}
      const weak=Object.entries(state.wrong||{}).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>0);
      const weakHtml=weak.length?`<div class="weak">${weak.map(([b,n])=>`<span>${esc(b)} ${n}회</span>`).join('')}</div>`:'<div class="score">오답 없이 완료했습니다.</div>';
      const nextDay=dayNum>=7&&dayNum<18?dayNum+1:null;
      const nextButton=nextDay?`<button class="primary" id="nextDay">Day ${nextDay} 바로 시작 →</button>`:'';
      app.innerHTML=shell(`<section class="card done-card"><div class="done-title">Day ${dayNum} 완료</div><div class="score">${C.questions.length}문제 학습 완료</div>${weakHtml}${nextButton}<button class="small" id="hub">전체 Day 목록</button><button class="small" id="again">이 Day 다시 풀기</button></section>`);
      const n=app.querySelector('#nextDay');if(n)n.onclick=()=>location.href=`fast_day.html?day=${nextDay}`;
      app.querySelector('#hub').onclick=()=>location.href='fast_index.html';
      app.querySelector('#again').onclick=reset;
    }
    render();
  }
})();
