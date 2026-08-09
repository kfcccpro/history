(function(g){
'use strict';
const KEY='history2-unit1-micro-block-v1';
const CFG={target:6,min:4,max:8};
function parse(v,f){try{return v?JSON.parse(v):f}catch(e){return f}}
function load(){const x=parse(localStorage.getItem(KEY),{});return x&&typeof x==='object'?x:{}}
function save(x){localStorage.setItem(KEY,JSON.stringify(x));return x}
function partition(total,target=CFG.target,min=CFG.min,max=CFG.max){
 total=Math.max(0,Number(total)||0);if(!total)return [];
 const minBlocks=Math.max(1,Math.ceil(total/max)),maxBlocks=Math.max(1,Math.floor(total/min));
 let n=Math.round(total/target);n=Math.max(minBlocks,Math.min(maxBlocks,n));
 const base=Math.floor(total/n),extra=total%n,out=[];let start=0;
 for(let i=0;i<n;i++){const size=base+(i<extra?1:0),end=start+size-1;out.push({block:i+1,start,end,size,totalBlocks:n});start=end+1}
 return out;
}
function boundary(index,total){const blocks=partition(total);return blocks.find(b=>b.end===Number(index)&&b.block<b.totalBlocks)||null}
function currentBlock(index,total){return partition(total).find(b=>Number(index)>=b.start&&Number(index)<=b.end)||null}
function dayStore(day){const all=load();all.days=all.days||{};all.days[day]=all.days[day]||{events:[],seen:{}};return {all,day:all.days[day]}}
function keyFor(day,b){return String(day)+':'+String(b.block)+':'+String(b.end)}
function seen(day,b){const x=dayStore(day).day;return !!x.seen[keyFor(day,b)]}
function markSeen(day,b,meta={}){const x=dayStore(day);x.day.seen[keyFor(day,b)]={at:Date.now(),...meta};save(x.all)}
function record(day,b,action,meta={}){const x=dayStore(day);x.day.events.push({id:'mb-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7),at:Date.now(),day:Number(day),block:b.block,start:b.start,end:b.end,size:b.size,action,...meta});x.day.events=x.day.events.slice(-120);save(x.all)}
function snapshot(){const all=load(),rows=[];for(const [day,v] of Object.entries(all.days||{}))for(const e of (v.events||[]))rows.push(e);rows.sort((a,b)=>b.at-a.at);const checkpoints=rows.filter(x=>x.action==='shown').length,paused=rows.filter(x=>x.action==='pause').length,continued=rows.filter(x=>x.action==='continue').length;return {cfg:CFG,rows:rows.slice(0,60),aggregate:{checkpoints,paused,continued,pauseRate:(paused+continued)?paused/(paused+continued):null}}}
g.H2MicroBlock={KEY,CFG,partition,boundary,currentBlock,seen,markSeen,record,snapshot};
})(window);
