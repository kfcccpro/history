(function(){
'use strict';
if(!window.H2LearningEffect||typeof scoreProblem!=='function')return;
const eff=H2LearningEffect.allEfficacy(),branchRows=H2LearningEffect.branchSnapshot();
const branchMap=new Map(branchRows.map(x=>[x.name,x]));
const base=scoreProblem;scoreProblem=function(m){const x=base(m),rows=eff.filter(e=>Number(e.day)===Number(m.day)&&e.problemId===m.problemId).sort((a,b)=>Number(b.createdAt||0)-Number(a.createdAt||0)),last=rows[0],route=H2LearningEffect.route(m.day,m.problemId);if(last){if(last.immediate&&!last.immediate.correct){x.score+=6;if(!x.reasons.includes('복구 직후 재실패'))x.reasons.push('복구 직후 재실패')}let fail=0;for(const q of Object.values(last.retention||{})){if((q.memory&&q.memory.correct===false)||(q.problem&&q.problem.correct===false))fail++}if(fail){x.score+=Math.min(6,fail*2);if(!x.reasons.includes('지연 유지 흔들림'))x.reasons.push('지연 유지 흔들림')}}const b=route&&branchMap.get(route.branchLabel);if(b&&b.deepProblems>=2&&b.precheckN===0){x.score+=3;if(!x.reasons.includes('선행개념 확인'))x.reasons.push('선행개념 확인')}return x};
try{const raw=localStorage.getItem(SESSION_KEY),s=raw?JSON.parse(raw):null;if(s&&s.index===0&&(!s.completed||!s.completed.length)&&Date.now()-Number(s.createdAt||0)<10000)localStorage.removeItem(SESSION_KEY)}catch(e){}
render();
})();
