(function(g){
'use strict';
if(!g.H2Policy||!g.H2SessionLoad)return;
const CFG={
 meta:{id:'korean-history2-unit1-session-resume',version:'1.0.0'},
 earlyEnd:{minimumCompletedProblems:4,recentAttemptWindow:5,maximumRecentAccuracy:.64,minimumSuppressionCycles:2,minimumSuppressedOptionalInterventions:4,maximumEarlyEndsPer24Hours:2,earlyEndCooldownMs:4*60*60*1000,doNotEndWithRemainingProblemsAtOrBelow:1},
 resume:{deferSameTabMs:30*60*1000,anchorMaximumMissesBeforeAnswer:2,storageKey:'history2-unit1-resume-token-v1',historyKey:'history2-unit1-resume-history-v1',sameTabDeferKey:'history2-unit1-resume-defer-v1'}
};
const TOKEN_KEY=CFG.resume.storageKey,HISTORY_KEY=CFG.resume.historyKey,DEFER_KEY=CFG.resume.sameTabDeferKey;
function uid(p='rs'){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function parse(v,f){try{return v?JSON.parse(v):f}catch(e){return f}}
function getLS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function setLS(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function rmLS(k){try{localStorage.removeItem(k)}catch(e){}}
function getSS(k){try{return sessionStorage.getItem(k)}catch(e){return null}}
function setSS(k,v){try{sessionStorage.setItem(k,v)}catch(e){}}
function rmSS(k){try{sessionStorage.removeItem(k)}catch(e){}}
function loadHistory(){const a=parse(getLS(HISTORY_KEY),[]);return Array.isArray(a)?a:[]}
function saveHistory(a){setLS(HISTORY_KEY,JSON.stringify((a||[]).slice(-100)))}
function pendingToken(){const t=parse(getLS(TOKEN_KEY),null);return t&&t.id&&!t.completedAt?t:null}
function putToken(t){setLS(TOKEN_KEY,JSON.stringify(t));const a=loadHistory(),i=a.findIndex(x=>x.id===t.id);if(i>=0)a[i]={...a[i],...t};else a.push(t);saveHistory(a);return t}
function recentAccuracy(attempts,n){const a=(attempts||[]).slice(-n);if(!a.length)return 1;return a.filter(x=>x.correct).length/a.length}
function distinctCorrect(attempts){return new Set((attempts||[]).filter(x=>x.correct).map(x=>String(x.problemId||''))).size}
function earlyEndGuard(now=Date.now()){
 const a=loadHistory().filter(x=>x.endedEarlyAt&&now-Number(x.endedEarlyAt)<=86400000);const last=a.sort((x,y)=>Number(y.endedEarlyAt)-Number(x.endedEarlyAt))[0];
 if(a.length>=CFG.earlyEnd.maximumEarlyEndsPer24Hours)return {ok:false,reason:'daily-limit',recent:a.length};
 if(last&&now-Number(last.endedEarlyAt)<CFG.earlyEnd.earlyEndCooldownMs)return {ok:false,reason:'cooldown',recent:a.length,lastAt:last.endedEarlyAt};
 return {ok:true,recent:a.length}
}
function evaluate(day,currentPid,nextPid,planned,remaining){
 const now=Date.now(),s=H2SessionLoad.loadCurrent();H2SessionLoad.refresh(s,false);const ats=s.attempts||[],done=distinctCorrect(ats),acc=recentAccuracy(ats,CFG.earlyEnd.recentAttemptWindow),cycles=Number(s.suppression?.cycle||0),supp=(s.suppressed||[]).length,budget=!!s.derived?.budgetExhausted;
 const guard=earlyEndGuard(now);const pressure=cycles>=CFG.earlyEnd.minimumSuppressionCycles||budget||supp>=CFG.earlyEnd.minimumSuppressedOptionalInterventions;
 const eligible=!!nextPid&&remaining>CFG.earlyEnd.doNotEndWithRemainingProblemsAtOrBelow&&done>=CFG.earlyEnd.minimumCompletedProblems&&pressure&&acc<=CFG.earlyEnd.maximumRecentAccuracy&&guard.ok;
 const reasons=[];if(cycles>=CFG.earlyEnd.minimumSuppressionCycles)reasons.push('반복 과부하 억제');if(budget)reasons.push('개입 예산 소진');if(supp>=CFG.earlyEnd.minimumSuppressedOptionalInterventions)reasons.push('비필수 개입 반복 억제');if(acc<=CFG.earlyEnd.maximumRecentAccuracy)reasons.push('최근 원문 정답 회복 낮음');
 return {eligible,day:Number(day),currentPid,nextPid,planned:Number(planned||0),remaining:Number(remaining||0),completedProblems:done,recentAccuracy:acc,cycles,suppressed:supp,budgetExhausted:budget,reasons,guard,sessionId:s.id}
}
function anchorFor(day,pid){const r=H2Policy.route(Number(day),pid);if(!r)return null;const m=r.memory||null;return {kind:m?'keyword':'branch',prompt:m?.prompt||'이 문제의 큰 가지는?',answer:m?.answer||r.branchLabel,accepted:m?[m.answer,...(m.accepted||[])]:[r.branchLabel],hint:m?.hint||'',keyword:m?.keyword||m?.answer||r.branchLabel,link:m?.link||r.conceptTitle||r.branchLabel,options:r.branchOptions||[],branchLabel:r.branchLabel,conceptTitle:r.conceptTitle}}
function createToken(evaluation){if(!evaluation?.eligible)return null;const now=Date.now(),t={id:uid('resume'),entryPolicyVersion:2,createdAt:now,endedEarlyAt:now,day:evaluation.day,fromProblemId:evaluation.currentPid,nextProblemId:evaluation.nextPid,sourceSessionId:evaluation.sessionId,plannedProblems:evaluation.planned,completedProblems:evaluation.completedProblems,remainingProblems:evaluation.remaining,recentAccuracy:evaluation.recentAccuracy,reasons:evaluation.reasons,anchor:anchorFor(evaluation.day,evaluation.nextPid),resumeStartedAt:null,anchorCompletedAt:null,targetFirstAttemptAt:null,targetFirstAttemptCorrect:null,targetCompletedAt:null,completedAt:null};putToken(t);setSS(DEFER_KEY,JSON.stringify({id:t.id,at:now}));try{const s=H2SessionLoad.loadCurrent();s.closed=true;s.endedAt=now;s.endReason='adaptive-early-end';H2SessionLoad.persist(s,false)}catch(e){}return t}
function shouldAutoResume(now=Date.now()){const t=pendingToken();if(!t)return false;const d=parse(getSS(DEFER_KEY),null);if(d&&d.id===t.id&&now-Number(d.at||0)<CFG.resume.deferSameTabMs)return false;return true}
function allowResumeNow(){rmSS(DEFER_KEY);return !!pendingToken()}
function markAnchorComplete(id,meta){const t=pendingToken();if(!t||t.id!==id)return null;t.anchorCompletedAt=t.anchorCompletedAt||Date.now();t.anchorAttempts=Number(meta?.attempts||1);t.anchorFirstCorrect=meta?.firstCorrect!==false;return putToken(t)}
function markResumeStarted(id){const t=pendingToken();if(!t||t.id!==id)return null;t.resumeStartedAt=t.resumeStartedAt||Date.now();rmSS(DEFER_KEY);return putToken(t)}
function isActiveTarget(day,pid){const t=pendingToken();return !!(t&&t.resumeStartedAt&&Number(t.day)===Number(day)&&t.nextProblemId===pid)}
function recordTargetAttempt(id,correct){const t=pendingToken();if(!t||t.id!==id)return null;const now=Date.now();if(!t.targetFirstAttemptAt){t.targetFirstAttemptAt=now;t.targetFirstAttemptCorrect=!!correct}if(correct){t.targetCompletedAt=now;t.completedAt=now;putToken(t);rmLS(TOKEN_KEY)}else putToken(t);return t}
function parentSnapshot(){const rows=loadHistory().sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)),ended=rows.filter(x=>x.endedEarlyAt),started=rows.filter(x=>x.resumeStartedAt),completed=rows.filter(x=>x.targetCompletedAt),first=rows.filter(x=>x.targetFirstAttemptAt);return {cfg:CFG,pending:pendingToken(),rows:rows.slice(0,30),aggregate:{earlyEnds:ended.length,resumeStarted:started.length,resumeCompleted:completed.length,resumeCompletionRate:started.length?completed.length/started.length:null,firstAttemptObserved:first.length,firstAttemptCorrect:first.filter(x=>x.targetFirstAttemptCorrect).length,firstAttemptAccuracy:first.length?first.filter(x=>x.targetFirstAttemptCorrect).length/first.length:null,avgPlanRatio:ended.length?ended.reduce((s,x)=>s+(Number(x.completedProblems||0)/Math.max(1,Number(x.plannedProblems||1))),0)/ended.length:null}}
}
// A closed load-controlled session must start fresh when actual resume begins.
const baseLoad=H2SessionLoad.loadCurrent.bind(H2SessionLoad);
// Optional systems are skipped only for the first resumed target; essential wrong-answer recovery remains untouched.
if(g.H2Risk&&typeof H2Risk.predict==='function'){
 const bp=H2Risk.predict.bind(H2Risk);H2Risk.predict=function(day,pid){if(isActiveTarget(day,pid))return null;return bp(day,pid)};
 if(typeof H2Risk.startMicro==='function'){const bs=H2Risk.startMicro.bind(H2Risk);H2Risk.startMicro=function(day,pid){if(isActiveTarget(day,pid))return null;return bs(day,pid)}}
}
if(g.H2LearningEffect&&typeof H2LearningEffect.shouldPrecheck==='function'){
 const b=H2LearningEffect.shouldPrecheck.bind(H2LearningEffect);H2LearningEffect.shouldPrecheck=function(day,pid,storage,now){if(isActiveTarget(day,pid))return {eligible:false,reason:'session-resume-target'};return b(day,pid,storage,now)}
}
if(g.H2SessionLoad&&typeof H2SessionLoad.anchorFor==='function'){
 const b=H2SessionLoad.anchorFor.bind(H2SessionLoad);H2SessionLoad.anchorFor=function(day,pid,input){if(isActiveTarget(day,pid))return null;return b(day,pid,input)}
}
g.H2SessionResume={CFG,TOKEN_KEY,HISTORY_KEY,DEFER_KEY,pendingToken,putToken,evaluate,createToken,anchorFor,shouldAutoResume,allowResumeNow,markAnchorComplete,markResumeStarted,isActiveTarget,recordTargetAttempt,parentSnapshot,earlyEndGuard};
})(window);
