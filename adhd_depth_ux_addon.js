(function(){
'use strict';
if(window.__H2_ADHD_DEPTH_UX__)return;
window.__H2_ADHD_DEPTH_UX__=true;

const path=location.pathname||'';
const dm=path.match(/korean_history2_day([1-6])_(?:student_flow_app|metacog_app)\.html$/i);
if(!dm)return;
const DAY=Number(dm[1]);

const css=`
/* ADHD depth repair: one question, one action, less text */
body .depth-card{width:min(1180px,100%)!important;align-content:center!important}
body .depth-kicker{display:none!important}
body .depth-diagnosis{grid-template-columns:auto minmax(0,1fr)!important;gap:10px!important;margin:0 0 10px!important;padding:9px 12px!important;border-radius:12px!important}
body .depth-diagnosis b{min-width:76px!important;min-height:36px!important;padding:5px 9px!important;font-size:15px!important}
body .depth-diagnosis span{font-size:16px!important;line-height:1.3!important;font-weight:900!important}
body .depth-path{gap:6px!important;margin:0 0 12px!important}
body .depth-path span{min-height:36px!important;padding:7px 6px!important;border-radius:10px!important;font-size:13px!important;line-height:1.1!important}
body .depth-title{font-size:clamp(28px,2.8vw,38px)!important;margin:0 0 7px!important;line-height:1.15!important}
body .depth-sub{font-size:17px!important;line-height:1.4!important;margin:0 0 12px!important;font-weight:800!important}
body .depth-choice-grid{gap:9px!important}
body .depth-choice{min-height:58px!important;padding:11px 14px!important;border-radius:13px!important;font-size:17px!important;line-height:1.32!important}
body .depth-msg{min-height:22px!important;margin:8px 0 0!important;font-size:15px!important;line-height:1.3!important}
body .depth-anchor{padding:14px 16px!important;margin:7px 0 11px!important;border-radius:14px!important}
body .depth-anchor b{font-size:22px!important;margin-bottom:3px!important}
body .depth-anchor p{font-size:15px!important;line-height:1.35!important}
body .depth-card>.primary,body .depth-anchor+.primary{min-height:56px!important;font-size:17px!important}
body #depthInput,body #depthSubmit{display:none!important}
body .depth-note{display:none!important}
body .h2-keyword-choice-grid{margin-top:4px}
body .map-shell{min-height:430px!important}
body .hm-node.d2[data-focusable="1"]{cursor:pointer}
body .hm-node.d2.h2-leaf-picked{box-shadow:0 0 0 4px rgba(76,125,255,.16),0 8px 22px rgba(28,40,63,.12)!important;transform:translateX(4px)}
@media(max-width:820px){
  body .depth-diagnosis{grid-template-columns:auto minmax(0,1fr)!important}
  body .depth-path{grid-template-columns:repeat(5,minmax(62px,1fr))!important;overflow-x:auto!important}
  body .depth-title{font-size:27px!important}
  body .depth-sub{font-size:16px!important}
  body .depth-choice{font-size:16px!important;min-height:54px!important}
  body .map-shell{min-height:360px!important}
}
@media(orientation:landscape) and (max-height:700px){
  body .depth-diagnosis{margin-bottom:6px!important;padding:6px 9px!important}
  body .depth-path{margin-bottom:7px!important}
  body .depth-path span{min-height:30px!important;font-size:12px!important}
  body .depth-title{font-size:26px!important;margin-bottom:3px!important}
  body .depth-sub{font-size:15px!important;margin-bottom:7px!important}
  body .depth-choice{min-height:48px!important;padding:8px 11px!important;font-size:15px!important}
  body .depth-msg{margin-top:5px!important}
}
`;
const style=document.createElement('style');
style.id='h2AdhdDepthUxStyle';
style.textContent=css;
document.head.appendChild(style);

function norm(v){return String(v==null?'':v).toLowerCase().replace(/[\s·.()\-_/,:;!?"'“”‘’]/g,'')}
function hash(v){let h=2166136261,s=String(v);for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function problem(){try{return typeof currentProblem==='function'?currentProblem():null}catch(_){return null}}
function route(){
  try{
    const p=problem();
    return p&&window.H2ConceptDepth&&typeof H2ConceptDepth.route==='function'?H2ConceptDepth.route(DAY,p.id):null;
  }catch(_){return null}
}
function phase(){try{return typeof runtime!=='undefined'&&runtime&&runtime._depth?String(runtime._depth.phase||''):''}catch(_){return ''}}
function uniqPush(out,v,answerNorm){
  const s=String(v==null?'':v).trim(),n=norm(s);
  if(!s||!n||n===answerNorm||out.some(x=>norm(x)===n))return;
  out.push(s);
}
function keywordOptions(r){
  const m=r&&r.memory;if(!m||!m.answer)return [];
  const answer=String(m.answer).trim(),an=norm(answer),pool=[];
  let catalog=[];try{catalog=H2ConceptDepth.DB&&Array.isArray(H2ConceptDepth.DB.problemCatalog)?H2ConceptDepth.DB.problemCatalog:[]}catch(_){}
  const groups=[
    catalog.filter(x=>x.day===r.day&&x.branchLabel===r.branchLabel),
    catalog.filter(x=>x.day===r.day&&x.rootLabel===r.rootLabel),
    catalog.filter(x=>x.day===r.day),
    catalog
  ];
  for(const group of groups){
    for(const x of group){if(x&&x.memory)uniqPush(pool,x.memory.answer,an);if(pool.length>=8)break}
    if(pool.length>=8)break;
  }
  for(const x of (r.conceptOptions||[]))uniqPush(pool,x,an);
  const distractors=pool.sort((a,b)=>hash((r.problemId||'')+'|'+a)-hash((r.problemId||'')+'|'+b)).slice(0,3);
  const opts=[answer,...distractors];
  return opts.sort((a,b)=>hash('order|'+(r.problemId||'')+'|'+a)-hash('order|'+(r.problemId||'')+'|'+b));
}
function shortPath(){
  document.querySelectorAll('.depth-path span').forEach(el=>{
    const t=el.textContent.trim();
    if(/가장 큰 지도/.test(t))el.textContent='큰 지도';
    else if(/오늘 범위/.test(t))el.textContent='범위';
    else if(/큰 가지/.test(t))el.textContent='가지';
    else if(/세부 개념/.test(t))el.textContent='개념';
    else if(/핵심어/.test(t))el.textContent='핵심';
  });
}
function simplifyDiagnosis(r){
  const box=document.querySelector('.depth-diagnosis');if(!box)return;
  const span=box.querySelector('span');
  if(span&&r&&r.skill)span.textContent=r.skill;
}
function simplifyText(r){
  const ph=phase(),title=document.querySelector('.depth-title'),sub=document.querySelector('.depth-sub');
  if(title&&/마지막은 직접 써서 고정|마지막 핵심 연결/.test(title.textContent))title.textContent='핵심 확인';
  if(sub){
    if(ph==='keyword'&&r&&r.memory&&r.memory.prompt)sub.textContent=r.memory.prompt;
    else if(ph==='unit-anchor')sub.textContent='큰 지도만 확인합니다.';
    else sub.textContent='하나만 고르세요.';
  }
  const anchor=document.querySelector('.depth-anchor p');if(anchor)anchor.textContent='큰 흐름을 확인하고 다시 내려갑니다.';
  const anchorBtn=document.getElementById('depthAnchorNext');if(anchorBtn)anchorBtn.textContent='다음 →';
  const msg=document.querySelector('.depth-msg');
  if(msg){
    const t=msg.textContent.trim();
    if(/여기서 흔들렸어요/.test(t))msg.textContent='한 단계 위에서 다시 확인합니다.';
    else if(/위에서 잡은 연결/.test(t)||/^힌트:/.test(t)||/정답을 한 번 보고/.test(t))msg.textContent='다시 고르세요.';
  }
}
function convertKeywordInput(r){
  const inp=document.getElementById('depthInput'),submit=document.getElementById('depthSubmit');
  if(!inp||!submit||!r||!r.memory)return;
  if(document.querySelector('.h2-keyword-choice-grid'))return;
  const opts=keywordOptions(r);if(!opts.length)return;
  const grid=document.createElement('div');
  grid.className='depth-choice-grid h2-keyword-choice-grid';
  opts.forEach(v=>{
    const b=document.createElement('button');
    b.type='button';b.className='depth-choice';b.textContent=v;
    b.addEventListener('click',()=>{inp.value=v;submit.click()});
    grid.appendChild(b);
  });
  inp.parentNode.insertBefore(grid,inp);
}
function activateMindMapLeaves(){
  document.querySelectorAll('.hm-stage').forEach(stage=>{
    stage.querySelectorAll('.hm-node.d2:not([data-h2-leaf-focus])').forEach(leaf=>{
      leaf.dataset.h2LeafFocus='1';leaf.dataset.focusable='1';
      leaf.addEventListener('click',()=>{
        try{
          if(typeof activeMindMaps==='undefined'||!Array.isArray(activeMindMaps))return;
          const map=activeMindMaps.find(x=>x&&x.stage===stage);if(!map||map.moved)return;
          const wrap=leaf.closest('.hm-nodewrap'),bi=Number(wrap&&wrap.dataset.branch);
          const branch=map.tree&&Array.isArray(map.tree.c)?map.tree.c.find(x=>Number(x.branchIndex)===bi):null;
          stage.querySelectorAll('.hm-node.d2.h2-leaf-picked').forEach(x=>x.classList.remove('h2-leaf-picked'));
          leaf.classList.add('h2-leaf-picked');
          if(branch){if(map.focusBranch!==branch.id)map.setFocus(branch.id);else map.fit(branch.id)}
        }catch(_){}
      });
    });
  });
}
let scheduled=false;
function apply(){
  scheduled=false;
  const r=route();
  if(document.querySelector('.depth-card')){
    shortPath();simplifyDiagnosis(r);simplifyText(r);convertKeywordInput(r);
  }
  activateMindMapLeaves();
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(apply)}
function boot(){
  schedule();
  const obs=new MutationObserver(schedule);
  obs.observe(document.body,{childList:true,subtree:true,characterData:true});
  window.addEventListener('resize',schedule,{passive:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
