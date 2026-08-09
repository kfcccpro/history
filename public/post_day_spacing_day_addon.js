(function(){
'use strict';
if(typeof flowReturnNow!=='function'||typeof FLOW_MODE==='undefined'||typeof state==='undefined'||typeof COURSE==='undefined')return;
const base=flowReturnNow;
flowReturnNow=function(){if(FLOW_MODE&&state.phase==='done'&&state.finishedAt){let day=0;const m=String(COURSE.meta?.id||'').match(/day(\d+)/i);if(m)day=Number(m[1]);if(day){try{const u=new URL(FLOW_RETURN,location.href);u.searchParams.set('resume','1');u.searchParams.set('dayComplete','1');u.searchParams.set('day',String(day));u.searchParams.set('finishedAt',String(state.finishedAt));location.href=u.href;return true}catch(e){}}}return base()};
})();
