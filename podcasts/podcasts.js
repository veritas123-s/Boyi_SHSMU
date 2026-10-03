'use strict';
const frame=document.querySelector('.podcast-original-frame');
if(frame){
 window.addEventListener('message',event=>{
  if(event.origin!==location.origin||event.source!==frame.contentWindow)return;
  if(event.data?.type==='shanhai-podcast-height'&&Number.isFinite(event.data.height)&&event.data.height>0&&event.data.height<100000)frame.style.height=`${event.data.height}px`;
  if(event.data?.type==='shanhai-podcast-play')document.querySelector('#background-music')?.pause();
 });
 document.addEventListener('play',event=>{if(event.target?.id==='background-music')frame.contentWindow.postMessage({type:'shanhai-podcast-pause'},location.origin);},true);
}
