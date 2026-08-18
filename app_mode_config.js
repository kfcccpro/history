(function(){
  'use strict';
  window.HISTORY2_APP_CONFIG=Object.freeze({
    buildMode:'release',
    studentPin:'8081',
    adminPin:'2007',
    development:Object.freeze({
      persistProgress:false,
      persistLearningHistory:false,
      firebaseSync:false,
      freeNavigation:true,
      adminStartsInDevConsole:true
    }),
    release:Object.freeze({
      persistProgress:true,
      persistLearningHistory:true,
      firebaseSync:true,
      freeNavigation:false,
      adminStartsInDevConsole:false
    })
  });

  const p=location.pathname||'';
  const student=/\/fast_index\.html$/i.test(p)||/\/fast_day\.html$/i.test(p)||/\/adaptive_fast_review\.html$/i.test(p)||/\/pre_chapter_wrong_gate\.html$/i.test(p)||/\/korean_history2_day[1-6]_(?:student_flow_app|metacog_app)\.html$/i.test(p)||/\/korean_history2_unit1_adaptive_review_metacog_flow\.html$/i.test(p);
  if(student&&!window.__H2_WRONG_SYSTEM_LOADER_REQUESTED__){
    window.__H2_WRONG_SYSTEM_LOADER_REQUESTED__=true;
    const s=document.createElement('script');
    s.src='wrong_learning_system_bootstrap.js';
    s.defer=true;
    s.onerror=()=>console.error('[History2] wrong_learning_system_bootstrap.js load failed');
    document.head.appendChild(s);
  }

  if(/\/korean_history2_day[1-6]_(?:student_flow_app|metacog_app)\.html$/i.test(p)&&!window.__H2_ADHD_DEPTH_UX_LOADER_REQUESTED__){
    window.__H2_ADHD_DEPTH_UX_LOADER_REQUESTED__=true;
    const u=document.createElement('script');
    u.src='adhd_depth_ux_addon.js';
    u.defer=true;
    u.onerror=()=>console.error('[History2] adhd_depth_ux_addon.js load failed');
    document.head.appendChild(u);
  }
})();
