(function(){
'use strict';
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function render(){
  if(!window.H2WeaknessProfile)return;
  const root=document.querySelector('main.wrap');
  if(!root||document.getElementById('studentWeaknessSummary'))return;
  const p=H2WeaknessProfile.get(),rec=H2WeaknessProfile.recommend(),items=(p.topConcept||[]).filter(x=>x.score>0).slice(0,3);
  const sec=document.createElement('section');
  sec.id='studentWeaknessSummary';sec.className='group';
  const cards=items.length?`<div class="grid">${items.map((x,i)=>`<div class="day" style="cursor:default"><b>우선 ${i+1}</b><strong>${esc(x.name)}</strong><span>${x.count}회 흔들림 · ${x.dayCount}개 Day에서 확인</span></div>`).join('')}</div>`:`<div style="color:#64788d;font-size:18px;font-weight:800">반복된 취약점이 아직 없습니다. 현재 진도를 이어가면 됩니다.</div>`;
  const action=rec?`<a href="${esc(rec.href)}" style="display:flex;align-items:center;justify-content:space-between;gap:18px;margin:20px 0 0;padding:22px 24px;border-radius:20px;background:#102b4c;color:#fff;text-decoration:none"><span><small style="display:block;font-size:15px;opacity:.72;font-weight:900;margin-bottom:6px">다음 추천 학습</small><strong style="display:block;font-size:clamp(23px,2vw,30px);line-height:1.3">${esc(rec.title)}</strong><span style="display:block;margin-top:7px;font-size:17px;line-height:1.45;opacity:.84;font-weight:800">${esc(rec.detail)}</span></span><b style="font-size:28px;white-space:nowrap">시작 →</b></a>`:'';
  sec.innerHTML=`<h2>지금 우선 보완할 3가지</h2><div style="color:#64788d;font-size:18px;font-weight:800;line-height:1.5;margin:-2px 0 16px">점수가 아니라, 최근 오답에서 반복된 개념을 보여줍니다. 아래 추천은 이 기록을 실제 다음 학습 순서에 반영합니다.</div>${cards}${action}`;
  const first=root.querySelector('.group');if(first)root.insertBefore(sec,first);else root.appendChild(sec)
}
function refresh(){const old=document.getElementById('studentWeaknessSummary');if(old)old.remove();render()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render,{once:true});else render();
window.addEventListener('history2:cloud-reconciled',()=>setTimeout(refresh,60));
})();