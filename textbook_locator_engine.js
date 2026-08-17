(function(g){
'use strict';
if(g.H2TextbookLocator)return;

const DAY={
  1:{unit:'Ⅰ 일제 식민 통치와 민족 운동',chapter:'01 일제의 식민지 통치 정책'},
  2:{unit:'Ⅰ 일제 식민 통치와 민족 운동',chapter:'02 3·1 운동과 대한민국 임시 정부'},
  3:{unit:'Ⅰ 일제 식민 통치와 민족 운동',chapter:'03 민족 운동의 전개와 분화'},
  4:{unit:'Ⅰ 일제 식민 통치와 민족 운동',chapter:'04 사회·문화의 변화와 대중 운동'},
  5:{unit:'Ⅰ 일제 식민 통치와 민족 운동',chapter:'05 독립 국가 건설 노력'},
  6:{unit:'Ⅰ 일제 식민 통치와 민족 운동',chapter:'대단원 I 마무리'},
  7:{unit:'Ⅱ 대한민국의 발전',chapter:'06 냉전 체제와 대한민국 정부 수립'},
  8:{unit:'Ⅱ 대한민국의 발전',chapter:'07 6·25 전쟁과 남북 분단의 고착화'},
  9:{unit:'Ⅱ 대한민국의 발전',chapter:'08 민주화를 위한 노력'},
 10:{unit:'Ⅱ 대한민국의 발전',chapter:'09 산업화의 성과와 사회·문화의 변화'},
 11:{unit:'Ⅱ 대한민국의 발전',chapter:'대단원 II 마무리'},
 12:{unit:'Ⅲ 오늘날의 대한민국',chapter:'10 6월 민주 항쟁 이후의 민주화 과정'},
 13:{unit:'Ⅲ 오늘날의 대한민국',chapter:'11 외환 위기 극복과 사회·문화의 변동'},
 14:{unit:'Ⅲ 오늘날의 대한민국',chapter:'12 한반도 분단 극복과 동아시아 평화를 위한 노력'},
 15:{unit:'Ⅲ 오늘날의 대한민국',chapter:'대단원 III 마무리'},
 16:{unit:'단원별 TEST',chapter:'TEST 01~04 · 일제 식민 통치와 민족 운동'},
 17:{unit:'단원별 TEST',chapter:'TEST 05~08 · 독립 국가 건설부터 민주화'},
 18:{unit:'단원별 TEST',chapter:'TEST 09~12 · 산업화부터 평화 노력'}
};

const BOOK='한국사Ⅱ 문제편';
let exactMap=null;
let exactPromise=null;

function clean(v){return String(v==null?'':v).replace(/\s+/g,' ').trim()}
function uniq(arr){return [...new Set((arr||[]).map(clean).filter(Boolean))]}
function normalizeId(id){return clean(id)}

function fromAuditEntry(day,e){
  const d=DAY[day]||{};
  return {
    day:Number(day),
    questionId:normalizeId(e&&e.id),
    book:BOOK,
    page:Number.isFinite(Number(e&&e.page))?Number(e.page):null,
    pageRange:null,
    questionNo:clean(e&&e.questionNo)||null,
    unit:d.unit||null,
    chapter:d.chapter||null,
    section:null,
    keywords:uniq([e&&e.title,e&&e.concept]),
    confidence:Number.isFinite(Number(e&&e.page))?'A':'C',
    verified:Number.isFinite(Number(e&&e.page)),
    sourceText:clean(e&&e.source)||null,
    sourceKind:'source-audit'
  };
}

function buildAuditMap(json){
  const out={};
  const days=json&&json.days||{};
  Object.keys(days).forEach(day=>{
    (Array.isArray(days[day])?days[day]:[]).forEach(e=>{
      if(!e||!e.id)return;
      out[`${Number(day)}:${normalizeId(e.id)}`]=fromAuditEntry(Number(day),e);
    });
  });
  return out;
}

function loadExactMap(){
  if(exactMap)return Promise.resolve(exactMap);
  if(exactPromise)return exactPromise;
  exactPromise=fetch('QUESTION_SOURCE_MAPPING_AUDIT.json',{cache:'force-cache'})
    .then(r=>{if(!r.ok)throw new Error('source map '+r.status);return r.json()})
    .then(j=>{exactMap=buildAuditMap(j);return exactMap})
    .catch(err=>{console.error('[History2] exact textbook locator map load failed',err);exactMap={};return exactMap});
  return exactPromise;
}

function safeKeywordCandidates(item){
  if(!item||typeof item!=='object')return [];
  const path=item.recovery&&Array.isArray(item.recovery.path)?item.recovery.path:[];
  return uniq([
    item.branch,
    path.length>1?path[path.length-2]:'',
    item.concept
  ]).slice(0,3);
}

function fallback(day,questionId,item){
  const d=DAY[Number(day)]||{};
  const section=clean(item&&item.branch)||null;
  const keywords=safeKeywordCandidates(item);
  return {
    day:Number(day)||0,
    questionId:normalizeId(questionId)||clean(item&&item.id)||null,
    book:BOOK,
    page:null,
    pageRange:null,
    questionNo:null,
    unit:d.unit||clean(item&&item.unit)||null,
    chapter:d.chapter||null,
    section,
    keywords,
    confidence:section?'C':'D',
    verified:false,
    sourceText:null,
    sourceKind:'chapter-locator'
  };
}

function enrich(base,item){
  const x={...base};
  if(item){
    if(!x.section)x.section=clean(item.branch)||null;
    x.keywords=uniq([...(x.keywords||[]),...safeKeywordCandidates(item)]).slice(0,4);
  }
  return x;
}

function getSync(day,questionId,item){
  const key=`${Number(day)}:${normalizeId(questionId||item&&item.id)}`;
  if(exactMap&&exactMap[key])return enrich(exactMap[key],item);
  return fallback(day,questionId,item);
}

async function get(day,questionId,item){
  const d=Number(day)||0;
  if(d>=1&&d<=6){
    const map=await loadExactMap();
    const key=`${d}:${normalizeId(questionId||item&&item.id)}`;
    if(map[key])return enrich(map[key],item);
  }
  return fallback(d,questionId,item);
}

function confidenceLabel(c){
  return ({A:'정확한 문제 페이지 확인',B:'페이지 범위 확인',C:'단원·소단원 위치 확인',D:'단원·찾을 말 확인'})[c]||'교재 위치 확인';
}

function pageLabel(loc){
  if(!loc)return '';
  if(Number.isFinite(Number(loc.page)))return `p.${Number(loc.page)}`;
  if(loc.pageRange&&loc.pageRange.start&&loc.pageRange.end)return `p.${loc.pageRange.start}~${loc.pageRange.end}`;
  return '';
}

function guide(loc,opts){
  if(!loc)return null;
  const o=opts||{};
  const rows=[];
  const p=pageLabel(loc);
  if(loc.book)rows.push({label:'책',value:loc.book});
  if(p)rows.push({label:'페이지',value:p});
  if(loc.unit)rows.push({label:'대단원',value:loc.unit});
  if(loc.chapter)rows.push({label:'챕터',value:loc.chapter});
  if(loc.section)rows.push({label:'목록',value:loc.section});
  const kws=Array.isArray(loc.keywords)?loc.keywords.filter(Boolean):[];
  if(o.includeKeywords!==false&&kws.length)rows.push({label:'찾아볼 말',value:kws.slice(0,o.keywordLimit||2).join(' · ')});
  return {
    ...loc,
    pageLabel:p||null,
    confidenceLabel:confidenceLabel(loc.confidence),
    rows,
    instruction:p?'표시된 페이지에서 아래 목록을 찾아보세요.':'페이지를 추측하지 않았습니다. 아래 챕터와 목록에서 찾아보세요.'
  };
}

function isExact(loc){return !!(loc&&loc.confidence==='A'&&Number.isFinite(Number(loc.page)))}

// Warm the verified Day 1-6 map without blocking the page.
if(typeof fetch==='function')loadExactMap();

g.H2TextbookLocator={DAY,BOOK,loadExactMap,get,getSync,guide,pageLabel,confidenceLabel,isExact};
})(window);
