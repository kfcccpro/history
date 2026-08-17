(function(){
'use strict';
if(window.__H2_PRECHAPTER_GATE_GUARD__)return;window.__H2_PRECHAPTER_GATE_GUARD__=true;
const p=location.pathname||'',q=new URLSearchParams(location.search);
if(q.get('bookGate')==='1'||/\/pre_chapter_wrong_gate\.html$/i.test(p)||/\/adaptive_fast_review\.html$/i.test(p)||/\/korean_history2_unit1_adaptive_review_metacog_flow\.html$/i.test(p))return;
let day=0;
let m=p.match(/\/korean_history2_day([1-6])_student_flow_app\.html$/i);if(m)day=Number(m[1]);
if(/\/fast_day\.html$/i.test(p))day=Math.max(0,Number(String(q.get('day')||'').replace(/[^0-9]/g,''))||0);
if(!(day>=2&&day<=18)||!window.H2WrongAnswerRegistry)return;
const PASS=`history2-pre-chapter-gate-pass-v1:${day}`;
const revision=typeof H2WrongAnswerRegistry.sourceRevisionBefore==='function'?H2WrongAnswerRegistry.sourceRevisionBefore(day):'';
let pass=null;try{pass=JSON.parse(localStorage.getItem(PASS)||'null')}catch(_){}
let sessionPass='';try{sessionPass=sessionStorage.getItem(PASS)||''}catch(_){}
const validLocal=!!(pass&&typeof pass==='object'&&pass.revision&&pass.revision===revision);
const validSession=!!(sessionPass&&sessionPass===revision);
if(validLocal||validSession)return;
const prior=H2WrongAnswerRegistry.historicalBefore(day,3);if(!prior.length)return;
const here=(p.split('/').pop()||'')+(location.search||'');
const url=`pre_chapter_wrong_gate.html?targetDay=${day}&return=${encodeURIComponent(here)}`;
location.replace(url);
})();
