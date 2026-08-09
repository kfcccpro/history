(function(){
'use strict';
if(typeof renderParentTab!=='function'||typeof runtime==='undefined')return;
const base=renderParentTab;
renderParentTab=function(){
  if(runtime.parentTab!=='sync')return base();
  const s=window.History2CloudSync?.state||{};
  const label=!s.configured?'Firebase 프로젝트 설정 필요':!s.authenticated?'동기화 계정 로그인 필요':s.error?s.error:(s.mode==='connecting'?'동기화 중':'클라우드 동기화 연결됨');
  return `<section class="parent-card"><h2>기기 간 학습 동기화</h2><p class="small">${label}</p><p class="small">동기화 설정은 단원 전체 기록을 한 계정으로 관리하는 통합 보호자 화면에서 설정합니다. 예전 가족 코드 방식은 더 이상 사용하지 않습니다.</p><button class="secondary" id="openUnifiedSync" style="margin-top:12px">통합 보호자 화면 열기</button></section>`;
};
const baseBind=bind;bind=function(){const r=baseBind();const b=document.getElementById('openUnifiedSync');if(b)b.onclick=()=>{sessionStorage.setItem('history2-parent-mode-unlocked','1');location.href='korean_history2_unit1_parent_mode_metacog.html'};return r};
})();
