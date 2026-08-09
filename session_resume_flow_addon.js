(function(){
'use strict';
if(!window.H2SessionResume||typeof META==='undefined'||!document.getElementById('app'))return;
let token=H2SessionResume.pendingToken();if(!token)return;
const st=document.createElement('style');st.textContent=`.resume-flow{width:min(720px,100%);background:#fff;border:1px solid #dfe5ec;border-radius:26px;padding:clamp(24px,5vw,44px);box-shadow:0 22px 60px rgba(17,31,52,.11);text-align:center}.resume-flow .ey{font-size:12px;font-weight:950;color:#627188;margin-bottom:12px}.resume-flow h2{font-size:clamp(29px,4.6vw,46px);line-height:1.25;margin:0 0 10px}.resume-flow p{color:#748094;font-weight:760}.resume-flow .answer{font-size:30px;font-weight:1000;background:#fff1d9;border-radius:16px;padding:16px;margin:14px 0}.resume-flow .next-key{margin:16px auto;padding:16px;border-radius:16px;background:#f5f7fa}.resume-flow .next-key span{display:block;font-size:11px;color:#7a8697;font-weight:900;margin-bottom:5px}.resume-flow .next-key b{font-size:24px}`;document.head.appendChild(st);
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function norm(v){return String(v||'').replace(/[\s·.,()\-_/]/g,'').toLowerCase()}
function shell(inner){document.getElementById('app').innerHTML=`${typeof renderTop==='function'?renderTop():''}<main class="center">${inner}</main>`}
if(!H2SessionResume.shouldAutoResume()){
 const key=token.anchor?.keyword||token.anchor?.answer||'';
 shell(`<section class="resume-flow"><div class="ey">오늘 학습</div><h2>오늘은 여기까지</h2><p>지금 문제까지 연결했습니다.</p><div class="next-key"><span>다음 시작 핵심</span><b>${esc(key)}</b></div></section>`);return;
}
let misses=0,show=false,msg='';
function ok(v){const a=token.anchor||{};return [a.answer,...(a.accepted||[])].some(x=>norm(x)===norm(v))}
function openTarget(){H2SessionResume.markAnchorComplete(token.id,{attempts:misses+1,firstCorrect:misses===0});H2SessionResume.markResumeStarted(token.id);const u=new URL(META.apps[String(token.day)],location.href);u.searchParams.set('flow','1');u.searchParams.set('return','korean_history2_unit1_student_metacog_flow.html');u.searchParams.set('sessionResume','1');u.searchParams.set('problem',token.nextProblemId);u.searchParams.set('token',token.id);location.href=u.href}
function draw(){const a=token.anchor||{},key=a.keyword||a.answer||'';shell(`<section class="resume-flow"><div class="ey">이어서 시작</div><h2>${esc(a.prompt||'핵심 연결 하나')}</h2><p>핵심 하나만 연결하고 바로 원문 문제로 갑니다.</p>${show?`<div class="answer">${esc(a.answer||key)}</div><p>같은 답을 직접 입력하세요.</p>`:`<input id="resumeInput" class="memory-input" autocomplete="off" spellcheck="false" placeholder="핵심어 입력">`}<div class="msg">${esc(msg)}</div><button class="cta" id="resumeSubmit" ${show?'disabled':''}>입력 확인</button></section>`);bindResume()}
function bindResume(){const i=document.getElementById('resumeInput'),b=document.getElementById('resumeSubmit');const run=()=>{const v=String(i?.value||'').trim();if(!v)return;if(ok(v)){openTarget();return}misses++;if(misses===1){msg=token.anchor?.hint?'힌트 · '+token.anchor.hint:'한 번 더 떠올려 보세요.';draw()}else{show=true;msg='';draw();setTimeout(()=>{show=false;msg='같은 답을 직접 입력하세요.';draw()},1200)}};if(b)b.onclick=run;if(i){setTimeout(()=>i.focus(),40);i.onkeydown=e=>{if(e.key==='Enter')run()}}}
draw();
})();
