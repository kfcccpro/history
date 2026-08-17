(function(){
'use strict';
const app=document.getElementById('app');
const params=new URLSearchParams(location.search);
const targetDay=Math.max(2,Math.min(18,Number(String(params.get('targetDay')||'2').replace(/[^0-9]/g,''))||2));
const returnUrl=String(params.get('return')||defaultReturn(targetDay));
const SESSION=`history2-pre-chapter-gate-session-v1:${targetDay}`;
const PASS=`history2-pre-chapter-gate-pass-v1:${targetDay}`;
let session=null;

function defaultReturn(d){return d<=6?`korean_history2_day${d}_student_flow_app.html`:`fast_day.html?day=${d}`}
function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function read(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
function save(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
function safeReturn(){return returnUrl&&/^(?:[A-Za-z0-9_.?=&%+\-]|%[0-9A-Fa-f]{2})+$/.test(returnUrl)?returnUrl:defaultReturn(targetDay)}
function waitSystem(){return new Promise(resolve=>{if(window.H2WrongAnswerRegistry)return resolve();let n=0;const t=setInterval(()=>{if(window.H2WrongAnswerRegistry||++n>120){clearInterval(t);resolve()}},50)})}
function makeSession(records){return{version:1,targetDay,createdAt:Date.now(),updatedAt:Date.now(),uids:records.map(r=>r.uid),done:{},awaiting:null,baselineCorrect:0}}
function reconcile(){
  if(!session||!session.awaiting||!window.H2WrongAnswerRegistry)return;
  const rec=H2WrongAnswerRegistry.get(session.awaiting);
  if(rec&&Number(rec.gateCorrectCount||0)>Number(session.baselineCorrect||0))session.done[session.awaiting]=true;
  session.awaiting=null;session.baselineCorrect=0;session.updatedAt=Date.now();save(SESSION,session);
}
function records(){return(session&&session.uids||[]).map(uid=>window.H2WrongAnswerRegistry&&H2WrongAnswerRegistry.get(uid)).filter(Boolean)}
function nextRecord(){return records().find(r=>!session.done[r.uid])||null}
function pass(){save(PASS,{version:1,targetDay,passedAt:Date.now(),uids:session?session.uids:[]});try{sessionStorage.setItem(PASS,'1')}catch(_){}location.replace(safeReturn())}
function launch(rec){
  session.awaiting=rec.uid;session.baselineCorrect=Number(rec.gateCorrectCount||0);session.updatedAt=Date.now();save(SESSION,session);
  const back=`pre_chapter_wrong_gate.html?targetDay=${targetDay}&return=${encodeURIComponent(safeReturn())}`;
  if(rec.day<=6){
    const q=new URLSearchParams({day:String(rec.day),problem:rec.questionId,gateUid:rec.uid,return:back});
    location.href=`unit1_book_gate.html?${q.toString()}`;
  }else{
    const q=new URLSearchParams({day:String(rec.day),bookGate:'1',problem:rec.questionId,gateUid:rec.uid,return:back});
    location.href=`fast_day.html?${q.toString()}`;
  }
}
function render(){
  const list=records(),next=nextRecord();
  if(!list.length)return pass();
  const slots=list.map((r,i)=>{const done=!!session.done[r.uid],now=next&&next.uid===r.uid;return `<div class="slot ${done?'done':now?'now':''}"><b>${done?'완료':'오답 '+(i+1)}</b><span>Day ${r.day}에서 한 번 이상 틀린 문제</span></div>`}).join('');
  const doneCount=list.filter(r=>session.done[r.uid]).length;
  app.innerHTML=`<div class="shell"><section class="card"><div class="kicker">새 챕터 시작 전 · 이전 오답 관문</div><h1>새 내용을 배우기 전에<br>이전 오답을 먼저 꺼냅니다.</h1><div class="lead">Day ${targetDay} 내용과 상관없는 문제도 나옵니다. 한 번이라도 틀렸던 문제를 다시 꺼내 장기 기억으로 옮깁니다.</div><div class="rule">다시 틀리면 해설과 정답을 바로 보여주지 않습니다. 앱이 알려주는 책의 페이지·챕터·목록을 직접 찾아본 뒤 같은 문제를 다시 풉니다.</div><div class="progress">${slots}</div><div class="actions"><button class="primary" id="go">${next?`이전 오답 ${doneCount+1}/${list.length} 풀기 →`:'새 챕터 시작 →'}</button><button class="secondary" id="hub">전체 Day 목록</button></div><div class="note">오답 기록은 맞힌 뒤에도 삭제하지 않고 학습 이력으로 보존합니다.</div></section></div>`;
  document.getElementById('go').onclick=()=>next?launch(next):pass();
  document.getElementById('hub').onclick=()=>location.href='fast_index.html';
}
async function boot(){
  await waitSystem();if(!window.H2WrongAnswerRegistry)return location.replace(safeReturn());
  try{await H2WrongAnswerRegistry.sync()}catch(_){}
  session=read(SESSION);
  if(!session||session.targetDay!==targetDay||!Array.isArray(session.uids)){
    const chosen=H2WrongAnswerRegistry.historicalBefore(targetDay,3);
    if(!chosen.length)return pass();session=makeSession(chosen);save(SESSION,session);
  }
  reconcile();render();
}
boot();
})();
