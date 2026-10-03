(() => {
 'use strict';
 const script=document.currentScript,base=new URL('.',script.src),key='shanhai-music-v1';
 let saved={};try{saved=JSON.parse(sessionStorage.getItem(key)||'{}');}catch{}
 const audio=new Audio(new URL('media/audio/shiguang-dingqiao.mp3',base));
 audio.id='background-music';audio.loop=true;audio.preload='metadata';audio.volume=.32;
 audio.setAttribute('playsinline','');audio.setAttribute('aria-label','背景音乐：时光，丁乔');
 const button=document.createElement('button');button.type='button';button.className='music-player';
 button.innerHTML='<span class="music-disc" aria-hidden="true"><span class="disc-label">山海<br>回声</span><span class="disc-hole"></span></span><span class="music-copy"><span class="music-title">时光 · 丁乔</span><span class="music-state">待播放</span></span><span class="music-symbol" aria-hidden="true">▶</span>';
 document.body.append(audio,button);
 let pausedByUser=saved.paused===true,busy=false;
 const status=button.querySelector('.music-state'),symbol=button.querySelector('.music-symbol');
 function render(){const playing=!audio.paused;button.classList.toggle('is-playing',playing);button.setAttribute('aria-pressed',String(playing));button.setAttribute('aria-label',playing?'暂停背景音乐：时光，丁乔':'播放背景音乐：时光，丁乔');status.textContent=playing?'正在播放':pausedByUser?'已暂停':'待播放';symbol.textContent=playing?'Ⅱ':'▶';}
 function save(){try{sessionStorage.setItem(key,JSON.stringify({paused:pausedByUser,time:audio.currentTime}));}catch{}}
 async function play(){if(busy)return;busy=true;try{await audio.play();}catch{render();}finally{busy=false;}}
 audio.addEventListener('loadedmetadata',()=>{if(Number.isFinite(saved.time)&&saved.time>0&&saved.time<audio.duration)audio.currentTime=saved.time;},{once:true});
 audio.addEventListener('play',()=>{pausedByUser=false;document.querySelectorAll('audio').forEach(a=>{if(a!==audio)a.pause();});render();save();});
 audio.addEventListener('pause',()=>{render();save();});
 audio.addEventListener('error',()=>{render();status.textContent='暂未加载';});
 document.addEventListener('play',event=>{if(event.target instanceof HTMLMediaElement&&event.target!==audio&&!audio.paused){pausedByUser=true;audio.pause();}},true);
 button.addEventListener('click',()=>{if(!audio.paused){pausedByUser=true;audio.pause();}else{pausedByUser=false;if(audio.error)audio.load();play();}save();});
 window.addEventListener('pagehide',save);audio.addEventListener('timeupdate',()=>{if(Math.floor(audio.currentTime)%5===0)save();});
 render();if(!pausedByUser&&document.body.dataset.page!=='podcast'){audio.autoplay=true;play();}
})();
