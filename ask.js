'use strict';
const askForm=document.querySelector('#ask-form'),question=document.querySelector('#question'),askStatus=document.querySelector('#ask-status'),answer=document.querySelector('#ask-answer');
const askButton=askForm.querySelector('button[type=submit]'),waiting=document.querySelector('#ask-waiting');
const waitMessage=waiting.querySelector('.wait-message'),waitTime=waiting.querySelector('.wait-time'),waitHint=waiting.querySelector('.wait-hint');
let pendingController=null,cancelled=false;
const stages=['received','reading','writing'];
function showProgress(progress){
 const index=stages.indexOf(progress.stage);if(index<0)return;
 waiting.dataset.stage=progress.stage;waitMessage.textContent=progress.message;
 waiting.querySelectorAll('.wait-step').forEach((step,i)=>{step.dataset.state=i<index?'done':i===index?'active':'pending';if(i===index)step.setAttribute('aria-current','step');else step.removeAttribute('aria-current');});
}
waiting.querySelector('.wait-cancel').addEventListener('click',()=>{cancelled=true;pendingController?.abort();});
document.querySelectorAll('.ask-prompts button').forEach(button=>button.addEventListener('click',()=>{question.value=button.textContent;question.focus();}));
async function readAnswer(response){
 if(response.status===204)return {suppressed:true};
 if(!response.ok||!response.headers.get('content-type')?.includes('application/x-ndjson')){
  const data=await response.json();if(!response.ok||typeof data.answer!=='string')throw new Error(data.error||'这次没有收到回答，请稍后重试。');return data;
 }
 const reader=response.body.getReader(),decoder=new TextDecoder();let buffer='',result;
 function receive(line){
  if(!line.trim())return;
  const event=JSON.parse(line);
  if(event.type==='progress')showProgress(event);
  if(event.type==='error')throw new Error(event.error||'这次未能生成回答，请稍后重试。');
  if(event.type==='done')result=event;
  if(event.type==='suppressed')result={suppressed:true};
 }
 try{
  while(true){const {done,value}=await reader.read();buffer+=done?decoder.decode():decoder.decode(value,{stream:true});let end;while((end=buffer.indexOf('\n'))>=0){receive(buffer.slice(0,end));buffer=buffer.slice(end+1);}if(done){receive(buffer);break;}}
 }finally{reader.releaseLock();}
 if(!result?.suppressed&&typeof result?.answer!=='string')throw new Error('回答传输中断，请重试。');return result;
}
askForm.addEventListener('submit',async event=>{
 event.preventDefault();if(askButton.disabled||!askForm.reportValidity())return;
 const text=question.value.trim();if(!text){question.focus();return;}
 askButton.disabled=true;askButton.textContent='正在处理…';askStatus.textContent='';answer.hidden=true;waiting.hidden=false;askForm.setAttribute('aria-busy','true');
 const controller=new AbortController(),started=performance.now();pendingController=controller;cancelled=false;
 waitTime.textContent='0秒';waitHint.textContent='回答会连同资料来源一起呈现。';showProgress({stage:'received',message:'正在连接馆员'});waiting.scrollIntoView({block:'nearest',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 const ticker=setInterval(()=>{const seconds=Math.floor((performance.now()-started)/1000);waitTime.textContent=`${seconds}秒`;if(seconds>=20)waitHint.textContent='还在处理中，复杂问题需要多一点时间。你可以继续等待或取消。';},1000);
 const timer=setTimeout(()=>controller.abort(),85000);
 try{
  const response=await fetch('https://122.51.44.155/boyi/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({question:text,website:new FormData(askForm).get('website'),stream_status:true})});
  const data=await readAnswer(response);
  if(data.suppressed){answer.querySelector('.answer-text').textContent='';answer.querySelector('ul').replaceChildren();return;}
  answer.querySelector('.answer-text').textContent=data.answer;
  const list=answer.querySelector('ul');list.replaceChildren();
  for(const source of data.sources||[]){
   const item=document.createElement('li'),label=`[${source.number}] ${source.title}`;
   if(source.source_type==='report'||source.source_type==='editorial_note'){item.textContent=label;list.append(item);continue;}
   try{const url=new URL(source.url);if(url.origin!=='https://veritas123-s.github.io'||!url.pathname.startsWith('/Boyi_SHSMU/'))continue;const link=document.createElement('a');link.href=url.href;link.textContent=label;item.append(link);list.append(item);}catch{continue;}
  }
  answer.querySelector('.answer-sources').hidden=!list.children.length;answer.hidden=false;answer.focus({preventScroll:true});answer.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});
 }catch(error){askStatus.textContent=cancelled?'已取消。你可以调整问题后重新提问。':error.name==='AbortError'?'回答等待较久，请稍后重试。':error instanceof TypeError?'网络暂时不可用，请稍后重试。':error.message;}
 finally{clearTimeout(timer);clearInterval(ticker);controller.abort();pendingController=null;waiting.hidden=true;askForm.removeAttribute('aria-busy');askButton.disabled=false;askButton.textContent='问一问';}
});

const suggestedQuestion=new URLSearchParams(location.search).get("question");if(suggestedQuestion&&suggestedQuestion.length<=800)question.value=suggestedQuestion;
