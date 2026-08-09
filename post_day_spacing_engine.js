(function(g){
'use strict';
const VERSION='1.1.0-post-day-spacing-composite-key';
const MARKER_KEY='history2-unit1-day-session-end-v1';
const HISTORY_KEY='history2-unit1-post-day-session-history-v1';
function now(){return Date.now()}
function parse(v,f){try{return v?JSON.parse(v):f}catch(e){return f}}
function get(k){try{return localStorage.getItem(k)}catch(e){return null}}
function set(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function dateKey(ts=now()){const d=new Date(Number(ts)||now());return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')}
function itemKey(x){return x&&x.id?'d'+Number(x.day)+':'+x.id:''}
function history(){const a=parse(get(HISTORY_KEY),[]);return Array.isArray(a)?a:[]}
function saveHistory(a){set(HISTORY_KEY,JSON.stringify((a||[]).slice(-60)))}
function current(){const m=parse(get(MARKER_KEY),null);return m&&m.id?m:null}
function saveMarker(m){set(MARKER_KEY,JSON.stringify(m));const a=history(),i=a.findIndex(x=>x.id===m.id);if(i>=0)a[i]={...a[i],...m};else a.push(m);saveHistory(a);return m}
function begin(day,finishedAt,items,plan){
  const t=Number(finishedAt)||now(),sessionKey=String(day)+':'+String(t),prev=current();if(prev&&prev.sessionKey===sessionKey)return prev;
  const selected=(items||[]).slice(0,3),plannedKeys=selected.map(itemKey),candidateKeys=Array.isArray(plan?.candidateKeys)?plan.candidateKeys.slice(0,8):(Array.isArray(plan?.candidates)?plan.candidates.slice(0,8).map(itemKey):plannedKeys.slice()),skippedKeys=Array.isArray(plan?.skippedKeys)?plan.skippedKeys.slice(0,8):candidateKeys.filter(k=>!plannedKeys.includes(k));
  const decision=plan?{version:plan.version||'',count:selected.length,cap:Number(plan.cap??3),reasons:Array.isArray(plan.reasons)?plan.reasons.slice(0,4):[],branchPolicies:Array.isArray(plan.branchPolicies)?plan.branchPolicies.slice(0,8):[]}:null;
  const m={id:'pds-'+String(day)+'-'+String(t),sessionKey,version:VERSION,policyVersion:plan?.version||null,day:Number(day),finishedAt:t,dateKey:dateKey(),startedAt:now(),candidateKeys,plannedKeys,skippedKeys,candidateIds:selected.map(x=>x.id),plannedIds:selected.map(x=>x.id),skippedIds:Array.isArray(plan?.skippedIds)?plan.skippedIds.slice(0,8):[],plannedCount:selected.length,completedKeys:[],completedIds:[],itemResults:{},attempts:0,correct:0,decision,closedAt:null,closeReason:null};
  return saveMarker(m)
}
function record(item,correct){
  const m=current();if(!m)return null;m.attempts=Number(m.attempts||0)+1;const id=item?.id||'',k=itemKey(item);
  if(k){m.itemResults=m.itemResults&&typeof m.itemResults==='object'?m.itemResults:{};const r=m.itemResults[k]||(m.itemResults[k]={day:Number(item.day),id,attempts:0,correctCount:0,firstCorrect:null,completedAt:null});r.attempts++;if(r.firstCorrect===null)r.firstCorrect=!!correct;if(correct){r.correctCount++;r.completedAt=r.completedAt||now()}}
  if(correct){m.correct=Number(m.correct||0)+1;m.completedKeys=Array.isArray(m.completedKeys)?m.completedKeys:[];if(k&&!m.completedKeys.includes(k))m.completedKeys.push(k);if(id&&!m.completedIds.includes(id))m.completedIds.push(id)}m.lastAttemptAt=now();m.lastCheckKey=k||null;m.lastCheckId=id||null;return saveMarker(m)
}
function close(reason='completed'){const m=current();if(!m)return null;m.closedAt=m.closedAt||now();m.closeReason=m.closeReason||reason;return saveMarker(m)}
function isToday(m=current()){return !!(m&&m.dateKey===dateKey())}
function sameDayLock(nextDay){const m=current();if(!isToday(m))return false;const n=nextDay==null?null:Number(nextDay);return Number(m.day)===6||n===Number(m.day)+1}
function remaining(memory){
  const m=current();if(!m)return[];
  if(Array.isArray(m.plannedKeys)&&m.plannedKeys.length){const done=new Set(m.completedKeys||[]),want=new Set(m.plannedKeys);return (memory||[]).filter(x=>want.has(itemKey(x))&&!done.has(itemKey(x))).slice(0,3)}
  return []
}
function snapshot(storage){let sourceAttempts=0,spacingAttempts=0,postDayAttempts=0,standaloneSpacingAttempts=0,completedDays=0;Object.entries(storage||{}).forEach(([d,k])=>{const s=parse(get(k),{});if(s.finishedAt||s.phase==='done')completedDays++;sourceAttempts+=Array.isArray(s.attempts)?s.attempts.length:0;(Array.isArray(s.reviewAttempts)?s.reviewAttempts:[]).forEach(a=>{if(a.context==='spacing'||a.context==='post-day-spacing'){spacingAttempts++;if(a.context==='post-day-spacing')postDayAttempts++;else standaloneSpacingAttempts++}})});const rows=history();return {version:VERSION,completedDays,sourceAttempts,spacingAttempts,postDayAttempts,standaloneSpacingAttempts,sessions:rows.length,closedSessions:rows.filter(x=>x.closedAt).length,recalledItems:rows.reduce((n,x)=>n+(Array.isArray(x.completedKeys)?x.completedKeys.length:(x.completedIds||[]).length),0),current:current(),rows:rows.slice(-20).reverse()}}
g.H2PostDaySpacing={VERSION,MARKER_KEY,HISTORY_KEY,dateKey,itemKey,current,begin,record,close,isToday,sameDayLock,remaining,snapshot,history};
})(window);
