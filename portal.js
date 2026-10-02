'use strict';
if(document.body.dataset.page==='practice'&&(new URLSearchParams(location.search).has('word')||/^#reflection/.test(location.hash))){
 location.replace('../reflections/'+location.search+location.hash);
}
const timeline=document.querySelector('.timeline-section');
if(timeline){
 const tabs=[...timeline.querySelectorAll('[role=tab]')];
 function show(tab){
  tabs.forEach(item=>{const selected=item===tab;item.setAttribute('aria-selected',String(selected));item.tabIndex=selected?0:-1;document.getElementById(item.getAttribute('aria-controls')).hidden=!selected;});
  tab.scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'});
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>show(tab));
  tab.addEventListener('keydown',event=>{
   const next={ArrowRight:(index+1)%tabs.length,ArrowLeft:(index+tabs.length-1)%tabs.length,Home:0,End:tabs.length-1}[event.key];
   if(next!==undefined){event.preventDefault();show(tabs[next]);tabs[next].focus({preventScroll:true});}
  });
 });
}
if(document.body.dataset.page==='intro'){
 const oldId=new URLSearchParams(location.search).get('id');
 if(oldId!==null && /^0*(?:[1-9]|1[0-8])$/.test(oldId))location.replace(`stories/${String(Number(oldId)).padStart(3,'0')}/`);
}
const imageDialog=document.querySelector('#image-dialog');
if(imageDialog && typeof imageDialog.showModal==='function'){
 document.querySelectorAll('.zoom-image').forEach(link=>link.addEventListener('click',event=>{
  event.preventDefault();imageDialog.querySelector('img').src=link.href;imageDialog.querySelector('.original-image-link').href=link.href;
  imageDialog.querySelector('img').alt=link.querySelector('img').alt;
  imageDialog.querySelector('p').textContent=link.dataset.caption||'';imageDialog.showModal();
 }));
 imageDialog.querySelector('button').addEventListener('click',()=>imageDialog.close());
 imageDialog.addEventListener('click',event=>{if(event.target===imageDialog)imageDialog.close();});
}
const cloud=document.querySelector('#wordcloud');
if(cloud){
 const words=[...cloud.querySelectorAll('button')],articles=[...document.querySelectorAll('.reflection')];
 const result=document.querySelector('#cloud-result'),reset=document.querySelector('#reset-cloud');
 function select(word){
  let count=0;
  for(const article of articles){
   const text=article.dataset.text,p=article.querySelector('.reflection-text');p.replaceChildren();
   article.hidden=!!word&&!text.includes(word);
   if(!article.hidden)count++;
   if(!word){p.textContent=text;continue;}
   const parts=text.split(word);parts.forEach((part,i)=>{p.append(document.createTextNode(part));if(i<parts.length-1){const mark=document.createElement('mark');mark.textContent=word;p.append(mark);}});
  }
  words.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.word===word)));
  result.textContent=word?`“${word}” · ${count} 段相关感想`:`全部 ${articles.length} 段感想`;
  reset.hidden=!word;
  const url=new URL(location.href);if(word)url.searchParams.set('word',word);else url.searchParams.delete('word');history.replaceState(null,'',url);
 }
 words.forEach(button=>button.addEventListener('click',()=>{select(button.dataset.word);result.scrollIntoView({block:'center',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}));
 reset.addEventListener('click',()=>select(''));
 function layout(){
  const width=cloud.clientWidth,height=width<500?560:390;cloud.style.height=height+'px';cloud.classList.add('cloud-ready');
  const placed=[];let failed=false;
  for(let i=0;i<words.length;i++){
   const button=words[i],count=Number(button.dataset.count);
   button.style.fontSize=(width<500?15:18)+Math.min(32,Math.sqrt(count)*7)+'px';
   const w=button.offsetWidth,h=button.offsetHeight;let position=null;
   for(let step=0;step<1800;step++){
    const t=step*.27,r=Math.sqrt(step)*6.2;
    const x=width/2+Math.cos(t+i*.9)*r*1.3-w/2,y=height/2+Math.sin(t+i*.9)*r*.95-h/2;
    if(x<3||y<3||x+w>width-3||y+h>height-3)continue;
    if(placed.every(p=>x+w+2<p.x||x>p.x+p.w+2||y+h+2<p.y||y>p.y+p.h+2)){position={x,y,w,h};break;}
   }
   if(!position){failed=true;break;}placed.push(position);button.style.left=position.x+'px';button.style.top=position.y+'px';
  }
  if(failed){cloud.classList.remove('cloud-ready');cloud.style.height='auto';words.forEach(b=>{b.style.left='';b.style.top='';});}
 }
 document.fonts.ready.then(layout);
 let timer;new ResizeObserver(()=>{clearTimeout(timer);timer=setTimeout(layout,100);}).observe(cloud);
 const initial=new URLSearchParams(location.search).get('word');if(initial&&words.some(b=>b.dataset.word===initial))select(initial);
}
