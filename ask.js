'use strict';
const askForm=document.querySelector('#ask-form'),question=document.querySelector('#question'),askStatus=document.querySelector('#ask-status'),answer=document.querySelector('#ask-answer');
const askButton=askForm.querySelector('button[type=submit]');
document.querySelectorAll('.ask-prompts button').forEach(button=>button.addEventListener('click',()=>{question.value=button.textContent;question.focus();}));
askForm.addEventListener('submit',async event=>{
 event.preventDefault();if(askButton.disabled||!askForm.reportValidity())return;
 const text=question.value.trim();if(!text){question.focus();return;}
 askButton.disabled=true;askButton.textContent='正在思考…';askStatus.textContent='';answer.hidden=true;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),85000);
 try{
  const response=await fetch('https://122.51.44.155/boyi/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({question:text,website:new FormData(askForm).get('website')})});
  const data=await response.json();if(!response.ok||typeof data.answer!=='string')throw new Error(data.error||'这次没有收到回答，请稍后重试。');
  answer.querySelector('.answer-text').textContent=data.answer;
  const list=answer.querySelector('ul');list.replaceChildren();
  for(const source of data.sources||[]){const url=new URL(source.url);if(url.origin!=='https://veritas123-s.github.io'||!url.pathname.startsWith('/Boyi_SHSMU/'))continue;const item=document.createElement('li'),link=document.createElement('a');link.href=url.href;link.textContent=`[${source.number}] ${source.title}`;item.append(link);list.append(item);}
  answer.querySelector('.answer-sources').hidden=!list.children.length;answer.hidden=false;answer.focus({preventScroll:true});answer.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 }catch(error){askStatus.textContent=error.name==='AbortError'?'回答等待较久，请稍后重试。':error instanceof TypeError?'网络暂时不可用，请稍后重试。':error.message;}
 finally{clearTimeout(timer);askButton.disabled=false;askButton.textContent='问一问';}
});
