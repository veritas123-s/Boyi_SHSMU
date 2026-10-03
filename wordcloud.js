'use strict';
(()=>{
 const cloud=document.querySelector('#wordcloud');if(!cloud)return;
 const words=[...cloud.querySelectorAll('.cloud-word')],pause=document.querySelector('#pause-cloud'),pick=document.querySelector('#pick-cloud');
 const invite=document.querySelector('#cloud-invite-text'),topic=document.querySelector('#echo-topic'),input=document.querySelector('.echo-form textarea[name=message]');
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');let paused=false;
 words.forEach((word,i)=>{word.style.setProperty('--cloud-duration',`${7+i%5}s`);word.style.setProperty('--cloud-delay',`${-(i*1.37)%9}s`);word.style.setProperty('--cloud-direction',i%2?'reverse':'normal');});
 function syncMotion(){cloud.dataset.paused=String(paused||document.hidden||reduced.matches);pause.disabled=reduced.matches;pause.textContent=reduced.matches?'已减少动态效果':paused?'继续浮动':'暂停浮动';pause.setAttribute('aria-pressed',String(paused));}
 pause.addEventListener('click',()=>{paused=!paused;syncMotion();});
 reduced.addEventListener('change',syncMotion);document.addEventListener('visibilitychange',syncMotion);syncMotion();
 if('IntersectionObserver'in window)new IntersectionObserver(entries=>{cloud.dataset.inView=String(entries[0].isIntersecting);},{threshold:.01}).observe(cloud);else cloud.dataset.inView='true';
 document.fonts.ready.then(()=>cloud.classList.add('cloud-motion-ready'));
 function updateInvite(){
  const selected=words.find(word=>word.getAttribute('aria-pressed')==='true')?.dataset.word;
  invite.textContent=selected?`“${selected}”让你想起了什么？读过他们的感想，也留下一句你的回声。`:'这些词里，哪一个与你有关？点一个词读感想，再留下一句自己的回声。';
  topic.hidden=!selected;topic.textContent=selected?`你选中了“${selected}”。可以写下它让你想到的人、经历或想做的事。`:'';
  input.placeholder=selected?`“${selected}”让我想到……`:'一句感受、一个问题，或下一次实践想做的事……';
 }
 words.forEach(word=>word.addEventListener('click',updateInvite));document.querySelector('#reset-cloud').addEventListener('click',updateInvite);updateInvite();
 pick.addEventListener('click',()=>{const choices=words.filter(word=>word.getAttribute('aria-pressed')!=='true');choices[Math.floor(Math.random()*choices.length)]?.click();});
 document.querySelectorAll('.cloud-write-link').forEach(link=>link.addEventListener('click',()=>requestAnimationFrame(()=>input.focus({preventScroll:true}))));
})();
