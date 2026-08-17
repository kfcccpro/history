(function(){
  'use strict';
  if(window.__HISTORY2_STORAGE_HOOKED__) return;
  window.__HISTORY2_STORAGE_HOOKED__=true;

  const cfg=window.HISTORY2_APP_CONFIG||{};
  const mode=cfg[cfg.buildMode]||{};
  const ephemeralLearning=mode.persistProgress===false&&mode.persistLearningHistory===false;
  const cloudDisabled=mode.firebaseSync===false;
  const firebaseCfgKey='history2-firebase-config-v1';

  const studentPath=location.pathname||'';
  const isStudentVisibilityPage=
    /\/fast_index\.html$/i.test(studentPath)||
    /\/fast_day\.html$/i.test(studentPath)||
    /\/korean_history2_day[1-6]_student_flow_app\.html$/i.test(studentPath);
  const isStudentLearningPage=
    /\/fast_day\.html$/i.test(studentPath)||
    /\/korean_history2_day[1-6]_student_flow_app\.html$/i.test(studentPath);
  const isAdaptiveFastReview=/\/adaptive_fast_review\.html$/i.test(studentPath);
  const isUnifiedJourneyPage=isStudentLearningPage||isAdaptiveFastReview;
  const isStudentHub=/\/fast_index\.html$/i.test(studentPath);
  const isParentPage=/\/parent\.html$/i.test(studentPath);

  if(isStudentVisibilityPage){
    if(!document.getElementById('history2-student-visibility-boost')){
      const styleLink=document.createElement('link');
      styleLink.id='history2-student-visibility-boost';
      styleLink.rel='stylesheet';
      styleLink.href='student_visibility_boost.css';
      document.head.appendChild(styleLink);
    }
    if(!document.getElementById('history2-student-visibility-refine')){
      const refineLink=document.createElement('link');
      refineLink.id='history2-student-visibility-refine';
      refineLink.rel='stylesheet';
      refineLink.href='student_visibility_refine.css';
      document.head.appendChild(refineLink);
    }
  }

  if(isStudentLearningPage&&!window.__H2_LEARNING_SOURCE_CONTEXT_REQUESTED__){
    window.__H2_LEARNING_SOURCE_CONTEXT_REQUESTED__=true;
    const sourceContext=document.createElement('script');
    sourceContext.src='learning_source_context_addon.js';
    sourceContext.defer=true;
    sourceContext.onerror=()=>console.error('[History2] learning_source_context_addon.js load failed');
    document.head.appendChild(sourceContext);
  }

  // One Day 1-18 weakness engine powers hub, parent analytics and the next-learning recommendation.
  if((isStudentHub||isParentPage||isUnifiedJourneyPage)&&!window.__H2_WEAKNESS_PROFILE_REQUESTED__){
    window.__H2_WEAKNESS_PROFILE_REQUESTED__=true;
    const core=document.createElement('script');
    core.src='weakness_profile_engine.js';
    core.defer=true;
    core.onload=()=>{
      if(isStudentHub||isParentPage){
        const view=document.createElement('script');
        view.defer=true;
        view.src=isParentPage?'weakness_profile_parent_addon.js':'weakness_profile_student_addon.js';
        view.onerror=()=>console.error('[History2] weakness profile view load failed');
        document.head.appendChild(view);
      }
      if(isUnifiedJourneyPage)loadUnifiedJourney();
    };
    core.onerror=()=>{
      console.error('[History2] weakness_profile_engine.js load failed');
      if(isUnifiedJourneyPage)loadUnifiedJourney();
    };
    document.head.appendChild(core);
  }else if(isUnifiedJourneyPage){
    loadUnifiedJourney();
  }

  function loadUnifiedJourney(){
    if(window.__H2_UNIFIED_JOURNEY_REQUESTED__)return;
    window.__H2_UNIFIED_JOURNEY_REQUESTED__=true;
    const journey=document.createElement('script');
    journey.src='unified_learning_journey_addon.js';
    journey.defer=true;
    journey.onerror=()=>console.error('[History2] unified_learning_journey_addon.js load failed');
    document.head.appendChild(journey);
  }

  window.__HISTORY2_SYNC_DIRTY__=window.__HISTORY2_SYNC_DIRTY__||new Set();
  const should=k=>typeof k==='string'&&k.startsWith('history2-')&&!k.startsWith('history2-firebase-')&&!k.startsWith('history2-sync-');
  const p=Storage.prototype;
  const rawGet=p.getItem, rawSet=p.setItem, rawRemove=p.removeItem, rawClear=p.clear;
  window.__HISTORY2_RAW_STORAGE__={getItem:rawGet,setItem:rawSet,removeItem:rawRemove,clear:rawClear};

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

  if(!cloudDisabled){
    const syncBootAt=Date.now();
    const reloadKey='history2-sync-applied-v1:'+location.pathname;
    const applyInitialCloudState=e=>{
      if(Date.now()-syncBootAt>30000){window.removeEventListener('history2:cloud-reconciled',applyInitialCloudState);return}
      if(!(e&&e.detail&&e.detail.changed))return;
      try{
        if(sessionStorage.getItem(reloadKey)==='1')return;
        sessionStorage.setItem(reloadKey,'1');
        setTimeout(()=>location.reload(),80);
      }catch(_){setTimeout(()=>location.reload(),80)}
    };
    window.addEventListener('history2:cloud-reconciled',applyInitialCloudState);
    setTimeout(()=>window.removeEventListener('history2:cloud-reconciled',applyInitialCloudState),30000);
  }

  if(!window.__H2_FOCUS_OX_ADDON_REQUESTED__){
    window.__H2_FOCUS_OX_ADDON_REQUESTED__=true;
    const s=document.createElement('script');
    s.src='focus_recall_ox_addon.js';
    s.defer=true;
    s.onerror=()=>console.error('[History2] focus_recall_ox_addon.js load failed');
    document.head.appendChild(s);
  }

  if(!window.__H2_DEPTH_CHOICE_ADDON_REQUESTED__){
    window.__H2_DEPTH_CHOICE_ADDON_REQUESTED__=true;
    const s=document.createElement('script');
    s.src='depth_choice_mode_addon.js';
    s.defer=true;
    s.onerror=()=>console.error('[History2] depth_choice_mode_addon.js load failed');
    document.head.appendChild(s);
  }
})();
