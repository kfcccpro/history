(function(){
'use strict';if(!window.H2MicroBlock)return;
function pct(v){return v==null?'—':Math.round(v*100)+'%'}
let timer=null;
function mount(){const main=document.getElementById('content')||document.querySelector('.parent-wrap')||document.querySelector('.wrap');if(!main)return;let el=document.getElementById('microBlockPanel');if(!el){el=document.createElement('section');el.id='microBlockPanel';el.className='section parent-card';main.appendChild(el)}const s=H2MicroBlock.snapshot(),a=s.aggregate;const sig=[a.checkpoints,a.paused,a.continued,a.pauseRate].join('|');if(el.dataset.sig===sig)return;el.dataset.sig=sig;el.innerHTML=`<h2>마이크로 블록 체크포인트</h2><div class="desc">원문 순서는 그대로 유지하면서 4~8문항 단위의 안전한 종료 지점을 만듭니다.</div><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:10px;margin-top:12px"><div class="kpi"><span class="small">체크포인트</span><b>${a.checkpoints}</b></div><div class="kpi"><span class="small">여기서 종료</span><b>${a.paused}</b></div><div class="kpi"><span class="small">계속 학습</span><b>${a.continued}</b></div><div class="kpi"><span class="small">종료 선택률</span><b>${pct(a.pauseRate)}</b></div></div>`}
function schedule(){clearTimeout(timer);timer=setTimeout(mount,60)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule);else schedule();new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});
})();
