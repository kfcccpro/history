(function(){
  'use strict';
  if(window.__H2_LEARNING_SOURCE_CONTEXT__)return;
  window.__H2_LEARNING_SOURCE_CONTEXT__=true;

  const DAY_INFO={
    1:{unit:'Ⅰ 일제 식민 통치와 민족 운동',title:'01 일제의 식민지 통치 정책'},
    2:{unit:'Ⅰ 일제 식민 통치와 민족 운동',title:'02 3·1 운동과 대한민국 임시 정부'},
    3:{unit:'Ⅰ 일제 식민 통치와 민족 운동',title:'03 민족 운동의 전개와 분화'},
    4:{unit:'Ⅰ 일제 식민 통치와 민족 운동',title:'04 사회·문화의 변화와 대중 운동'},
    5:{unit:'Ⅰ 일제 식민 통치와 민족 운동',title:'05 독립 국가 건설 노력'},
    6:{unit:'Ⅰ 일제 식민 통치와 민족 운동',title:'대단원 I 마무리'},
    7:{unit:'Ⅱ 대한민국의 발전',title:'06 냉전 체제와 대한민국 정부 수립'},
    8:{unit:'Ⅱ 대한민국의 발전',title:'07 6·25 전쟁과 남북 분단의 고착화'},
    9:{unit:'Ⅱ 대한민국의 발전',title:'08 민주화를 위한 노력'},
    10:{unit:'Ⅱ 대한민국의 발전',title:'09 산업화의 성과와 사회·문화의 변화'},
    11:{unit:'Ⅱ 대한민국의 발전',title:'대단원 II 마무리'},
    12:{unit:'Ⅲ 오늘날의 대한민국',title:'10 6월 민주 항쟁 이후의 민주화 과정'},
    13:{unit:'Ⅲ 오늘날의 대한민국',title:'11 외환 위기 극복과 사회·문화의 변동'},
    14:{unit:'Ⅲ 오늘날의 대한민국',title:'12 한반도 분단 극복과 동아시아 평화를 위한 노력'},
    15:{unit:'Ⅲ 오늘날의 대한민국',title:'대단원 III 마무리'},
    16:{unit:'단원별 TEST',title:'TEST 01~04 · 일제 식민 통치와 민족 운동'},
    17:{unit:'단원별 TEST',title:'TEST 05~08 · 정부 수립부터 민주화'},
    18:{unit:'단원별 TEST',title:'TEST 09~12 · 산업화부터 평화 노력'}
  };

  const style=document.createElement('style');
  style.id='h2-learning-source-context-style';
  style.textContent=`
    .learning-source-context{display:flex;align-items:center;flex-wrap:wrap;gap:0;margin:7px 0 0;color:#5b718b;font-size:clamp(16px,1.15vw,18px);font-weight:820;line-height:1.45;letter-spacing:-.015em;min-width:0}
    .learning-source-context .lsc-item{min-width:0}
    .learning-source-context .lsc-page{color:#1d6fb8;font-weight:950}
    .learning-source-context .lsc-unit{color:#526a85;font-weight:900}
    .learning-source-context .lsc-day{color:#637991;font-weight:900;white-space:nowrap}
    .learning-source-context .lsc-title{color:#405a76;font-weight:900}
    .learning-source-context .lsc-concept{color:#315f86;font-weight:900}
    .learning-source-context .lsc-sep{color:#9aabba;padding:0 7px;font-weight:800}
    .learning-source-context.is-fast{max-width:min(1180px,78vw)}
    .learning-source-context.is-question{flex:1 1 640px;margin:0 10px 0 0;order:-10;white-space:nowrap;overflow:hidden}
    .learning-source-context.is-question .lsc-item{overflow:hidden;text-overflow:ellipsis}
    body.h2-ux-v6 .question-panel .q-meta:has(.learning-source-context.is-question){display:flex!important;align-items:center!important;flex-wrap:nowrap!important;gap:8px!important}
    body.h2-ux-v6 .h2-v6-headcopy .learning-source-context{margin-top:6px}
    @media(max-width:900px){
      .learning-source-context{font-size:16px}
      .learning-source-context.is-fast{max-width:72vw}
      .learning-source-context .lsc-unit.optional-when-tight{display:none}
    }
    @media (orientation:landscape) and (max-height:700px){
      .learning-source-context{font-size:15px!important;line-height:1.35!important;margin-top:4px!important}
      .learning-source-context.is-question{max-width:100%;margin-right:6px!important}
      .learning-source-context .lsc-unit.optional-when-tight{display:none}
      .learning-source-context .lsc-concept.optional-when-tight{display:none}
      .learning-source-context .lsc-sep{padding:0 5px}
    }
  `;
  document.head.appendChild(style);

  const pathname=location.pathname||'';
  const fast=/\/fast_day\.html$/i.test(pathname);
  const fullMatch=pathname.match(/\/korean_history2_day([1-6])_student_flow_app\.html$/i);
  let lastFastConcept='';

  function dayNumber(){
    if(fast){
      const n=Number(new URLSearchParams(location.search).get('day')||0);
      return Number.isInteger(n)&&n>=7&&n<=18?n:0;
    }
    return fullMatch?Number(fullMatch[1]):0;
  }

  function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim()}

  function exactPage(){
    const candidates=[...document.querySelectorAll('.original-source,.source-note')];
    for(const el of candidates){
      const raw=clean(el.dataset&&el.dataset.learningSourceRaw||el.textContent);
      if(raw&&el.dataset&&!el.dataset.learningSourceRaw)el.dataset.learningSourceRaw=raw;
      const m=raw.match(/(문제편|교재|본책|워크북|개념편)?\s*(?:p\.?\s*)?(\d{1,3})\s*(?:쪽|페이지)/i);
      if(m){
        const kind=clean(m[1])||'교재';
        return {label:`${kind} p.${Number(m[2])}`,page:Number(m[2]),exact:true};
      }
    }
    const imgs=[...document.querySelectorAll('.original-question img[src],.question-panel img[src]')];
    for(const img of imgs){
      const src=String(img.getAttribute('src')||'');
      const m=src.match(/source[_-]page[_-]0*(\d{1,3})/i);
      if(m)return {label:`문제편 p.${Number(m[1])}`,page:Number(m[1]),exact:true};
    }
    return null;
  }

  function fastConcept(){
    if(document.querySelector('.intro-card,.done-card'))lastFastConcept='';
    const el=document.querySelector('.question-card .concept');
    const t=clean(el&&el.textContent);
    if(t)lastFastConcept=t;
    return lastFastConcept;
  }

  function partsFor(n){
    const info=DAY_INFO[n]||{};
    const page=exactPage();
    const parts=[];
    if(page)parts.push({text:page.label,cls:'lsc-page'});
    if(info.unit)parts.push({text:info.unit,cls:'lsc-unit'+(page?' optional-when-tight':'')});
    if(n)parts.push({text:`Day ${n}`,cls:'lsc-day'});
    if(info.title)parts.push({text:info.title,cls:'lsc-title'});
    const concept=fast?fastConcept():'';
    if(concept)parts.push({text:concept,cls:'lsc-concept optional-when-tight'});
    return parts;
  }

  function fill(el,parts){
    const key=parts.map(p=>p.text).join('|');
    if(el.dataset.contextKey===key)return;
    el.dataset.contextKey=key;
    el.replaceChildren();
    parts.forEach((p,i)=>{
      if(i){const sep=document.createElement('span');sep.className='lsc-sep';sep.textContent='·';el.appendChild(sep)}
      const s=document.createElement('span');s.className='lsc-item '+p.cls;s.textContent=p.text;el.appendChild(s);
    });
    el.setAttribute('aria-label','학습 위치: '+parts.map(p=>p.text).join(', '));
  }

  function ensureFast(n,parts){
    const host=document.querySelector('.shell>.top>div:first-child');
    const title=host&&host.querySelector('.title');
    if(!host||!title)return;
    let el=host.querySelector(':scope>.learning-source-context');
    if(!el){
      el=document.createElement('div');
      el.className='learning-source-context is-fast';
      title.insertAdjacentElement('afterend',el);
    }
    fill(el,parts);
  }

  function ensureFull(n,parts){
    const qmeta=document.querySelector('.question-panel .q-meta');
    if(qmeta){
      let el=qmeta.querySelector(':scope>.learning-source-context');
      if(!el){
        el=document.createElement('span');
        el.className='learning-source-context is-question';
        qmeta.prepend(el);
      }
      fill(el,parts);
      return;
    }
    const head=document.querySelector('.h2-v6-headcopy');
    const title=head&&head.querySelector('h1');
    if(head&&title){
      let el=head.querySelector(':scope>.learning-source-context');
      if(!el){
        el=document.createElement('div');
        el.className='learning-source-context';
        title.insertAdjacentElement('afterend',el);
      }
      fill(el,parts.filter(p=>!p.cls.includes('lsc-page')));
    }
  }

  function render(){
    const n=dayNumber();
    if(!n)return;
    const parts=partsFor(n);
    if(!parts.length)return;
    if(fast)ensureFast(n,parts);else ensureFull(n,parts);
  }

  let queued=false;
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;render()});
  }
  const observer=new MutationObserver(schedule);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});else schedule();
})();
