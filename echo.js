'use strict';
document.querySelectorAll('.echo-form').forEach(form=>{
 let submissionId='',lastPayload='';
 const uuid=()=>{const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;return [...b].map((x,i)=>([4,6,8,10].includes(i)?'-':'')+x.toString(16).padStart(2,'0')).join('');};
 const status=form.querySelector('.echo-status'),button=form.querySelector('button[type=submit]');
 form.addEventListener('submit',async event=>{
  event.preventDefault();if(button.disabled||!form.reportValidity())return;
  const values=new FormData(form),message=String(values.get('message')||'').trim(),suggestion=String(values.get('suggestion')||'').trim();
  if(!message&&!suggestion){status.textContent='写下一点想法，再寄出回声。';form.querySelector('textarea').focus();return;}
  const payload={kind:form.dataset.kind,message,suggestion,website:values.get('website')||''},fingerprint=JSON.stringify(payload);
  if(fingerprint!==lastPayload){submissionId=uuid();lastPayload=fingerprint;}
  button.disabled=true;button.textContent='正在寄出…';status.textContent='';
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch('https://122.51.44.155/boyi/api/echo',{method:'POST',headers:{'Content-Type':'application/json'},signal:controller.signal,body:JSON.stringify({id:submissionId,...payload})});
   const data=await response.json().catch(()=>null);if(!response.ok||data?.ok!==true)throw new Error(data?.error||'暂时未能保存，内容已保留，请稍后重试。');
   form.hidden=true;const success=form.parentElement.querySelector('.echo-success');success.hidden=false;success.focus();
  }catch(error){status.textContent=error.name==='AbortError'?'连接超时，内容已保留，请重试。':error instanceof TypeError?'网络暂时不可用，内容已保留，请重试。':error.message;}
  finally{clearTimeout(timer);button.disabled=false;button.textContent='寄出回声';}
 });
});
