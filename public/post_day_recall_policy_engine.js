(function(g){
'use strict';
if(!g.H2PostDaySpacing||!g.H2ConceptDepth)return;
const DAY=86400000;
const CFG={
  meta:{id:'korean-history2-unit1-post-day-recall-policy',version:'1.0.0-adaptive-post-day-count'},
  decision:{minCount:0,maxCount:3,coldStartCount:1,candidateLimit:8,minimumSessionsForAdaptation:3,minimumBranchObservedPerGroup:2,dropoutGraceMinutes:120,loadCaps:{overloadOrBudgetExhausted:0,budgetRatio75Percent:1},marginalThresholds:[.12,.28,.42]},
  retention:{windows:[{id:'d1',days:1,maxDays:2.5,weight:.2},{id:'d3',days:3,maxDays:5,weight:.35},{id:'d7',days:7,maxDays:14,weight:.45}],stableRate:.85,weakRate:.65,negativeUplift:-.05,positiveUplift:.10}
};
const STORAGE=H2ConceptDepth.DB.meta.storage;
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function parse(v,f){try{return v?JSON.parse(v):f}catch(e){return f}}
function state(day){try{return parse(localStorage.getItem(STORAGE[String(day)]),{})||{}}catch(e){return {}}}
function route(item){return item?H2ConceptDepth.route(Number(item.day),item.problemId):null}
function branch(item){return route(item)?.branchLabel||item?.conceptTitle||'기타'}
function itemKey(x){return H2PostDaySpacing.itemKey?H2PostDaySpacing.itemKey(x):'d'+Number(x.day)+':'+x.id}
function memoryMap(memory){return Object.fromEntries((memory||[]).map(x=>[itemKey(x),x]))}
function sessionRows(){return (H2PostDaySpacing.history()||[]).filter(x=>x&&x.id).sort((a,b)=>Number(a.finishedAt||a.startedAt||0)-Number(b.finishedAt||b.startedAt||0))}
function sessionStatus(x,now=Date.now()){if(x.closedAt)return 'closed';const age=now-Number(x.startedAt||x.finishedAt||now);return age>=CFG.decision.dropoutGraceMinutes*60000?'abandoned':'pending'}
function countStats(now=Date.now()){
  const out={0:{n:0,closed:0,abandoned:0},1:{n:0,closed:0,abandoned:0},2:{n:0,closed:0,abandoned:0},3:{n:0,closed:0,abandoned:0}};
  for(const x of sessionRows()){const n=clamp(Number(x.plannedCount??(x.plannedIds||[]).length),0,3),z=out[n],s=sessionStatus(x,now);z.n++;if(s==='closed')z.closed++;if(s==='abandoned')z.abandoned++}
  Object.values(out).forEach(z=>{z.completionRate=z.n?z.closed/z.n:null;z.abandonRate=z.n?z.abandoned/z.n:null});return out
}
function laterPostDayAt(item,after,before){const s=state(item.day),a=Array.isArray(s.reviewAttempts)?s.reviewAttempts:[];const hits=a.filter(x=>x.checkId===item.id&&x.context==='post-day-spacing'&&Number(x.at||0)>after+30*60000&&Number(x.at||0)<before).sort((x,y)=>Number(x.at)-Number(y.at));return hits[0]?.at||null}
function evidenceFor(session,item,win,now=Date.now()){
  const start=Number(session.finishedAt||session.startedAt||0)+win.days*DAY,end=Number(session.finishedAt||session.startedAt||0)+win.maxDays*DAY;if(now<start)return {observed:false,pending:true};
  const s=state(item.day),reviews=Array.isArray(s.reviewAttempts)?s.reviewAttempts:[],attempts=Array.isArray(s.attempts)?s.attempts:[];
  const direct=reviews.filter(x=>x.checkId===item.id&&x.context!=='post-day-spacing'&&Number(x.at||0)>=start&&Number(x.at||0)<=end).sort((a,b)=>Number(a.at)-Number(b.at))[0];
  const orig=attempts.filter(x=>x.problemId===item.problemId&&Number(x.at||0)>=start&&Number(x.at||0)<=end).sort((a,b)=>Number(a.at)-Number(b.at))[0];
  const ev=direct&&orig?(Number(direct.at)<=Number(orig.at)?{at:Number(direct.at),correct:!!direct.correct,source:'direct-recall'}:{at:Number(orig.at),correct:!!orig.correct,source:'original-problem'}):direct?{at:Number(direct.at),correct:!!direct.correct,source:'direct-recall'}:orig?{at:Number(orig.at),correct:!!orig.correct,source:'original-problem'}:null;
  if(!ev)return {observed:false,pending:now<=end};const conf=laterPostDayAt(item,Number(session.finishedAt||0),ev.at);if(conf)return {observed:false,confounded:true,at:conf};return {observed:true,...ev}
}
function blankBranch(name){return {name,selected:0,skipped:0,selectedObs:0,selectedOk:0,skippedObs:0,skippedOk:0,windows:{d1:{selN:0,selOk:0,ctlN:0,ctlOk:0},d3:{selN:0,selOk:0,ctlN:0,ctlOk:0},d7:{selN:0,selOk:0,ctlN:0,ctlOk:0}},weightedSelected:null,weightedSkipped:null,uplift:null}}
function branchStats(memory,now=Date.now()){
  const mm=memoryMap(memory),map={};
  for(const sess of sessionRows()){
    if(!Array.isArray(sess.plannedKeys))continue;
    const selected=new Set(sess.completedKeys||[]),skipped=new Set(sess.skippedKeys||[]);
    for(const id of [...selected,...skipped]){const item=mm[id];if(!item)continue;const k=branch(item),z=map[k]||(map[k]=blankBranch(k)),isSel=selected.has(id);if(isSel)z.selected++;else z.skipped++;
      for(const w of CFG.retention.windows){const e=evidenceFor(sess,item,w,now),q=z.windows[w.id];if(!e.observed)continue;if(isSel){q.selN++;z.selectedObs++;if(e.correct){q.selOk++;z.selectedOk++}}else{q.ctlN++;z.skippedObs++;if(e.correct){q.ctlOk++;z.skippedOk++}}}
    }
  }
  for(const z of Object.values(map)){
    let sw=0,ss=0,cw=0,cs=0;for(const w of CFG.retention.windows){const q=z.windows[w.id];if(q.selN){sw+=w.weight;ss+=w.weight*(q.selOk/q.selN)}if(q.ctlN){cw+=w.weight;cs+=w.weight*(q.ctlOk/q.ctlN)}}z.weightedSelected=sw?ss/sw:null;z.weightedSkipped=cw?cs/cw:null;if(z.weightedSelected!=null&&z.weightedSkipped!=null)z.uplift=z.weightedSelected-z.weightedSkipped;
  }
  return map
}
function learningRetention(branchLabel){try{if(!g.H2LearningEffect)return null;const x=H2LearningEffect.branchSnapshot().find(z=>z.name===branchLabel);if(!x)return null;let w=0,s=0,n=0;for(const q of CFG.retention.windows){const r=x.ret?.[q.id];if(r&&r.n){w+=q.weight;s+=q.weight*(r.ok/r.n);n+=r.n}}return w?{rate:s/w,n}:null}catch(e){return null}}
function loadSnapshot(override){if(override)return override;try{if(!g.H2SessionLoad)return null;const c=H2SessionLoad.parentSnapshot().current||{};const ar=Number(c.budgetActions||0)?Number(c.extraActions||0)/Number(c.budgetActions):0,sr=Number(c.budgetScreens||0)?Number(c.extraScreens||0)/Number(c.budgetScreens):0;return {overloadActive:!!c.overloadActive,budgetExhausted:ar>=1||sr>=1,budgetRatio:Math.max(ar,sr)}}catch(e){return null}}
function branchPolicy(item,bmap){const k=branch(item),z=bmap[k]||blankBranch(k),lr=learningRetention(k),log=item.log||{},a=Math.max(1,Number(log.attempts||1)),acc=Number(log.correctCount||0)/a,ret=lr?.rate??z.weightedSelected,obs=lr?.n||z.selectedObs,stable=ret!=null&&obs>=3&&ret>=CFG.retention.stableRate,harmful=z.uplift!=null&&z.selectedObs>=3&&z.uplift<=CFG.retention.negativeUplift;return {branchLabel:k,stats:z,learningRetention:lr,accuracy:acc,stable,harmful}}
function itemScore(item,bmap,now=Date.now()){
  const p=branchPolicy(item,bmap),due=Number(item.due||now),overdue=clamp((now-due)/DAY,0,7)/7,ret=p.learningRetention?.rate??p.stats.weightedSelected,need=ret==null?.55:1-ret,weak=1-clamp(p.accuracy,0,1),up=p.stats.uplift;
  let score=.42*need+.25*weak+.18*overdue+.08;if(up!=null)score+=.25*Math.max(0,up)-.25*Math.max(0,-up);if(p.stable&&(up==null||up<=.05))score-=.35;if(p.harmful)score=-1;return {...p,item,score,overdueDays:(now-due)/DAY}
}
function dropoutCap(stats){let cap=3;const s3=stats[3],s2=stats[2];if(s3.n>=3&&s3.abandonRate>=.25)cap=2;if(s2.n>=3&&s2.abandonRate>=.25)cap=1;return cap}
function plan(day,due,memory,now=Date.now(),override={}){
  const candidates=(due||[]).slice(0,CFG.decision.candidateLimit),bmap=branchStats(memory,now),counts=countStats(now),load=loadSnapshot(override.load),rows=sessionRows(),closed=rows.filter(x=>x.policyVersion===CFG.meta.version&&Array.isArray(x.plannedKeys)&&sessionStatus(x,now)==='closed').length;
  let cap=Math.min(CFG.decision.maxCount,candidates.length,dropoutCap(counts));const reasons=[];
  if(load?.overloadActive||load?.budgetExhausted){cap=0;reasons.push('세션 부하/예산으로 마무리 회상 생략')}else if(Number(load?.budgetRatio||0)>=.75){cap=Math.min(cap,1);reasons.push('세션 부하가 높아 1개로 제한')}
  const scored=candidates.map(x=>itemScore(x,bmap,now)).sort((a,b)=>b.score-a.score||a.item.due-b.item.due);
  let selected=[];
  if(cap>0&&closed<CFG.decision.minimumSessionsForAdaptation){if(scored.length)selected=[scored[0]];reasons.push('초기 기록 구간: 1개만 탐색')}else if(cap>0){
    const firstPass=[],later=[];const seen=new Set();for(const x of scored){if(!seen.has(x.branchLabel)){firstPass.push(x);seen.add(x.branchLabel)}else later.push(x)}const ordered=[...firstPass,...later];for(const x of ordered){if(selected.length>=cap)break;const t=CFG.decision.marginalThresholds[selected.length]??.42;if(x.score>=t)selected.push(x)}if(!selected.length&&scored[0]&&scored[0].score>=.1&&!scored[0].stable&&!scored[0].harmful)selected=[scored[0]];
  }
  const ids=new Set(selected.map(x=>x.item.id)),selectedItems=candidates.filter(x=>ids.has(x.id)).slice(0,cap),skipped=candidates.filter(x=>!ids.has(x.id));
  if(!candidates.length)reasons.push('도래한 회상 없음');else if(cap===0&&!reasons.length)reasons.push('추가 회상 이득보다 세션 종료 우선');else if(selectedItems.length===0&&cap>0)reasons.push('안정 가지 또는 순이득 부족으로 0개');else if(closed>=CFG.decision.minimumSessionsForAdaptation)reasons.push(`기억 유지·이탈 비용 비교 후 ${selectedItems.length}개`);
  return {version:CFG.meta.version,day:Number(day),count:selectedItems.length,selected:selectedItems,skipped,candidates,candidateKeys:candidates.map(itemKey),selectedKeys:selectedItems.map(itemKey),skippedKeys:skipped.map(itemKey),candidateIds:candidates.map(x=>x.id),skippedIds:skipped.map(x=>x.id),reasons,cap,load,countStats:counts,branchPolicies:scored.map(x=>({key:itemKey(x.item),id:x.item.id,day:Number(x.item.day),branchLabel:x.branchLabel,score:Number(x.score.toFixed(4)),stable:x.stable,harmful:x.harmful,uplift:x.stats.uplift,retention:x.learningRetention?.rate??x.stats.weightedSelected}))}
}
function parentSnapshot(memory,now=Date.now()){
  const bs=branchStats(memory,now),counts=countStats(now),rows=sessionRows(),last=rows[rows.length-1]||null;return {version:CFG.meta.version,sessions:rows.length,counts,branches:Object.values(bs).sort((a,b)=>(b.selected+b.skipped)-(a.selected+a.skipped)).slice(0,12),lastDecision:last?.decision||null,lastSession:last}
}
g.H2PostDayRecallPolicy={CFG,sessionRows,sessionStatus,countStats,evidenceFor,branchStats,itemScore,plan,parentSnapshot};
})(window);
