(function(){
'use strict';
if(!window.H2Policy||typeof scoreProblem!=='function')return;
const base=scoreProblem;
scoreProblem=function(m){const x=base(m),r=H2Policy.route(m.day,m.problemId);if(!r)return x;const p=H2Policy.branchPolicy(r.branchLabel);if(p.needPrereq){x.score+=5;if(!x.reasons.includes('선행 핵심 연결'))x.reasons.push('선행 핵심 연결')}if(p.longTermWeak){x.score+=4;if(!x.reasons.includes('간격 회상 강화'))x.reasons.push('간격 회상 강화')}if(p.fadeLevel>=2){x.score=Math.max(0,x.score-2);if(!x.reasons.includes('유지 안정'))x.reasons.push('유지 안정')}return x};
render();
})();
