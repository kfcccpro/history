(function(){
'use strict';
let value;
try{
  Object.defineProperty(window,'HISTORY2_FAST_CONTENT',{
    configurable:true,
    enumerable:true,
    get(){return value},
    set(v){
      try{
        const day=Number(new URLSearchParams(location.search).get('day')||0);
        const add=(window.HISTORY2_FAST_BOOST||{})[day]||[];
        if(v&&Array.isArray(v.questions)&&add.length){
          const seen=new Set(v.questions.map(q=>q&&q.id));
          const extra=add.filter(q=>q&&q.id&&!seen.has(q.id));
          if(extra.length)v.questions=v.questions.concat(extra);
          const branches=new Set(Array.isArray(v.branches)?v.branches:[]);
          extra.forEach(q=>{if(q.branch)branches.add(q.branch)});
          v.branches=[...branches];
        }
      }catch(_){ }
      value=v;
    }
  });
}catch(_){ }
})();
