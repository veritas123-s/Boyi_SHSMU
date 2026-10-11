"use strict";
const form=document.querySelector('#feedback-form'), status=document.querySelector('#form-status');
const story=new URLSearchParams(location.search).get('story');
let submissionId='',lastPayload='';
const uuid=()=>{const b=crypto.getRandomValues(new Uint8Array(16));b[6]=(b[6]&15)|64;b[8]=(b[8]&63)|128;return [...b].map((x,i)=>([4,6,8,10].includes(i)?'-':'')+x.toString(16).padStart(2,'0')).join('');};
form.addEventListener('submit',async event=>{
 event.preventDefault(); if(!form.reportValidity()) return;
 const button=form.querySelector('button[type=submit]'); if(button.disabled) return;
 const data=new FormData(form);
 const payload={rating:Number(data.get('rating')),favorite:data.get('favorite'),impression:String(data.get('impression')||'').trim(),suggestion:String(data.get('suggestion')||'').trim(),website:data.get('website')||'',source:/^(00[1-9]|01[0-8])$/.test(story||'')?story:'event'},fingerprint=JSON.stringify(payload);
 if(fingerprint!==lastPayload){submissionId=uuid();lastPayload=fingerprint;}
 const body={id:submissionId,...payload};
 button.disabled=true;button.textContent='正在提交…';status.textContent='';
 const controller=new AbortController(), timer=setTimeout(()=>controller.abort(),20000);
 try {
  const response=await fetch('https://122.51.44.155/boyi/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:controller.signal});
  const result=await response.json().catch(()=>null);
  if(!response.ok || result?.ok!==true) throw new Error(result?.error||'暂时未能保存，请稍后重试。已填写内容仍保留。');
  form.hidden=true; const success=document.querySelector('#success');success.hidden=false;success.focus();
 } catch(error) {status.textContent=error.name==='AbortError'?'连接超时，请重试。已填写内容仍保留。':error instanceof TypeError?'网络暂时不可用，请稍后重试。已填写内容仍保留。':error.message;}
 finally{clearTimeout(timer);button.disabled=false;button.textContent='提交反馈';}
});
