(function(){
'use strict';
if(window.__H2_UNIFIED_LEARNING_JOURNEY__)return;
window.__H2_UNIFIED_LEARNING_JOURNEY__=true;

const path=location.pathname||'';
const full=/\/korean_history2_day([1-6])_student_flow_app\.html$/i.test(path);
const fast=/\/fast_day\.html$/i.test(path);
const adaptive=/\/adaptive_fast_review\.html$/i.test(path);
if(!full&&!fast&&!adaptive)return;

const STEPS=[
  {id:'start',no:'1',label:'시작'},
  {id:'question',no:'2',label:'문제'},
  {id:'diagnosis',no:'3',label:'진단'},
  {id:'repair',no:'4',label:'복구'},
  {id:'result',no:'5',label:'결과'},
  {id:'next',no:'6',label:'다음 학습'}
];

const style=document.createElement('style');
style.id='h2-unified-learning-journey-style';
style.textContent=`
  .h2-journey{width:min(1500px,calc(100% - 28px));margin:12px auto 4px;padding:12px 14px;border:1px solid #dbe5ed;border-radius:18px;background:rgba(255,255,255,.96);box-shadow:0 7px 22px rgba(16,43,76,.045);position:relative;z-index:16}
  .h2-journey-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:10px}
  .h2-journey-title{font-size:15px;font-weight:950;color:#536b83}.h2-journey-now{font-size:16px;font-weight:1000;color:#173b60;white-space:nowrap}
  .h2-journey-steps{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px}
  .h2-journey-step{min-height:46px;border-radius:13px;background:#f3f6f9;color:#8695a5;display:flex;align-items:center;justify-content:center;gap:7px;padding:8px 9px;font-size:15px;font-weight:900;line-height:1.2;text-align:center}
  .h2-journey-step b{display:grid;place-items:center;width:24px;height:24px;border-radius:50%;background:#e4ebf1;color:#718397;font-size:13px;flex:0 0 24px}
  .h2-journey-step.done{background:#edf7f3;color:#39705e}.h2-journey-step.done b{background:#d8eee5;color:#17664d}
  .h2-journey-step.on{background:#eaf4fc;color:#175e93;box-shadow:inset 0 0 0 2px #7db2d6}.h2-journey-step.on b{background:#1d6fb8;color:#fff}
  .h2-journey-step.future{opacity:.72}
  .h2-next-action{width:min(1180px,calc(100% - 28px));margin:18px auto 28px;border:2px solid #caddeb;border-radius:22px;background:#f5faff;padding:22px 24px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:18px;align-items:center;box-shadow:0 9px 28px rgba(16,43,76,.06)}
  .h2-next-action .eyebrow{font-size:16px;font-weight:1000;color:#1d6fb8;margin-bottom:7px}.h2-next-action strong{display:block;font-size:clamp(24px,2.4vw,34px);line-height:1.25;color:#183b5d;letter-spacing:-.025em}.h2-next-action p{margin:8px 0 0;font-size:18px;line-height:1.5;color:#5b7187;font-weight:820;word-break:keep-all}
  .h2-next-action a{display:grid;place-items:center;min-width:190px;min-height:64px;padding:0 22px;border-radius:16px;background:#102b4c;color:#fff;text-decoration:none;font-size:19px;font-weight:1000}
  @media(max-width:820px){.h2-journey{width:calc(100% - 20px);padding:10px}.h2-journey-head{margin-bottom:8px}.h2-journey-title{font-size:14px}.h2-journey-now{font-size:14px}.h2-journey-steps{grid-template-columns:repeat(3,1fr)}.h2-journey-step{min-height:42px;font-size:14px}.h2-next-action{width:calc(100% - 20px);grid-template-columns:1fr;padding:19px}.h2-next-action strong{font-size:25px}.h2-next-action p{font-size:17px}.h2-next-action a{min-height:58px;min-width:0}}
  @media(orientation:landscape) and (max-height:700px){.h2-journey{padding:8px 10px;margin-top:6px}.h2-journey-head{display:none}.h2-journey-step{min-height:36px;font-size:13px;padding:5px}.h2-journey-step b{width:20px;height:20px;flex-basis:20px;font-size:11px}.h2-next-action{padding:15px 18px;margin-top:12px}.h2-next-action .eyebrow{font-size:14px}.h2-next-action strong{font-size:22px}.h2-next-action p{font-size:16px}.h2-next-action a{min-height:52px;font-size:17px}}
`;
document.head.appendChild(style);

function rank(id){return STEPS.findIndex(x=>x.id===id)}
function detect(){
  if(full&&document.querySelector('#appMain .parent-wrap'))return {hidden:true};
  if(adaptive){
    if(document.querySelector('.done-card'))return {stage:'result',note:'취약 문제 복습 결과를 확인합니다.',done:true};
    if(document.querySelector('.repair-card'))return {stage:'repair',note:'진단된 부분만 짧게 복구합니다.'};
    if(document.querySelector('.question-card .feedback.bad'))return {stage:'diagnosis',note:'왜 틀렸는지 먼저 확인합니다.'};
    if(document.querySelector('.question-card'))return {stage:'question',note:'취약 문제를 다시 풀어 확인합니다.'};
    return {stage:'start',note:'틀렸던 문제만 골라 다시 시작합니다.'};
  }
  if(fast){
    if(document.querySelector('.done-card'))return {stage:'result',note:'오늘의 결과와 다음 학습을 확인합니다.',done:true};
    if(document.querySelector('.repair-card'))return {stage:'repair',note:'진단된 한 부분만 복구한 뒤 원문제로 돌아갑니다.'};
    if(document.querySelector('.question-card .feedback.bad'))return {stage:'diagnosis',note:'내가 고른 보기와 막힌 Depth를 확인합니다.'};
    if(document.querySelector('.question-card'))return {stage:'question',note:'문제를 읽고 먼저 스스로 판단합니다.'};
    return {stage:'start',note:'큰 흐름을 보고 바로 문제로 들어갑니다.'};
  }
  if(document.querySelector('.wrongbook-wrap'))return {stage:'repair',note:'틀렸던 핵심을 직접 회상해 다시 연결합니다.'};
  if(document.querySelector('.closing-head'))return {stage:'result',note:'채운 가지와 남은 오답을 확인합니다.',done:true};
  if(document.querySelector('.feedback-screen')){
    if(document.querySelector('.selected-answer'))return {stage:'diagnosis',note:'내가 무엇을 잘못 연결했는지 먼저 확인합니다.'};
    return {stage:'repair',note:'필요한 Depth만 복구하고 원문제로 돌아갑니다.'};
  }
  if(document.querySelector('.question-panel'))return {stage:'question',note:'문제를 먼저 풀고, 틀리면 이유를 찾습니다.'};
  return {stage:'start',note:'오늘의 큰 지도를 보고 문제로 들어갑니다.'};
}

function host(){
  if(full){const main=document.querySelector('main');return main&&main.parentElement?main.parentElement:document.body}
  return document.querySelector('#app')||document.body;
}
function insertJourney(el){
  if(full){const main=document.querySelector('main');if(main)main.insertAdjacentElement('beforebegin',el);else document.body.prepend(el);return}
  const shell=document.querySelector('.shell');if(shell)shell.insertBefore(el,shell.firstChild);else (document.querySelector('#app')||document.body).prepend(el);
}
function renderJourney(stage,note){
  let el=document.getElementById('h2UnifiedJourney');
  if(!el){el=document.createElement('section');el.id='h2UnifiedJourney';el.className='h2-journey';insertJourney(el)}
  const r=rank(stage);
  el.innerHTML=`<div class="h2-journey-head"><span class="h2-journey-title">오늘 학습 흐름</span><span class="h2-journey-now">지금 · ${STEPS[r]?.label||'학습'}</span></div><div class="h2-journey-steps">${STEPS.map((s,i)=>`<div class="h2-journey-step ${i<r?'done':i===r?'on':'future'}"><b>${s.no}</b><span>${s.label}</span></div>`).join('')}</div>`;
  el.title=note||'';
}
function removeJourney(){const x=document.getElementById('h2UnifiedJourney');if(x)x.remove();const n=document.getElementById('h2UnifiedNextAction');if(n)n.remove()}
function recommendation(){try{return window.H2WeaknessProfile&&H2WeaknessProfile.recommend?H2WeaknessProfile.recommend():null}catch(_){return null}}
function renderNext(){
  if(document.getElementById('h2UnifiedNextAction'))return;
  const rec=recommendation();if(!rec||!rec.href)return;
  const el=document.createElement('section');el.id='h2UnifiedNextAction';el.className='h2-next-action';
  el.innerHTML=`<div><div class="eyebrow">6 · 다음 학습</div><strong>${escapeHtml(rec.title||'다음 학습')}</strong><p>${escapeHtml(rec.detail||'지금 기록을 기준으로 다음 학습을 이어갑니다.')}</p></div><a href="${escapeAttr(rec.href)}">${rec.type==='review'?'취약 복습 시작':'다음 학습 시작'} →</a>`;
  if(full){const main=document.querySelector('main');if(main)main.insertAdjacentElement('afterend',el);else document.body.appendChild(el)}else{const shell=document.querySelector('.shell');if(shell)shell.appendChild(el);else (document.querySelector('#app')||document.body).appendChild(el)}
}
function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(v){return String(v??'').replace(/["'<>]/g,'')}

let queued=false,last='';
function update(){
  queued=false;
  const d=detect();
  if(d.hidden){removeJourney();return}
  const key=`${d.stage}|${d.done?'1':'0'}|${d.note||''}`;
  if(key!==last){last=key;renderJourney(d.stage,d.note)}
  const next=document.getElementById('h2UnifiedNextAction');
  if(d.done){if(!next)setTimeout(renderNext,20)}else if(next)next.remove();
}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(update)}
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
window.addEventListener('history2:cloud-reconciled',()=>setTimeout(schedule,80));
})();