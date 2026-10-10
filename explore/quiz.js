import {calculate, validAnswer, preference, percentages} from './scoring.js?v=20261011-directions1';

const VERSION='20261011-directions1', STORE='boyi-path-session-v1';
const $=id=>document.getElementById(id);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let data, position=0, answers={}, supplements={}, storageAvailable=true;
const panels=['landing','quiz','review','result'];
function show(id){panels.forEach(name=>$(name).hidden=name!==id);window.scrollTo({top:0,behavior:'instant'});}
function persist(){
  try {sessionStorage.setItem(STORE,JSON.stringify({version:VERSION,position,answers,supplements}));}
  catch {storageAvailable=false;$('quiz-message').textContent='浏览器暂时无法保存进度。本次仍可答题，请保持页面打开。';}
}
function cleanSupplement(q,values){
  if(!Array.isArray(values))return [];
  const selected=[...new Set(values.filter(n=>Number.isInteger(n)&&n>=0&&n<q.choices.length))].slice(0,q.max);
  const exclusive=selected.find(n=>(q.exclusive||[]).includes(n));
  return exclusive===undefined?selected:[exclusive];
}
function restore(){
  try {
    const raw=JSON.parse(sessionStorage.getItem(STORE)||'null');
    if(!raw||![VERSION,'20261011-medstudent1'].includes(raw.version))return;
    const previousVersion=raw.version!==VERSION;
    for(const q of data.questions)if(validAnswer(raw.answers?.[q.id]))answers[q.id]=raw.answers[q.id];
    for(const q of data.supplements){
      const saved=raw.supplements?.[q.id];
      // Earlier identity answers cannot identify the new study/work stage.
      const migrated=previousVersion?(q.id===25?[]:(saved||[]).map(n=>n===3?q.exclusive[0]:n)):saved;
      supplements[q.id]=cleanSupplement(q,migrated);
    }
    position=Number.isInteger(raw.position)?Math.min(27,Math.max(0,raw.position)):0;
    if(previousVersion&&position>=24)position=24;
  } catch { /* Corrupt or unavailable storage leaves a fresh in-memory session. */ }
}
function answeredCount(){return Object.keys(answers).length;}
function current(){return position<24?data.questions[position]:data.supplements[position-24];}
function renderQuestion(){
  show('quiz');const q=current(), core=position<24;
  $('question-count').textContent=`${String(position+1).padStart(2,'0')} / 28 · ${core?'情境题':'补充题'}`;
  $('progress').value=position+1;
  const hint=core?"凭兴趣单选，可跳过。":q.max===1?'选一个最像当前情况的回答。':`最多选${q.max}项，也可以先跳过。${q.exclusive?.length?`“${q.choices[q.exclusive[0]]}”须单独选择。`:''}`;
  $('question-area').innerHTML=`<h1 id="question-title" tabindex="-1">${escape(q.prompt)}</h1><p class="question-hint">${hint}</p><div class="option-list" role="group" aria-labelledby="question-title">${q.choices.map((c,i)=>{
    const checked=core?answers[q.id]===i+1:(supplements[q.id]||[]).includes(i);
    return `<label class="option"><input type="${core||q.max===1?'radio':'checkbox'}" name="answer-${q.id}" value="${i}" ${checked?'checked':''}><span>${core?`<span class="letter">${'ABCD'[i]}</span>`:''}${escape(c)}</span></label>`;
  }).join('')}</div>`;
  $('previous').disabled=position===0;
  $('next').textContent=position===27?'看看我的配方':'下一题';
  $('next').disabled=core&&!validAnswer(answers[q.id]);
  $('skip').hidden=!core;
  $('quiz-message').textContent=storageAvailable?'':'';
  $('question-area').querySelectorAll('input').forEach(input=>input.addEventListener('change',()=>{
    const choice=Number(input.value);
    if(core){answers[q.id]=choice+1;$('next').disabled=false;}
    else {
      let selected=supplements[q.id]||[];
      if(q.max===1)selected=[choice];
      else if(input.checked){
        if((q.exclusive||[]).includes(choice))selected=[choice];
        else {selected=selected.filter(n=>!(q.exclusive||[]).includes(n));if(selected.length>=q.max){input.checked=false;$('quiz-message').textContent=`这题最多选${q.max}项。`;return;}selected=[...selected,choice];}
      } else selected=selected.filter(n=>n!==choice);
      supplements[q.id]=selected;
      $('question-area').querySelectorAll('input').forEach(el=>el.checked=selected.includes(Number(el.value)));
      $('quiz-message').textContent='';
    }
    persist();
  }));
  $('question-title').focus({preventScroll:true});persist();
}
function advance(){if(position<27){position++;renderQuestion();}else evaluate();}
function renderReview(message=''){
  show('review');const score=calculate(answers,data.questions,data.profiles);
  $('review-intro').textContent=`核心题已答${score.answered}/24。点击修改，可回到任何一道题。`;
  $('review-list').innerHTML=[...data.questions,...data.supplements].map((q,i)=>{
    const text=i<24?(validAnswer(answers[q.id])?q.choices[answers[q.id]-1]:'暂时跳过'):(supplements[q.id]||[]).map(n=>q.choices[n]).join('、')||'暂时跳过';
    return `<div class="review-item"><div><strong>Q${q.id} · ${escape(text)}</strong><p>${escape(q.prompt)}</p></div><button class="text-button" data-question="${i}" aria-label="修改第${q.id}题">修改</button></div>`;
  }).join('');
  $('review-list').querySelectorAll('button').forEach(b=>b.onclick=()=>{position=Number(b.dataset.question);renderQuestion();});
  $('review-message').textContent=message;$('review').focus({preventScroll:true});
}
function axesHtml(result){return `<section class="axis-section"><h2>你的四维配方</h2><div class="axis-grid">${data.axes.map((a,i)=>{
  const s=result.scores[i],[left,right]=percentages(s),label=result.code[i]===a.left?a.a:a.b;
  return `<div class="axis-card"><div class="axis-labels"><span>${a.left} · ${a.a}<strong class="axis-percent">${left===null?'未作答':left+'%'}</strong></span><span>${a.right} · ${a.b}<strong class="axis-percent">${right===null?'未作答':right+'%'}</strong></span></div>${s===null?'':`<div class="axis-track" role="img" aria-label="${a.a} ${left}%，${a.b} ${right}%" style="--position:${100-s}%"><span></span></div>`}<p class="axis-caption">${s===null?'这个维度暂无作答。':`${label} · ${preference(s)}<br>${result.counts[i]}题已答`}</p></div>`;
}).join('')}</div><p class="method-note">百分比表示本次已答题目的倾向得分。类型按完整精度计算。</p></section>`;}
function supplementalHtml(){
  const items=data.supplements.map(q=>({q,selected:(supplements[q.id]||[]).map(n=>q.choices[n])})).filter(x=>x.selected.length);
  if(!items.length)return '';
  const stage=(supplements[25]||[])[0];
  const trainingByStage=[
    '先用课程、教学病例和公开科普认识各方向。',
    '选一个感兴趣的科室或实验室，在老师指导下做小任务。',
    '轮转时观察日常工作，把有兴趣和觉得吃力的环节记下来，再和带教聊聊。',
    '结合现有临床经验，向目标科室了解培养与岗位要求。',
    '结合课题和导师建议，了解临床研究、机制研究或医工方向的实际分工。',
    '对照目标岗位要求，核对需要补充的训练与经验。',
    '先从公开课程、科普和跨学科项目了解医学工作。'
  ];
  const training=trainingByStage[stage]||'结合自己的阶段和实际经历，向相关团队了解下一步训练要求。';
  return `<section class="supplement-result"><h2>把配方放进你的生活</h2>${items.map(({q,selected})=>`<p><strong>${q.id===25?'当前阶段':q.id===26?'已经体验':q.id===27?'选工作时在意':'想了解的方向'}：</strong>${escape(selected.join('、'))}</p>`).join('')}<p>${training}</p></section>`;
}
function placesHtml(p){return `<section class="profile-section type-places"><h2>可以优先了解的科室与工作方向</h2><div class="axis-grid">${p.places.map(x=>`<div class="axis-card"><h3>${escape(x.name)}</h3><p class="place-work">${escape(x.work)}</p></div>`).join('')}</div><p class="method-note">这里按工作特点提供探索线索，结合实际体验和培养要求再判断。研究岗位和研究所按方向列出，具体设置以各单位为准。</p>${p.places.some(x=>x.kind==='enterprise')?`<p class="method-note enterprise-declaration">${escape(data.enterpriseDeclaration)}</p>`:''}</section>`;}
function fullProfile(p){return `${placesHtml(p)}<section class="profile-section"><h2>值得试试的职业道路</h2><div class="career-grid">${p.careers.map(([a,b,c])=>`<div class="career-card"><span>${escape(a)}</span><h3>${escape(b)}</h3><p><strong>了解重点：</strong>${escape(c)}</p></div>`).join('')}</div></section><section class="profile-section"><h2>认识一位职业榜样</h2><div class="person-block"><figure><a href="photos/${p.word}-original.jpg?v=${VERSION}" target="_blank" rel="noopener"><img src="photos/${p.word}.webp?v=${VERSION}" alt="${escape(p.person)}真实照片" width="640" height="800" loading="lazy"></a><figcaption>点击查看高清图 · <a href="credits/#${p.word}">照片来源与署名</a></figcaption></figure><div><p class="path-eyebrow">职业榜样</p><h3>${escape(p.person)}</h3><p>${escape(p.fact)}</p><a href="${p.source}" target="_blank" rel="noopener">了解人物故事 ↗</a></div></div></section><section class="profile-section"><h2>把喜欢，放进真实工作里</h2><p>${escape(p.friction)}</p><a href="types/${p.word.toLowerCase()}/" class="text-button">读完整的角色介绍 ↗</a></section>`;}
function evaluate(){
  const score=calculate(answers,data.questions,data.profiles);
  show('result');let content='';
  const resultNote=score.mode==='default'?'全部核心题已跳过，本次默认配方为RUSH。':score.answered<24?`核心题已答${score.answered}/24，本次配方依据已答题目生成。${score.counts.includes(0)?'未答维度使用默认设置，暂不显示百分比。':''}`:'';
  const p=score.candidates[0];$('result').style.setProperty('--accent',p.color);
  content=`${resultNote?`<p class="method-note result-note">${resultNote}</p>`:''}<div class="result-feature"><div><p class="path-eyebrow">你的医途配方 · ${p.groupName}</p><div class="result-word">${p.word}</div><h1>${p.name}</h1><p class="profile-tag">${escape(p.tag)}</p><p>${escape(p.traits)}</p></div><img src="characters/${p.word}.webp" width="480" height="540" alt="${p.name}医学角色插画"></div>${axesHtml(score)}${supplementalHtml()}<div class="day-box"><span>工作的一天</span><p>${escape(p.routine)}</p></div>${fullProfile(p)}`;
  if(p.photoNote)content=content.replace('<figcaption>','<figcaption>'+escape(p.photoNote)+'<br>');
  $('result').innerHTML=content+`<div class="share-actions"><button id="edit-answers" class="btn quiet">查看 / 修改答案</button><button id="print-result" class="btn quiet">保存为PDF</button><button id="copy-result" class="btn primary">复制我的配方</button><button id="restart" class="text-button">重新开始</button></div><p id="share-message" class="share-message" role="status"></p><p class="method-note">将本次配方和实际体验、培养条件一起看，具体计分见<a href="about/">题目与计分</a>。</p>`;
  $('edit-answers').onclick=()=>renderReview();$('print-result').onclick=()=>window.print();
  $('copy-result').onclick=async()=>{
    const names=`${p.word} ${p.name}`;
    const lines=data.axes.map((a,i)=>{const [left,right]=percentages(score.scores[i]);return left===null?`${a.a}/${a.b}：未作答`:`${a.a} ${left}% / ${a.b} ${right}%`;});
    const link=new URL(`types/${p.word.toLowerCase()}/`,location.href).href;
    const text=`我的医途配方：${names}\n${resultNote?resultNote+'\n':''}${lines.join('\n')}\n一起看看你的医途搭子：${link}`;
    try{await navigator.clipboard.writeText(text);$('share-message').textContent='已复制，可以发给同学一起聊聊。';}
    catch{$('share-message').textContent='可以长按下方文字复制。';const area=document.createElement('textarea');area.value=text;area.setAttribute('aria-label','我的配方分享文字');area.style.cssText='width:100%;min-height:140px;font-size:16px';$('share-message').after(area);area.select();}
  };
  $('restart').onclick=()=>{
    if(!confirm('重新开始会清除本轮答案。要开始新的一轮吗？'))return;
    answers={};supplements={};position=0;try{sessionStorage.removeItem(STORE);}catch{}
    $('resume-note').hidden=true;$('start').innerHTML='调出我的配方 ↗';renderQuestion();
  };
  $('result').focus({preventScroll:true});persist();
}
async function init(){
  try{const response=await fetch(`data.json?v=${VERSION}`);if(!response.ok)throw new Error(`data ${response.status}`);data=await response.json();if(data.version!==VERSION||data.profiles.length!==16||data.questions.length!==24)throw new Error('version mismatch');}
  catch{const error=document.createElement('p');error.className='empty-result';error.textContent='题目暂时没加载好，请刷新后再试。下面的16型介绍可以先逛逛。';$('start').before(error);$('start').disabled=true;return;}
  restore();
  if(answeredCount()){$('start').textContent='继续我的配方 ↗';$('resume-note').hidden=false;$('resume-note').textContent=`上次已答${answeredCount()}/24道核心题，进度还在。`;}
  $('start').onclick=renderQuestion;$('previous').onclick=()=>{if(position>0){position--;renderQuestion();}};
  $('next').onclick=advance;$('skip').onclick=()=>{delete answers[current().id];persist();advance();};
  $('exit').onclick=()=>{persist();show('landing');$('start').textContent='继续我的配方 ↗';$('resume-note').hidden=false;$('resume-note').textContent=`已答${answeredCount()}/24道核心题，下次从这里继续。`;};
  $('open-review').onclick=()=>renderReview();$('review-return').onclick=renderQuestion;$('evaluate').onclick=evaluate;
  document.querySelectorAll('.group-filters button').forEach(button=>button.onclick=()=>{
    document.querySelectorAll('.group-filters button').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
    document.querySelectorAll('#all-types .type-card').forEach((card,i)=>card.hidden=button.dataset.group!=='all'&&data.profiles[i].group!==Number(button.dataset.group));
  });
  if(!answeredCount())$('start').innerHTML='调出我的配方 <span aria-hidden="true">↗</span>';
  $('start').disabled=false;
  if(location.hash==='#start')renderQuestion();
}
init();
