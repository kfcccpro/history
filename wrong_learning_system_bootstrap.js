(function(){
'use strict';
if(window.__H2_WRONG_SYSTEM_BOOTSTRAP__)return;
window.__H2_WRONG_SYSTEM_BOOTSTRAP__=true;

const p=location.pathname||'';
const student=/\/fast_index\.html$/i.test(p)||/\/fast_day\.html$/i.test(p)||/\/adaptive_fast_review\.html$/i.test(p)||/\/korean_history2_day[1-6]_(?:student_flow_app|metacog_app)\.html$/i.test(p)||/\/korean_history2_unit1_adaptive_review_metacog_flow\.html$/i.test(p);
if(!student)return;

function load(src,test){
  return new Promise(resolve=>{
    if(test&&test()){resolve();return}
    const s=document.createElement('script');s.src=src;s.async=false;
    s.onload=()=>resolve();s.onerror=()=>{console.error('[History2] '+src+' load failed');resolve()};
    document.head.appendChild(s);
  });
}

async function boot(){
  await load('textbook_locator_engine.js',()=>!!window.H2TextbookLocator);
  await load('wrong_answer_registry.js',()=>!!window.H2WrongAnswerRegistry);
  try{if(window.H2WrongAnswerRegistry)await H2WrongAnswerRegistry.sync()}catch(e){console.error('[History2] wrong registry sync failed',e)}
  window.dispatchEvent(new CustomEvent('history2:wrong-system-ready'));
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else setTimeout(boot,0);
})();
