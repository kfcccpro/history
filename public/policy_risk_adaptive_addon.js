(function(){
'use strict';
if(!window.H2Risk||typeof scoreItem!=='function')return;
const base=scoreItem;scoreItem=function(x){let s=base(x);try{const r=H2Risk.riskFor(Number(x.day),x.problemId);if(r&&r.high)s+=Math.min(3,1+Math.round(r.score*2))}catch(e){}return s};
})();
