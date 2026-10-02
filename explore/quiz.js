(() => {
 'use strict';
 const $=selector=>document.querySelector(selector),key='shanhai-explore-v1';
 let data,answers=[],index=0,completed=false;
 const start=$('#quiz-start'),stage=$('#quiz-stage'),result=$('#quiz-result');
 function save(){try{sessionStorage.setItem(key,JSON.stringify({version:data.version,answers,index,completed}));}catch{}}
 function showQuestion(){
  $('#quiz-intro').hidden=true;result.hidden=true;stage.hidden=false;
  const q=data.questions[index];$('#quiz-question').textContent=q.title;$('#quiz-counter').textContent=`情境 ${String(index+1).padStart(2,'0')} / ${data.questions.length}`;
  const done=answers.filter(Number.isInteger).length;$('#quiz-count').textContent=`已选择 ${done} 题`;$('#quiz-progress').value=done;
  const list=$('#quiz-options');list.replaceChildren();
  q.choices.forEach((c,i)=>{const label=document.createElement('label'),input=document.createElement('input'),body=document.createElement('span'),letter=document.createElement('b'),text=document.createElement('span');input.type='radio';input.name='choice';input.value=i;input.required=true;input.checked=answers[index]===i;letter.textContent=String.fromCharCode(65+i);text.textContent=c.label;body.append(letter,text);label.append(input,body);list.append(label);input.addEventListener('change',()=>{answers[index]=i;completed=false;save();$('#quiz-count').textContent=`已选择 ${answers.filter(Number.isInteger).length} 题`;$('#quiz-progress').value=answers.filter(Number.isInteger).length;});});
  $('#quiz-back').disabled=index===0;$('#quiz-next').textContent=index===data.questions.length-1?'查看我的结果 →':'下一题 →';$('#quiz-status').textContent='';
  $('#quiz-question').focus();stage.scrollIntoView({block:'start',behavior:'instant'});save();
 }
 function showResult(){
  const scored=scoreQuiz(data.questions,answers),portrait=data.results[scored.type];stage.hidden=true;$('#quiz-intro').hidden=true;result.hidden=false;
  $('#quiz-type').textContent=scored.type;$('#quiz-result-title').textContent=portrait.title;$('#quiz-description').textContent=portrait.description;$('#quiz-invitation').textContent=portrait.invitation;
  const labels={ie:['独处蓄力 · I','交流蓄力 · E'],ns:['具体经验 · S','联想探索 · N'],tf:['逻辑分析 · T','感受协调 · F'],pj:['计划推进 · J','灵活展开 · P']};
  const dimensions=$('#quiz-dimensions');dimensions.replaceChildren();
  scored.dimensions.forEach(d=>{const row=document.createElement('div'),line=document.createElement('div'),left=document.createElement('span'),right=document.createElement('span'),meter=document.createElement('div'),marker=document.createElement('i');row.className='quiz-dimension';line.className='dimension-labels';left.textContent=labels[d.axis][0];right.textContent=labels[d.axis][1];line.append(left,right);meter.className='dimension-track';meter.setAttribute('role','img');meter.setAttribute('aria-label',`${left.textContent}至${right.textContent}，本次位置 ${d.position} / 100`);marker.style.left=`${d.position}%`;meter.append(marker);row.append(line,meter);dimensions.append(row);});
  completed=true;save();result.focus();result.scrollIntoView({block:'start',behavior:'instant'});
 }
 start.addEventListener('click',()=>completed?showResult():showQuestion());
 $('#quiz-form').addEventListener('submit',e=>{e.preventDefault();if(!Number.isInteger(answers[index]))return;if(index<data.questions.length-1){index++;showQuestion();}else showResult();});
 $('#quiz-back').addEventListener('click',()=>{if(index>0){index--;showQuestion();}});
 $('#quiz-revise').addEventListener('click',()=>{index=0;showQuestion();});
 $('#quiz-restart').addEventListener('click',()=>{if(!confirm('重新开始将清空本次选择。继续吗？'))return;answers=Array(data.questions.length).fill(null);index=0;completed=false;showQuestion();});
 $('#quiz-copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(`我的医学人格探索：${$('#quiz-type').textContent} · ${$('#quiz-result-title').textContent}\n${$('#quiz-description').textContent}\n山海有回声 · 趣味探索\nhttps://veritas123-s.github.io/Boyi_SHSMU/explore/`);$('#quiz-copy-status').textContent='已复制，和同伴聊聊你的选择吧。';}catch{$('#quiz-copy-status').textContent='请长按选取结果文字，或截图保存。';}});
 async function load(){try{const response=await fetch('data.json?v=20261002g');if(!response.ok)throw new Error();data=await response.json();answers=Array(data.questions.length).fill(null);try{const state=JSON.parse(sessionStorage.getItem(key)||'null');if(state?.version===data.version&&Array.isArray(state.answers)&&state.answers.length===answers.length&&state.answers.every((a,i)=>a===null||(Number.isInteger(a)&&data.questions[i].choices[a]))){answers=state.answers;index=Number.isInteger(state.index)?Math.max(0,Math.min(answers.length-1,state.index)):0;completed=state.completed===true&&answers.every(Number.isInteger);}}catch{}start.disabled=false;start.textContent=completed?'查看我的结果':answers.some(Number.isInteger)?'继续探索 →':'开始探索 →';}catch{$('#quiz-load-status').textContent='暂时未能加载题目，请刷新重试。';start.textContent='等待题目加载';}}
 load();
})();
