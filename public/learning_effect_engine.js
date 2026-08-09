(function(g){
'use strict';
if(!g.H2ConceptDepth)return;
const DAY=86400000;
const CFG={meta:{id:'korean-history2-unit1-remediation-efficacy',version:'1.0.0'},deepRecoveryTrigger:{baseLevels:['root','unit'],minimumEvents:2,minimumDistinctProblems:2,evidenceWindowDays:21,resetAfterPrecheck:true},retentionWindows:[{id:'d1',days:1,label:'1일'},{id:'d3',days:3,label:'3일'},{id:'d7',days:7,label:'7일'}]};
const STORAGE=H2ConceptDepth.DB.meta.storage;
function readState(day){try{return JSON.parse(localStorage.getItem(STORAGE[String(day)])||'{}')}catch(e){return {}}}
function writeState(day,s){localStorage.setItem(STORAGE[String(day)],JSON.stringify(s))}
function route(day,pid){return H2ConceptDepth.route(Number(day),pid)}
function deepLevel(x){return CFG.deepRecoveryTrigger.baseLevels.includes(String(x&&x.baseLevel||''))}
function ensure(s){s.remediationEfficacyLog=Array.isArray(s.remediationEfficacyLog)?s.remediationEfficacyLog:[];s.precheckLog=Array.isArray(s.precheckLog)?s.precheckLog:[];return s}
function allDepth(storage=STORAGE){return H2ConceptDepth.collect(storage)}
function allEfficacy(storage=STORAGE){const out=[];for(let d=1;d<=6;d++){const s=ensure(H2ConceptDepth.readState(storage[String(d)]));for(const x of s.remediationEfficacyLog)out.push({...x,day:Number(x.day||d)})}return out}
function allPrechecks(storage=STORAGE){const out=[];for(let d=1;d<=6;d++){const s=ensure(H2ConceptDepth.readState(storage[String(d)]));for(const x of s.precheckLog)out.push({...x,day:Number(x.day||d)})}return out}
function latestPrecheck(branch,storage=STORAGE){return allPrechecks(storage).filter(x=>x.branchLabel===branch).sort((a,b)=>Number(b.at||0)-Number(a.at||0))[0]||null}
function triggerEvidence(branch,storage=STORAGE,now=Date.now()){
  const last=latestPrecheck(branch,storage),cut=Math.max(now-CFG.deepRecoveryTrigger.evidenceWindowDays*DAY,last?Number(last.at||0):0);
  const rows=allDepth(storage).filter(x=>deepLevel(x)&&Number(x.at||0)>cut).filter(x=>route(x.day,x.problemId)?.branchLabel===branch).sort((a,b)=>Number(a.at||0)-Number(b.at||0));
  const problems=[...new Set(rows.map(x=>`${x.day}:${x.problemId}`))];
  return {branchLabel:branch,rows,problemCount:problems.length,eventCount:rows.length,eligible:rows.length>=CFG.deepRecoveryTrigger.minimumEvents&&problems.length>=CFG.deepRecoveryTrigger.minimumDistinctProblems,lastPrecheck:last};
}
function shouldPrecheck(day,pid,storage=STORAGE,now=Date.now()){
  const r=route(day,pid);if(!r)return {eligible:false,reason:'no-route'};
  const s=H2ConceptDepth.readState(storage[String(day)]),pending=(s.conceptDepthLog||[]).filter(x=>x.problemId===pid).filter(x=>!(s.remediationEfficacyLog||[]).some(e=>e.depthLogId===x.id&&e.immediate)).sort((a,b)=>Number(b.at||0)-Number(a.at||0))[0];
  if(pending)return {eligible:false,reason:'immediate-retry-pending'};
  const ev=triggerEvidence(r.branchLabel,storage,now);if(!ev.eligible)return {...ev,eligible:false,reason:'threshold'};
  const triggerAt=Math.max(...ev.rows.map(x=>Number(x.at||0)),0);
  const attempts=(s.attempts||[]).filter(a=>a.problemId===pid&&Number(a.at||0)>=triggerAt);
  if(attempts.length)return {...ev,eligible:false,reason:'already-attempted-after-trigger',triggerAt,route:r};
  const already=(s.precheckLog||[]).some(x=>x.problemId===pid&&x.branchLabel===r.branchLabel&&Number(x.at||0)>=triggerAt);
  if(already)return {...ev,eligible:false,reason:'already-prechecked',triggerAt,route:r};
  return {...ev,eligible:true,reason:'deep-repeat',triggerAt,route:r};
}
function retentionSkeleton(at){const o={};for(const w of CFG.retentionWindows)o[w.id]={id:w.id,label:w.label,days:w.days,dueAt:Number(at||Date.now())+w.days*DAY,memory:null,problem:null};return o}
function createImmediateEpisode(day,pid,depth,attempt){const r=route(day,pid);return {id:'eff-'+String(depth.id||Date.now().toString(36)),depthLogId:depth.id,day:Number(day),problemId:pid,branchLabel:r?.branchLabel||'',rootLabel:r?.rootLabel||'',conceptTitle:r?.conceptTitle||'',baseLevel:depth.baseLevel||'concept',recoveryAt:Number(depth.at||Date.now()),deep:deepLevel(depth),immediate:{at:Number(attempt.at||Date.now()),correct:!!attempt.correct,attemptId:attempt.id||'',source:'original-retry'},retention:retentionSkeleton(attempt.at),createdAt:Date.now()}}
function pendingDepth(day,pid,s){s=ensure(s||readState(day));return (s.conceptDepthLog||[]).filter(x=>x.problemId===pid).filter(x=>!s.remediationEfficacyLog.some(e=>e.depthLogId===x.id&&e.immediate)).sort((a,b)=>Number(b.at||0)-Number(a.at||0))[0]||null}
function recordImmediate(day,pid,attempt){const s=ensure(readState(day)),depth=pendingDepth(day,pid,s);if(!depth)return null;const e=createImmediateEpisode(day,pid,depth,attempt);s.remediationEfficacyLog.push(e);writeState(day,s);return e}
function findEpisode(day,id){const s=ensure(readState(day));return {s,e:s.remediationEfficacyLog.find(x=>x.id===id)||null}}
function nextDueWindow(e,kind,now=Date.now()){if(!e||!e.retention)return null;for(const w of CFG.retentionWindows){const x=e.retention[w.id];if(!x||Number(x.dueAt||0)>now)continue;if(kind==='memory'&&!x.memory&&!x.problem)return x;if(kind==='problem'&&!x.problem&&!x.memory)return x}return null}
function recordMemoryEvidence(day,episodeId,windowId,correct,extra={}){const {s,e}=findEpisode(day,episodeId);if(!e||!e.retention?.[windowId])return false;const x=e.retention[windowId];if(!x.memory)x.memory={at:Date.now(),correct:!!correct,source:'keyword-recall',...extra};writeState(day,s);return true}
function recordProblemEvidenceForRoute(day,pid,correct,attemptAt=Date.now()){
  const r=route(day,pid);if(!r)return 0;let n=0;
  for(let d=1;d<=6;d++){const s=ensure(readState(d));let changed=false;for(const e of s.remediationEfficacyLog){if(!e.immediate||!e.immediate.correct||e.branchLabel!==r.branchLabel)continue;const w=nextDueWindow(e,'problem',attemptAt);if(!w)continue;w.problem={at:attemptAt,correct:!!correct,source:'related-original-problem',day:Number(day),problemId:pid};changed=true;n++}if(changed)writeState(d,s)}return n
}
function dueRetentionMemory(meta,now=Date.now()){
  const out=[];for(const e of allEfficacy()){if(!e.immediate||!e.immediate.correct)continue;const w=nextDueWindow(e,'memory',now);if(!w)continue;const item=(meta||[]).find(x=>Number(x.day)===Number(e.day)&&x.problemId===e.problemId);if(!item)continue;out.push({...item,due:Number(w.dueAt||0),_retentionEpisodeId:e.id,_retentionWindow:w.id,_retentionLabel:w.label,_retentionDueAt:w.dueAt,_retentionBranch:e.branchLabel})}
  return out.sort((a,b)=>a.due-b.due)
}
function branchSnapshot(storage=STORAGE){const depths=allDepth(storage),eff=allEfficacy(storage),pcs=allPrechecks(storage),map={};function gk(name){return map[name]||(map[name]={name,deep:0,deepProblems:new Set(),effN:0,immediateCorrect:0,precheckN:0,precheckOk:0,ret:{d1:{n:0,ok:0},d3:{n:0,ok:0},d7:{n:0,ok:0}}})}
  for(const x of depths){if(!deepLevel(x))continue;const r=route(x.day,x.problemId),k=r?.branchLabel||'기타',z=gk(k);z.deep++;z.deepProblems.add(`${x.day}:${x.problemId}`)}
  for(const e of eff){const z=gk(e.branchLabel||'기타');if(e.immediate){z.effN++;if(e.immediate.correct)z.immediateCorrect++}for(const w of CFG.retentionWindows){const q=e.retention?.[w.id];if(!q)continue;const obs=q.memory||q.problem;if(obs){z.ret[w.id].n++;if((q.memory&&q.memory.correct)||(q.problem&&q.problem.correct))z.ret[w.id].ok++}}}
  for(const p of pcs){const z=gk(p.branchLabel||'기타');z.precheckN++;if(p.branchCorrect&&p.keywordCorrect)z.precheckOk++}
  return Object.values(map).map(z=>({...z,deepProblems:z.deepProblems.size,immediateRate:z.effN?z.immediateCorrect/z.effN:null,precheckRate:z.precheckN?z.precheckOk/z.precheckN:null})).sort((a,b)=>(b.deepProblems-a.deepProblems)||(b.deep-a.deep))
}
function parentSnapshot(storage=STORAGE){const eff=allEfficacy(storage),pcs=allPrechecks(storage),im=eff.filter(x=>x.immediate),imOk=im.filter(x=>x.immediate.correct).length,ret={};for(const w of CFG.retentionWindows){let n=0,ok=0;for(const e of eff){const q=e.retention?.[w.id];if(!q)continue;const observed=!!(q.memory||q.problem);if(!observed)continue;n++;if((q.memory&&q.memory.correct)||(q.problem&&q.problem.correct))ok++}ret[w.id]={label:w.label,n,ok,rate:n?ok/n:null}}
  return {episodes:eff.length,immediateN:im.length,immediateOk:imOk,immediateRate:im.length?imOk/im.length:null,prechecks:pcs.length,precheckOk:pcs.filter(x=>x.branchCorrect&&x.keywordCorrect).length,retention:ret,branches:branchSnapshot(storage).slice(0,8)}
}
g.H2LearningEffect={CFG,DAY,STORAGE,readState,writeState,ensure,route,deepLevel,allEfficacy,allPrechecks,triggerEvidence,shouldPrecheck,pendingDepth,recordImmediate,recordMemoryEvidence,recordProblemEvidenceForRoute,dueRetentionMemory,parentSnapshot,branchSnapshot};
})(window);
