(function(){
'use strict';
if(!window.H2Policy||typeof COURSE==='undefined'||typeof state==='undefined'||typeof explanationSteps!=='function')return;
const mt=String(COURSE.meta&&COURSE.meta.id||'').match(/day(\d+)/i),DAYNUM=mt?Number(mt[1]):0;
if(!DAYNUM)return;
state.interventionPolicyLog=state.interventionPolicyLog||[];state.policyDecisionLog=state.policyDecisionLog||[];
const css=`.policy-prereq{max-width:720px;margin:auto}.policy-prereq .k{font-size:12px;font-weight:950;color:#64748b;letter-spacing:.04em;margin-bottom:9px}.policy-prereq h2{font-size:clamp(28px,4vw,40px);line-height:1.15;margin:0 0 8px}.policy-prereq p{color:#5c6c80;font-weight:760;line-height:1.6;margin:0 0 15px}.policy-prereq .branch{display:inline-block;padding:7px 10px;border-radius:999px;background:#eef4f9;color:#426987;font-size:12px;font-weight:900;margin-bottom:12px}.policy-prereq input{width:100%;height:64px;border:3px solid #d5dfeb;border-radius:17px;padding:0 16px;text-align:center;font:inherit;font-size:24px;font-weight:900}.policy-prereq input:focus{outline:none;border-color:#4397d6;box-shadow:0 0 0 5px rgba(67,151,214,.12)}.policy-prereq .msg{min-height:24px;margin:12px 0 0;color:#8b5a18;font-size:14px;font-weight:850}.policy-prereq .msg.ok{color:#217a53}`;
const st=document.createElement('style');st.id='personalizedPolicyDayStyles';st.textContent=css;document.head.appendChild(st);
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(v){return String(v||'').replace(/[\s·.,()\-_/]/g,'').toLowerCase()}
function polFor(p){const r=H2Policy.route(DAYNUM,p.id);return r?H2Policy.branchPolicy(r.branchLabel):null}
function resetPrereq(){runtime._policyPrereq=null}
function initPrereq(p){if(runtime._policyPrereq&&runtime._policyPrereq.problemId===p.id)return runtime._policyPrereq;const q=H2Policy.prerequisiteFor(DAYNUM,p.id);if(!q)return null;runtime._policyPrereq={problemId:p.id,data:q,tries:0,actions:0,startedAt:Date.now(),msg:'',done:false};H2Policy.logDecision(DAYNUM,{key:`prereq:${p.id}:${q.branchLabel}:${Math.floor(Date.now()/86400000)}`,type:'strengthen',problemId:p.id,branchLabel:q.branchLabel,action:'insert-prerequisite-keyword',reason:q.policy.reason});return runtime._policyPrereq}
function renderPrereq(p){const s=initPrereq(p);if(!s)return '';const m=s.data.memory||{};return `<div class="policy-prereq"><div class="k">복구 전에 연결 하나만</div><span class="branch">${esc(s.data.branchLabel)}</span><h2>위쪽 핵심 하나 먼저</h2><p>${esc(m.prompt||s.data.conceptTitle)}</p><input id="policyPrereqInput" autocomplete="off" spellcheck="false" placeholder="핵심어 입력"><div class="msg ${s.msg==='연결됨'?'ok':''}">${esc(s.msg)}</div><button class="primary" id="policyPrereqSubmit" style="margin-top:10px">입력 확인</button></div>`}
function bindPrereq(){const p=currentProblem(),s=runtime._policyPrereq;if(!s)return;const inp=document.getElementById('policyPrereqInput'),btn=document.getElementById('policyPrereqSubmit');const run=()=>{const v=String(inp&&inp.value||'').trim();if(!v)return;s.actions++;s.tries++;const m=s.data.memory||{},accepted=[m.answer,...(m.accepted||[])].filter(Boolean),ok=accepted.some(x=>norm(x)===norm(v));if(ok){s.msg='연결됨';render();setTimeout(()=>{runtime.feedbackStep++;resetPrereq();render()},350)}else{s.msg=s.tries===1?'힌트 · '+(m.hint||String(m.answer||'').slice(0,1)+'…'):'정답을 한 번 보고 다시 직접 입력: '+(m.answer||s.data.conceptTitle);if(inp)inp.value='';render()}};if(btn)btn.onclick=run;if(inp){setTimeout(()=>inp.focus(),40);inp.onkeydown=e=>{if(e.key==='Enter')run()}}}
// Fade/selection policy for the already existing automatic precheck.
if(window.H2LearningEffect&&typeof H2LearningEffect.shouldPrecheck==='function'){
  const baseShould=H2LearningEffect.shouldPrecheck;
  H2LearningEffect.shouldPrecheck=function(day,pid,storage,now){const base=baseShould(day,pid,storage,now);if(!base||!base.eligible)return base;const r=H2Policy.route(day,pid);if(!r)return base;const pol=H2Policy.branchPolicy(r.branchLabel);if(pol.skipPrecheck){H2Policy.logDecision(Number(day),{key:`precheck-skip:${pid}:${r.branchLabel}:${Math.floor((now||Date.now())/86400000)}`,type:'fade',problemId:pid,branchLabel:r.branchLabel,action:'skip-precheck',reason:pol.reason});return {...base,eligible:false,reason:'personalized-policy-fade',policy:pol}}return {...base,policy:pol}}
}
const baseSteps=explanationSteps;
explanationSteps=function(p){let s=baseSteps(p).filter(x=>x!=='policy-prereq');const pol=polFor(p);if(pol&&pol.skipPattern)s=s.filter(x=>x!=='pattern');if(pol&&pol.needPrereq&&s.includes('depth-ladder')){const i=s.indexOf('depth-ladder');s.splice(i,0,'policy-prereq')}return s};
const baseRenderExplanation=renderExplanation;
renderExplanation=function(p){const steps=explanationSteps(p),kind=steps[Math.min(runtime.feedbackStep,steps.length-1)];if(kind==='policy-prereq')return `<div class="learn-grid">${renderPath(p)}<section class="panel feedback-screen"><div class="repair-card">${repairProgress(runtime.feedbackStep,steps.length)}${renderPrereq(p)}</div></section></div>`;return baseRenderExplanation(p)};
const baseBind=bind;bind=function(){baseBind();bindPrereq()};
const baseReset=resetRuntimeForQuestion;resetRuntimeForQuestion=function(){resetPrereq();return baseReset()};
const baseCheck=checkAnswer;
checkAnswer=function(){const p=currentProblem(),before=(state.attempts||[]).length;baseCheck();const arr=state.attempts||[],attempt=arr.length>before?arr[arr.length-1]:null;if(!attempt)return;H2Policy.syncLegacyDay(DAYNUM);H2Policy.assignImmediate(DAYNUM,p.id,attempt);H2Policy.recordOriginalEvidence(DAYNUM,p.id,!!attempt.correct,Number(attempt.at||Date.now()));try{const fresh=H2Policy.readState(DAYNUM);state.interventionPolicyLog=fresh.interventionPolicyLog||[];state.policyDecisionLog=fresh.policyDecisionLog||[]}catch(e){}}
H2Policy.syncLegacyDay(DAYNUM);render();
})();
