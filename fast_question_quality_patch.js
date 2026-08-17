(function(g){
'use strict';
if(g.History2FastQuestionQuality)return;

const PATCH={
  d10q02:{
    q:'1960~1970년대 정부의 경제 성장 전략을 가장 잘 설명한 것은?',
    options:[
      '내수 시장 보호를 최우선으로 하고 수출 지원을 줄였다',
      '수출 기업을 지원해 해외 시장을 확대하고 외화를 확보했다',
      '농업 생산 확대만으로 공업화 재원을 마련했다',
      '수입 자유화를 먼저 확대해 국내 산업 보호를 축소했다'
    ],answer:1,
    why:'정부는 수출 기업을 지원하고 해외 시장을 확대해 외화를 확보하는 수출 주도형 성장 전략을 추진했습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'정책과 성장 전략 연결',focus:'수출 지원 → 해외 시장 확대 → 외화 확보'}
  },
  d10q06:{
    q:'1970년대 정부가 철강·조선·기계·석유화학에 투자를 집중한 산업 정책은?',
    options:['경공업 수출 산업 육성','중화학 공업 육성','농업 기계화 중심 정책','정보 통신 산업 육성'],answer:1,
    why:'1970년대 정부는 철강·조선·기계·석유화학 등 중화학 공업을 집중 육성했습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'산업 사례와 정책 연결',focus:'철강·조선·기계·석유화학 → 중화학 공업'}
  },
  d10q12:{
    options:[
      '경제 성장은 이루어졌지만 노동·도시·환경 문제도 함께 커졌다',
      '경제 성장과 함께 도시 과밀과 노동 문제도 빠르게 해소되었다',
      '수출은 늘었지만 산업 구조와 생활 방식에는 거의 변화가 없었다',
      '산업화가 진행되면서 농촌과 도시의 격차가 곧바로 사라졌다'
    ],answer:0,
    qualityDiagnosis:{depth:'D4',label:'보기 구별·문제 적용',skill:'산업화의 성과와 한계 함께 비교',focus:'경제 성장 + 노동·도시·환경 문제'}
  },
  d11s13:{
    q:'1970년대 포항제철·조선소·석유화학 단지 확대와 가장 직접적으로 연결되는 산업 정책은?',
    options:['경공업 중심 수출 정책','중화학 공업 육성','농업 증산 중심 정책','정보 통신 산업 육성'],answer:1,
    why:'1970년대 정부는 철강·조선·기계·석유화학 등 중화학 공업을 집중적으로 육성했습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'산업 시설과 정책 연결',focus:'철강·조선·석유화학 → 중화학 공업'}
  },
  d11q06:{
    options:['금융 실명제','부동산 실명제','금리 자유화','외환 거래 자유화'],answer:0,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'정책 목적과 제도 연결',focus:'금융 거래의 투명성 → 금융 실명제'}
  },
  d11q11:{
    options:[
      '노동·환경·여성 등 다양한 시민운동과 시민단체 활동이 확대되었다',
      '시민단체의 공적 활동이 이전보다 전면 금지되었다',
      '사회 문제에 대한 시민의 조직적 참여가 크게 줄었다',
      '민주화 이후 노동·환경 문제에 대한 사회운동이 사라졌다'
    ],answer:0,
    why:'민주화가 진전되면서 노동·환경·여성 등 다양한 분야에서 시민단체와 사회운동의 활동이 확대되었습니다.',
    qualityDiagnosis:{depth:'D4',label:'보기 구별·문제 적용',skill:'민주화 이후 사회 변화 판단',focus:'정치 민주화 → 시민사회와 사회운동의 성장'}
  },
  d12q01:{
    options:['국제 통화 기금(IMF)','세계 무역 기구(WTO)','경제 협력 개발 기구(OECD)','아시아 태평양 경제 협력체(APEC)'],answer:0,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'경제 위기와 국제기구 연결',focus:'1997 외환 위기 → IMF 긴급 자금 지원'}
  },
  d12q03:{
    options:[
      '기업·금융 부문의 구조 조정과 부실 기관 정리',
      '부실 금융기관의 정리를 중단하고 기존 구조를 그대로 유지',
      '모든 기업 부채를 정부가 일괄적으로 없애는 정책',
      '외환 시장과 해외 자본 거래를 전면 폐쇄하는 정책'
    ],answer:0,
    qualityDiagnosis:{depth:'D4',label:'보기 구별·문제 적용',skill:'외환 위기 대응 정책 구별',focus:'기업·금융 구조 조정'}
  },
  d12q08:{
    q:'외국인 노동자와 결혼 이민자 등 외국인 주민의 증가와 가장 직접적으로 연결되는 사회 변화는?',
    options:['다문화 사회의 확대','도시 인구의 전면 감소','산업화 이전 농촌 사회로의 복귀','고령 인구 비중의 급격한 감소'],answer:0,
    why:'외국인 주민과 이민 인구가 늘면서 언어·문화·가족 형태가 다양해지고 다문화 사회의 성격이 커졌습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'인구 변화와 사회 현상 연결',focus:'외국인 주민 증가 → 다문화 사회 확대'}
  },
  d12q10:{
    q:'한류와 디지털 문화의 확산을 함께 보여 주는 사례로 가장 적절한 것은?',
    options:[
      'K-pop·드라마 등이 OTT·SNS를 통해 해외 이용자에게 빠르게 확산되었다',
      '대중문화 소비가 국내 지상파 방송 시간대에만 한정되었다',
      '인터넷 보급 뒤에도 영상과 음악의 해외 유통은 오프라인에만 머물렀다',
      '한국 대중문화의 해외 소비가 줄어들며 국제 교류도 축소되었다'
    ],answer:0,
    why:'한류 콘텐츠는 OTT·SNS 같은 디지털 플랫폼을 통해 해외로 빠르게 확산되며 국제적 영향력을 넓혔습니다.',
    qualityDiagnosis:{depth:'D4',label:'보기 구별·문제 적용',skill:'문화 변화 사례 판단',focus:'한류 + OTT·SNS를 통한 국제 확산'}
  },
  d13q07:{
    q:'남북 간 긴장 완화와 교류 확대의 사례로 보기 어려운 것은?',
    options:['이산가족 상봉','남북 회담 개최','남북 경제 협력 사업','군사적 충돌의 의도적 확대'],answer:3,
    why:'이산가족 상봉·남북 회담·경제 협력은 대화와 교류의 사례이며, 군사적 충돌 확대는 긴장 완화와 반대 방향입니다.',
    qualityDiagnosis:{depth:'D4',label:'보기 구별·문제 적용',skill:'평화·교류 사례와 대립 행동 구별',focus:'대화·교류 확대 ↔ 군사적 긴장 확대'}
  },
  d13q09:{
    q:'6·15 남북 공동 선언의 내용과 가장 가까운 것은?',
    options:[
      '남북이 서로의 통일 방안에 공통성이 있음을 인정하고 교류·협력을 확대하기로 했다',
      '유엔 감시 아래 즉시 남북 총선거를 실시하기로 했다',
      '군사 분계선을 즉시 없애고 단일 정부를 수립하기로 했다',
      '남북이 서로 별도의 군사 동맹을 체결하기로 했다'
    ],answer:0,
    why:'6·15 남북 공동 선언은 남북 통일 방안의 공통성을 인정하고 이산가족 문제 해결과 경제·사회·문화 교류 협력을 확대하는 방향을 담았습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'선언과 핵심 내용 연결',focus:'6·15 공동 선언 → 통일 방안의 공통성·교류 협력'}
  },
  d14q05:{
    options:['금융 실명제','부동산 실명제','금리 자유화','외환 거래 자유화'],answer:0,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'정책과 정부 연결',focus:'김영삼 정부 → 금융 실명제'}
  },
  d14q07:{
    options:['세계 무역 기구(WTO)','국제 통화 기금(IMF)','경제 협력 개발 기구(OECD)','아시아 태평양 경제 협력체(APEC)'],answer:1,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'외환 위기와 국제기구 연결',focus:'1997 외환 위기 → IMF'}
  },
  d14q11:{
    q:'외환 위기 극복 과정에서 실제로 추진된 경제 정책은?',
    options:[
      '기업·금융 부문의 구조 조정',
      '부실 금융기관을 정리하지 않고 그대로 유지',
      '외환 거래와 시장 개방을 전면 중단',
      '모든 대기업을 정부가 직접 소유하는 체제로 전환'
    ],answer:0,
    why:'외환 위기 극복 과정에서 기업과 금융 부문의 구조 조정 및 부실 기관 정리가 추진되었습니다.',
    qualityDiagnosis:{depth:'D4',label:'보기 구별·문제 적용',skill:'위기 대응 정책 구별',focus:'외환 위기 → 기업·금융 구조 조정'}
  },
  d14q15:{
    q:'남북 경제 협력 사업의 사례로 가장 적절한 것은?',
    options:['개성 공단 운영','남북 기본 합의서 채택','이산가족 상봉','남북 정상 회담 개최'],answer:0,
    why:'개성 공단은 남북이 함께 추진한 대표적인 경제 협력 사업입니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'남북 교류 사례와 유형 연결',focus:'경제 협력 → 개성 공단'}
  },
  d15q03:{
    q:'1910년대 조선에서 회사를 설립할 때 적용된 회사령의 핵심 방식은?',
    options:['총독의 허가를 받아야 하는 허가제','신고만 하면 설립할 수 있는 신고제','회사 설립을 전면 금지하는 방식','일본 본토 의회의 승인을 받는 방식'],answer:0,
    why:'1910년 회사령은 회사 설립을 조선 총독의 허가제로 두어 기업 활동을 통제했습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'법령과 운영 방식 연결',focus:'회사령 → 회사 설립 허가제'}
  },
  d15q09:{
    q:'1920년 6월 홍범도가 이끈 대한 독립군 등이 일본군을 크게 물리친 전투는?',
    options:['봉오동 전투','청산리 대첩','대전자령 전투','쌍성보 전투'],answer:0,
    why:'1920년 6월 홍범도의 대한 독립군 등이 봉오동에서 일본군을 크게 물리쳤습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'인물·시기·전투 연결',focus:'홍범도·1920년 6월 → 봉오동 전투'}
  },
  d15q10:{
    options:['봉오동 전투','청산리 대첩','대전자령 전투','쌍성보 전투'],answer:1,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'부대·인물과 전투 연결',focus:'김좌진·북로 군정서군 → 청산리 대첩'}
  },
  d15q11:{
    q:'김원봉이 1919년 만주 지린에서 조직한 의열 투쟁 단체는?',
    options:['의열단','한인 애국단','조선 의용대','신간회'],answer:0,
    why:'김원봉은 1919년 만주 지린에서 의열단을 조직했습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'인물·시기와 단체 연결',focus:'김원봉·1919 지린 → 의열단'}
  },
  d15q14:{
    q:'1929년 원산 노동자들이 전개한 대표적인 대규모 노동 쟁의는?',
    options:['원산 총파업','암태도 소작 쟁의','형평 운동','광주 학생 항일 운동'],answer:0,
    why:'1929년 원산 노동자들은 대규모 총파업을 전개했습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'지역·시기와 사회운동 연결',focus:'1929년 원산 노동자 → 원산 총파업'}
  },
  d16q04:{
    q:'광복을 앞둔 독립운동 세력이 공통적으로 준비해야 했던 핵심 과제는?',
    options:['독립 국가의 정치 체제와 건국 방안 마련','일제 식민 통치 기구의 장기 유지','일본 제국 내 자치권만 확보','독립 이후에도 총독부 행정 체제 유지'],answer:0,
    why:'광복을 앞둔 독립운동 세력은 해방 뒤 어떤 국가를 세울지 정치 체제와 건국 방안을 준비했습니다.',
    qualityDiagnosis:{depth:'D4',label:'보기 구별·문제 적용',skill:'광복 직전 독립운동의 과제 판단',focus:'독립운동의 목표 → 해방 이후 독립 국가 건설'}
  },
  d16q10:{
    options:['인천 상륙 작전','낙동강 방어선 전투','흥남 철수 작전','1·4 후퇴'],answer:0,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'전쟁 시기와 작전 연결',focus:'1950년 9월 반격 → 인천 상륙 작전'}
  },
  d16q11:{
    options:['중국군의 대규모 개입','인천 상륙 작전','휴전 회담 시작','반공 포로 석방'],answer:0,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'전쟁 전개와 원인·결과 연결',focus:'압록강 부근 북진 → 중국군 개입 → 후퇴'}
  },
  d16q15:{
    q:'1972년 10월 유신을 통해 박정희 정부가 강화한 정치 체제는?',
    options:['유신 체제','제2공화국 의원 내각제','제3공화국 초기 대통령제','1987년 직선제 체제'],answer:0,
    why:'1972년 유신 헌법 제정으로 대통령 권한과 장기 집권 기반이 크게 강화된 유신 체제가 성립했습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'시기와 정치 체제 연결',focus:'1972년 10월 유신 → 유신 체제'}
  },
  d17q04:{
    q:'1970년대 정부가 철강·조선·기계·석유화학을 집중 육성한 산업 정책은?',
    options:['경공업 수출 산업 육성','중화학 공업 육성','농업 증산 중심 정책','정보 통신 산업 육성'],answer:1,
    why:'1970년대에는 철강·조선·기계·석유화학 등 중화학 공업 육성이 본격화되었습니다.',
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'산업 사례와 정책 연결',focus:'철강·조선·기계·석유화학 → 중화학 공업'}
  },
  d17q06:{
    options:['북방 외교','한일 국교 정상화','햇볕 정책','통상 수교 거부 정책'],answer:0,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'정부와 대외 정책 연결',focus:'노태우 정부 → 북방 외교'}
  },
  d17q12:{
    q:'관세 등 국가 사이의 무역 장벽을 낮추기 위한 자유 무역 협정의 약자는?',
    options:['FTA','ODA','OECD','PKO'],answer:0,
    why:'FTA는 Free Trade Agreement, 즉 자유 무역 협정을 뜻합니다.',
    qualityDiagnosis:{depth:'D2',label:'뜻·핵심 사실',skill:'경제 용어의 뜻 확인',focus:'FTA = 자유 무역 협정'}
  },
  d17q14:{
    options:['7·4 남북 공동 성명','남북 기본 합의서','6·15 남북 공동 선언','10·4 남북 공동 선언'],answer:1,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'연도와 남북 합의 문서 연결',focus:'1991년 → 남북 기본 합의서'}
  },
  d17q15:{
    options:['6·15 남북 공동 선언','7·4 남북 공동 성명','남북 기본 합의서','10·4 남북 공동 선언'],answer:0,
    qualityDiagnosis:{depth:'D3',label:'관계·순서 연결',skill:'정상 회담과 공동 선언 연결',focus:'2000년 첫 남북 정상 회담 → 6·15 공동 선언'}
  }
};

