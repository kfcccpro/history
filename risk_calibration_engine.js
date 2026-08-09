(function(g){
'use strict';
if(!g.H2Risk||!g.H2Policy)return;
const BASE_RISK_FOR=H2Risk.riskFor.bind(H2Risk);
const BASE_COMPLETE=H2Risk.completeMicro.bind(H2Risk);
const BASE_EVALUATE=H2Risk.evaluateAttempt.bind(H2Risk);
const BASE_PARENT=H2Risk.parentSnapshot.bind(H2Risk);
const BASE_CFG=H2Risk.CFG;
const CFG={
  globalThreshold:.68,
  minimumEvaluatedPerBranch:6,
  recentWindow:12,
  minimumThreshold:.64,
  maximumThreshold:.82,
  raiseStep:.04,
  lowerStep:.02,
  highFalsePositiveRate:.35,
  lowFalsePositiveRate:.15,
  minimumHitRateForLowering:.70,
  overPredictionGap:.12,
  minimumPositiveNetEquivalentForLowering:1.0,
  timePerActionMs:6000,
  dormancyMs:24*60*60*1000,
  consecutiveFalsePositives:2,
  negativeRecentWindow:3,
  minimumEvaluatedForNegativeAverage:6,
  negativeAverageNetEquivalent:0,
  maxLog:400
};
function uid(p='rc'){return p+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function ensureState(s){s=H2Risk.ensure(s||{});s.riskCalibrationLog=Array.isArray(s.riskCalibrationLog)?s.riskCalibrationLog:[];return s}
function read(day){return ensureState(H2Risk.read(Number(day)))}
function write(day,s){H2Risk.write(Number(day),ensureState(s))}
function branchDay(branch){const r=(g.H2ConceptDepth&&H2ConceptDepth.DB&&H2ConceptDepth.DB.problemCatalog||[]).find(x=>x.branchLabel===branch);return Number(r&&r.day||1)}
function allCalibration(){const out=[];for(let d=1;d<=6;d++){const s=read(d);for(const x of s.riskCalibrationLog||[])out.push({...x,day:Number(x.day||d)})}return out.sort((a,b)=>Number(a.at||0)-Number(b.at||0))}
function predictions(branch){return H2Risk.allField('riskPredictionLog').filter(x=>(!branch||x.branchLabel===branch)&&x.interventionApplied&&x.outcome).sort((a,b)=>Number(a.outcome?.at||a.at||0)-Number(b.outcome?.at||b.at||0))}
function microFor(pred){if(!pred)return null;return H2Risk.allField('proactiveMicrocheckLog').find(x=>x.predictionId===pred.id)||null}
function depthBurden(branch){const st=(H2Policy.methodStats(branch)||[]).find(x=>x.id==='depth-recovery');return {actions:Number(st?.burden?.actions||0),durationMs:Number(st?.burden?.durationMs||0)}}
function episodeNet(pred){if(!pred||!pred.outcome)return null;const micro=microFor(pred);if(!micro||!micro.completed)return null;const depth=depthBurden(pred.branchLabel),avoided=Number(pred.outcome.deepRecoveryAvoidedProxy||0)>0?1:0;const grossActions=avoided*depth.actions,grossTimeMs=avoided*depth.durationMs;const costActions=Number(micro.actions||0),costTimeMs=Number(micro.durationMs||0);const netActions=grossActions-costActions,netTimeMs=grossTimeMs-costTimeMs,netEquivalent=netActions+netTimeMs/CFG.timePerActionMs;return {predictionId:pred.id,method:micro.method||pred.candidateMethod||'',grossActions,grossTimeMs,costActions,costTimeMs,netActions,netTimeMs,netEquivalent}}
function mean(rows,fn){if(!rows.length)return 0;return rows.reduce((a,x)=>a+Number(fn(x)||0),0)/rows.length}
function rate(rows,fn){if(!rows.length)return null;return rows.filter(fn).length/rows.length}
function latestDormancy(branch){return [...allCalibration()].reverse().find(x=>x.branchLabel===branch&&x.action==='dormant')||null}
function activeDormancy(branch,now=Date.now()){const x=latestDormancy(branch);return x&&Number(x.until||0)>now?x:null}
function recentMetrics(branch){const rows=predictions(branch).slice(-CFG.recentWindow),nets=rows.map(episodeNet).filter(Boolean),hitRate=rate(rows,x=>!!x.outcome?.hit),fpRate=rate(rows,x=>!!x.outcome?.falsePositive),meanScore=mean(rows,x=>x.score),calibrationGap=hitRate==null?null:hitRate-meanScore;return {rows,n:rows.length,nets,hitRate,fpRate,meanScore,calibrationGap,avgNetActions:mean(nets,x=>x.netActions),avgNetTimeMs:mean(nets,x=>x.netTimeMs),avgNetEquivalent:mean(nets,x=>x.netEquivalent),totalNetActions:nets.reduce((a,x)=>a+x.netActions,0),totalNetTimeMs:nets.reduce((a,x)=>a+x.netTimeMs,0),totalNetEquivalent:nets.reduce((a,x)=>a+x.netEquivalent,0)}}
function consecutiveFalsePositives(rows){let n=0;for(let i=rows.length-1;i>=0;i--){if(rows[i].outcome?.falsePositive)n++;else break}return n}
function dormancyTrigger(branch){const m=recentMetrics(branch),consecutive=consecutiveFalsePositives(m.rows),lastNets=m.rows.slice(-CFG.negativeRecentWindow).map(episodeNet).filter(Boolean);if(consecutive>=CFG.consecutiveFalsePositives)return {reason:'연속 오탐',detail:`최근 ${consecutive}회 연속 오탐`};if(lastNets.length>=CFG.negativeRecentWindow&&lastNets.every(x=>x.netEquivalent<0))return {reason:'반복 음의 순이익',detail:`최근 ${CFG.negativeRecentWindow}회 선제 개입의 순이익이 모두 음수`};if(m.n>=CFG.minimumEvaluatedForNegativeAverage&&m.nets.length>=CFG.minimumEvaluatedForNegativeAverage&&m.avgNetEquivalent<=CFG.negativeAverageNetEquivalent)return {reason:'음의 평균 순이익',detail:'충분한 평가 표본에서 평균 순이익이 0 이하'};return null}
function logCalibration(branch,entry){const day=branchDay(branch),s=read(day),last=s.riskCalibrationLog[s.riskCalibrationLog.length-1];if(last&&last.branchLabel===branch&&last.action===entry.action&&last.reason===entry.reason&&Date.now()-Number(last.at||0)<30*60*1000)return last;const row={id:uid(),at:Date.now(),day,branchLabel:branch,...entry};s.riskCalibrationLog.push(row);if(s.riskCalibrationLog.length>CFG.maxLog)s.riskCalibrationLog=s.riskCalibrationLog.slice(-CFG.maxLog);write(day,s);return row}
function ensureDormancy(branch,now=Date.now()){const active=activeDormancy(branch,now);if(active)return active;const trigger=dormancyTrigger(branch);if(!trigger)return null;return logCalibration(branch,{action:'dormant',reason:trigger.reason,detail:trigger.detail,until:now+CFG.dormancyMs})}
function calibrationFor(branch,now=Date.now()){const m=recentMetrics(branch),sufficient=m.n>=CFG.minimumEvaluatedPerBranch&&m.nets.length>=CFG.minimumEvaluatedPerBranch;let threshold=CFG.globalThreshold,status='전역 기준 유지',reason='가지별 평가 표본이 아직 부족함';if(sufficient){const overPred=m.calibrationGap!=null&&m.calibrationGap<=-CFG.overPredictionGap;const negative=m.avgNetEquivalent<=0;const highFp=m.fpRate!=null&&m.fpRate>=CFG.highFalsePositiveRate;const strong=m.hitRate!=null&&m.hitRate>=CFG.minimumHitRateForLowering&&m.fpRate!=null&&m.fpRate<=CFG.lowFalsePositiveRate&&m.avgNetEquivalent>=CFG.minimumPositiveNetEquivalentForLowering&&!overPred;if(highFp||negative||overPred){threshold=clamp(CFG.globalThreshold+CFG.raiseStep,CFG.minimumThreshold,CFG.maximumThreshold);status='보수 상향';reason=highFp?'오탐률이 높아 임계값 상향':negative?'순이익이 0 이하라 임계값 상향':'예측 위험이 실제 적중률보다 과대해 임계값 상향'}else if(strong){threshold=clamp(CFG.globalThreshold-CFG.lowerStep,CFG.minimumThreshold,CFG.maximumThreshold);status='소폭 하향';reason='적중률·낮은 오탐·양의 순이익이 함께 안정적'}else{status='가지 기준 유지';reason='표본은 충분하지만 임계값 변경 근거가 크지 않음'}}const dormant=activeDormancy(branch,now);return {branchLabel:branch,threshold,sufficient,status,reason,dormant:!!dormant,dormancyReason:dormant?.reason||'',dormancyUntil:Number(dormant?.until||0),...m}}
function adjustedRiskFor(day,pid){const r=BASE_RISK_FOR(Number(day),pid);if(!r)return null;const cal=calibrationFor(r.branchLabel);return {...r,baseThreshold:CFG.globalThreshold,calibratedThreshold:cal.threshold,high:r.score>=cal.threshold&&r.confidence>=BASE_CFG.risk.minimumConfidence,calibration:cal}}
function methodNet(branch,method){const rows=predictions(branch).filter(x=>x.candidateMethod===method),nets=rows.map(episodeNet).filter(Boolean);return {n:nets.length,avg:nets.length?mean(nets,x=>x.netEquivalent):null}}
function calibratedMicroCandidate(risk){if(!risk||!risk.high)return null;const stats=risk.policy?.stats||[],rt=risk.route,eligible=stats.filter(x=>BASE_CFG.micro.methods.includes(x.id)&&x.episodes>=BASE_CFG.micro.minimumEpisodes&&x.effectScore!=null&&x.effectScore>=BASE_CFG.micro.minimumEffect&&Number(x.burden?.durationMs||0)>0&&Number(x.burden.durationMs)<=BASE_CFG.micro.maxAverageDurationMs&&Number(x.burden?.actions||0)<=BASE_CFG.micro.maxAverageActions).filter(x=>{const n=methodNet(risk.branchLabel,x.id);return !(n.n>=3&&n.avg<=0)}).sort((a,b)=>Number(a.burden.durationMs)-Number(b.burden.durationMs)||Number(a.burden.actions)-Number(b.burden.actions));const pick=eligible[0];if(!pick)return null;if(pick.id==='precheck')return {method:pick.id,label:pick.label,kind:'branch-choice',prompt:'이 문제는 어느 큰 가지에 붙나요?',answer:rt.branchLabel,options:rt.branchOptions||[],effectScore:pick.effectScore,avgDurationMs:pick.burden.durationMs};const m=rt.memory;if(!m)return null;return {method:pick.id,label:pick.label,kind:'keyword-input',prompt:m.prompt,answer:m.answer,accepted:[m.answer,...(m.accepted||[])],hint:m.hint||'',effectScore:pick.effectScore,avgDurationMs:pick.burden.durationMs}}
function predict(day,pid){const risk=adjustedRiskFor(day,pid);if(!risk)return null;const existing=H2Risk.allField('riskPredictionLog').filter(x=>x.sessionId===H2Risk.SESSION.id&&x.day===Number(day)&&x.problemId===pid&&!x.outcome).slice(-1)[0];if(existing)return existing;const dorm=ensureDormancy(risk.branchLabel);const cal=calibrationFor(risk.branchLabel);if(H2Risk.SESSION.suppressed||H2Risk.SESSION.served>=BASE_CFG.micro.maxPerSession||H2Risk.isImmediateRetry(day,pid)||dorm)return {...risk,high:false,suppressed:true,calibration:{...cal,dormant:!!dorm,dormancyReason:dorm?.reason||cal.dormancyReason,dormancyUntil:Number(dorm?.until||cal.dormancyUntil||0)}};if(!risk.high)return risk;const netGate=cal.sufficient&&cal.avgNetEquivalent<=0;if(netGate){const s=read(day),row={id:uid('rp'),sessionId:H2Risk.SESSION.id,day:Number(day),problemId:pid,branchLabel:risk.branchLabel,at:Date.now(),score:Number(risk.score.toFixed(3)),confidence:Number(risk.confidence.toFixed(3)),signals:risk.signals,predictedHigh:true,candidateMethod:null,interventionApplied:false,reason:'가지별 순이익 게이트: 평균 순이익이 0 이하',calibratedThreshold:cal.threshold,outcome:null};s.riskPredictionLog.push(row);write(day,s);return {...risk,prediction:row,candidate:null,netBenefitBlocked:true}}
  const candidate=calibratedMicroCandidate(risk),s=read(day),row={id:uid('rp'),sessionId:H2Risk.SESSION.id,day:Number(day),problemId:pid,branchLabel:risk.branchLabel,at:Date.now(),score:Number(risk.score.toFixed(3)),confidence:Number(risk.confidence.toFixed(3)),signals:risk.signals,predictedHigh:true,candidateMethod:candidate?.method||null,interventionApplied:!!candidate,reason:candidate?'교정 임계값 통과 + 양의 순이익 가능성이 있는 최소 개입':'교정 기준을 통과했지만 순이익이 검증된 20초 이하 개입 없음',calibratedThreshold:cal.threshold,outcome:null};s.riskPredictionLog.push(row);if(s.riskPredictionLog.length>400)s.riskPredictionLog=s.riskPredictionLog.slice(-400);write(day,s);return {...risk,prediction:row,candidate}}
function startMicro(day,pid){const p=predict(day,pid);if(!p||!p.prediction?.interventionApplied||!p.candidate)return null;const s=read(day);let row=s.proactiveMicrocheckLog.find(x=>x.predictionId===p.prediction.id);if(!row){row={id:uid('mc'),predictionId:p.prediction.id,sessionId:H2Risk.SESSION.id,day:Number(day),problemId:pid,branchLabel:p.branchLabel,method:p.candidate.method,kind:p.candidate.kind,startedAt:Date.now(),endedAt:null,actions:0,misses:0,firstCorrect:null,completed:false};s.proactiveMicrocheckLog.push(row);write(day,s);H2Risk.SESSION.served++}return {prediction:p.prediction,candidate:p.candidate,log:row}}
function completeMicro(day,id,data){return BASE_COMPLETE(day,id,data)}
function evaluateAttempt(day,pid,attempt){const out=BASE_EVALUATE(day,pid,attempt);if(!out)return null;const s=read(day),pred=[...s.riskPredictionLog].reverse().find(x=>x.sessionId===H2Risk.SESSION.id&&x.problemId===pid&&x.outcome&&Number(x.outcome.at||0)===Number(out.at||0))||[...s.riskPredictionLog].reverse().find(x=>x.sessionId===H2Risk.SESSION.id&&x.problemId===pid&&x.outcome);if(!pred)return out;const net=episodeNet(pred);if(net){Object.assign(pred.outcome,{netBenefitActions:Number(net.netActions.toFixed(2)),netBenefitTimeMs:Math.round(net.netTimeMs),netBenefitEquivalent:Number(net.netEquivalent.toFixed(3)),microCostActions:net.costActions,microCostTimeMs:net.costTimeMs,grossSavedActions:Number(net.grossActions.toFixed(2)),grossSavedTimeMs:Math.round(net.grossTimeMs)});write(day,s);const cal=calibrationFor(pred.branchLabel);logCalibration(pred.branchLabel,{action:'evaluated',reason:'선제 개입 효과 평가',predictionId:pred.id,threshold:cal.threshold,sampleN:cal.n,hitRate:cal.hitRate,falsePositiveRate:cal.fpRate,meanPredictedRisk:cal.meanScore,calibrationGap:cal.calibrationGap,avgNetActions:cal.avgNetActions,avgNetTimeMs:cal.avgNetTimeMs,avgNetEquivalent:cal.avgNetEquivalent});ensureDormancy(pred.branchLabel)}return out}
function parentSnapshot(){const base=BASE_PARENT(),branches=(base.branches||[]).map(x=>{const c=calibrationFor(x.branchLabel),d=activeDormancy(x.branchLabel);return {...x,calibrationStatus:c.status,currentThreshold:c.threshold,calibrationReason:c.reason,calibrationSampleN:c.n,meanPredictedRisk:c.meanScore,observedHitRate:c.hitRate,calibrationGap:c.calibrationGap,netSavedActions:c.totalNetActions,netSavedTimeMs:c.totalNetTimeMs,netEquivalent:c.totalNetEquivalent,averageNetEquivalent:c.avgNetEquivalent,dormant:!!d,dormancyReason:d?.reason||'',dormancyUntil:Number(d?.until||0)}});const totals=branches.reduce((a,x)=>({netActions:a.netActions+Number(x.netSavedActions||0),netTimeMs:a.netTimeMs+Number(x.netSavedTimeMs||0),dormant:a.dormant+Number(!!x.dormant)}),{netActions:0,netTimeMs:0,dormant:0});return {...base,branches,calibration:{globalThreshold:CFG.globalThreshold,minimumEvaluatedPerBranch:CFG.minimumEvaluatedPerBranch,netSavedActions:totals.netActions,netSavedTimeMs:totals.netTimeMs,dormantBranches:totals.dormant,events:allCalibration().length}}}
H2Risk.riskFor=adjustedRiskFor;
H2Risk.microCandidate=calibratedMicroCandidate;
H2Risk.predict=predict;
H2Risk.startMicro=startMicro;
H2Risk.completeMicro=completeMicro;
H2Risk.evaluateAttempt=evaluateAttempt;
H2Risk.parentSnapshot=parentSnapshot;
H2Risk.calibrationFor=calibrationFor;
H2Risk.recentMetrics=recentMetrics;
H2Risk.episodeNet=episodeNet;
H2Risk.ensureDormancy=ensureDormancy;
H2Risk.allCalibration=allCalibration;
H2Risk.CALIBRATION_CFG=CFG;
})(window);
