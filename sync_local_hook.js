(function(){
  if(window.__HISTORY2_STORAGE_HOOKED__) return;
  window.__HISTORY2_STORAGE_HOOKED__=true;
  window.__HISTORY2_SYNC_DIRTY__=window.__HISTORY2_SYNC_DIRTY__||new Set();
  const should=k=>typeof k==='string'&&k.startsWith('history2-')&&!k.startsWith('history2-firebase-')&&!k.startsWith('history2-sync-');
  const p=Storage.prototype, rawSet=p.setItem, rawRemove=p.removeItem, rawClear=p.clear;
  window.__HISTORY2_RAW_STORAGE__={setItem:rawSet,removeItem:rawRemove,clear:rawClear};
  p.setItem=function(k,v){const r=rawSet.call(this,k,v);if(this===localStorage&&should(k)&&!window.__HISTORY2_APPLYING_REMOTE__){window.__HISTORY2_SYNC_DIRTY__.add(k);window.dispatchEvent(new CustomEvent('history2:local-dirty',{detail:{key:k}}));}return r};
  p.removeItem=function(k){const r=rawRemove.call(this,k);if(this===localStorage&&should(k)&&!window.__HISTORY2_APPLYING_REMOTE__){window.__HISTORY2_SYNC_DIRTY__.add(k);window.dispatchEvent(new CustomEvent('history2:local-dirty',{detail:{key:k,removed:true}}));}return r};
  p.clear=function(){const keys=[];if(this===localStorage)for(let i=0;i<this.length;i++){const k=this.key(i);if(should(k))keys.push(k)}const r=rawClear.call(this);if(this===localStorage&&!window.__HISTORY2_APPLYING_REMOTE__)keys.forEach(k=>window.__HISTORY2_SYNC_DIRTY__.add(k));return r};
})();
