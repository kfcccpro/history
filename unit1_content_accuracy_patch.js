(function(){
'use strict';
if(window.__H2_UNIT1_ACCURACY_PATCH__)return;
window.__H2_UNIT1_ACCURACY_PATCH__=true;

const REPLACE=new Map([
  ['일본 육군·해군 대장 중에서 임명되었고 입법·사법·행정·군사 전권을 행사했습니다.','초기에는 현역 육·해군 대장 가운데 총독을 임명하도록 했지만, 1919년 관제 개정으로 문관 임명도 제도상 가능해졌습니다. 실제 역대 조선 총독은 모두 군 출신이었습니다.']
]);

function patchText(root){
  if(!root)return;
  const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
  const nodes=[];let n;
  while((n=walker.nextNode()))nodes.push(n);
  nodes.forEach(node=>{
    const raw=node.nodeValue||'';
    for(const [from,to] of REPLACE){
      if(raw.includes(from)){node.nodeValue=raw.replace(from,to);break}
    }
  });
}

function patchKnownGlossaryObjects(){
  const candidates=['HISTORY2_GLOSSARY','HISTORY2_GLOSSARY_DB','GLOSSARY_DB','HISTORY2_DAY6_GLOSSARY'];
  candidates.forEach(k=>{
    try{
      const db=window[k];
      if(db&&db['조선 총독']&&typeof db['조선 총독']==='object'){
        db['조선 총독'].context='초기에는 현역 육·해군 대장 가운데 총독을 임명하도록 했지만, 1919년 관제 개정으로 문관 임명도 제도상 가능해졌습니다. 실제 역대 조선 총독은 모두 군 출신이었습니다.';
      }
    }catch(_){ }
  });
}

let queued=false;
function run(){queued=false;patchKnownGlossaryObjects();patchText(document.body)}
function schedule(){if(queued)return;queued=true;requestAnimationFrame(run)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
})();
