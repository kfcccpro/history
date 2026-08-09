(function(){
'use strict';
if(!window.H2ConceptDepth)return;
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
const x=H2ConceptDepth.parentSnapshot(H2ConceptDepth.DB.meta.storage);if(!x.total)return;
const labels={concept:'소개념까지 알고 있음',branch:'큰 가지부터 다시',root:'오늘 범위부터 다시',unit:'대단원부터 다시'};
const style=document.createElement('style');style.textContent=`.depth-parent-bars{display:grid;gap:10px}.depth-parent-row{display:grid;grid-template-columns:170px 1fr 46px;gap:10px;align-items:center}.depth-parent-row b{font-size:13px}.depth-parent-bar{height:12px;background:#edf1f6;border-radius:999px;overflow:hidden}.depth-parent-bar i{display:block;height:100%;background:#4b8fc5;border-radius:inherit}.depth-parent-list{display:grid;gap:9px;margin-top:15px}.depth-parent-item{border:1px solid #e2e8f0;border-radius:14px;padding:12px 14px}.depth-parent-item b{display:block}.depth-parent-item small{color:#6b7688;font-weight:750}`;document.head.appendChild(style);
const max=Math.max(1,...Object.values(x.count));const rows=['concept','branch','root','unit'].map(k=>`<div class="depth-parent-row"><b>${labels[k]}</b><div class="depth-parent-bar"><i style="width:${Math.round((x.count[k]||0)/max*100)}%"></i></div><strong>${x.count[k]||0}</strong></div>`).join('');
const branches=x.topBranches.map(b=>`<div class="depth-parent-item"><b>${esc(b.name)}</b><small>복구 ${b.count}회 · 상위 범위까지 올라간 경우 ${b.deep}회</small></div>`).join('');
const html=`<section class="section"><h2>개념 뎁스 복구 · 어디부터 다시 알아야 하는가</h2><div class="desc">오답 뒤 소개념에서 시작해 모르면 상위 가지로 올라가고, 마지막으로 연결되는 지점부터 다시 내려온 기록입니다. 최근 7일 ${x.recent7}회.</div><div class="depth-parent-bars">${rows}</div>${branches?`<div class="depth-parent-list">${branches}</div>`:''}</section>`;
const foot=document.querySelector('.foot,.footer');if(foot)foot.insertAdjacentHTML('beforebegin',html);else{const c=document.getElementById('content')||document.querySelector('.wrap')||document.body;c.insertAdjacentHTML('beforeend',html)}
})();
