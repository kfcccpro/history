(function(){
'use strict';
if(!window.H2ConceptDepth||typeof COURSE==='undefined'||typeof state==='undefined')return;
const mt=String(COURSE.meta&&COURSE.meta.id||'').match(/day(\d+)/i),DAYNUM=mt?Number(mt[1]):0;
if(!DAYNUM)return;
state.conceptDepthLog=state.conceptDepthLog||[];
const css=`
.depth-card{width:min(1320px,100%);max-width:none;margin:auto;display:grid;grid-template-columns:minmax(0,1fr);align-content:center}
.depth-kicker{font-size:16px;font-weight:950;color:#52677f;letter-spacing:.02em;margin-bottom:8px}
.depth-diagnosis{display:grid;grid-template-columns:auto minmax(0,1fr);gap:12px;align-items:center;margin:0 0 13px;padding:12px 14px;border:1px solid #dbe5ee;border-radius:14px;background:#f7fafc;color:#40556e}
.depth-diagnosis b{display:inline-grid;place-items:center;min-width:118px;min-height:42px;padding:7px 11px;border-radius:11px;background:#eaf4fc;color:#225f91;font-size:17px;line-height:1.2}
.depth-diagnosis span{font-size:17px;line-height:1.5;font-weight:850;word-break:keep-all}
.depth-path{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:4px 0 18px}
.depth-path span{position:relative;min-height:48px;padding:11px 8px;border-radius:12px;background:#eef3f8;color:#6a7c91;font-size:15px;line-height:1.2;font-weight:950;text-align:center;display:grid;place-items:center;border:2px solid transparent}
.depth-path span.on{background:#eaf4fc;color:#1e6498;border-color:#78add2;box-shadow:0 0 0 3px rgba(67,151,214,.08)}
.depth-path span.fail{background:#fff3e8;color:#985b19;border-color:#e5b77e}
.depth-title{font-size:clamp(32px,3.2vw,46px);margin:0 0 9px;line-height:1.12;letter-spacing:-.025em;word-break:keep-all}
.depth-sub{font-size:20px;color:#53677e;font-weight:820;line-height:1.55;margin:0 0 16px;word-break:keep-all}
.depth-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.depth-choice{width:100%;min-height:72px;border:2px solid #d9e3ec;border-radius:15px;background:#fff;padding:15px 17px;text-align:left;font:inherit;font-size:19px;font-weight:900;line-height:1.4;word-break:keep-all;transition:border-color .14s ease,background .14s ease,transform .14s ease}
.depth-choice:hover,.depth-choice:focus-visible{border-color:#72a9d0;background:#f5faff;outline:none;transform:translateY(-1px)}
.depth-msg{min-height:30px;margin:13px 0 0;color:#965a18;font-size:17px;line-height:1.45;font-weight:900}.depth-msg.ok{color:#217a53}
.depth-input{width:100%;height:72px;border:3px solid #d5dfeb;border-radius:16px;padding:0 18px;text-align:center;font:inherit;font-size:27px;font-weight:950;background:#fff}
.depth-input:focus{outline:none;border-color:#4397d6;box-shadow:0 0 0 5px rgba(67,151,214,.12)}
.depth-anchor{padding:20px 22px;border-radius:17px;background:#eef5fb;border:1px solid #d6e5f1;margin:10px 0 15px}
.depth-anchor b{display:block;font-size:28px;line-height:1.25;margin-bottom:7px}.depth-anchor p{margin:0;color:#52657a;font-size:18px;line-height:1.55;font-weight:800;word-break:keep-all}
.depth-note{font-size:15px;color:#667b91;font-weight:850;margin-top:10px;text-align:center}
.depth-card>.primary{min-height:64px;font-size:19px}
@media (orientation:landscape) and (min-width:900px){body.h2-ux-v6 .feedback-screen:has(.depth-card){padding:12px 24px!important;align-items:center!important;place-items:center!important}body.h2-ux-v6 .repair-card:has(.depth-card){width:min(1360px,100%)!important;max-width:none!important}.depth-card{max-height:calc(100dvh - 118px);overflow:auto;padding:4px 2px}.depth-choice-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (orientation:landscape) and (max-height:700px){.depth-diagnosis{padding:8px 11px;margin-bottom:8px}.depth-diagnosis b{min-height:36px;font-size:15px}.depth-diagnosis span{font-size:15px}.depth-path{margin-bottom:10px}.depth-path span{min-height:38px;padding:7px 6px;font-size:13px}.depth-title{font-size:30px;margin-bottom:5px}.depth-sub{font-size:17px;margin-bottom:10px}.depth-choice{min-height:58px;padding:10px 13px;font-size:17px}.depth-input{height:60px;font-size:23px}.depth-anchor{padding:14px 16px}.depth-anchor b{font-size:23px}.depth-anchor p{font-size:16px}.depth-msg{margin-top:8px;font-size:15px}}
@media (max-width:820px){.depth-diagnosis{grid-template-columns:1fr;gap:7px}.depth-diagnosis b{justify-self:start;min-width:0}.depth-path{grid-template-columns:repeat(5,minmax(70px,1fr));overflow-x:auto;padding-bottom:2px}.depth-choice-grid{grid-template-columns:1fr}.depth-title{font-size:30px}.depth-sub{font-size:17px}}
`;
const st=document.createElement('style');st.id='conceptDepthStyles';st.textContent=css;document.head.appendChild(st);
function esc(v){return escapeHtml(v)}
const AUDIT_DIAG={
  '1:p01':{depth:'D3',skill:'시대·순서 연결',message:'제1차 세계 대전의 시간 범위 안에 러시아 혁명을 놓는 시대 연결에서 막혔습니다.'},
  '1:p02':{depth:'D3',skill:'시대·정책 연결',message:'조선 태형령이라는 단서를 1910년대 무단 통치와 헌병 경찰제로 연결하는 단계에서 막혔습니다.'},
  '1:p04':{depth:'D3',skill:'같은 시기 연결',message:'헌병 경찰 통치와 토지 조사 사업이 같은 1910년대에 놓인다는 시간 연결에서 막혔습니다.'},
  '1:p06':{depth:'D3',skill:'공통 특징 연결',message:'허가제라는 통제 방식과 한국 자원 장악이라는 목적·결과를 함께 연결하는 단계에서 막혔습니다.'},
  '1:p07':{depth:'D3',skill:'원인·결과 연결',message:'3·1 운동의 충격이 일제의 문화 정치 표방으로 이어진 인과 관계에서 막혔습니다.'},
  '1:p10b':{depth:'D3',skill:'시대 구별',message:'1910년대 헌병 경찰·태형과 1930년대 후반 황국 신민화 정책을 시대별로 구별하는 단계에서 막혔습니다.'},
  '1:p11':{depth:'D3',skill:'기준 시점 전후 연결',message:'1938년 국가 총동원법을 기준으로 정책이 이전인지 이후인지 시간축에 배치하는 단계에서 막혔습니다.'},
  '2:p06':{depth:'D3',skill:'전개·인과 연결',message:'비폭력 평화 시위가 일제의 폭력 탄압 뒤 일부 지역에서 격화되는 전개를 연결하는 단계에서 막혔습니다.'},
  '2:p07':{depth:'D3',skill:'사상·운동 연결',message:'민족 자결주의라는 국제적 흐름을 3·1 운동의 배경으로 연결하는 단계에서 막혔습니다.'},
  '2:p09':{depth:'D3',skill:'시대·순서 연결',message:'2·8 독립 선언을 3·1 운동 직전의 시간축에 놓는 단계에서 막혔습니다.'},
  '2:p10':{depth:'D4',skill:'유사 임시 정부 구별',message:'연해주·상하이·국내의 임시 정부와 통합 기준을 서로 구별하는 단계에서 막혔습니다.'},
  '2:p11':{depth:'D3',skill:'회의·결과 연결',message:'국민 대표 회의에서 창조파와 개조파가 대립하여 회의가 결렬된 흐름을 연결하는 단계에서 막혔습니다.'},
  '2:p12':{depth:'D4',skill:'조직·활동 구별',message:'대한민국 임시 정부의 행정·통신 조직과 의열단의 직접 행동을 서로 구별하는 단계에서 막혔습니다.'},
  '2:p13':{depth:'D4',skill:'기관·지역 구별',message:'임시 정부 기관과 국외 독립운동 지역의 조직을 서로 구별하는 단계에서 막혔습니다.'},
  '2:p15':{depth:'D4',skill:'지역·단체 구별',message:'서간도·북간도·연해주의 독립운동 단체와 학교를 지역별로 구별하는 단계에서 막혔습니다.'},
  '2:p16':{depth:'D3',skill:'전개·결과 연결',message:'3·1 운동의 전 계층 참여와 일제의 폭력 탄압 사례를 하나의 전개로 연결하는 단계에서 막혔습니다.'},
  '2:p17':{depth:'D3',skill:'주권·정부 연결',message:'대동단결 선언의 국민 주권 주장을 임시 정부 수립 논리와 연결하는 단계에서 막혔습니다.'},
  '2:p18':{depth:'D3',skill:'사건·체제 변화 연결',message:'국민 대표 회의 결렬 이후 이승만 탄핵과 국무령제로 이어지는 체제 변화를 연결하는 단계에서 막혔습니다.'},
  '2:p19':{depth:'D3',skill:'원인·결과 연결',message:'3·1 운동 이후 일제가 문화 정치를 표방한 인과 관계를 연결하는 단계에서 막혔습니다.'},
  '4:p02':{depth:'D2',skill:'핵심 개념 뜻',message:'농촌 진흥 운동이라는 정책 명칭과 핵심 성격을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p05':{depth:'D3',skill:'변화·관계 연결',message:'사회주의 사상 → 혁명적 농민 조합 → 반제국주의 항일 투쟁으로 농민 운동의 성격이 바뀌는 관계에서 막혔습니다.'},
  '4:p08':{depth:'D2',skill:'핵심 개념 뜻',message:'여성계 민족 협동 전선인 근우회의 명칭을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p09':{depth:'D2',skill:'핵심 개념·활동',message:'근우회가 무엇을 했고 무엇을 목표로 했는지 핵심 활동을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p11':{depth:'D2',skill:'핵심 개념·활동',message:'조선어 학회의 주요 활동을 정확히 회상하는 단계에서 막혔습니다.'},
  '4:p12':{depth:'D3',skill:'관계 연결',message:'보편적 발전 법칙이라는 주장과 식민 사관의 정체성론 비판을 서로 연결하는 단계에서 막혔습니다.'},
  '4:p13':{depth:'D2',skill:'핵심 개념 뜻',message:'식민 사관의 세 논리인 정체성론·타율성론·당파성론의 명칭을 정확히 회상하는 단계에서 막혔습니다.'},
  '5:p02':{depth:'D3',skill:'배경·공통 관계 연결',message:'만주 사변 이후 중국의 반일 감정과 한·중 연합 작전의 공통 배경을 연결하는 단계에서 막혔습니다.'},
  '5:p07':{depth:'D3',skill:'시대·순서 연결',message:'1937년 중일 전쟁과 1938년 조선 의용대 조직을 시간 순서로 연결하는 단계에서 막혔습니다.'},
  '5:p09':{depth:'D3',skill:'시기·활동 연결',message:'김구의 한인 애국단 활동과 임시 정부의 충칭 정착을 시간축에 배치하는 단계에서 막혔습니다.'},
  '5:p12':{depth:'D3',skill:'작전 과정 연결',message:'OSS 훈련에서 국내 진공 작전 준비, 일본 항복으로 인한 미실행까지의 과정을 연결하는 단계에서 막혔습니다.'},
  '6:p02':{depth:'D2',skill:'핵심 개념 뜻',message:'조선 총독의 임명 조건과 통치 권한이라는 핵심 사실을 정확히 회상하는 단계에서 막혔습니다.'},
  '6:p03':{depth:'D3',skill:'시대·정책 연결',message:'헌병 경찰제와 토지 조사 사업을 같은 1910년대 정책으로 연결하는 단계에서 막혔습니다.'},
  '6:p04':{depth:'D3',skill:'원인·목적 연결',message:'3·1 운동 뒤 문화 정치 표방과 한국인 불만 무마라는 목적을 연결하는 단계에서 막혔습니다.'},
  '6:p05':{depth:'D2',skill:'정책 사례 회상',message:'황국 신민 서사와 창씨개명처럼 민족 말살 정책의 구체적 사례를 정확히 회상하는 단계에서 막혔습니다.'},
  '6:p06':{depth:'D4',skill:'유사 경제 정책 구별',message:'1910년대 토지 조사 사업과 1920~1930년대 산미 증식 계획을 시기와 내용으로 구별하는 단계에서 막혔습니다.'},
  '6:p09':{depth:'D4',skill:'독립운동 노선 구별',message:'독립 의군부의 복벽주의와 대한 광복회의 공화주의를 서로 구별하는 단계에서 막혔습니다.'},
  '6:p10':{depth:'D4',skill:'1919년 운동 구별',message:'2·8 독립 선언·3·1 운동·5·4 운동을 지역과 순서로 구별하는 단계에서 막혔습니다.'},
  '6:p11':{depth:'D4',skill:'의거 단체 구별',message:'의열단과 한인 애국단의 인물·선언·의거를 서로 구별하는 단계에서 막혔습니다.'},
  '6:p12':{depth:'D3',skill:'시기·의거 연결',message:'한인 애국단 조직과 1932년 이봉창 의거를 시간축으로 연결하는 단계에서 막혔습니다.'},
  '6:p14':{depth:'D4',skill:'민족 협동 전선 구별',message:'정우회 선언과 신간회 결성을 민족 협동 전선의 흐름 속에서 구별하는 단계에서 막혔습니다.'},
  '6:p15':{depth:'D3',skill:'시대·순서 연결',message:'전투 이름 자체보다 봉오동 → 청산리 → 자유시 → 독립군 재편의 시대·순서 연결에서 막혔습니다.'},
  '6:p19':{depth:'D4',skill:'사회 운동 구별',message:'형평 운동과 근우회를 대상·목표에 따라 서로 구별하는 단계에서 막혔습니다.'},
  '6:p20':{depth:'D4',skill:'역사학자 구별',message:'박은식과 신채호의 공통된 민족주의 역사학과 각 저술을 구별하는 단계에서 막혔습니다.'},
  '6:p22':{depth:'D4',skill:'무장 조직·활동 구별',message:'동북 항일 연군·조국 광복회·보천보 전투의 관계와 역할을 구별하는 단계에서 막혔습니다.'},
  '6:p25':{depth:'D3',skill:'전쟁·선전 포고 연결',message:'1941년 아시아·태평양 전쟁 발발과 대한민국 임시 정부의 대일 선전 포고를 연결하는 단계에서 막혔습니다.'}
};
function auditDiag(p){return p&&AUDIT_DIAG[DAYNUM+':'+p.id]||null}
function applyDiagAudit(base,p){const a=auditDiag(p);if(!a)return base||{};return {...(base||{}),depth:a.depth,skill:a.skill,message:a.message,immediate:a.message,concept:a.message}}
try{if(typeof diagnosisFor==='function'){const _diagnosisFor=diagnosisFor;diagnosisFor=function(p,a){return applyDiagAudit(_diagnosisFor(p,a),p)}}}catch(e){}
try{if(typeof metacogFor==='function'){const _metacogFor=metacogFor;metacogFor=function(p,a){return applyDiagAudit(_metacogFor(p,a),p)}}}catch(e){}
const legacyDay6Label=(v)=>DAYNUM===6&&v==='민족 유일당과 학생 운동'?'실력 양성·민족 협동·학생 운동':DAYNUM===6&&v==='의열 투쟁'?'비밀 결사와 의열 투쟁':v;
function rt(p){
  const base=H2ConceptDepth.route(DAYNUM,p.id);if(!base)return base;const r={...base};
  if(DAYNUM===6){r.conceptTitle=legacyDay6Label(r.conceptTitle);r.conceptOptions=(r.conceptOptions||[]).map(legacyDay6Label);r.path=(r.path||[]).map(legacyDay6Label)}
  const a=auditDiag(p);if(a){r.metacogDepth=a.depth;r.skill=a.skill}
  if(DAYNUM===1&&p.id==='p01')r.memory={...(r.memory||{}),keyword:'제1차 세계 대전 시간축',prompt:'전쟁 시작·러시아 혁명·전쟁 종료를 순서대로 쓰세요.',answer:'1914 전쟁 시작 → 1917 러시아 혁명 → 1918 전쟁 종료',accepted:['1914 1917 러시아 혁명 1918','1914→1917 러시아 혁명→1918'],hint:'1914 → 1917 러시아 혁명 → 1918',link:'전쟁 범위 안에 사건을 놓기'};
  if(DAYNUM===1&&p.id==='p02')r.memory={...(r.memory||{}),keyword:'조선 태형령과 무단 통치',prompt:'조선 태형령을 통치 시기와 경찰 제도에 연결해 쓰세요.',answer:'조선 태형령 → 1910년대 무단 통치 → 헌병 경찰',accepted:['조선 태형령 1910년대 무단 통치 헌병 경찰','조선태형령→1910년대무단통치→헌병경찰'],hint:'조선 태형령 → 1910년대 ○○ 통치 → 헌병 경찰',link:'법령 단서 → 시대 → 통치 제도'};
  if(DAYNUM===1&&p.id==='p04')r.memory={...(r.memory||{}),keyword:'헌병 경찰과 토지 조사 사업의 시기',prompt:'헌병 경찰 통치와 같은 시기의 경제 정책을 시간축으로 쓰세요.',answer:'1910년대 헌병 경찰 통치 ↔ 1910~1918 토지 조사 사업',accepted:['1910년대 헌병 경찰 통치 1910 1918 토지 조사 사업','헌병 경찰 토지 조사 사업 1910년대'],hint:'헌병 경찰 = 1910년대 / 토지 조사 = 1910~1918',link:'두 정책의 시간 범위 겹침'};
  if(DAYNUM===1&&p.id==='p06')r.memory={...(r.memory||{}),keyword:'허가제와 자원 장악의 연결',prompt:'1910년대 경제 법령의 방식과 결과를 흐름으로 쓰세요.',answer:'허가제 → 한국인 경제 활동 통제 → 일본 자본의 자원 장악',accepted:['허가제 한국인 경제 활동 통제 일본 자본 자원 장악','허가제→경제 활동 통제→자원 장악'],hint:'허가제 → 경제 활동 ○○ → 자원 장악',link:'통제 방식 → 영향 → 식민 경제 목적'};
  if(DAYNUM===1&&p.id==='p07')r.memory={...(r.memory||{}),keyword:'3·1 운동과 문화 정치',prompt:'문화 정치가 표방된 직접적 배경을 인과로 쓰세요.',answer:'3·1 운동 → 문화 정치 표방',accepted:['3·1 운동 문화 정치','3.1운동→문화정치','3·1 운동 이후 문화 정치를 표방'],hint:'3·1 운동 → 문화 ○○',link:'대규모 저항 → 통치 방식의 표면적 변화'};
  if(DAYNUM===1&&p.id==='p10b')r.memory={...(r.memory||{}),keyword:'민족 말살 통치의 시간축',prompt:'태형·치안 유지법·황국 신민 서사를 시대순으로 쓰세요.',answer:'1910년대 조선 태형령 → 1925 치안 유지법 → 1937 이후 황국 신민 서사',accepted:['1910년대 조선 태형령 1925 치안 유지법 1937 이후 황국 신민 서사','조선 태형령→치안 유지법→황국 신민 서사'],hint:'1910년대 태형 → 1925 치안 유지법 → 1937 이후 황국 신민 서사',link:'시대가 다른 장면을 구별하기'};
  if(DAYNUM===1&&p.id==='p11')r.memory={...(r.memory||{}),keyword:'국가 총동원법 전후 시간축',prompt:'신문지법·국가 총동원법·징병제를 시대순으로 쓰세요.',answer:'1907 신문지법 → 1938 국가 총동원법 → 1944 징병제',accepted:['1907 신문지법 1938 국가 총동원법 1944 징병제','신문지법→국가 총동원법→징병제'],hint:'1907 → 1938 → 1944',link:'1938년을 기준으로 이전/이후 판별'};
  if(DAYNUM===2&&p.id==='p06')r.memory={...(r.memory||{}),keyword:'3·1 운동 전개 변화',prompt:'3·1 운동의 초기 방식과 탄압 뒤 변화를 순서대로 쓰세요.',answer:'비폭력 평화 시위 → 일제의 폭력 탄압 → 일부 지역 시위 격화',accepted:['비폭력 평화 시위 일제의 폭력 탄압 일부 지역 시위 격화','비폭력 시위→폭력 탄압→시위 격화','평화 시위→일제 탄압→무력 저항'],hint:'비폭력 평화 시위 → 일제의 ○○ 탄압 → 시위 격화',link:'초기 방식 → 탄압 → 일부 지역의 변화'};
  if(DAYNUM===2&&p.id==='p07')r.memory={...(r.memory||{}),keyword:'민족 자결주의와 3·1 운동',prompt:'윌슨의 민족 자결주의가 어떤 운동의 국제적 배경이 되었는지 연결해 쓰세요.',answer:'윌슨의 민족 자결주의 → 3·1 운동의 국제적 배경',accepted:['윌슨 민족 자결주의 3·1 운동 국제적 배경','민족 자결주의→3·1 운동','민족자결주의→3.1운동'],hint:'민족 자결주의 → 3·1 ○○',link:'국제 정세 → 국내 독립운동'};
  if(DAYNUM===2&&p.id==='p09')r.memory={...(r.memory||{}),keyword:'2·8 독립 선언과 3·1 운동',prompt:'1919년 2월과 3월의 독립운동을 순서대로 쓰세요.',answer:'1919년 2·8 독립 선언 → 1919년 3·1 운동',accepted:['1919 2·8 독립 선언 3·1 운동','2·8 독립 선언→3·1 운동','2.8독립선언→3.1운동'],hint:'2월 8일 선언 → 3월 1일 ○○',link:'도쿄 유학생 선언 → 국내 만세 운동'};
  if(DAYNUM===2&&p.id==='p10')r.memory={...(r.memory||{}),keyword:'임시 정부 통합 구별',prompt:'세 임시 정부의 지역과 통합 기준을 구별해 쓰세요.',answer:'연해주 대한 국민 의회 / 상하이 대한민국 임시 정부 / 국내 한성 정부 → 한성 정부 법통 계승',accepted:['연해주 대한 국민 의회 상하이 대한민국 임시 정부 국내 한성 정부 한성 정부 법통 계승','대한 국민 의회 연해주 임시 정부 상하이 한성 정부 국내 한성 정부 법통 계승'],hint:'연해주 대한 국민 의회 / 상하이 임시 정부 / 국내 한성 정부',link:'지역 구별 → 한성 정부 법통 계승'};
  if(DAYNUM===2&&p.id==='p11')r.memory={...(r.memory||{}),keyword:'국민 대표 회의의 전개',prompt:'국민 대표 회의의 대립과 결과를 흐름으로 쓰세요.',answer:'1923 국민 대표 회의 → 창조파·개조파 대립 → 결렬',accepted:['1923 국민 대표 회의 창조파 개조파 대립 결렬','국민 대표 회의→창조파 개조파 대립→결렬'],hint:'국민 대표 회의 → 창조파·○○파 → 결렬',link:'회의 → 노선 대립 → 결과'};
  if(DAYNUM===2&&p.id==='p12')r.memory={...(r.memory||{}),keyword:'임시 정부와 의열단 구별',prompt:'임시 정부의 국내 조직과 의열단의 활동을 구별해 쓰세요.',answer:'대한민국 임시 정부 → 연통제·교통국 / 의열단 → 의열 투쟁·조선 혁명 선언',accepted:['대한민국 임시 정부 연통제 교통국 의열단 의열 투쟁 조선 혁명 선언','임시 정부 연통제 교통국 / 의열단 조선 혁명 선언'],hint:'임시 정부 = 연통제·교통국 / 의열단 = 조선 ○○ 선언',link:'행정·통신 조직과 직접 행동 단체 구별'};
  if(DAYNUM===2&&p.id==='p13')r.memory={...(r.memory||{}),keyword:'기관과 지역 조직 구별',prompt:'임시 정부 기관과 국외 지역 조직을 구별해 쓰세요.',answer:'임시 정부 → 군무부·구미 위원부 / 북간도 → 간민회 / 연해주 → 대한 광복군 정부',accepted:['임시 정부 군무부 구미 위원부 북간도 간민회 연해주 대한 광복군 정부','군무부 구미위원부 / 간민회 북간도 / 대한광복군정부 연해주'],hint:'임시 정부 = 군무부·구미 위원부 / 북간도 = 간민회',link:'중앙 기관과 지역 독립운동 조직 구별'};
  if(DAYNUM===2&&p.id==='p15')r.memory={...(r.memory||{}),keyword:'국외 독립운동 기지 구별',prompt:'서간도와 북간도의 대표 자치·교육 조직을 구별해 쓰세요.',answer:'서간도 → 경학사·신흥 강습소 / 북간도 → 간민회·명동 학교',accepted:['서간도 경학사 신흥 강습소 북간도 간민회 명동 학교','경학사 신흥강습소 서간도 / 간민회 명동학교 북간도'],hint:'서간도 = 경학사·신흥 강습소 / 북간도 = 간민회·명동 학교',link:'지역 ↔ 단체·학교를 짝으로 구별'};
  if(DAYNUM===2&&p.id==='p16')r.memory={...(r.memory||{}),keyword:'3·1 운동 참여와 탄압',prompt:'3·1 운동의 참여 특징과 일제의 탄압 사례를 연결해 쓰세요.',answer:'학생·여성·농민·노동자 등 전 계층 참여 → 전국적 확산 → 제암리 학살 등 폭력 탄압',accepted:['전 계층 참여 전국적 확산 제암리 학살 폭력 탄압','학생 여성 농민 노동자 전 계층 참여 제암리 학살'],hint:'전 ○○ 참여 → 전국 확산 → 제암리 학살',link:'참여 확대 → 전국화 → 폭력 탄압'};
  if(DAYNUM===2&&p.id==='p17')r.memory={...(r.memory||{}),keyword:'대동단결 선언의 논리',prompt:'대동단결 선언의 주권 변화와 정부 수립 주장을 연결해 쓰세요.',answer:'1917 대동단결 선언 → 황제의 주권을 국민이 계승 → 임시 정부 수립 주장',accepted:['1917 대동단결 선언 국민 주권 임시 정부 수립','대동단결 선언→국민 주권→임시 정부 수립'],hint:'대동단결 선언 → 국민 ○○ → 임시 정부',link:'황제에서 국민으로 주권 이동'};
  if(DAYNUM===2&&p.id==='p18')r.memory={...(r.memory||{}),keyword:'임시 정부 체제 변화',prompt:'국민 대표 회의 뒤 임시 정부 체제 변화를 순서대로 쓰세요.',answer:'국민 대표 회의 결렬 → 이승만 탄핵 → 국무령제',accepted:['국민 대표 회의 결렬 이승만 탄핵 국무령제','국민대표회의→이승만 탄핵→국무령제'],hint:'회의 결렬 → 이승만 ○○ → 국무령제',link:'위기 → 지도자 교체 → 헌법·체제 개편'};
  if(DAYNUM===2&&p.id==='p19')r.memory={...(r.memory||{}),keyword:'3·1 운동과 문화 정치',prompt:'3·1 운동 뒤 일제의 통치 방식 변화를 인과로 쓰세요.',answer:'3·1 운동 → 문화 정치 표방',accepted:['3·1 운동 문화 정치','3.1운동→문화정치','3·1 운동 이후 문화 정치 표방'],hint:'3·1 운동 → 문화 ○○',link:'대규모 저항 → 표면적 통치 방식 변화'};
  if(DAYNUM===4&&p.id==='p05')r.memory={...(r.memory||{}),keyword:'1930년대 농민 운동의 변화',prompt:'1930년대 농민 운동의 성격 변화를 흐름으로 연결해 쓰세요.',answer:'사회주의 사상 → 혁명적 농민 조합 → 반제국주의 항일 투쟁',accepted:['사회주의 사상 혁명적 농민 조합 반제국주의 항일 투쟁','사회주의→혁명적 농민 조합→반제국주의 항일 투쟁','사회주의 사상의 영향으로 혁명적 농민 조합을 조직하고 반제국주의 항일 투쟁으로 발전하였다'],hint:'사회주의 → 혁명적 농민 조합 → 반제국주의 항일 투쟁',link:'사상 영향 → 조직 변화 → 투쟁 성격 변화'};
  if(DAYNUM===4&&p.id==='p12')r.memory={...(r.memory||{}),keyword:'보편적 발전 법칙과 정체성론 비판',prompt:'백남운의 주장이 어떤 식민 사관을 반박하는지 연결해 쓰세요.',answer:'보편적 발전 법칙 → 정체성론 비판',accepted:['보편적 발전 법칙 정체성론 비판','보편적 발전 법칙으로 정체성론을 비판','한국사도 보편적 발전 법칙에 따라 발전하므로 정체성론을 비판하였다','한국사도 세계사적 발전 법칙에 따라 발전하므로 정체성론을 비판하였다'],hint:'보편적 발전 법칙 → ○○성론 비판',link:'한국사도 스스로 발전함 → 정체되어 있었다는 주장 반박'};
  if(DAYNUM===5&&p.id==='p02')r.memory={...(r.memory||{}),keyword:'만주 사변과 한·중 연합 작전',prompt:'한·중 연합 작전이 활발해진 배경을 흐름으로 쓰세요.',answer:'1931 만주 사변 → 중국의 반일 감정 고조 → 한·중 연합 작전',accepted:['1931 만주 사변 중국 반일 감정 한중 연합 작전','만주 사변→반일 감정→한중 연합 작전'],hint:'만주 사변 → 반일 ○○ → 한·중 연합 작전',link:'일본의 만주 침략 → 공동의 적 → 연합'};
  if(DAYNUM===5&&p.id==='p07')r.memory={...(r.memory||{}),keyword:'중일 전쟁과 조선 의용대',prompt:'중일 전쟁과 조선 의용대 조직을 시간 순서로 쓰세요.',answer:'1937 중일 전쟁 → 1938 조선 의용대 조직',accepted:['1937 중일 전쟁 1938 조선 의용대','중일 전쟁→조선 의용대','1937→1938 조선 의용대'],hint:'1937 중일 전쟁 → 1938 조선 ○○대',link:'전쟁 발발 → 중국 관내 한인 무장 부대 조직'};
  if(DAYNUM===5&&p.id==='p09')r.memory={...(r.memory||{}),keyword:'임시 정부 이동 시간축',prompt:'김구의 한인 애국단과 임시 정부의 충칭 정착을 시간 순서로 쓰세요.',answer:'1931 상하이 한인 애국단 → 1940 충칭 대한민국 임시 정부 정착',accepted:['1931 한인 애국단 1940 충칭 대한민국 임시 정부','한인 애국단→충칭 임시 정부','1931 상하이→1940 충칭'],hint:'1931 상하이 한인 애국단 → 1940 ○○ 정착',link:'상하이 시기 의거 활동 → 충칭 시기'};
  if(DAYNUM===5&&p.id==='p12')r.memory={...(r.memory||{}),keyword:'국내 진공 작전 준비 과정',prompt:'한국광복군의 국내 진공 작전 준비와 결과를 흐름으로 쓰세요.',answer:'OSS 특수 훈련 → 국내 정진군 편성·국내 진공 작전 준비 → 일본 항복으로 실행 못함',accepted:['OSS 특수 훈련 국내 정진군 국내 진공 작전 일본 항복 실행 못함','OSS 훈련→국내 진공 작전 준비→일본 항복으로 무산','OSS→국내 정진군→국내 진공 작전→일본 항복'],hint:'OSS 훈련 → 국내 ○○군 → 국내 진공 작전 → 일본 항복',link:'훈련 → 부대 편성 → 작전 준비 → 미실행'};
  if(DAYNUM===6&&p.id==='p03')r.memory={...(r.memory||{}),keyword:'헌병 경찰제와 토지 조사 사업',prompt:'1910년대 통치 제도와 경제 정책을 같은 시기로 연결해 쓰세요.',answer:'1910년대 헌병 경찰제 ↔ 토지 조사 사업',accepted:['1910년대 헌병 경찰제 토지 조사 사업','헌병 경찰제→1910년대→토지 조사 사업'],hint:'헌병 경찰제 = 1910년대 = 토지 ○○ 사업',link:'통치 제도와 경제 정책의 시기 겹침'};
  if(DAYNUM===6&&p.id==='p04')r.memory={...(r.memory||{}),keyword:'문화 정치의 배경과 목적',prompt:'문화 정치가 표방된 배경과 목적을 연결해 쓰세요.',answer:'3·1 운동 → 문화 정치 표방 → 한국인의 불만 무마',accepted:['3·1 운동 문화 정치 불만 무마','3.1운동→문화정치→불만무마'],hint:'3·1 운동 → 문화 정치 → 불만 ○○',link:'저항 → 표면적 완화 → 통치 안정'};
  if(DAYNUM===6&&p.id==='p06')r.memory={...(r.memory||{}),keyword:'경제 수탈 정책 구별',prompt:'토지 조사 사업과 산미 증식 계획을 시기로 구별해 쓰세요.',answer:'1910~1918 토지 조사 사업 / 1920~1934 산미 증식 계획',accepted:['1910 1918 토지 조사 사업 1920 1934 산미 증식 계획','1910년대 토지 조사 사업 / 1920년대 산미 증식 계획'],hint:'1910년대 = 토지 조사 / 1920~1934 = 산미 ○○ 계획',link:'토지 소유 정리·수탈과 쌀 증산·반출 정책 구별'};
  if(DAYNUM===6&&p.id==='p08')r.memory={...(r.memory||{}),keyword:'국민 대표 회의 노선 대립',prompt:'국민 대표 회의의 두 세력 주장과 결과를 연결해 쓰세요.',answer:'창조파 → 임시 정부 해산·새 정부 수립 / 개조파 → 임시 정부 개편 → 회의 결렬',accepted:['창조파 임시 정부 해산 새 정부 개조파 임시 정부 개편 회의 결렬','창조파→새 정부 / 개조파→임시 정부 개편→결렬'],hint:'창조파 = 새 정부 / 개조파 = 기존 정부 ○○',link:'노선 구별 → 대립 → 결렬'};
  if(DAYNUM===6&&p.id==='p09')r.memory={...(r.memory||{}),keyword:'독립 의군부와 대한 광복회 구별',prompt:'두 비밀 결사의 정치 지향을 구별해 쓰세요.',answer:'독립 의군부 → 복벽주의 / 대한 광복회 → 공화주의',accepted:['독립 의군부 복벽주의 대한 광복회 공화주의','독립의군부→복벽주의 / 대한광복회→공화주의'],hint:'독립 의군부 = 복벽 / 대한 광복회 = 공화',link:'황제 복원과 공화 국가 지향 구별'};
  if(DAYNUM===6&&p.id==='p10')r.memory={...(r.memory||{}),keyword:'1919년 민족 운동 순서',prompt:'2·8 독립 선언·3·1 운동·5·4 운동을 순서와 지역으로 쓰세요.',answer:'2·8 독립 선언(일본 유학생) → 3·1 운동(한국) → 5·4 운동(중국)',accepted:['2·8 독립 선언 일본 3·1 운동 한국 5·4 운동 중국','2.8독립선언→3.1운동→5.4운동'],hint:'2월 일본 → 3월 한국 → 5월 중국',link:'1919년 동아시아 민족 운동의 시간축'};
  if(DAYNUM===6&&p.id==='p11')r.memory={...(r.memory||{}),keyword:'의열단과 한인 애국단 구별',prompt:'의열단과 한인 애국단의 대표 연결어를 구별해 쓰세요.',answer:'의열단 → 신채호·조선 혁명 선언 / 한인 애국단 → 김구·이봉창·윤봉길',accepted:['의열단 신채호 조선 혁명 선언 한인 애국단 김구 이봉창 윤봉길','의열단→조선 혁명 선언 / 한인 애국단→이봉창 윤봉길'],hint:'의열단 = 조선 혁명 선언 / 한인 애국단 = 이봉창·윤봉길',link:'단체 ↔ 인물·활동을 묶어 구별'};
  if(DAYNUM===6&&p.id==='p12')r.memory={...(r.memory||{}),keyword:'한인 애국단과 이봉창 의거',prompt:'한인 애국단 조직과 이봉창 의거를 시간 순서로 쓰세요.',answer:'1931 김구가 한인 애국단 조직 → 1932 이봉창 의거',accepted:['1931 한인 애국단 1932 이봉창 의거','한인 애국단→이봉창 의거'],hint:'1931 한인 애국단 → 1932 이봉창 ○○',link:'단체 조직 → 이듬해 의거'};
  if(DAYNUM===6&&p.id==='p14')r.memory={...(r.memory||{}),keyword:'정우회 선언과 신간회',prompt:'민족 협동 전선이 신간회 결성으로 이어지는 흐름을 쓰세요.',answer:'1926 정우회 선언 → 민족 협동 전선 촉구 → 1927 신간회 결성',accepted:['1926 정우회 선언 민족 협동 전선 1927 신간회','정우회 선언→민족 협동 전선→신간회'],hint:'정우회 선언 → 민족 ○○ 전선 → 신간회',link:'선언 → 좌우 협력 → 단체 결성'};
  if(DAYNUM===6&&p.id==='p15'){
    r.path=[...(r.path||[]).slice(0,4),'봉오동 전투 → 청산리 대첩 → 자유시 참변 → 독립군 재편'];
    r.memory={...(r.memory||{}),keyword:'독립군 전투·이동 순서',prompt:'봉오동 전투부터 독립군 재편까지의 흐름을 순서대로 써보세요.',answer:'봉오동 전투 → 청산리 대첩 → 자유시 참변 → 독립군 재편',accepted:['봉오동 전투 청산리 대첩 자유시 참변 독립군 재편','봉오동 청산리 자유시 독립군 재편','봉오동→청산리→자유시→독립군 재편'],hint:'봉오동 → 청산리 → 자유시 → 독립군 재편',link:'1920년 6월 → 1920년 10월 → 1921년 → 이후 재편'};
  }
  if(DAYNUM===6&&p.id==='p16')r.memory={...(r.memory||{}),keyword:'12월 테제와 신간회 해소',prompt:'12월 테제가 신간회 해소론으로 이어진 흐름을 쓰세요.',answer:'1928 12월 테제 → 사회주의 세력의 신간회 해소론 → 1931 신간회 해소',accepted:['1928 12월 테제 신간회 해소론 1931 신간회 해소','12월 테제→신간회 해소론→신간회 해소'],hint:'12월 테제 → 신간회 ○○론 → 1931 해소',link:'사회주의 운동 방침 변화 → 민족 협동 전선 이탈'};
  if(DAYNUM===6&&p.id==='p19')r.memory={...(r.memory||{}),keyword:'사회 운동 대상 구별',prompt:'형평 운동과 근우회를 대상과 목표로 구별해 쓰세요.',answer:'형평 운동 → 백정 차별 철폐 / 근우회 → 여성 권리 향상·민족 운동',accepted:['형평 운동 백정 차별 철폐 근우회 여성 권리 향상 민족 운동','형평운동→백정 / 근우회→여성'],hint:'형평 운동 = 백정 / 근우회 = 여성',link:'운동 이름보다 대상·목표로 구별'};
  if(DAYNUM===6&&p.id==='p20')r.memory={...(r.memory||{}),keyword:'박은식과 신채호 구별',prompt:'두 민족주의 역사학자의 대표 저술을 구별해 쓰세요.',answer:'박은식 → 한국통사·한국독립운동지혈사 / 신채호 → 조선상고사·조선사연구초',accepted:['박은식 한국통사 한국독립운동지혈사 신채호 조선상고사 조선사연구초','박은식→한국통사 / 신채호→조선상고사'],hint:'박은식 = 한국통사 / 신채호 = 조선상고사',link:'공통점은 민족주의 역사학, 저술은 구별'};
  if(DAYNUM===6&&p.id==='p22')r.memory={...(r.memory||{}),keyword:'동북 항일 연군의 전개',prompt:'동북 인민 혁명군부터 보천보 전투까지의 연결을 쓰세요.',answer:'동북 인민 혁명군 → 1936 동북 항일 연군 → 조국 광복회 연계 → 1937 보천보 전투',accepted:['동북 인민 혁명군 1936 동북 항일 연군 조국 광복회 1937 보천보 전투','동북 인민 혁명군→동북 항일 연군→조국 광복회→보천보 전투'],hint:'동북 인민 혁명군 → 동북 항일 연군 → 조국 광복회 → 보천보',link:'조직 개편 → 민족 연합 → 국내 진입 전투'};
  if(DAYNUM===6&&p.id==='p24')r.memory={...(r.memory||{}),keyword:'국내 진공 작전과 결과',prompt:'국내 진공 작전의 준비와 실행되지 못한 이유를 연결해 쓰세요.',answer:'한국광복군·OSS 국내 진공 작전 준비 → 일본 항복 → 실행 전에 광복',accepted:['한국광복군 OSS 국내 진공 작전 일본 항복 실행 전에 광복','OSS 국내 진공 작전→일본 항복→미실행'],hint:'OSS와 작전 준비 → 일본 ○○ → 실행 못함',link:'작전 준비와 국제 정세의 결과 연결'};
  if(DAYNUM===6&&p.id==='p25')r.memory={...(r.memory||{}),keyword:'1941년 전쟁과 대일 선전 포고',prompt:'1941년 국제 정세와 임시 정부의 행동을 연결해 쓰세요.',answer:'1941 아시아·태평양 전쟁 발발 → 대한민국 임시 정부의 대일 선전 포고',accepted:['1941 아시아 태평양 전쟁 대한민국 임시 정부 대일 선전 포고','태평양 전쟁→대일 선전 포고'],hint:'1941 전쟁 발발 → 임시 정부 대일 ○○ 포고',link:'전쟁 확대 → 연합국과 함께 대일전 참여 선언'};
  return r;
}
function resetDepth(){runtime._depth=null}
function initDepth(p){if(runtime._depth)return runtime._depth;const r=rt(p);runtime._depth={phase:'concept-check',failed:[],baseLevel:null,msg:'',startedAt:Date.now(),misses:0,actions:0,route:r,inputTry:0,showAnswer:false};return runtime._depth}
function levelIndex(id){return {unit:0,root:1,branch:2,concept:3,keyword:4}[id]??0}
function activeLevel(s){if(s.phase.includes('concept'))return 'concept';if(s.phase.includes('branch'))return 'branch';if(s.phase.includes('root'))return 'root';if(s.phase.includes('unit'))return 'unit';if(s.phase==='keyword')return 'keyword';return 'concept'}
function pathHtml(s){const labels=[['unit','가장 큰 지도'],['root','오늘 범위'],['branch','큰 가지'],['concept','세부 개념'],['keyword','핵심어']],cur=activeLevel(s);return `<div class="depth-path" aria-label="개념 복구 깊이">${labels.map(([id,l],i)=>`<span class="${id===cur?'on':''} ${s.failed.includes(id)?'fail':''}">${i+1}. ${l}</span>`).join('')}</div>`}
function choices(options,answer){return `<div class="depth-choice-grid">${(options||[]).map((x,i)=>`<button class="depth-choice" data-depth-choice="${i}" data-depth-answer="${esc(answer)}">${esc(x)}</button>`).join('')}</div>`}
function promptFor(s,r){if(s.phase==='concept-check')return ['이 문제와 가장 가까운 개념은 무엇인가요?','가까운 개념부터 확인합니다.',choices(r.conceptOptions,r.conceptTitle)];if(s.phase==='branch-check')return ['한 단계 위 큰 가지는?','세부 개념이 흔들리면 바로 위 큰 가지를 확인합니다.',choices(r.branchOptions,r.branchLabel)];if(s.phase==='root-check')return ['이 문제의 오늘 범위는?','큰 가지도 흔들리면 오늘 범위까지 올라갑니다.',choices(r.rootOptions,r.rootLabel)];if(s.phase==='unit-anchor')return ['가장 큰 지도부터 다시','여기부터는 알고 있다고 가정하지 않습니다.',`<div class="depth-anchor"><b>${esc(r.unitLabel)}</b><p>큰 지도 → 오늘 범위 → 큰 가지 → 세부 개념 순서로 다시 내려갑니다.</p></div><button class="primary" id="depthAnchorNext">여기서부터 다시 연결</button>`];if(s.phase==='descend-root')return ['오늘 범위 다시 연결','큰 지도 안에서 오늘 범위를 고릅니다.',choices(r.rootOptions,r.rootLabel)];if(s.phase==='descend-branch')return ['큰 가지 다시 연결',`<b>${esc(r.rootLabel)}</b> 안에서 맞는 가지를 고릅니다.`,choices(r.branchOptions,r.branchLabel)];if(s.phase==='descend-concept')return ['세부 개념 다시 연결',`<b>${esc(r.branchLabel)}</b> 안에서 이 문제의 개념을 고릅니다.`,choices(r.conceptOptions,r.conceptTitle)];const m=r.memory;if(m)return ['마지막은 직접 써서 고정',esc(m.prompt),`<input id="depthInput" class="depth-input" autocomplete="off" spellcheck="false" placeholder="핵심어 입력"><button class="primary" id="depthSubmit" style="margin-top:12px">입력 확인</button>${m.link?`<div class="depth-note">연결 힌트 · ${esc(m.link)}</div>`:''}`];return ['마지막 핵심 연결','이 문제의 세부 개념 이름을 직접 입력하세요.',`<input id="depthInput" class="depth-input" autocomplete="off" spellcheck="false" placeholder="개념 이름 입력"><button class="primary" id="depthSubmit" style="margin-top:12px">입력 확인</button>`]}
function renderDepthRepair(p){const s=initDepth(p),r=s.route;if(!r)return renderAnchorRepair(p);const [title,sub,body]=promptFor(s,r),raw=(typeof diagnosisFor==='function'?diagnosisFor(p,runtime.answer):runtime.lastDiagnosis)||runtime.lastDiagnosis||{},diag=applyDiagAudit(raw,p),a=auditDiag(p);const depth=String(diag.depth||r.metacogDepth||'개념 연결');const message=String((a&&a.message)||diag.message||diag.immediate||'어디부터 연결이 끊겼는지 확인합니다.');return `<div class="depth-card"><div class="depth-kicker">오답을 정답으로 바꾸기 전에 · 어디부터 모르는지 먼저 찾기</div><div class="depth-diagnosis"><b>${esc(depth)}</b><span>${esc(message)}</span></div>${pathHtml(s)}<h2 class="depth-title">${title}</h2><p class="depth-sub">${sub} 모르면 한 단계 위로 올라가고, 아는 지점을 찾으면 다시 내려옵니다.</p>${body}<div class="depth-msg ${s.msg==='연결됨'?'ok':''}">${esc(s.msg==='연결됨'?'연결됨':s.msg||'')}</div></div>`}
function isSame(a,b){return normalize(a)===normalize(b)}
function nextAfterKnown(s,level){s.baseLevel=s.baseLevel||level;s.msg='연결됨';setTimeout(()=>{s.msg='';if(level==='concept')s.phase='keyword';else if(level==='branch')s.phase='descend-concept';else if(level==='root')s.phase='descend-branch';else s.phase='descend-root';render()},350)}
function descendNext(s,phase){s.msg='연결됨';setTimeout(()=>{s.msg='';s.phase=phase;render()},350)}
function wrongUp(s,level,next){if(!s.failed.includes(level))s.failed.push(level);s.misses++;s.msg='여기서 흔들렸어요. 한 단계 위에서 다시 찾습니다.';setTimeout(()=>{s.msg='';s.phase=next;render()},450)}
function completeDepth(p){const s=runtime._depth,r=s.route,a=auditDiag(p);const measured=(typeof metacogFor==='function'?(metacogFor(p,runtime.answer)||{}).depth:(runtime.lastDiagnosis&&runtime.lastDiagnosis.depth)||'')||'';const entry={id:'cd-'+uid(),day:DAYNUM,problemId:p.id,at:Date.now(),baseLevel:s.baseLevel||'concept',failedLevels:[...s.failed],misses:s.misses||0,actions:s.actions||0,durationMs:Math.max(0,Date.now()-s.startedAt),metacogDepth:a?a.depth:measured,path:r.path};state.conceptDepthLog=state.conceptDepthLog||[];state.conceptDepthLog.push(entry);saveState();try{remotePatch({conceptDepthLog:state.conceptDepthLog})}catch(e){}runtime.feedbackStep++;resetDepth();render()}
function bindDepth(){const p=currentProblem(),s=runtime._depth;if(!s)return;document.querySelectorAll('[data-depth-choice]').forEach(b=>b.onclick=()=>{const r=s.route,v=b.textContent.trim(),ans=b.dataset.depthAnswer;s.actions++;if(isSame(v,ans)){if(s.phase==='concept-check')nextAfterKnown(s,'concept');else if(s.phase==='branch-check')nextAfterKnown(s,'branch');else if(s.phase==='root-check')nextAfterKnown(s,'root');else if(s.phase==='descend-root')descendNext(s,'descend-branch');else if(s.phase==='descend-branch')descendNext(s,'descend-concept');else if(s.phase==='descend-concept')descendNext(s,'keyword')}else{if(s.phase==='concept-check')wrongUp(s,'concept','branch-check');else if(s.phase==='branch-check')wrongUp(s,'branch','root-check');else if(s.phase==='root-check'){if(!s.failed.includes('root'))s.failed.push('root');s.misses++;s.baseLevel='unit';s.phase='unit-anchor';s.msg='';render()}else{s.misses++;s.msg='위에서 잡은 연결을 보고 다시 고르세요.';render()}}});const an=document.getElementById('depthAnchorNext');if(an)an.onclick=()=>{s.actions++;s.phase='descend-root';render()};const inp=document.getElementById('depthInput'),sub=document.getElementById('depthSubmit');const submit=()=>{const r=s.route,m=r.memory,v=String(inp&&inp.value||'').trim();if(!v)return;s.actions++;const accepted=m?[m.answer,...(m.accepted||[])]:[r.conceptTitle];if(accepted.some(x=>isSame(x,v))){s.msg='연결됨';setTimeout(()=>completeDepth(p),350)}else{s.misses++;s.inputTry++;if(s.inputTry===1)s.msg='힌트: '+(m&&m.hint||String(accepted[0]||'').slice(0,1)+'…');else s.msg='정답을 한 번 보고, 바로 다시 직접 입력하세요: '+accepted[0];render()}};if(sub)sub.onclick=submit;if(inp){setTimeout(()=>inp.focus(),40);inp.onkeydown=e=>{if(e.key==='Enter')submit()}}}
const baseReset=resetRuntimeForQuestion;resetRuntimeForQuestion=function(){resetDepth();return baseReset()};
const baseSteps=explanationSteps;explanationSteps=function(p){const s=baseSteps(p).filter(x=>x!=='depth-ladder');const i=s.indexOf('metacog');s.splice(i>=0?i+1:1,0,'depth-ladder');return s};
const priorRender=renderExplanation;renderExplanation=function(p){const steps=explanationSteps(p),kind=steps[Math.min(runtime.feedbackStep,steps.length-1)];if(kind==='depth-ladder')return `<div class="learn-grid">${renderPath(p)}<section class="panel feedback-screen"><div class="repair-card">${repairProgress(runtime.feedbackStep,steps.length)}${renderDepthRepair(p)}</div></section></div>`;return priorRender(p)};
const baseBind=bind;bind=function(){baseBind();bindDepth()};
render();
})();
