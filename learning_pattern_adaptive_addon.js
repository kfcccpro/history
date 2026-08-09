(function(){
'use strict';
if(!window.H2Patterns||typeof scoreProblem!=='function')return;
let storage={};try{storage=JSON.parse(document.getElementById('storageData').textContent)}catch(e){storage=H2Patterns.DB.meta.storage}
const baseScore=scoreProblem;
scoreProblem=function(m){const x=baseScore(m),b=H2Patterns.problemBoost(m.day,m.problemId,storage);if(b.boost){x.score+=b.boost;if(b.reason&&!x.reasons.includes(b.reason))x.reasons.push(b.reason)}return x}
try{const raw=localStorage.getItem(SESSION_KEY),s=raw?JSON.parse(raw):null;if(s&&s.index===0&&(!s.completed||!s.completed.length)&&Date.now()-Number(s.createdAt||0)<10000)localStorage.removeItem(SESSION_KEY)}catch(e){}
render();
})();
