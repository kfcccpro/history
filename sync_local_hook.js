(function(){
  'use strict';
  if(window.__HISTORY2_STORAGE_HOOKED__) return;
  window.__HISTORY2_STORAGE_HOOKED__=true;

  const cfg=window.HISTORY2_APP_CONFIG||{};
  const mode=cfg[cfg.buildMode]||{};
  const ephemeralLearning=mode.persistProgress===false&&mode.persistLearningHistory===false;
  const cloudDisabled=mode.firebaseSync===false;
  const firebaseCfgKey='history2-firebase-config-v1';

  window.__HISTORY2_SYNC_DIRTY__=window.__HISTORY2_SYNC_DIRTY__||new Set();
  const should=k=>typeof k==='string'&&k.startsWith('history2-')&&!k.startsWith('history2-firebase-')&&!k.startsWith('history2-sync-');
  const p=Storage.prototype;
  const rawGet=p.getItem, rawSet=p.setItem, rawRemove=p.removeItem, rawClear=p.clear;
  window.__HISTORY2_RAW_STORAGE__={getItem:rawGet,setItem:rawSet,removeItem:rawRemove,clear:rawClear};

  // Development mode must not silently reconnect to Firebase just because a web config exists.
  // Keep a diagnostic copy, but hide both the bundled and locally saved config from the sync engine.
  if(cloudDisabled){
    window.__HISTORY2_FIREBASE_CONFIG_DISABLED__=window.HISTORY2_FIREBASE_CONFIG||null;
    window.HISTORY2_FIREBASE_CONFIG=null;
  }

  p.getItem=function(k){
    if(this===localStorage){
      if(cloudDisabled&&k===firebaseCfgKey)return null;
      if(ephemeralLearning&&should(k))return rawGet.call(sessionStorage,k);
    }
    return rawGet.call(this,k);
  };

  p.setItem=function(k,v){
    if(this===localStorage&&ephemeralLearning&&should(k)){
      // Preserve the same-tab learning flow without writing durable progress in development.
      return rawSet.call(sessionStorage,k,v);
    }
    const r=rawSet.call(this,k,v);
    if(this===localStorage&&should(k)&&!cloudDisabled&&!window.__HISTORY2_APPLYING_REMOTE__){
      window.__HISTORY2_SYNC_DIRTY__.add(k);
      window.dispatchEvent(new CustomEvent('history2:local-dirty',{detail:{key:k}}));
    }
    return r;
  };

  p.removeItem=function(k){
    if(this===localStorage&&ephemeralLearning&&should(k))return rawRemove.call(sessionStorage,k);
    const r=rawRemove.call(this,k);
    if(this===localStorage&&should(k)&&!cloudDisabled&&!window.__HISTORY2_APPLYING_REMOTE__){
      window.__HISTORY2_SYNC_DIRTY__.add(k);
      window.dispatchEvent(new CustomEvent('history2:local-dirty',{detail:{key:k,removed:true}}));
    }
    return r;
  };

  p.clear=function(){
    if(this===localStorage&&ephemeralLearning){
      // A development reset must not erase durable release data from the same browser.
      const keys=[];
      for(let i=0;i<sessionStorage.length;i++){
        const k=sessionStorage.key(i);
        if(should(k))keys.push(k);
      }
      keys.forEach(k=>rawRemove.call(sessionStorage,k));
      return;
    }
    const keys=[];
    if(this===localStorage)for(let i=0;i<this.length;i++){
      const k=this.key(i);
      if(should(k))keys.push(k);
    }
    const r=rawClear.call(this);
    if(this===localStorage&&!cloudDisabled&&!window.__HISTORY2_APPLYING_REMOTE__){
      keys.forEach(k=>window.__HISTORY2_SYNC_DIRTY__.add(k));
      if(keys.length)window.dispatchEvent(new CustomEvent('history2:local-dirty',{detail:{cleared:true,keys}}));
    }
    return r;
  };

  // Shared intro UX addon loader. Keeps Day 1–6 HTML untouched and makes future UX edits one-file changes.
  if(!window.__H2_FOCUS_OX_ADDON_REQUESTED__){
    window.__H2_FOCUS_OX_ADDON_REQUESTED__=true;
    const s=document.createElement('script');
    s.src='focus_recall_ox_addon.js';
    s.defer=true;
    s.onerror=()=>console.error('[History2] focus_recall_ox_addon.js load failed');
    document.head.appendChild(s);
  }
})();
