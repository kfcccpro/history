(function(){
  'use strict';
  let started=false;
  function start(){
    if(started)return;started=true;
    const gate=new URLSearchParams(location.search).get('bookGate')==='1';
    const s=document.createElement('script');
    s.src=gate?'fast_book_gate_engine.js':'fast_day_engine.js';
    s.onerror=()=>console.error(`[History2] ${s.src} load failed`);
    document.body.appendChild(s);
  }
  const sync=window.History2CloudSync;
  const ready=sync&&sync.ready;
  if(ready&&typeof ready.then==='function')ready.then(start,start);
  else start();
})();
