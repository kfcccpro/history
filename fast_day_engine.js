(function(){
  'use strict';
  const app=document.getElementById('app');
  const params=new URLSearchParams(location.search);
  const day=String(params.get('day')||'7').replace(/[^0-9]/g,'')||'7';
  const dayNum=Number(day);
  const script=document.createElement('script');
  script.src=`korean_history2_day${day}_fast_content.js`;
  script.onload=boot;
  script.onerror=()=>fatal(`Day ${day} 콘텐츠를 불러오지 못했습니다.`);
  document.head.appendChild(script);

  function fatal(msg){app.innerHTML=`<div class="shell"><div></div><section class="card"><h1 class="title">${esc(msg)}</h1><button class="primary" id="goHub">전체 목록</button></section><div></div></div>`;const b=document.getElementById('goHub');if(b)b.onclick=()=>location.href='fast_index.html'}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function boot(){
    const C=window.HISTORY2_FAST_CONTENT;
    if(!C||String(C.day)!==day||!Array.isArray(C.questions)||!C.questions.length)return fatal('콘텐츠 형식이 올바르지 않습니다.');
    const key=`history2-fast-day-${day}`;
    let state=load()||{phase:'intro',index:0,wrong:{},needsRetry:false,repairOxMiss:false,answered:null};
    if(state.index>=C.questions.length)state={phase:'done',index:C.questions.length,wrong:state.wrong||{}};

    function load(){try{return JSON.parse(sessionStorage.getItem(key)||'null')}catch(_){return null}}
    function save(){try{sessionStorage.setItem(key,JSON.stringify(state))}catch(_){}}
    function reset(){try{sessionStorage.removeItem(key)}catch(_){} state={phase:'intro',index:0,wrong:{},needsRetry:false,repairOxMiss:false,answered:null};render()}
    function q(){return C.questions[state.index]}
    function progress(){return Math.min(state.index,C.questions.length)}
    function shell(content){
      return `<div class="shell"><header class="top"><div><div class="kicker">${esc(C.unit)} · Day ${esc(C.day)}</div><h1 class="title">${esc(C.title)}</h1></div><div class="progress"><b>${progress()}</b> / ${C.questions.length}</div></header>${content}<footer class="foot">빠른 학습 모드 · 필요한 내용만</footer></div>`;
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
      const item=q(); if(!item){state.phase='done';save();return render()}
      const answered=state.answered;
      const choices=item.options.map((o,i)=>{
        const cls=answered===null||answered===undefined?'':(i===item.answer?' correct':(i===answered?' wrong':''));
        return `<button class="choice${cls}" data-i="${i}" ${answered!==null&&answered!==undefined?'disabled':''}><span class="n">${i+1}</span><span>${esc(o)}</span></button>`;
      }).join('');
      let fb='';
      if(answered!==null&&answered!==undefined){
        const good=answered===item.answer;
        fb=`<div class="feedback ${good?'good':'bad'}"><strong>${good?'정답':'여기만 다시'}</strong><span>${esc(good?item.why:item.recovery.clue)}</span></div>${good?'<button class="next" id="next">다음 →</button>':''}`;
      }
      app.innerHTML=shell(`<section class="card question-card"><div class="qmeta"><span class="concept">${esc(item.branch)} · ${esc(item.concept)}</span><span>${state.index+1} / ${C.questions.length}</span></div><div class="qtext">${esc(item.q)}</div><div class="choices">${choices}</div>${fb}</section>`);
      app.querySelectorAll('.choice').forEach(btn=>btn.onclick=()=>answer(Number(btn.dataset.i)));
      const next=app.querySelector('#next');if(next)next.onclick=advance;
      if(answered!==null&&answered!==undefined&&answered!==item.answer)setTimeout(()=>{state.phase='repair';state.answered=null;save();render()},520);
    }
    function answer(i){
      const item=q(); state.answered=i;
      if(i!==item.answer){state.wrong[item.branch]=(state.wrong[item.branch]||0)+1;state.needsRetry=true}
      save();render();
    }
    function advance(){state.index++;state.answered=null;state.needsRetry=false;state.repairOxMiss=false;state.phase=state.index>=C.questions.length?'done':'question';save();render()}
    function renderRepair(){
      const item=q();const r=item.recovery;const path=(r.path||[]).map((p,i)=>`${i?'<i>→</i>':''}<span>${esc(p)}</span>`).join('');
      const miss=state.repairOxMiss;
      app.innerHTML=shell(`<section class="card repair-card"><div class="repair-title">이 문제는 여기만 다시 보면 됩니다.</div><div class="path">${path}</div><div class="clue">${esc(r.clue)}</div><div class="judge"><div class="judge-label">맞으면 O, 아니면 X</div><div class="judge-statement">${esc(r.ox.text)}</div><div class="ox"><button class="o" data-v="1"><strong>O</strong>맞다</button><button class="x" data-v="0"><strong>X</strong>아니다</button></div>${miss?`<div class="correction">${esc(r.ox.correction||r.clue)}</div><div class="repair-help">한 번 더 판단하세요.</div>`:''}</div></section>`);
      app.querySelectorAll('[data-v]').forEach(btn=>btn.onclick=()=>judge(btn.dataset.v==='1'));
    }
    function judge(v){
      const item=q();
      if(v===!!item.recovery.ox.answer){state.phase='question';state.answered=null;state.repairOxMiss=false;save();render()}
      else{state.repairOxMiss=true;save();render()}
    }
    function renderDone(){
      const weak=Object.entries(state.wrong||{}).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>0);
      const weakHtml=weak.length?`<div class="weak">${weak.map(([b,n])=>`<span>${esc(b)} ${n}회</span>`).join('')}</div>`:'<div class="score">오답 없이 완료했습니다.</div>';
      const nextDay=dayNum>=7&&dayNum<17?dayNum+1:null;
      const nextButton=nextDay?`<button class="primary" id="nextDay">Day ${nextDay} 바로 시작 →</button>`:'';
      app.innerHTML=shell(`<section class="card done-card"><div class="done-title">Day ${esc(C.day)} 완료</div><div class="score">${C.questions.length}문제 학습 완료</div>${weakHtml}${nextButton}<button class="small" id="hub">전체 Day 목록</button><button class="small" id="again">이 Day 다시 풀기</button></section>`);
      const n=app.querySelector('#nextDay');if(n)n.onclick=()=>location.href=`fast_day.html?day=${nextDay}`;
      app.querySelector('#hub').onclick=()=>location.href='fast_index.html';
      app.querySelector('#again').onclick=reset;
    }
    render();
  }
})();
