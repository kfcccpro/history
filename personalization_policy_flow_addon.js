(function(){
'use strict';
if(!window.H2Policy||typeof META==='undefined'||typeof dueData!=='function'||typeof saveReview!=='function'||typeof renderReview!=='function')return;
let ctx=null;
function ctxFor(x){if(!x)return null;const key=`${x.day}:${x.id}`;if(!ctx||ctx.key!==key)ctx={id:'sr-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,6),key,startedAt:Date.now(),actions:0,retries:0,firstCorrect:null};return ctx}
function policyForItem(x){if(!x)return null;const r=H2Policy.route(Number(x.day),x.problemId);return r?H2Policy.branchPolicy(r.branchLabel):null}
if(typeof intervalDays==='function'){
  const baseInterval=intervalDays;
  intervalDays=function(log){const base=baseInterval(log),item=(META.memory||[]).find(x=>x.id===log?.id),pol=policyForItem(item);if(!pol)return base;if(pol.spacingMode==='tighten'){if(base>=7)return 3;if(base>=3)return 1;return 1}if(pol.spacingMode==='ease'){if(base<=1)return 3;return 7}if(pol.spacingMode==='light')return 7;return base}
}
const baseDue=dueData;
dueData=function(){const rows=baseDue(),seenStable=new Set();return rows.sort((a,b)=>{const pa=policyForItem(a),pb=policyForItem(b),aa=(pa?.longTermWeak||pa?.selectedMethod==='spacing-recall')?1:0,bb=(pb?.longTermWeak||pb?.selectedMethod==='spacing-recall')?1:0;return bb-aa||Number(a.due||0)-Number(b.due||0)}).filter(x=>{if(x._retentionEpisodeId)return true;const p=policyForItem(x);if(!p||p.fadeLevel<2)return true;const r=H2Policy.route(Number(x.day),x.problemId),k=r?.branchLabel||'';if(!k)return true;if(seenStable.has(k))return false;seenStable.add(k);return true})};
const baseRender=renderReview;
renderReview=function(){const x=queue&&queue[idx];if(x)ctxFor(x);return baseRender()};
const baseSave=saveReview;
saveReview=function(x,input,correct){const c=ctxFor(x),first=c&&c.firstCorrect===null;if(c){c.actions++;if(first)c.firstCorrect=!!correct;if(!correct)c.retries++}baseSave(x,input,correct);if(first)H2Policy.recordRecallEvidence(Number(x.day),x.problemId,!!correct,Date.now(),{checkId:x.id,policySource:'spacing-first-attempt'});if(correct&&c){H2Policy.createSpacingEpisode(x,c,!!c.firstCorrect,Date.now())}};
const baseStart=startFlow;startFlow=function(){ctx=null;return baseStart()};
render();
})();
