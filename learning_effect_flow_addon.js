(function(){
'use strict';
if(!window.H2LearningEffect||typeof dueData!=='function'||typeof saveReview!=='function'||typeof META==='undefined')return;
const baseDue=dueData;dueData=function(){const retention=H2LearningEffect.dueRetentionMemory(META.memory),base=baseDue(),keys=new Set(retention.map(x=>`${x.day}:${x.id}`));return [...retention,...base.filter(x=>!keys.has(`${x.day}:${x.id}`))]};
const baseSave=saveReview;saveReview=function(x,input,correct){baseSave(x,input,correct);if(x&&x._retentionEpisodeId&&x._retentionWindow)H2LearningEffect.recordMemoryEvidence(Number(x.day),x._retentionEpisodeId,x._retentionWindow,correct,{checkId:x.id,problemId:x.problemId,dueAt:x._retentionDueAt,observedDelayDays:Math.max(0,(Date.now()-Number(x._retentionDueAt||Date.now()))/H2LearningEffect.DAY)})};
const baseRenderReview=renderReview;renderReview=function(){const html=baseRenderReview();const x=queue[idx];if(!x||!x._retentionLabel)return html;return html.replace(/<div class="step">기억 ([^<]+)<\/div>/,`<div class="step">${x._retentionLabel} 뒤 확인 · 기억 $1</div>`)};
render();
})();
