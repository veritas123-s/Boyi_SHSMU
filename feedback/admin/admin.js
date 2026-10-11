'use strict';
const api='https://122.51.44.155/boyi/feedback/admin/';
const $=id=>document.getElementById(id),login=$('login'),workspace=$('workspace'),status=$('status');
let token='',page=1,total=0,filters=new URLSearchParams(),busy=false;
const labelKind={reflections:'实践感想',practice:'实践意向与建议',feedback:'快闪反馈'};
function node(tag,text,cls){const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;}
async function request(route,options={}) {
 const r=await fetch(api+route,{...options,headers:{Authorization:'Bearer '+token,...options.headers},signal:AbortSignal.timeout(20000),cache:'no-store'});
 if(!r.ok){const data=await r.json().catch(()=>null);if(r.status===401)exit();throw Error(data?.error||'暂时无法读取，请稍后重试。');}return r;
}
function exit(){token='';$('key').value='';workspace.hidden=true;login.hidden=false;$('items').replaceChildren();$('summary').textContent='';$('filters').reset();filters=new URLSearchParams();status.textContent='';}
function render(item) {
 const card=node('article',undefined,'record');card.append(node('h2',labelKind[item.kind]),node('div',new Date(item.created_at).toLocaleString('zh-CN',{timeZone:'Asia/Shanghai'})+(item.rating?' · '+item.rating+' 分 · '+item.favorite:''),'meta'));
 if(item.message){card.append(node('label',item.kind==='practice'?'实践意向':'感想'),node('p',item.message));}
 if(item.suggestion){card.append(node('label','建议'),node('p',item.suggestion));}
 const edit=node('div',undefined,'edit'),stateLabel=node('label','整理状态'),select=node('select'),noteLabel=node('label','整理备注','note'),note=node('textarea');
 for(const [value,text] of [['new','待整理'],['reviewed','已整理'],['archived','已归档']]){const option=node('option',text);option.value=value;select.append(option);}
 select.value=item.status;select.setAttribute('aria-label','整理状态');stateLabel.append(select);note.value=item.note;note.maxLength=2000;note.rows=3;note.setAttribute('aria-label','整理备注');noteLabel.append(note);edit.append(stateLabel,noteLabel);
 const save=node('button','保存整理'),saved=node('span','', 'saved');save.type='button';save.addEventListener('click',async()=>{save.disabled=true;saved.textContent='';try{await request('submissions',{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:item.id,status:select.value,note:note.value})});saved.textContent='已保存';}catch(e){saved.textContent=e.message;}finally{save.disabled=false;}});
 card.append(edit,save,saved);return card;
}
async function load(){if(busy)return;busy=true;status.textContent='正在读取…';$('prev').disabled=$('next').disabled=true;try{const q=new URLSearchParams(filters);q.set('page',String(page));const data=await (await request('submissions?'+q)).json();total=data.summary.total;login.hidden=true;workspace.hidden=false;$('summary').textContent=`共 ${total} 条 · 待整理 ${data.summary.pending||0} 条 · 平均评分 ${data.summary.average??'暂无'}`;$('items').replaceChildren(...data.items.map(render));if(!data.items.length)$('items').append(node('p','还没有符合条件的留言。'));$('page').textContent=`${page} / ${Math.max(1,Math.ceil(total/30))}`;status.textContent='';}catch(e){status.textContent=e.name==='TimeoutError'?'连接超时，请稍后重试。':e.message;}finally{busy=false;$('prev').disabled=page<=1;$('next').disabled=page*30>=total;}}
login.addEventListener('submit',async e=>{e.preventDefault();token=$('key').value.trim();$('key').value='';page=1;await load();});
$('filters').addEventListener('submit',async e=>{e.preventDefault();filters=new URLSearchParams([...new FormData(e.target)].filter(([,v])=>v));page=1;await load();});
$('prev').addEventListener('click',()=>{page--;load();});$('next').addEventListener('click',()=>{page++;load();});$('logout').addEventListener('click',exit);
$('export').addEventListener('click',async()=>{const b=$('export');b.disabled=true;status.textContent='正在导出…';try{const blob=await (await request('export?'+filters)).blob(),url=URL.createObjectURL(blob),a=node('a');a.href=url;a.download='博医回声_'+new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Shanghai'})+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),5000);status.textContent='已导出当前筛选结果。';}catch(e){status.textContent=e.message;}finally{b.disabled=false;}});
window.addEventListener('pagehide',exit);
