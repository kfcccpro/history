(function(){
  'use strict';
  let started=false;
  function start(){
    if(started)return;started=true;
    const s=document.createElement('script');
    s.src='fast_day_engine.js';
    s.onerror=()=>console.error('[History2] fast_day_engine.js load failed');
    document.body.appendChild(s);
  }
  const sync=window.History2CloudSync;
  const ready=sync&&sync.ready;
  if(ready&&typeof ready.then==='function')ready.then(start,start);
  else start();
})();
