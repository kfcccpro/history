(function(){
'use strict';
if(window.__H2_DEPTH_CHOICE_MODE__)return;
window.__H2_DEPTH_CHOICE_MODE__=true;

const style=document.createElement('style');
style.textContent=`
.depth-objective-hidden{display:none!important}
.depth-memory-choice-wrap{display:grid;gap:12px;margin-top:4px}
.depth-memory-choice-lead{font-size:17px;line-height:1.45;font-weight:900;color:#53677e}
.depth-memory-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:11px}
.depth-memory-choice{width:100%;min-height:76px;border:2px solid #d9e3ec;border-radius:15px;background:#fff;padding:15px 17px;text-align:left;font:inherit;font-size:18px;font-weight:900;line-height:1.