function merge(target,patch){
  if(!target||!patch)return target;
  Object.keys(patch).forEach(k=>{
    const v=patch[k];
    if(Array.isArray(v))target[k]=v.slice();
    else if(v&&typeof v==='object'){
      if(!target[k]||typeof target[k]!=='object'||Array.isArray(target[k]))target[k]={};
      merge(target[k],v);
    }else target[k]=v;
  });
  return target;
}

function targetSlot(id,answerCount){
  const m=String(id||'').match(/^d(\d+)(?:q|s|src)(\d+)$/i);
  if(m)return (Number(m[1])+Number(m[2]))%answerCount;
  let h=0;for(const c of String(id||''))h=(h*31+c.charCodeAt(0))>>>0;
  return h%answerCount;
}

function rebalance(q){
  if(!q||q.__qualityBalanced||!Array.isArray(q.options)||q.options.length<2)return q;
  const n=q.options.length,oldAnswer=Number(q.answer);
  if(!Number.isInteger(oldAnswer)||oldAnswer<0||oldAnswer>=n)return q;
  const slot=targetSlot(q.id,n);
  const correct=q.options[oldAnswer];
  const distractors=q.options.filter((_,i)=>i!==oldAnswer);
  const next=new Array(n);next[slot]=correct;
  let d=0;for(let i=0;i<n;i++)if(i!==slot)next[i]=distractors[d++];
  q.options=next;q.answer=slot;q.__qualityBalanced=true;
  return q;
}

