'use strict';
const audio=document.querySelector('audio');
function reportHeight(){parent.postMessage({type:'shanhai-podcast-height',height:Math.ceil(document.body.getBoundingClientRect().height)},location.origin);}
new ResizeObserver(reportHeight).observe(document.body);
window.addEventListener('load',reportHeight);document.fonts.ready.then(reportHeight);
if(audio){
audio.addEventListener('play',()=>parent.postMessage({type:'shanhai-podcast-play'},location.origin));
const showError=()=>{document.querySelector('.audio-error').hidden=false;reportHeight();};
const clearError=()=>{document.querySelector('.audio-error').hidden=true;reportHeight();};
audio.addEventListener('error',showError);
audio.querySelectorAll('source').forEach(source=>source.addEventListener('error',showError));
audio.addEventListener('loadedmetadata',clearError);
audio.addEventListener('canplay',clearError);
}
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data?.type==='shanhai-podcast-pause')audio?.pause();});
