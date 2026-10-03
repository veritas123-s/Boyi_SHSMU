'use strict';
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion:reduce)'),main=document.querySelector('main');let observer;
 function reveal(node){node.classList.add('is-revealed');observer?.unobserve(node);}
 function setup(){
  observer?.disconnect();
  if(reduced.matches){document.querySelectorAll('.reveal-ready').forEach(node=>node.classList.remove('reveal-ready'));return;}
  if(!('IntersectionObserver'in window))return;
  observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting)reveal(entry.target);}),{threshold:.05,rootMargin:'0px 0px -20px 0px'});
  const nodes=[...document.querySelectorAll('.field-path article,.method-grid article,.practice-chain li,.practice-story-card,.practice-reflection-link,.report-card,.brand-grid article,.feature-grid article,.discovery-grid>a,.practice-reading a,.story-nav a,.reflection,.story-grid .story-card')];
  nodes.forEach((node,index)=>{node.style.setProperty('--reveal-delay',`${index%3*65}ms`);node.classList.add('reveal-ready');if(node.getBoundingClientRect().top<innerHeight-20)reveal(node);else observer.observe(node);});
 }
 setup();reduced.addEventListener('change',setup);
 if(main&&!reduced.matches&&!('onpagereveal'in window))main.animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:380,easing:'ease-out'});
 document.addEventListener('focusin',event=>{event.target.closest('.reveal-ready')&&reveal(event.target.closest('.reveal-ready'));});
 const timeline=document.querySelector('.timeline-section');
 function animateMoment(){if(reduced.matches)return;const panel=timeline.querySelector('[role=tabpanel]:not([hidden])');panel?.getAnimations().forEach(animation=>animation.cancel());panel?.animate([{opacity:.35,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:330,easing:'ease-out'});}
 timeline?.addEventListener('click',event=>{if(event.target.closest('[role=tab]'))requestAnimationFrame(animateMoment);});
 timeline?.addEventListener('keydown',event=>{if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)&&event.target.closest('[role=tab]'))requestAnimationFrame(animateMoment);});
 document.documentElement.dataset.motion='ready';
})();
