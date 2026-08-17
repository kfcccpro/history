(function(g){
'use strict';
if(g.H2WeaknessProfile)return;
const S={1:'history2-day1-original-mastery-v2',2:'history2-day2-attention-mastery-v2',3:'history2-day3-terms-mastery-v1',4:'history2-day4-terms-mastery-v1',5:'history2-day5-terms-mastery-v1',6:'history2-day6-unit-review-v1'};
const U={1:'Ⅰ 일제 식민 통치와 민족 운동',2:'Ⅰ 일제 식민 통치와 민족 운동',3:'Ⅰ 일제 식민 통치와 민족 운동',4:'Ⅰ 일제 식민 통치와 민족 운동',5:'Ⅰ 일제 식민 통치와 민족 운동',6:'Ⅰ 일제 식민 통치와 민족 운동',7:'Ⅱ 대한민국의 발전',8:'Ⅱ 대한민국의 발전',9:'Ⅱ 대한민국의 발전',10:'Ⅱ 대한민국의 발전',11:'Ⅱ 대한민국의 발전',12:'Ⅲ 오늘날의 대한민국',13:'Ⅲ 오늘날의 대한민국',14:'Ⅲ 오늘날의 대한민국',15:'Ⅲ 오늘날의 대한민국',16:'단원별 TEST',17:'단원별 TEST',18:'단원별 TEST'};
function j(k){try{return JSON.parse(localStorage.getItem(k)||'null')}catch(_){return null}}
function add(map,k,w,meta){if(!k)return;const x=map[k]||(map[k]={score:0,count:0,days:{},examples:[]});x.score+=w;x.count++;if(meta.day)x.days[meta.day]=1;if(meta.example&&x.examples.length<4)x.examples.push(meta.example)}
function build(){const depth={},concept={},unit={},day={};for(let d=1;d<=6;d++){const s=j(S[d])||{};Object.values(s.wrongNotes||{}).forEach(w=>{const m=w&&w.metacog||{},n=Number(w&&w.wrongCount||1),meta={day:d,example:w&&w.title||m.problemTitle||''};add(unit,U[d],n,meta);add(depth,m.depth||m.metacogDepth||'미분류',n,meta);add(concept,m.conceptTitle||m.branchLabel||w&&w.title||'미분류',n,meta);add(day,'Day '+d,n,meta)});(s.conceptDepthLog||[]).forEach(e=>{const meta={day:d,example:e.problemTitle||e.conceptTitle||''};add(depth,e.depth||e.metacogDepth||'미분류',1,meta)})}
for(let d=7;d<=18;d++){const s=j('history2-fast-day-'+d)||{};(s.history||[]).forEach(e=>{if(e.correct!==false)return;const z=e.diagnosis||{},meta={day:d,example:e.concept||e.questionId||''};add(unit,U[d],1,meta);add(depth,z.depth||'미분류',1,meta);add(concept,e.concept||e.branch||'미분류',1,meta);add(day,'Day '+d,1,meta)});(s.repairLog||[]).forEach(e=>{if(e.correct!==false)return;const z=e.diagnosis||{},meta={day:d,example:e.concept||e.questionId||''};add(depth,z.depth||'미분류',0.5,meta)})}
function top(map,n){return Object.entries(map).map(([name,v])=>({name,...v,dayCount:Object.keys(v.days).length})).sort((a,b)=>b.score-a.score||b.count-a.count).slice(0,n)}
return{updatedAt:Date.now(),topDepth:top(depth,4),topConcept:top(concept,8),topUnit:top(unit,4),topDay:top(day,8),raw:{depth,concept,unit,day}}}
function get(){const p=build();try{localStorage.setItem('history2-weakness-profile-v1',JSON.stringify(p))}catch(_){}return p}
g.H2WeaknessProfile={get,build};
})(window);