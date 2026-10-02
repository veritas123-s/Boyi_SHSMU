'use strict';
document.querySelectorAll('.echo-form').forEach(form=>{
 let submissionId=crypto.randomUUID();
 const status=form.querySelector('.echo-status'),button=form.querySelector('button[type=submit]');
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(button.disabled||!form.reportValidity())return;
  const values=new FormData(form),message=String(values.get('message')||'').trim(),suggestion=String(values.get('suggestion')||'').trim();
  if(!message&&!suggestion){status.textContent='写下一点想法，再寄出回声。';form.querySelector('textarea').focus();return;}
  button.disabled=true;button.textContent='正在寄出…';status.textContent='';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('https://shanhai-boyi-feedback.david-zhang-2922.chatgpt.site/api/echo',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({id:submissionId,kind:form.dataset.kind,message,suggestion,website:values.get('website')})});
   const data=await response.json();if(!response.ok||data.ok!==true)throw new Error(data.error||'暂时未能保存，请稍后重试。');
   form.hidden=true;const success=form.parentElement.querySelector('.echo-success');success.hidden=false;success.focus();
  }catch(error){status.textContent=error.name==='AbortError'?'连接超时，内容已保留，请重试。':error instanceof TypeError?'网络暂时不可用，内容已保留，请重试。':error.message;}
  finally{clearTimeout(timer);button.disabled=false;button.textContent='寄出回声';}
 });
});
