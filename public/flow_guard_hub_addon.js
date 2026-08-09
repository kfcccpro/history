(function(){
'use strict';
if(!window.H2FlowGuard||typeof META==='undefined'||typeof render!=='function')return;
const G=H2FlowGuard;let recovering=false,verifyTimer=null;
function validPhase(){return ['hero','review','bridge','done','postreview','sessiondone'].includes(phase)}
function sanitizeState(reason){
 const d=typeof nextDay==='function'?nextDay():null;
 if(!validPhase())phase='hero';
 if(d&&phase==='review'){phase='hero';queue=[];idx=0;tries=0;msg='';showAnswer=false;}
 if(phase==='review'&&(!Array.isArray(queue)||!queue.length)){phase=d?'hero':'done'}
 G.log('hub-state-sanitized',{reason,phase,nextDay:d});
}
function validDom(){const root=document.getElementById('app');if(!root||!root.textContent.trim())return false;if(root.querySelector('.resume-flow'))return G.isVisibleAction(root)||/오늘은 여기까지/.test(root.textContent);if(phase==='done'||phase==='sessiondone')return /끝|완료/.test(root.textContent);return G.isVisibleAction(root)}
function snapshot(){return {phase,queue:(queue||[]).map(x=>({id:x.id,day:x.day,problemId:x.problemId})),idx,tries,msg,showAnswer,nextDay:typeof nextDay==='function'?nextDay():null}}
function capture(){if(validPhase()&&validDom())G.saveSafe('hub','main',snapshot())}
function recover(reason,error){if(recovering)return;recovering=true;try{const safe=G.lastSafe('hub','main');if(safe&&['hero','review','bridge','done','postreview','sessiondone'].includes(safe.phase)){phase=safe.phase==='review'&&nextDay()?'hero':safe.phase;idx=Number(safe.idx||0);tries=Number(safe.tries||0);msg=String(safe.msg||'');showAnswer=!!safe.showAnswer;if(phase==='review')queue=dueData().slice(0,5);else if(phase==='postreview'&&window.H2PostDaySpacingHub)queue=H2PostDaySpacingHub.restoreQueue();else queue=[];}else sanitizeState(reason);G.log('hub-auto-recovery',{reason,error:String(error?.message||error||''),restoredPhase:phase});baseRender();setTimeout(capture,20)}catch(e){G.log('hub-recovery-failed',{reason,error:String(e?.message||e)})}finally{recovering=false}}
const baseRender=render;
render=function(){if(recovering)return baseRender();if(!validPhase())sanitizeState('invalid-phase-before-render');try{const r=baseRender();clearTimeout(verifyTimer);verifyTimer=setTimeout(()=>{if(!validDom())recover('dead-end-dom');else capture()},35);return r}catch(e){recover('render-exception',e)}};
window.addEventListener('error',e=>G.log('hub-window-error',{message:e.message,source:e.filename,line:e.lineno,col:e.colno}));
window.addEventListener('unhandledrejection',e=>G.log('hub-unhandled-rejection',{reason:String(e.reason?.message||e.reason||'')}));
const root=document.getElementById('app');if(root)new MutationObserver(()=>{clearTimeout(verifyTimer);verifyTimer=setTimeout(()=>{if(!validDom())recover('mutation-dead-end');else capture()},60)}).observe(root,{childList:true,subtree:true});
setTimeout(()=>{if(!validDom())recover('initial-dead-end');else capture()},60);
})();