function apply(content){
  if(!content||!Array.isArray(content.questions))return content;
  content.questions.forEach(q=>{
    if(!q||!q.id)return;
    if(PATCH[q.id])merge(q,PATCH[q.id]);
    rebalance(q);
  });
  content.questionQualityAudit='2026-08-17';
  return content;
}

function diagnose(item,pickedIndex){
  const preset=item&&item.qualityDiagnosis||null;
  const text=`${item&&item.q||''} ${item&&item.concept||''}`;
  let depth='D3',skill='개념과 보기 연결',label='관계 연결';
  if(preset){depth=preset.depth||depth;skill=preset.skill||skill;label=preset.label||label;}
  else if(/옳지 않은|아닌 것은|잘못|구별|해당하지|보기 어려운|가장 적절|가장 잘|공통점|균형 있게|의미/.test(text)){
    depth='D4';skill='보기 비교·문제 적용';label='보기 구별·문제 적용';
  }else if(/연도|시기|순서|직후|이후|이전|먼저|나중|몇 년|언제|해는|날짜|\d{4}년/.test(text)){
    depth='D3';skill='시기·순서 연결';label='관계·순서 연결';
  }else if(/결과|배경|원인|영향|이어|계기|때문/.test(text)){
    depth='D3';skill='원인·결과 연결';label='관계·순서 연결';
  }else if(/인물|누가|중심|주도|이끈|조합|정부/.test(text)){
    depth='D3';skill='인물·정부와 활동 연결';label='관계·순서 연결';
  }else if(/단체|기관|회의|정책|제도|사건|운동|무엇|특징/.test(text)){
    depth='D2';skill='핵심 개념·특징 확인';label='뜻·핵심 사실';
  }
  const picked=String(item&&item.options&&item.options[pickedIndex]||'').trim();
  const correct=String(item&&item.options&&item.options[item.answer]||'').trim();
  const focus=String(preset&&preset.focus||item&&item.recovery&&item.recovery.path&&item.recovery.path[item.recovery.path.length-1]||item&&item.concept||'핵심 개념').trim();
  return {depth,skill,label,picked,correct,focus,message:`이번 답에서는 ${item&&item.concept||'이 개념'}의 '${skill}' 단계가 흔들렸습니다. 이 부분만 복구한 뒤 같은 문제를 다시 풉니다.`};
}

g.History2FastQuestionQuality={PATCH,apply,diagnose,rebalance};
g.applyHistory2FastQuestionQuality=apply;
})(window);
