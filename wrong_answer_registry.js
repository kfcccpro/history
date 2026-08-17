(function(g){
'use strict';
if(g.H2WrongAnswerRegistry)return;

const KEY='history2-wrong-answer-registry-v1';
const DAY_KEYS={
  1:'history2-day1-original-mastery-v2',
  2:'history2-day2-attention-mastery-v2',
  3:'history2-day3-terms-mastery-v1',
  4:'history2-day4-terms-mastery-v1',
  5:'history2-day5-terms-mastery-v1',
  6:'history2-day6-unit-review-v1'
};
let syncing=false;

function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
function now(){return Date.now()}
function ntime(v){const n=Number(v||0);return Number.isFinite(n)&&n>0?n:0}
function uid(day,id){return `d${Number(day)}:${String(id||'').trim()}`}
function load(){const x=read(KEY);return x&&typeof x==='object'?x:{version:1,updatedAt:0,records:{}}}
function save(db){db.version=1;db.updatedAt=now();try{localStorage.setItem(KEY,JSON.stringify(db))}catch(_){}return db}
function clone(x){return JSON.parse(JSON.stringify(x))}
function hashText(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)}

function ensure(db,day,id,meta){
  const k=uid(day,id);if(!id)return null;
  const old=db.records[k]||{};
  const m=meta||{};
  const oldResolved=ntime(old.resolvedAt);
  const rec=db.records[k]={
    uid:k,day:Number(day),questionId:String(id),
    title:m.title||old.title||'',concept:m.concept||old.concept||'',branch:m.branch||old.branch||'',
    firstWrongAt:ntime(old.firstWrongAt)||ntime(m.at)||now(),lastWrongAt:Math.max(ntime(old.lastWrongAt),ntime(m.at)),
    wrongCount:Math.max(Number(old.wrongCount||0),Number(m.wrongCount||0)),
    gateWrongCount:Number(old.gateWrongCount||0),gateCorrectCount:Number(old.gateCorrectCount||0),bookResolvedCount:Number(old.bookResolvedCount||0),
    lastPicked:m.lastPicked||old.lastPicked||'',depth:m.depth||old.depth||'',skill:m.skill||old.skill||'',
    status:old.status||'open',resolvedAt:oldResolved,lastResolvedAt:Math.max(ntime(old.lastResolvedAt),oldResolved),lastGateAt:ntime(old.lastGateAt),lastBookPromptAt:ntime(old.lastBookPromptAt),
    locator:old.locator||null,source:'history2'
  };
  return rec;
}

function needsBookLookupValue(rec){
  if(!rec)return false;
  const prompt=ntime(rec.lastBookPromptAt),cleared=Math.max(ntime(rec.lastResolvedAt),ntime(rec.lastWrongAt));
  return prompt>cleared;
}
function reopenIfNewSourceWrong(rec,wrongAt){
  const at=ntime(wrongAt),resolved=ntime(rec&&rec.resolvedAt);
  if(!rec||rec.status!=='resolved'||!resolved||!at||at<=resolved)return false;
  rec.lastResolvedAt=Math.max(ntime(rec.lastResolvedAt),resolved);
  rec.resolvedAt=0;
  rec.status=Number(rec.gateWrongCount||0)>=2?'recurring':'open';
  return true;
}
function resolveRecord(rec,at){
  if(!rec)return;
  const t=ntime(at)||now();
  rec.status='resolved';rec.resolvedAt=t;rec.lastResolvedAt=Math.max(ntime(rec.lastResolvedAt),t);
}

function scanDetailed(db,day,state){
  const notes=state&&state.wrongNotes||{};
  Object.entries(notes).forEach(([id,w])=>{
    if(!w)return;
    const n=Math.max(1,Number(w.wrongCount||1)),m=w.metacog||{},old=db.records[uid(day,id)]||null;
    const wrongAt=ntime(w.lastWrongAt)||ntime(w.lastAt)||ntime(w.updatedAt)||ntime(w.createdAt)||ntime(old&&old.lastWrongAt)||now();
    const rec=ensure(db,day,id,{title:w.title||m.problemTitle||'',concept:m.conceptTitle||'',branch:m.branchLabel||'',wrongCount:n,at:wrongAt,depth:m.depth||m.metacogDepth||'',skill:m.skill||''});
    if(!rec)return;
    rec.wrongCount=Math.max(rec.wrongCount,n);
    reopenIfNewSourceWrong(rec,wrongAt);
    const ps=state.problemStatus&&state.problemStatus[id];
    const masteredAt=Math.max(ntime(w.masteredAt),ps&&ps.status==='mastered'?Math.max(ntime(ps.at),ntime(ps.updatedAt)):0);
    if(ps&&ps.status==='mastered'&&masteredAt&&masteredAt>=wrongAt&&rec.status!=='resolved')resolveRecord(rec,masteredAt);
  });
}

function scanFast(db,day,state){
  const per={};
  (state&&Array.isArray(state.history)?state.history:[]).forEach(e=>{
    if(!e||!e.questionId)return;
    const x=per[e.questionId]||(per[e.questionId]={wrong:0,last:null,lastWrong:null,title:'',concept:e.concept||'',branch:e.branch||'',depth:'',skill:'',picked:''});
    if(e.correct===false){x.wrong++;x.lastWrong=e;if(e.diagnosis){x.depth=e.diagnosis.depth||x.depth;x.skill=e.diagnosis.skill||x.skill;x.picked=e.diagnosis.picked||x.picked}}
    x.last=e;x.concept=e.concept||x.concept;x.branch=e.branch||x.branch;
  });
  Object.entries(per).forEach(([id,x])=>{
    if(!x.wrong)return;
    const old=db.records[uid(day,id)]||null;
    const wrongAt=ntime(x.lastWrong&&x.lastWrong.at)||ntime(old&&old.lastWrongAt)||now();
    const rec=ensure(db,day,id,{concept:x.concept,branch:x.branch,wrongCount:x.wrong,at:wrongAt,depth:x.depth,skill:x.skill,lastPicked:x.picked});
    if(!rec)return;
    rec.wrongCount=Math.max(rec.wrongCount,x.wrong);
    reopenIfNewSourceWrong(rec,wrongAt);
    const lastAt=ntime(x.last&&x.last.at);
    if(x.last&&x.last.correct===true&&lastAt>=wrongAt&&rec.status!=='resolved')resolveRecord(rec,lastAt||now());
  });
}

async function enrichLocators(db){
  const locator=g.H2TextbookLocator;if(!locator||typeof locator.get!=='function')return db;
  const jobs=Object.values(db.records).map(async rec=>{
    const item={id:rec.questionId,branch:rec.branch,concept:rec.concept,recovery:{path:[rec.branch,rec.concept].filter(Boolean)}};
    try{rec.locator=await locator.get(rec.day,rec.questionId,item)}catch(_){}
  });
  await Promise.all(jobs);return db;
}

async function sync(){
  if(syncing)return load();syncing=true;
  try{
    const db=load();
    for(let d=1;d<=6;d++)scanDetailed(db,d,read(DAY_KEYS[d])||{});
    for(let d=7;d<=18;d++)scanFast(db,d,read(`history2-fast-day-${d}`)||{});
    await enrichLocators(db);save(db);return db;
  }finally{syncing=false}
}

function all(){return Object.values(load().records).sort((a,b)=>ntime(b.lastWrongAt)-ntime(a.lastWrongAt))}
function get(idOrUid,day){const db=load();const k=day?uid(day,idOrUid):String(idOrUid);return db.records[k]||null}
function needsBookLookup(idOrRec,day){const rec=idOrRec&&typeof idOrRec==='object'?idOrRec:get(idOrRec,day);return needsBookLookupValue(rec)}
function actionableBefore(targetDay,limit){
  const t=Number(targetDay)||99;
  return all().filter(r=>r.day<t&&r.status!=='resolved').sort((a,b)=>{
    const ar=(a.status==='recurring'?100:0)+(a.gateWrongCount||0)*10+(a.wrongCount||0)*3;
    const br=(b.status==='recurring'?100:0)+(b.gateWrongCount||0)*10+(b.wrongCount||0)*3;
    return br-ar||ntime(b.lastWrongAt)-ntime(a.lastWrongAt);
  }).slice(0,Math.max(1,Number(limit)||3));
}
function historicalBefore(targetDay,limit){
  const t=Number(targetDay)||99;
  return all().filter(r=>r.day<t).sort((a,b)=>{
    const ar=(a.status!=='resolved'?50:0)+(a.gateWrongCount||0)*8+(a.wrongCount||0)*2;
    const br=(b.status!=='resolved'?50:0)+(b.gateWrongCount||0)*8+(b.wrongCount||0)*2;
    return br-ar||ntime(b.lastWrongAt)-ntime(a.lastWrongAt);
  }).slice(0,Math.max(1,Number(limit)||3));
}
function sourceRevisionBefore(targetDay){
  const t=Number(targetDay)||99;
  const rows=all().filter(r=>r.day<t).sort((a,b)=>String(a.uid).localeCompare(String(b.uid))).map(r=>`${r.uid}|${Number(r.wrongCount||0)}|${ntime(r.lastWrongAt)}`);
  return `v1:${rows.length}:${hashText(rows.join('~'))}`;
}
function markGateAttempt(recordUid,correct,opts){
  const db=load(),r=db.records[recordUid];if(!r)return null;const o=opts||{};
  r.lastGateAt=now();
  if(correct){r.gateCorrectCount=(r.gateCorrectCount||0)+1;resolveRecord(r,r.lastGateAt);if(o.bookUsed)r.bookResolvedCount=(r.bookResolvedCount||0)+1}
  else{r.gateWrongCount=(r.gateWrongCount||0)+1;r.status=r.gateWrongCount>=2?'recurring':'book-retry';r.lastBookPromptAt=r.lastGateAt;r.resolvedAt=0}
  save(db);return clone(r);
}
function reopen(recordUid){const db=load(),r=db.records[recordUid];if(!r)return null;const old=ntime(r.resolvedAt);if(old)r.lastResolvedAt=Math.max(ntime(r.lastResolvedAt),old);r.status='open';r.resolvedAt=0;save(db);return clone(r)}
function stats(){const a=all();return{total:a.length,open:a.filter(x=>x.status!=='resolved').length,resolved:a.filter(x=>x.status==='resolved').length,recurring:a.filter(x=>x.status==='recurring').length,pendingBook:a.filter(needsBookLookupValue).length}}

g.H2WrongAnswerRegistry={KEY,sync,all,get,needsBookLookup,actionableBefore,historicalBefore,sourceRevisionBefore,markGateAttempt,reopen,stats};

setTimeout(()=>sync(),0);
window.addEventListener('history2:local-dirty',e=>{
  const k=e&&e.detail&&e.detail.key||'';
  if(k===KEY)return;
  if(/^history2-(?:day[1-6]|fast-day-)/.test(k))setTimeout(()=>sync(),30);
});
})(window);