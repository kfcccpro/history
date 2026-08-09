(function(){
'use strict';
try{
  if(!window.H2PostDayRecallPolicy||typeof M==='undefined')return;
  const s=H2PostDayRecallPolicy.parentSnapshot(M.memory),foot=document.querySelector('.foot');if(!foot)return;
  const pct=v=>v==null?'—':Math.round(v*100)+'%';
  const rows=(s.branches||[]).slice(0,6).map(z=>{const sel=z.weightedSelected,ctl=z.weightedSkipped,up=z.uplift;return `<div class="day"><div class="n">${z.selected} / ${z.skipped}</div><b>${z.name}<small style="display:block;color:var(--muted);margin-top:4px">회상 후 유지 ${pct(sel)} · 미선택 유지 ${pct(ctl)} · 차이 ${up==null?'—':(up>=0?'+':'')+Math.round(up*100)+'%p'}</small></b><span class="pill ${up!=null&&up<0?'hot':up!=null&&up>=.1?'ok':''}">${up==null?'관찰 중':up>=.1?'유지':up<0?'축소':'비교'}</span></div>`}).join('')||'<div class="desc">아직 비교 가능한 장기 기록이 없습니다.</div>';
  const c=s.counts||{},cards=[0,1,2,3].map(n=>{const x=c[n]||{};return `<div class="bucket"><span class="lab">마무리 회상 ${n}개</span><b>${x.n||0}</b><span>완료 ${pct(x.completionRate)} · 이탈 ${pct(x.abandonRate)}</span></div>`}).join('');
  const d=s.lastDecision,reason=d?.reasons?.join(' · ')||'기록을 더 모으는 중';
  const html=`<section class="section"><h2>Day 마무리 회상 자동 조절</h2><div class="desc">3·7일 기억 유지와 세션 종료 이탈 비용을 함께 보고 0~3개를 자동 선택합니다. 학생 화면에는 이 판단값을 표시하지 않습니다.</div><div class="schedule" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${cards}</div><div class="desc" style="margin-top:14px"><b>최근 결정</b> · ${reason}</div><div class="days">${rows}</div></section>`;
  foot.insertAdjacentHTML('beforebegin',html);
}catch(e){console.warn('post day recall policy parent addon',e)}
})();
