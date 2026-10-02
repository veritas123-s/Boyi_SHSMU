(function(root){
 'use strict';
 function scoreQuiz(questions,answers){
  if(answers.length!==questions.length)throw new Error('请完成全部情境。');
  const sums={ie:0,ns:0,tf:0,pj:0},counts={ie:0,ns:0,tf:0,pj:0};
  questions.forEach((q,i)=>{const a=answers[i];if(!Number.isInteger(a)||!q.choices[a])throw new Error('请完成全部情境。');sums[q.axis]+=q.choices[a].score;counts[q.axis]++;});
  const type=(sums.ie>24?'E':'I')+(sums.ns<24?'S':'N')+(sums.tf<24?'T':'F')+(sums.pj<27?'J':'P');
  return {type,dimensions:['ie','ns','tf','pj'].map(axis=>({axis,score:sums[axis],count:counts[axis],position:Math.round((sums[axis]-counts[axis])/(counts[axis]*4)*100)}))};
 }
 if(typeof module==='object'&&module.exports)module.exports={scoreQuiz};else root.scoreQuiz=scoreQuiz;
})(globalThis);
