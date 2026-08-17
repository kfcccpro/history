(function(){
'use strict';
const params=new URLSearchParams(location.search);
if(params.get('bookGate')!=='1'||window.__H2_UNIT1_BOOK_GATE__)return;
window.__H2_UNIT1_BOOK_GATE__=true;

const requested=String(params.get('problem')||'').trim();
const gateUid=String(params.get('gateUid')||'').trim();
const returnUrl=String(params.get('return')||'pre_chapter_wrong_gate.html');
let wrapped=false,markedWrongForAttempt=false,bookSeen=false,finishing=false;

function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function dayNumber(){const m=(location.pathname||'').match(/day(\d+)_metacog/i);if(m)return Number(m[1]);try{const x=String(COURSE&&COURSE.meta&&COURSE.meta.id||'').match(/day(\d+)/i);return x?Number(x[1]):0}catch(_){return 0}}
function current(){try{return COURSE.problems&&COURSE.problems[state.problemIndex]||null}catch(_){return null}}
function root(){return document.getElementById('appMain')||document.querySelector('main')||document.body}
function registryRecord(){try{return window.H2WrongAnswerRegistry&&gateUid?H2WrongAnswerRegistry.get(gateUid):null}catch(_){return null}}
function pendingLookup(){try{return !!(window.H2WrongAnswerRegistry&&gateUid&&typeof H2WrongAnswerRegistry.needsBookLookup==='function'&&H2WrongAnswerRegistry.needsBookLookup(gateUid))}catch(_){return false}}
function guideRows(loc){
  const g=window.H2TextbookLocator&&H2TextbookLocator.guide?H2TextbookLocator.guide(loc,{includeKeywords:false}):null;
  if(!g)return '';
  const rows=(g.rows||[]).filter(r=>r.label!=='찾아볼 말').map(r=>`<div class="h2-book-row"><b>${esc(r.label)}</b><span>${esc(r.value)}</span></div>`).join('');
  const qno=loc&&loc.questionNo?`<div class="h2-book-row"><b>문제 위치</b><span>${esc(loc.questionNo)}번 주변</span></div>`:'';
  return `${rows}${qno}<div class="h2-book-confidence">${esc(g.confidenceLabel||'교재 위치 확인')}</div>`;
}
function ensureStyle(){
  if(document.getElementById('h2Unit1BookGateStyle'))return;
  const s=document.createElement('style');s.id='h2Unit1BookGateStyle';s.textContent=`
  .h2-book-gate{width:min(1120px,calc(100% - 28px));margin:24px auto;padding:clamp(24px,4vw,48px);border:2px solid #caddeb;border-radius:28px;background:#fff;box-shadow:0 16px 44px rgba(16,43,76,.08);font-family:Pretendard,"Noto Sans KR",system-ui,sans-serif;color:#183b5d}
  .h2-book-kicker{font-size:18px;font-weight:1000;color:#b42318;margin-bottom:10px}.h2-book-title{font-size:clamp(30px,4vw,48px);font-weight:1000;line-height:1.25;letter-spacing:-.035em;word-break:keep-all}.h2-book-sub{margin-top:13px;font-size:clamp(19px,2vw,24px);line-height:1.55;font-weight:850;color:#5f7287;word-break:keep-all}
  .h2-book-box{display:grid;gap:10px;margin:25px 0;padding:20px;border-radius:20px;background:#f5f9fc;border:1px solid #d8e4ed}.h2-book-row{display:grid;grid-template-columns:110px minmax(0,1fr);gap:12px;align-items:start;font-size:20px;line-height:1.45}.h2-book-row b{color:#52708d}.h2-book-row span{font-weight:950;color:#173b60;word-break:keep-all}.h2-book-confidence{margin-top:4px;font-size:15px;font-weight:900;color:#74889b}
  .h2-book-rule{padding:17px 19px;border-radius:17px;background:#fff7e8;border:1px solid #efd69e;font-size:19px;line-height:1.55;font-weight:900;color:#735420;word-break:keep-all}.h2-book-action{margin-top:24px;width:100%;min-height:72px;border:0;border-radius:18px;background:#102b4c;color:#fff;font-size:22px;font-weight:1000;cursor:pointer}.h2-book-action.secondary{background:#eef4f8;color:#234766;border:1px solid #ccdce7}
  @media(max-width:700px){.h2-book-gate{width:calc(100% - 18px);padding:22px 17px}.h2-book-row{grid-template-columns:88px 1fr;font-size:18px}.h2-book-action{font-size:20px}}
  `;document.head.appendChild(s);
}
async function locator(){
  const d=dayNumber(),p=current();
  const rec=registryRecord();if(rec&&rec.locator)return rec.locator;
  if(window.H2TextbookLocator&&H2TextbookLocator.get)return H2TextbookLocator.get(d,requested||p&&p.id,p||{});
  return rec&&rec.locator||null;
}
async function markWrong(){
  if(markedWrongForAttempt)return;markedWrongForAttempt=true;bookSeen=true;
  if(pendingLookup())return;
  try{if(window.H2WrongAnswerRegistry&&gateUid)H2WrongAnswerRegistry.markGateAttempt(gateUid,false,{bookUsed:false})}catch(_){}
}
async function markCorrect(){if(finishing)return;finishing=true;try{if(window.H2WrongAnswerRegistry&&gateUid)H2WrongAnswerRegistry.markGateAttempt(gateUid,true,{bookUsed:bookSeen})}catch(_){}}
async function renderLookup(){
  ensureStyle();await markWrong();const loc=await locator();const r=root();if(!r)return;
  r.innerHTML=`<section class="h2-book-gate"><div class="h2-book-kicker">다시 틀렸습니다 · 해설은 아직 보지 않습니다</div><div class="h2-book-title">책에서 근거를 찾아 다시 풀어보세요.</div><div class="h2-book-sub">정답을 바로 알려주지 않습니다. 아래 위치에서 관련 내용을 직접 찾은 뒤 같은 문제에 다시 답합니다.</div><div class="h2-book-box">${guideRows(loc)||'<div class="h2-book-row"><b>안내</b><span>현재 챕터의 해당 목록에서 찾아보세요.</span></div>'}</div><div class="h2-book-rule">책을 펼쳐 내용을 확인하세요. 정답·해설·정답 핵심어는 지금 화면에서 공개하지 않습니다.</div><button class="h2-book-action" id="h2BookRetry">책에서 찾았습니다 → 같은 문제 다시 풀기</button></section>`;
  const b=document.getElementById('h2BookRetry');if(b)b.onclick=()=>{finishing=false;try{if(typeof resetRuntimeForQuestion==='function')resetRuntimeForQuestion();else{runtime.mode='question';runtime.answer=null;runtime.feedbackStep=0;runtime.lastDiagnosis=null}baseRender()}catch(_){location.reload()}};
}
async function renderSuccess(){
  ensureStyle();await markCorrect();const r=root();if(!r)return;
  const p=current();const title=bookSeen?'책에서 근거를 찾아 스스로 해결했습니다.':'이전 오답을 이번에는 스스로 해결했습니다.';const sub=bookSeen?'교재에서 근거를 확인한 뒤 같은 문제를 다시 맞혔습니다.':'이번에는 교재 도움 없이 바로 맞혔습니다.';
  r.innerHTML=`<section class="h2-book-gate"><div class="h2-book-kicker" style="color:#0b765c">오답 복구 완료</div><div class="h2-book-title">${title}</div><div class="h2-book-sub">${esc(p&&p.title||'이 문제')} · ${sub} 이제 다음 오답 또는 새 챕터로 이동합니다.</div><button class="h2-book-action" id="h2BookReturn">계속하기 →</button></section>`;
  const b=document.getElementById('h2BookReturn');if(b)b.onclick=()=>{try{window.top.location.href=returnUrl}catch(_){location.href=returnUrl}};
}
function installGateAnswerCheck(){
  try{
    if(typeof checkAnswer!=='function'||typeof isCorrect!=='function')return false;
    checkAnswer=function(){
      const p=current();if(!p)return;
      try{if(typeof answerReady==='function'&&!answerReady(p)){if(typeof toast==='function')toast('답을 먼저 고르세요.');return}}catch(_){}
      let correct=false;try{correct=!!isCorrect(p,runtime.answer)}catch(_){correct=false}
      if(correct){runtime.mode='correct';render();return}
      runtime.mode='explain';runtime.feedbackStep=0;runtime.lastDiagnosis=null;render();
    };
    window.__H2_UNIT1_GATE_ISOLATED__=true;
    return true;
  }catch(e){console.error('[History2] unit1 gate answer isolation failed',e);return false}
}
let baseRender=null;
function install(){
  if(wrapped)return true;
  try{
    if(typeof COURSE==='undefined'||typeof state==='undefined'||typeof runtime==='undefined'||typeof render!=='function')return false;
    const d=dayNumber();if(!(d>=1&&d<=6))return false;
    if(requested&&Array.isArray(COURSE.problems)){
      const i=COURSE.problems.findIndex(p=>String(p&&p.id||'')===requested);
      if(i>=0){state.phase='learn';state.problemIndex=i;try{if(typeof resetRuntimeForQuestion==='function')resetRuntimeForQuestion();else{runtime.mode='question';runtime.answer=null;runtime.feedbackStep=0;runtime.lastDiagnosis=null}}catch(_){}}
    }
    baseRender=render;
    render=function(){
      if(runtime&&runtime.route==='parent')return baseRender();
      if(runtime&&runtime.mode==='explain'){renderLookup();return}
      if(runtime&&runtime.mode==='correct'){renderSuccess();return}
      return baseRender();
    };
    if(!installGateAnswerCheck())return false;
    if(pendingLookup()){markedWrongForAttempt=true;bookSeen=true;runtime.mode='explain';runtime.answer=null;runtime.feedbackStep=0;runtime.lastDiagnosis=null}
    wrapped=true;render();return true;
  }catch(e){console.error('[History2] unit1 book gate install failed',e);return false}
}
let tries=0;const timer=setInterval(()=>{tries++;if(install()||tries>120)clearInterval(timer)},50);
})();
