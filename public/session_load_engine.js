(function(g){
'use strict';
if(!g.H2Policy||!g.H2ConceptDepth)return;
const DAY=86400000;
const CFG={
  meta:{id:'korean-history2-unit1-session-load',version:'1.0.0'},
  session:{idleResetMs:30*60*1000,maxSessionMs:90*60*1000,releaseWithTiming:2,releaseWithoutTiming:3,maxHistory:50},
  budget:{actions:16,screens:8,proactiveChecks:2,warningActionRatio:.70,warningScreenRatio:.70},
  signals:{slow:{weight:.22,minBaseline:6,recent:3},fast:{weight:.18,minBaseline:6,recent:3},wrong:{weight:.24,recent:3},deep:{weight:.18,recent:4},burden:{weight:.18}},
  overload:{threshold:.65,minAvailable:2,strongSignalCount:3,strongSignalFloor:.55},
  anchor:{maxPerCycle:1}
};
const CURRENT_KEY='history2-unit1-session-load-current-v1';
const HISTORY_KEY='history2-unit1-session-load-history-v1';
function uid(p='sl'){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function clamp(v,a=0,b=1){return Math.max(a,Math.min(b,v))}
function median(a){if(!a.length)return 0;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2}
function getSS(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function setSS(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function getLS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function setLS(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function blank(now=Date.now()){return {id:uid('sess'),startedAt:now,lastActivityAt:now,endedAt:null,closed:false,attempts:[],suppression:{active:false,reason:'',startedAt:null,stableStreak:0,cycle:0,anchorPending:false,anchorServedInCycle:0},suppressed:[],anchors:[],derived:{actions:0,screens:0,proactiveChecks:0,budgetRatio:0,signals:null,score:0,overload:false,budgetExhausted:false},updatedAt:now}}
function parse(v,fallback){try{return v?JSON.parse(v):fallback}catch(e){return fallback}}
function loadHistory(){const a=parse(getLS(HISTORY_KEY),[]);return Array.isArray(a)?a:[]}
function saveHistory(a){setLS(HISTORY_KEY,JSON.stringify((a||[]).slice(-CFG.session.maxHistory)))}
function upsertHistory(s){const a=loadHistory(),i=a.findIndex(x=>x.id===s.id),row=summary(s);if(i>=0)a[i]=row;else a.push(row);saveHistory(a)}
function closeOld(s,now){if(!s)return;const x={...s,closed:true,endedAt:Number(s.lastActivityAt||now),updatedAt:now};upsertHistory(x)}
function loadCurrent(now=Date.now()){
  let s=parse(getSS(CURRENT_KEY),null);
  if(!s||!s.id||s.closed||now-Number(s.lastActivityAt||0)>CFG.session.idleResetMs||now-Number(s.startedAt||0)>CFG.session.maxSessionMs){if(s&&s.id&&!s.closed)closeOld(s,now);s=blank(now);persist(s,false)}
  s.attempts=Array.isArray(s.attempts)?s.attempts:[];s.suppressed=Array.isArray(s.suppressed)?s.suppressed:[];s.anchors=Array.isArray(s.anchors)?s.anchors:[];
  s.suppression=s.suppression||blank(now).suppression;s.derived=s.derived||blank(now).derived;
  return s
}
function persist(s,touch=true){const now=Date.now();if(touch)s.lastActivityAt=now;s.updatedAt=now;setSS(CURRENT_KEY,JSON.stringify(s));upsertHistory(s);return s}
function allStates(){const out=[];for(let d=1;d<=6;d++){try{out.push({day:d,state:H2Policy.readState(d)||{}})}catch(e){}}return out}
function attemptRows(){const out=[];for(const {day,state} of allStates())for(const a of (state.attempts||[]))out.push({...a,day:Number(a.day||day)});return out.sort((a,b)=>Number(a.at||0)-Number(b.at||0))}
function depthRows(){const out=[];for(const {day,state} of allStates())for(const x of (state.conceptDepthLog||[]))out.push({...x,day:Number(x.day||day)});return out.sort((a,b)=>Number(a.at||0)-Number(b.at||0))}
function interventionBurden(s){
  const start=Number(s.startedAt||0),end=Date.now(),seen=new Set();let actions=0,screens=0,proactiveChecks=0;
  function add(id,a,sc,kind){const k=String(id||kind+'-'+a+'-'+sc);if(seen.has(k))return;seen.add(k);actions+=Math.max(0,Number(a||0));screens+=Math.max(0,Number(sc||0));if(['proactive-microcheck','automatic-precheck'].includes(kind))proactiveChecks++}
  for(const {state} of allStates()){
    for(const x of (state.conceptDepthLog||[])){const at=Number(x.endedAt||x.at||0);if(at>=start&&at<=end){const levelN=Math.max(1,Number(x.failedLevels?.length||0)+Number(x.passedLevels?.length||0));add(x.id,x.actions||levelN,Math.min(5,levelN+1),'concept-depth')}}
    for(const x of (state.patternRemediationLog||[])){const at=Number(x.at||0);if(at>=start&&at<=end)add(x.id,x.actions||1,1,'pattern-remediation')}
    for(const x of (state.precheckLog||[])){const at=Number(x.at||0);if(at>=start&&at<=end)add(x.id,x.actions||2,2,'automatic-precheck')}
    for(const x of (state.proactiveMicrocheckLog||[])){const at=Number(x.endedAt||x.startedAt||0);if(at>=start&&at<=end&&x.completed)add(x.id,x.actions||1,1,'proactive-microcheck')}
  }
  for(const x of (s.anchors||[])){if(Number(x.at||0)>=start)add(x.id,x.actions||1,1,'anchor')}
  return {actions,screens,proactiveChecks,actionRatio:actions/CFG.budget.actions,screenRatio:screens/CFG.budget.screens,proactiveRatio:proactiveChecks/CFG.budget.proactiveChecks}
}
function timingBaseline(s){const rows=attemptRows().filter(x=>Number(x.at||0)<Number(s.startedAt||0)&&Number(x.responseTimeMs||0)>0);const vals=rows.map(x=>Number(x.responseTimeMs));return {n:vals.length,median:median(vals.slice(-30))}}
function sessionAttempts(s){return (s.attempts||[]).sort((a,b)=>Number(a.at||0)-Number(b.at||0))}
function isDeep(x){return ['unit','root'].includes(String(x.baseLevel||''))||Number(x.failedLevels?.length||0)>=2}
function signalSnapshot(s){
  const base=timingBaseline(s),ats=sessionAttempts(s),recent=ats.slice(-3),bur=interventionBurden(s),deep=depthRows().filter(x=>Number(x.endedAt||x.at||0)>=Number(s.startedAt||0)&&isDeep(x)).slice(-CFG.signals.deep.recent);
  let slow={score:0,available:false,n:0,detail:'응답시간 기준 표본 부족'},fast={score:0,available:false,n:0,detail:'응답시간 기준 표본 부족'};
  if(base.n>=CFG.signals.slow.minBaseline&&base.median>0&&recent.filter(x=>Number(x.responseTimeMs||0)>0).length>=2){
    const rv=recent.map(x=>Number(x.responseTimeMs||0)).filter(x=>x>0),ratio=median(rv)/base.median;slow={score:ratio>=1.8?1:ratio>=1.5?.76:ratio>=1.25?.45:0,available:true,n:rv.length,ratio,detail:`최근 중앙값 ${Math.round(ratio*100)}% (개인 기준 대비)`};
    const fastCut=Math.max(1800,base.median*.38),fastRows=recent.filter(x=>Number(x.responseTimeMs||0)>0&&Number(x.responseTimeMs)<fastCut),wrongFast=fastRows.filter(x=>x.correct===false).length;const score=wrongFast>=2?1:wrongFast===1?.65:fastRows.length>=2?.42:0;fast={score,available:true,n:recent.length,fastCount:fastRows.length,wrongFast,cutoffMs:Math.round(fastCut),detail:`최근 빠른 응답 ${fastRows.length}회 / 그중 오답 ${wrongFast}회`}
  }
  let streak=0;for(let i=ats.length-1;i>=0;i--){if(ats[i].correct===false)streak++;else break}const wrong={score:streak>=3?1:streak===2?.72:streak===1?.3:0,available:ats.length>0,n:Math.min(3,ats.length),streak,detail:`연속 오답 ${streak}회`};
  const deepSig={score:deep.length>=3?1:deep.length===2?.82:deep.length===1?.5:0,available:true,n:deep.length,detail:`이번 세션 깊은 복구 ${deep.length}회`};
  const br=Math.max(bur.actionRatio,bur.screenRatio),burden={score:br>=1.25?1:br>=1?.88:br>=.7?.55:br>=.45?.3:0,available:true,n:bur.actions+bur.screens,ratio:br,detail:`추가 행동 ${bur.actions}/${CFG.budget.actions}, 화면 ${bur.screens}/${CFG.budget.screens}`};
  const signals={slow,fast,wrong,deep:deepSig,burden};let ws=0,sum=0,available=0;for(const [k,meta] of Object.entries(CFG.signals)){const x=signals[k];if(!x||!x.available)continue;sum+=Number(meta.weight||0)*Number(x.score||0);ws+=Number(meta.weight||0);available++}const score=ws?sum/ws:0,budgetExhausted=bur.actionRatio>=1||bur.screenRatio>=1||bur.proactiveChecks>=CFG.budget.proactiveChecks,strongCount=Object.values(signals).filter(x=>x&&x.available&&Number(x.score||0)>=CFG.overload.strongSignalFloor).length;const overload=(score>=CFG.overload.threshold&&available>=CFG.overload.minAvailable)||(strongCount>=CFG.overload.strongSignalCount&&score>=CFG.overload.strongSignalFloor);return {score,available,strongCount,signals,burden:bur,budgetExhausted,overload,baseline:base}
}
function refresh(s,allowTransition=true){const snap=signalSnapshot(s);s.derived={...s.derived,actions:snap.burden.actions,screens:snap.burden.screens,proactiveChecks:snap.burden.proactiveChecks,budgetRatio:Math.max(snap.burden.actionRatio,snap.burden.screenRatio),signals:snap.signals,score:snap.score,overload:snap.overload,budgetExhausted:snap.budgetExhausted,baselineN:snap.baseline.n,baselineMedianMs:snap.baseline.median};
  if(allowTransition&&snap.overload&&!s.suppression.active){s.suppression={...s.suppression,active:true,reason:'combined-overload',startedAt:Date.now(),stableStreak:0,cycle:Number(s.suppression.cycle||0)+1,anchorPending:true,anchorServedInCycle:0}}
  persist(s,false);return snap
}
function touch(){const s=loadCurrent();s.lastActivityAt=Date.now();refresh(s);persist(s,false);return s}
function blockKey(kind,day,pid,s){return `${s.id}:${s.suppression.cycle}:${kind}:${day}:${pid}`}
function recordSuppressed(kind,day,pid,reason){const s=loadCurrent(),key=blockKey(kind,day,pid,s);if(!s.suppressed.some(x=>x.key===key)){s.suppressed.push({id:uid('sup'),key,at:Date.now(),kind,day:Number(day||0),problemId:String(pid||''),reason:reason||'session-load'});if(s.suppressed.length>200)s.suppressed=s.suppressed.slice(-200);persist(s)}return true}
function shouldSuppress(kind,day,pid){const s=loadCurrent(),snap=refresh(s,false);if(s.suppression.active){recordSuppressed(kind,day,pid,'인지 부하 억제 중');return true}if(snap.budgetExhausted){recordSuppressed(kind,day,pid,'세션 개입 예산 소진');return true}if(['proactive-microcheck','automatic-precheck'].includes(kind)&&snap.burden.proactiveChecks>=CFG.budget.proactiveChecks){recordSuppressed(kind,day,pid,'선제 개입 예산 소진');return true}return false}
function isImmediateRetry(day,pid){if(g.H2Risk&&typeof H2Risk.isImmediateRetry==='function')return !!H2Risk.isImmediateRetry(Number(day),pid);return false}
function beforeQuestion(day,pid){const s=touch();refresh(s);return {session:s,suppress:s.suppression.active||s.derived.budgetExhausted,anchor:anchorFor(day,pid,s)}}
function anchorFor(day,pid,input){const s=input||loadCurrent();if(!s.suppression.active||!s.suppression.anchorPending||s.suppression.anchorServedInCycle>=CFG.anchor.maxPerCycle||isImmediateRetry(day,pid))return null;const r=H2Policy.route(Number(day),pid);if(!r)return null;const m=r.memory||null;return {day:Number(day),problemId:pid,branchLabel:r.branchLabel,rootLabel:r.rootLabel,conceptTitle:r.conceptTitle,memory:m,kind:m?'keyword':'branch',prompt:m?.prompt||'이 문제의 큰 가지는?',answer:m?.answer||r.branchLabel,accepted:m?[m.answer,...(m.accepted||[])]:[r.branchLabel],options:r.branchOptions||[],hint:m?.hint||''}}
function completeAnchor(day,pid,data){const s=loadCurrent(),r=H2Policy.route(Number(day),pid),row={id:uid('anc'),at:Date.now(),sessionId:s.id,cycle:s.suppression.cycle,day:Number(day),problemId:pid,branchLabel:r?.branchLabel||'',actions:Number(data?.actions||1),firstCorrect:data?.firstCorrect!==false,misses:Number(data?.misses||0),outcome:null};s.anchors.push(row);s.suppression.anchorPending=false;s.suppression.anchorServedInCycle=Number(s.suppression.anchorServedInCycle||0)+1;refresh(s,false);persist(s);return row}
function stableAttempt(s,a){if(!a||!a.correct)return false;const baseN=Number(s.derived.baselineN||0),base=Number(s.derived.baselineMedianMs||0),rt=Number(a.responseTimeMs||0);if(baseN>=6&&base>0&&rt>0)return rt>=Math.max(1200,base*.35)&&rt<=base*1.6;return true}
function recordAttempt(day,pid,a){if(!a)return null;const s=loadCurrent(),prev=s.attempts[s.attempts.length-1],immediateRetry=!!(prev&&prev.problemId===pid&&prev.correct===false&&Number(a.at||Date.now())-Number(prev.at||0)<5*60*1000);const row={id:a.id||uid('att'),at:Number(a.at||Date.now()),day:Number(day),problemId:pid,correct:!!a.correct,responseTimeMs:Number(a.responseTimeMs||0),immediateRetry};if(!s.attempts.some(x=>x.id===row.id))s.attempts.push(row);for(let i=s.anchors.length-1;i>=0;i--){const x=s.anchors[i];if(!x.outcome&&x.problemId===pid){x.outcome={at:row.at,correct:row.correct,responseTimeMs:row.responseTimeMs};break}}
  refresh(s,false);
  if(s.suppression.active&&!immediateRetry){if(stableAttempt(s,row))s.suppression.stableStreak=Number(s.suppression.stableStreak||0)+1;else s.suppression.stableStreak=0;const need=Number(s.derived.baselineN||0)>=6?CFG.session.releaseWithTiming:CFG.session.releaseWithoutTiming;if(s.suppression.stableStreak>=need){s.suppression={...s.suppression,active:false,reason:'',startedAt:null,stableStreak:0,anchorPending:false,anchorServedInCycle:0}}}
  refresh(s,false);persist(s);return {session:s,row}
}
function summary(s){const anchors=(s.anchors||[]),obs=anchors.filter(x=>x.outcome),ok=obs.filter(x=>x.outcome.correct).length;return {id:s.id,startedAt:s.startedAt,lastActivityAt:s.lastActivityAt,endedAt:s.endedAt||null,closed:!!s.closed,attempts:(s.attempts||[]).length,correct:(s.attempts||[]).filter(x=>x.correct).length,extraActions:Number(s.derived?.actions||0),extraScreens:Number(s.derived?.screens||0),proactiveChecks:Number(s.derived?.proactiveChecks||0),budgetActions:CFG.budget.actions,budgetScreens:CFG.budget.screens,overloadScore:Number(s.derived?.score||0),overloadActive:!!s.suppression?.active,overloadSignals:s.derived?.signals||null,suppressedCount:(s.suppressed||[]).length,suppressedByKind:(s.suppressed||[]).reduce((o,x)=>(o[x.kind]=(o[x.kind]||0)+1,o),{}),anchorsServed:anchors.length,anchorOutcomes:obs.length,anchorCorrect:ok,postAnchorAccuracy:obs.length?ok/obs.length:null,cycles:Number(s.suppression?.cycle||0),updatedAt:s.updatedAt||Date.now()}}
function parentSnapshot(){const raw=parse(getSS(CURRENT_KEY),null),cur=raw&&raw.id?raw:null;const history=loadHistory().filter(x=>x&&x.id);let current={id:'',startedAt:0,lastActivityAt:0,attempts:0,correct:0,extraActions:0,extraScreens:0,proactiveChecks:0,budgetActions:CFG.budget.actions,budgetScreens:CFG.budget.screens,overloadScore:0,overloadActive:false,overloadSignals:null,suppressedCount:0,suppressedByKind:{},anchorsServed:0,anchorOutcomes:0,anchorCorrect:0,postAnchorAccuracy:null,cycles:0};if(cur){refresh(cur,false);current=summary(cur);const i=history.findIndex(x=>x.id===cur.id);if(i>=0)history[i]=current;else history.push(current)}const rows=history.sort((a,b)=>Number(b.startedAt||0)-Number(a.startedAt||0)).slice(0,20),agg={sessions:rows.length,extraActions:0,extraScreens:0,suppressed:0,anchors:0,anchorObs:0,anchorOk:0,overloadSessions:0};for(const x of rows){agg.extraActions+=Number(x.extraActions||0);agg.extraScreens+=Number(x.extraScreens||0);agg.suppressed+=Number(x.suppressedCount||0);agg.anchors+=Number(x.anchorsServed||0);agg.anchorObs+=Number(x.anchorOutcomes||0);agg.anchorOk+=Number(x.anchorCorrect||0);if(Number(x.cycles||0)>0)agg.overloadSessions++}agg.postAnchorAccuracy=agg.anchorObs?agg.anchorOk/agg.anchorObs:null;return {cfg:CFG,current,rows,aggregate:agg}}
// Gate existing optional systems without changing essential wrong-answer recovery.
if(g.H2Risk&&typeof H2Risk.predict==='function'){
  const basePredict=H2Risk.predict.bind(H2Risk);H2Risk.predict=function(day,pid){if(shouldSuppress('proactive-microcheck',day,pid)){const r=H2Risk.riskFor(Number(day),pid);return r?{...r,high:false,suppressed:true,sessionLoadSuppressed:true}:null}return basePredict(day,pid)}
  if(typeof H2Risk.startMicro==='function'){const baseStart=H2Risk.startMicro.bind(H2Risk);H2Risk.startMicro=function(day,pid){if(shouldSuppress('proactive-microcheck',day,pid))return null;return baseStart(day,pid)}}
}
if(g.H2LearningEffect&&typeof H2LearningEffect.shouldPrecheck==='function'){
  const basePre=H2LearningEffect.shouldPrecheck.bind(H2LearningEffect);H2LearningEffect.shouldPrecheck=function(day,pid,storage,now){if(shouldSuppress('automatic-precheck',day,pid))return {eligible:false,reason:'session-load-budget-or-overload'};return basePre(day,pid,storage,now)}
}
g.H2SessionLoad={CFG,CURRENT_KEY,HISTORY_KEY,loadCurrent,persist,touch,refresh,signalSnapshot,interventionBurden,beforeQuestion,shouldSuppress,recordSuppressed,anchorFor,completeAnchor,recordAttempt,parentSnapshot,summary};
})(window);
