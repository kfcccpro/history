(function(g){
'use strict';
const VERSION='1.0.0-source-first-state-guard';
const LOG_KEY='history2-unit1-flow-guard-log-v1';
const SAFE_KEY='history2-unit1-flow-guard-safe-v1';
const META_KEY='history2-unit1-flow-guard-meta-v1';
const MAX_LOGS=120;
function now(){return Date.now()}
function uid(p='fg'){return p+'-'+now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function parse(v,f){try{return v?JSON.parse(v):f}catch(e){return f}}
function getLS(k){try{return localStorage.getItem(k)}catch(e){return null}}
function setLS(k,v){try{localStorage.setItem(k,v)}catch(e){}}
function clone(v){try{return JSON.parse(JSON.stringify(v))}catch(e){return null}}
function logs(){const a=parse(getLS(LOG_KEY),[]);return Array.isArray(a)?a:[]}
function log(type,detail={}){const a=logs();a.push({id:uid('ev'),at:now(),type,detail:clone(detail)||{}});setLS(LOG_KEY,JSON.stringify(a.slice(-MAX_LOGS)));return a[a.length-1]}
function safeStore(){const o=parse(getLS(SAFE_KEY),{});return o&&typeof o==='object'?o:{}}
function saveSafe(scope,id,payload){const o=safeStore();o[scope+':'+id]={...clone(payload),savedAt:now(),guardVersion:VERSION};setLS(SAFE_KEY,JSON.stringify(o));return o[scope+':'+id]}
function lastSafe(scope,id){return safeStore()[scope+':'+id]||null}
function clearSafe(scope,id){const o=safeStore();delete o[scope+':'+id];setLS(SAFE_KEY,JSON.stringify(o))}
function setMeta(extra={}){const prev=parse(getLS(META_KEY),{});const meta={...prev,...clone(extra),version:VERSION,updatedAt:now()};setLS(META_KEY,JSON.stringify(meta));return meta}
function summarizeDays(storage){const out={};Object.entries(storage||{}).forEach(([day,key])=>{const s=parse(getLS(key),{});out[day]={phase:s.phase||null,problemIndex:Number.isFinite(Number(s.problemIndex))?Number(s.problemIndex):null,attempts:Array.isArray(s.attempts)?s.attempts.length:0,memoryItems:s.memoryLog&&typeof s.memoryLog==='object'?Object.keys(s.memoryLog).length:0,wrongNotes:s.wrongNotes&&typeof s.wrongNotes==='object'?Object.keys(s.wrongNotes).length:0,finishedAt:s.finishedAt||null};});return out}
function report(storage){const safe=clone(safeStore())||{};Object.values(safe).forEach(x=>{if(x?.state?.sync){x.state.sync.configText='';x.state.sync.familyCode=x.state.sync.familyCode?'[redacted]':''}});return {generatedAt:new Date().toISOString(),guardVersion:VERSION,meta:parse(getLS(META_KEY),{}),recentEvents:logs().slice(-60),safePoints:safe,days:summarizeDays(storage),resumeToken:parse(getLS('history2-unit1-resume-token-v1'),null),entryPolicy:parse(getLS('history2-unit1-flow-entry-policy-v2'),null),userAgent:(typeof navigator!=='undefined'?navigator.userAgent:''),location:(typeof location!=='undefined'?location.href:'')}}
function downloadReport(storage,filename='history2-flow-diagnostic.json'){const data=JSON.stringify(report(storage),null,2);const blob=new Blob([data],{type:'application/json;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},0)}
function isVisibleAction(root){if(!root)return false;const q='button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]';return !!root.querySelector(q)}
g.H2FlowGuard={VERSION,LOG_KEY,SAFE_KEY,META_KEY,uid,clone,log,logs,saveSafe,lastSafe,clearSafe,setMeta,report,downloadReport,isVisibleAction};
setMeta({loadedAt:now()});
})(window);
