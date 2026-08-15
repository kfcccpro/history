(function(){
  function esc(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function statusText(s){
    if(!s.configured)return 'Firebase 프로젝트 설정 필요';
    if(s.protocol==='file:')return 'HTTPS 배포 주소에서 기기 간 동기화가 활성화됩니다.';
    if(s.error)return s.error;
    if(!s.authenticated||s.mode==='connecting')return 'Firebase 자동 연결 중';
    return s.lastSyncAt?'기기 간 동기화됨 · '+new Date(s.lastSyncAt).toLocaleString():'Firebase 연결됨';
  }
  function mount(){const main=document.getElementById('content')||document.querySelector('.parent-wrap')||document.querySelector('.wrap');if(!main||document.getElementById('firebaseSyncPanel'))return;const api=window.History2CloudSync||{},s=api.state||{configured:false};const el=document.createElement('section');el.id='firebaseSyncPanel';el.className='section parent-card';el.innerHTML=`<h2>기기 간 학습 동기화</h2><div class="desc" id="firebaseSyncStatus">${esc(statusText(s))}</div><div id="firebaseSyncBody"></div>`;main.appendChild(el);render()}
  function render(){const el=document.getElementById('firebaseSyncBody'),api=window.History2CloudSync||{},s=api.state||{};if(!el)return;document.getElementById('firebaseSyncStatus').textContent=statusText(s);
    if(!s.configured){el.innerHTML='<p class="desc">Firebase 설정이 배포 파일에 없습니다. 최신 배포 패키지를 사용하세요.</p>';return}
    if(s.protocol==='file:'){el.innerHTML='<p class="desc">로컬 파일에서는 기존 기기 저장을 사용합니다. GitHub Pages 주소로 접속하면 학생 로그인 없이 자동 동기화됩니다.</p>';return}
    if(!s.authenticated){el.innerHTML='<p class="desc">학생 로그인 화면 없이 Firebase에 자동 연결하고 있습니다.</p>';return}
    el.innerHTML=`<div class="sync-account"><b>단일 학생 학습공간 연결됨</b><span>${s.offlineCache?'오프라인 캐시 사용':'온라인 동기화'}</span></div><div class="sync-login-actions"><button class="btn primary" id="syncNow">지금 동기화</button></div><div class="desc" id="firebaseSyncMsg" style="margin-top:8px">PC·스마트폰·태블릿은 같은 학습공간을 사용합니다. 관리자 모드는 기존 PIN 2007로만 엽니다.</div>`;
    document.getElementById('syncNow').onclick=async()=>{const m=document.getElementById('firebaseSyncMsg');try{m.textContent='동기화 중...';await api.syncNow();m.textContent='동기화 완료'}catch(e){m.textContent='확인 필요: '+(e.code||e.message||e)}};
  }
  window.addEventListener('history2:sync-status',()=>{mount();render()});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(mount,0));else setTimeout(mount,0);
})();
