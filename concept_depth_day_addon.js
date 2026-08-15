(function(){
'use strict';
if(!window.H2ConceptDepth||typeof COURSE==='undefined'||typeof state==='undefined')return;
const mt=String(COURSE.meta&&COURSE.meta.id||'').match(/day(\d+)/i),DAYNUM=mt?Number(mt[1]):0;
if(!DAYNUM)return;
state.conceptDepthLog=state.conceptDepthLog||[];
const css=`
.depth-card{width:min(1320px,100%);max-width:none;margin:auto;display:grid;grid-template-columns:minmax(0,1fr);align-content:center}
.depth-kicker{font-size:16px;font-weight:950;color:#52677f;letter-spacing:.02em;margin-bottom:8px}
.depth-diagnosis{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;margin:0 0 13px;padding:12px 14px;border:1px solid #dbe5ee;border-radius:14px;background:#f7fafc;color:#40556e}
.depth-diagnosis b{display:inline-grid;place-items:center;min-width:118px;min-height:42px;padding:7px 11px;border-radius:11px;background:#eaf4fc;color:#225f91;font-size:17px;line-height:1.2}
.depth-diagnosis span{font-size:17px;line-height:1.5;font-weight:850;word-break:keep-all}
.depth-path{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:4px 0 18px}
.depth-path span{position:relative;min-height:48px;padding:11px 8px;border-radius:12px;background:#eef3f8;color:#6a7c91;font-size:15px;line-height:1.2;font-weight:950;text-align:center;display:grid;place-items:center;border:2px solid transparent}
.depth-path span.on{background:#eaf4fc;color:#1e6498;border-color:#78add2;box-shadow:0 0 0 3px rgba(67,151,214,.08)}
.depth-path span.fail{background:#fff3e8;color:#985b19;border-color:#e5b77e}
.depth-title{font-size:clamp(32px,3.2vw,46px);margin:0 0 9px;line-height:1.12;letter-spacing:-.025em;word-break:keep-all}
.depth-sub{font-size:20px;color:#53677e;font-weight:820;line-height:1.55;margin:0 0 16px;word-break:keep-all}
.depth-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.depth-choice{width:100%;min-height:72px;border:2px solid #d9e3ec;border-radius:15px;background:#fff;padding:15px 17px;text-align:left;font:inherit;font-size:19px;font-weight:900;line-height:1.4;word-break:keep-all;transition:border-color .14s ease,background .14s ease,transform .14s ease}
.depth-choice:hover,.depth-choice:focus-visible{border-color:#72a9d0;background:#f5faff;outline:none;transform:translateY(-1px)}
.depth-msg{min-height:30px;margin:13px 0 0;color:#965a18;font-size:17px;line-height:1.45;font-weight:900}.depth-msg.ok{color:#217a53}
.depth-input{width:100%;height:72px;border:3px solid #d5dfeb;border-radius:16px;padding:0 18px;text-align:center;font:inherit;font-size:27px;font-weight:950;background:#fff}
.depth-input:focus{outline:none;border-color:#4397d6;box-shadow:0 0 0 5px rgba(67,151,214,.12)}
.depth-anchor{padding:20px 22px;border-radius:17px;background:#eef5fb;border:1px solid #d6e5f1;margin:10px 0 15px}
.depth-anchor b{display:block;font-size:28px;line-height:1.25;margin-bottom:7px}.depth-anchor p{margin:0;color:#52657a;font-size:18px;line-height:1.55;font-weight:800;word-break:keep-all}
.depth-note{font-size:15px;color:#667b91;font-weight:850;margin-top:10px;text-align:center}
.depth-card>.primary{min-height:64px;font-size:19px}
@media (orientation:landscape) and (min-width:900px){body.h2-ux-v6 .feedback-screen:has(.depth-card){padding:12px 24px!important;align-items:center!important;place-items:center!important}body.h2-ux-v6 .repair-card:has(.depth-card){width:min(1360px,100%)!important;max-width:none!important}.depth-card{max-height:calc(100dvh - 118px);overflow:auto;padding:4px 2px}.depth-choice-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (orientation:landscape) and (max-height:700px){.depth-diagnosis{padding:8px 11px;margin-bottom:8px}.depth-diagnosis b{min-height:36px;font-size:15px}.depth-diagnosis span{font-size:15px}.depth-path{margin-bottom:10px}.depth-path span{min-height:38px;padding:7px 6px;font-size:13px}.depth-title{font-size:30px;margin-bottom:5px}.depth-sub{font-size:17px;margin-bottom:10px}.depth-choice{min-height:58px;padding:10px 13px;font-size:17px}.depth-input{height:60px;font-size:23px}.depth-anchor{padding:14px 16px}.depth-anchor b{font-size:23px}.depth-anchor p{font-size:16px}.depth-msg{margin-top:8px;font-size:15px}}
@media (max-width:820px){.depth-diagnosis{grid-template-columns:1fr;gap:7px}.depth-diagnosis b{justify-self:start;min-width:0}.depth-path{grid-template-columns:repeat(5,minmax(70px,1fr));overflow-x:auto;padding-bottom:2px}.depth-choice-grid{grid-template-columns:1fr}.depth-title{font-size:30px}.depth-sub{font-size:17px}}
`;
const st=document.createElement('style');st.id='conceptDepthStyles';st.textContent=css;document.head.appendChild(st);
function esc(v){return escapeHtml(v)}
const AUDIT_DIAG={
  '4:p02':{depth:'D2',skill:'핵심 개념 뜻',message:'농촌 진흥 운동이라는 정책 명칭과 핵심 성격을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p05':{depth:'D3',skill:'변화·관계 연결',message:'사회주의 사상 → 혁명적 농민 조합 → 반제국주의 항일 투쟁으로 농민 운동의 성격이 바뀌는 관계에서 막혔습니다.'},
  '4:p08':{depth:'D2',skill:'핵심 개념 뜻',message:'여성계 민족 협동 전선인 근우회의 명칭을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p09':{depth:'D2',skill:'핵심 개념·활동',message:'근우회가 무엇을 했고 무엇을 목표로 했는지 핵심 활동을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p11':{depth:'D2',skill:'핵심 개념·활동',message:'조선어 학회의 주요 활동을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p12':{depth:'D3',skill:'관계 연결',message:'보편적 발전 법칙이라는 주장과 식민 사관의 정체성론 비판을 서로 연결하는 단계에서 막혔습니다.'},
  '4:p13':{depth:'D2',skill:'핵심 개념 뜻',message:'식민 사관의 세 논리인 정체성론·타율성론·당파성론의 명칭을 정확히 회상하는 단계에서 막혔습니다.'},
  '6:p15':{depth:'D3',skill:'시대·순서 연결',message:'전투 이름 자체보다 봉오동 → 청산리 → 자유시 → 독립군 재편의 시대·순서 연결에서 막혔습니다.'}
};
function auditDiag(p){return p&&AUDIT_DIAG[DAYNUM+':'+p.id]||null}
function applyDiagAudit(base,p){const a=auditDiag(p);if(!a)return base||{};return {...(base||{}),depth:a.depth,skill:a.skill,message:a.message,immediate:a.message,concept:a.message}}
try{if(typeof diagnosisFor==='function'){const _diagnosisFor=diagnosisFor;diagnosisFor=function(p,a){return applyDiagAudit(_diagnosisFor(p,a),p)}}}catch(e){}
try{if(typeof metacogFor==='function'){const _metacogFor=metacogFor;metacogFor=function(p,a){return applyDiagAudit(_metacogFor(p,a),p)}}}catch(e){}
const legacyDay6Label=(v)=>DAYNUM===6&&v==='민족 유일당과 학생 운동'?'실력 양성·민족 협동·학생 운동':DAYNUM===6&&v==='의열 투쟁'?'비밀 결사와 의열 투쟁':v;
function rt(p){
  const base=H2ConceptDepth.route(DAYNUM,p.id);if(!base)return base;const r={...base};
  if(DAYNUM===6){r.conceptTitle=legacyDay6Label(r.conceptTitle);r.conceptOptions=(r.conceptOptions||[]).map(legacyDay6Label);r.path=(r.path||[]).map(legacyDay6Label)}
  const a=auditDiag(p);if(a){r.metacogDepth=a.depth;r.skill=a.skill}
  if(DAYNUM===4&&p.id==='p05'){
    r.memory={...(r.memory||{}),keyword:'1930년대 농민 운동의 변화',prompt:'1930년대 농민 운동의 성격 변화를 흐름으로 연결해 쓰세요.',answer:'사회주의 사상 → 혁명적 농민 조합 → 반제국주의 항일 투쟁',accepted:['사회주의 사상 혁명적 농민 조합 반제국주의 항일 투쟁','사회주의→혁명적 농민 조합→반제국주의 항일 투쟁','사회주의 사상의 영향으로 혁명적 농민 조합을 조직하고 반제국주의 항일 투쟁으로 발전하였다'],hint:'사회주의 → 혁명적 농민 조합 → 반제국주의 항일 투쟁',link:'사상 영향 → 조직 변화 → 투쟁 성격 변화'};
  }
  if(DAYNUM===4&&p.id==='p12'){
    r.memory={...(r.memory||{}),keyword:'보편적 발전 법칙과 정체성론 비판',prompt:'백남운의 주장이 어떤 식민 사관을 반박하는지 연결해 쓰세요.',answer:'보편적 발전 법칙 → 정체성론 비판',accepted:['보편적 발전 법칙 정체성론 비판','보편적 발전 법칙으로 정체성론을 비판','한국사도 보편적 발전 법칙에 따라 발전하므로 정체성론을 비판하였다','한국사도 세계사적 발전 법칙에 따라 발전하므로 정체성론을 비판하였다'],hint:'보편적 발전 법칙 → ○○성론 비판',link:'한국사도 스스로 발전함 → 정체되어 있었다는 주장 반박'};
  }
  if(DAYNUM===6&&p.id==='p15'){
    r.path=[...(r.path||[]).slice(0,4),'봉오동 전투 → 청산리 대첩 → 자유시 참변 → 독립군 재편'];
    r.memory={...(r.memory||{}),keyword:'독립군 전투·이동 순서',prompt:'봉오동 전투부터 독립군 재편까지의 흐름을 순서대로 써보세요.',answer:'봉오동 전투 → 청산리 대첩 → 자유시 참변 → 독립군 재편',accepted:['봉오동 전투 청산리 대첩 자유시 참변 독립군 재편','봉오동 청산리 자유시 독립군 재편','봉오동→청산리→자유시→독립군 재편'],hint:'봉오동 → 청산리 → 자유시 → 독립군 재편',link:'1920년 6월 → 1920년 10월 → 1921년 → 이후 재편'};
  }
  return r;
}
function resetDepth(){runtime._depth=null}
function initDepth(p){if(runtime._depth)return runtime._depth;const r=rt(p);runtime._depth={phase:'concept-check',failed:[],baseLevel:null,msg:'',startedAt:Date.now(),misses:0,actions:0,route:r,inputTry:0,showAnswer:false};return runtime._depth}
function levelIndex(id){return {unit:0,root:1,branch:2,concept:3,keyword:4}[id]??0}
function activeLevel(s){if(s.phase.includes('concept'))return 'concept';if(s.phase.includes('branch'))return 'branch';if(s.phase.includes('root'))return 'root';if(s.phase.includes('unit'))return 'unit';if(s.phase==='keyword')return 'keyword';return 'concept'}
function pathHtml(s){const labels=[['unit','가장 큰 지도'],['root','오늘 범위'],['branch','큰 가지'],['concept','세부 개념'],['keyword','핵심어']],cur=activeLevel(s);return `<div class="depth-path" aria-label="개념 복구 깊이">${labels.map(([id,l],i)=>`<span class="${id===cur?'on':''} ${s.failed.includes(id)?'fail':''}">${i+1}. ${l}</span>`).join('')}</div>`}
function choices(options,answer){return `<div class="depth-choice-grid">${(options||[]).map((x,i)=>`<button class="depth-choice" data-depth-choice="${i}" data-depth-answer="${esc(answer)}">${esc(x)}</button>`).join('')}</div>`}
function promptFor(s,r){if(s.phase==='concept-check')return ['이 문제와 가장 가까운 개념은 무엇인가요?','가까운 개념부터 확인합니다.',choices(r.conceptOptions,r.conceptTitle)];if(s.phase==='branch-check')return ['한 단계 위 큰 가지는?','세부 개념이 흔들리면 바로 위 큰 가지를 확인합니다.',choices(r.branchOptions,r.branchLabel)];if(s.phase==='root-check')return ['이 문제의 오늘 범위는?','큰 가지도 흔들리면 오늘 범위까지 올라갑니다.',choices(r.rootOptions,r.rootLabel)];if(s.phase==='unit-anchor')return ['가장 큰 지도부터 다시','여기부터는 알고 있다고 가정하지 않습니다.',`<div class="depth-anchor"><b>${esc(r.unitLabel)}</b><p>큰 지도 → 오늘 범위 → 큰 가지 → 세부 개념 순서로 다시 내려갑니다.</p></div><button class="primary" id="depthAnchorNext">여기서부터 다시 연결</button>`];if(s.phase==='descend-root')return ['오늘 범위 다시 연결','큰 지도 안에서 오늘 범위를 고릅니다.',choices(r.rootOptions,r.rootLabel)];if(s.phase==='descend-branch')return ['큰 가지 다시 연결',`<b>${esc(r.rootLabel)}</b> 안에서 맞는 가지를 고릅니다.`,choices(r.branchOptions,r.branchLabel)];if(s.phase==='descend-concept')return ['세부 개념 다시 연결',`<b>${esc(r.branchLabel)}</b> 안에서 이 문제의 개념을 고릅니다.`,choices(r.conceptOptions,r.conceptTitle)];const m=r.memory;if(m)return ['마지막은 직접 써서 고정',esc(m.prompt),`<input id="depthInput" class="depth-input" autocomplete="off" spellcheck="false" placeholder="핵심어 입력"><button class="primary" id="depthSubmit" style="margin-top:12px">입력 확인</button>${m.link?`<div class="depth-note">연결 힌트 · ${esc(m.link)}</div>`:''}`];return ['마지막 핵심 연결','이 문제의 세부 개념 이름을 직접 입력하세요.',`<input id="depthInput" class="depth-input" autocomplete="off" spellcheck="false" placeholder="개념 이름 입력"><button class="primary" id="depthSubmit" style="margin-top:12px">입력 확인</button>`]}
function renderDepthRepair(p){const s=initDepth(p),r=s.route;if(!r)return renderAnchorRepair(p);const [title,sub,body]=promptFor(s,r),raw=(typeof diagnosisFor==='function'?diagnosisFor(p,runtime.answer):runtime.lastDiagnosis)||runtime.lastDiagnosis||{},diag=applyDiagAudit(raw,p),a=auditDiag(p);const depth=String(diag.depth||r.metacogDepth||'개념 연결');const message=String((a&&a.message)||diag.message||diag.immediate||'어디부터 연결이 끊겼는지 확인합니다.');return `<div class="depth-card"><div class="depth-kicker">오답을 정답으로 바꾸기 전에 · 어디부터 모르는지 먼저 찾기</div><div class="depth-diagnosis"><b>${esc(depth)}</b><span>${esc(message)}</span></div>${pathHtml(s)}<h2 class="depth-title">${title}</h2><p class="depth-sub">${sub} 모르면 한 단계 위로 올라가고, 아는 지점을 찾으면 다시 내려옵니다.</p>${body}<div class="depth-msg ${s.msg==='연결됨'?'ok':''}">${esc(s.msg==='연결됨'?'연결됨':s.msg||'')}</div></div>`}
function isSame(a,b){return normalize(a)===normalize(b)}
function nextAfterKnown(s,level){s.baseLevel=s.baseLevel||level;s.msg='연결됨';setTimeout(()=>{s.msg='';if(level==='concept')s.phase='keyword';else if(level==='branch')s.phase='descend-concept';else if(level==='root')s.phase='descend-branch';else s.phase='descend-root';render()},350)}
function descendNext(s,phase){s.msg='연결됨';setTimeout(()=>{s.msg='';s.phase=phase;render()},350)}
function wrongUp(s,level,next){if(!s.failed.includes(level))s.failed.push(level);s.misses++;s.msg='여기서 흔들렸어요. 한 단계 위에서 다시 찾습니다.';setTimeout(()=>{s.msg='';s.phase=next;render()},450)}
function completeDepth(p){const s=runtime._depth,r=s.route,a=auditDiag(p);const measured=(typeof metacogFor==='function'?(metacogFor(p,runtime.answer)||{}).depth:(runtime.lastDiagnosis&&runtime.lastDiagnosis.depth)||'')||'';const entry={id:'cd-'+uid(),day:DAYNUM,problemId:p.id,at:Date.now(),baseLevel:s.baseLevel||'concept',failedLevels:[...s.failed],misses:s.misses||0,actions:s.actions||0,durationMs:Math.max(0,Date.now()-s.startedAt),metacogDepth:a?a.depth:measured,path:r.path};state.conceptDepthLog=state.conceptDepthLog||[];state.conceptDepthLog.push(entry);saveState();try{remotePatch({conceptDepthLog:state.conceptDepthLog})}catch(e){}runtime.feedbackStep++;resetDepth();render()}
function bindDepth(){const p=currentProblem(),s=runtime._depth;if(!s)return;document.querySelectorAll('[data-depth-choice]').forEach(b=>b.onclick=()=>{const r=s.route,v=b.textContent.trim(),ans=b.dataset.depthAnswer;s.actions++;if(isSame(v,ans)){if(s.phase==='concept-check')nextAfterKnown(s,'concept');else if(s.phase==='branch-check')nextAfterKnown(s,'branch');else if(s.phase==='root-check')nextAfterKnown(s,'root');else if(s.phase==='descend-root')descendNext(s,'descend-branch');else if(s.phase==='descend-branch')descendNext(s,'descend-concept');else if(s.phase==='descend-concept')descendNext(s,'keyword')}else{if(s.phase==='concept-check')wrongUp(s,'concept','branch-check');else if(s.phase==='branch-check')wrongUp(s,'branch','root-check');else if(s.phase==='root-check'){if(!s.failed.includes('root'))s.failed.push('root');s.misses++;s.baseLevel='unit';s.phase='unit-anchor';s.msg='';render()}else{s.misses++;s.msg='위에서 잡은 연결을 보고 다시 고르세요.';render()}}});const an=document.getElementById('depthAnchorNext');if(an)an.onclick=()=>{s.actions++;s.phase='descend-root';render()};const inp=document.getElementById('depthInput'),sub=document.getElementById('depthSubmit');const submit=()=>{const r=s.route,m=r.memory,v=String(inp&&inp.value||'').trim();if(!v)return;s.actions++;const accepted=m?[m.answer,...(m.accepted||[])]:[r.conceptTitle];if(accepted.some(x=>isSame(x,v))){s.msg='연결됨';setTimeout(()=>completeDepth(p),350)}else{s.misses++;s.inputTry++;if(s.inputTry===1)s.msg='힌트: '+(m&&m.hint||String(accepted[0]||'').slice(0,1)+'…');else s.msg='정답을 한 번 보고, 바로 다시 직접 입력하세요: '+accepted[0];render()}};if(sub)sub.onclick=submit;if(inp){setTimeout(()=>inp.focus(),40);inp.onkeydown=e=>{if(e.key==='Enter')submit()}}}
const baseReset=resetRuntimeForQuestion;resetRuntimeForQuestion=function(){resetDepth();return baseReset()};
const baseSteps=explanationSteps;explanationSteps=function(p){const s=baseSteps(p).filter(x=>x!=='depth-ladder');const i=s.indexOf('metacog');s.splice(i>=0?i+1:1,0,'depth-ladder');return s};
const priorRender=renderExplanation;renderExplanation=function(p){const steps=explanationSteps(p),kind=steps[Math.min(runtime.feedbackStep,steps.length-1)];if(kind==='depth-ladder')return `<div class="learn-grid">${renderPath(p)}<section class="panel feedback-screen"><div class="repair-card">${repairProgress(runtime.feedbackStep,steps.length)}${renderDepthRepair(p)}</div></section></div>`;return priorRender(p)};
const baseBind=bind;bind=function(){baseBind();bindDepth()};
render();
})();
