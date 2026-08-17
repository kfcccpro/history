(function(){
'use strict';

const QA_VERSION='2026-08-17-q1';
const pathname=location.pathname||'';
const day=Number(new URLSearchParams(location.search).get('day')||0);

function migrateTransientState(key,isAdaptive){
  try{
    const raw=localStorage.getItem(key);
    if(!raw)return;
    const state=JSON.parse(raw);
    if(!state||typeof state!=='object'||state._questionQaVersion===QA_VERSION)return;

    // Answer positions were deterministically reordered by the question-quality layer.
    // Preserve history/progress, but never reuse a transient old option index or repair screen.
    if((state.phase==='question'&&state.answered!==null&&state.answered!==undefined)||state.phase==='repair'){
      state.phase='question';
      state.answered=null;
      state.lastDiagnosis=null;
      state.repairOxMiss=false;
      if(!isAdaptive)state.needsRetry=false;
    }
    state._questionQaVersion=QA_VERSION;
    localStorage.setItem(key,JSON.stringify(state));
  }catch(_){ }
}

if(day>=7&&day<=18){
  if(/\/adaptive_fast_review\.html$/i.test(pathname)){
    migrateTransientState(`history2-adaptive-fast-review-${day}`,true);
  }else if(/\/fast_day\.html$/i.test(pathname)){
    migrateTransientState(`history2-fast-day-${day}`,false);
  }
}

let value;
try{
  Object.defineProperty(window,'HISTORY2_FAST_CONTENT',{
    configurable:true,
    enumerable:true,
    get(){return value},
    set(v){
      try{
        const add=(window.HISTORY2_FAST_BOOST||{})[day]||[];
        if(v&&Array.isArray(v.questions)&&add.length){
          const seen=new Set(v.questions.map(q=>q&&q.id));
          const extra=add.filter(q=>q&&q.id&&!seen.has(q.id));
          if(extra.length)v.questions=v.questions.concat(extra);
          const branches=new Set(Array.isArray(v.branches)?v.branches:[]);
          extra.forEach(q=>{if(q.branch)branches.add(q.branch)});
          v.branches=[...branches];
        }
        if(window.applyHistory2FastAccuracy)v=window.applyHistory2FastAccuracy(v)||v;
        if(window.applyHistory2FastQuestionQuality)v=window.applyHistory2FastQuestionQuality(v)||v;
      }catch(_){ }
      value=v;
    }
  });
}catch(_){ }
})();
