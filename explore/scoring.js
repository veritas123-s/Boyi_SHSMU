export const AXIS_LETTERS = [['P','S'],['A','E'],['H','T'],['C','I']];
// Fixed decimal weights are symmetric across the two ends of each question.
export const WEIGHT_UNITS = [1004142,1007321,1002361,1006458,1003166,1006056,1001231,1003589,1007958,1003852,1005678,1000828,1004031,1005574,1008557,1002801,1006811,1008102,1001854,1004261,1005440,1008882,1001104,1004340];
export function validAnswer(value) { return Number.isInteger(value) && value >= 1 && value <= 4; }
export function calculate(answers, questions, profiles) {
  const totals=[0,0,0,0],weights=[0,0,0,0],counts=[0,0,0,0],firstDirections=[0,0,0,0];
  for (const q of questions) {
    const value=answers[q.id];if(!validAnswer(value))continue;
    const direction=(q.forward?1:-1)*([2,1,-1,-2][value-1]),weight=WEIGHT_UNITS[q.id-1];
    if(!Number.isInteger(weight))throw new Error('Missing question weight');
    totals[q.axis]+=direction*weight;weights[q.axis]+=weight;counts[q.axis]++;
    if(!firstDirections[q.axis]&&direction)firstDirections[q.axis]=direction;
  }
  const answered=counts.reduce((a,b)=>a+b,0);
  const scores=weights.map((w,i)=>w?50+25*totals[i]/w:null);
  const defaultCode='PATI';
  const code=answered?totals.map((total,i)=>counts[i]?AXIS_LETTERS[i][(total||firstDirections[i])<0?1:0]:defaultCode[i]).join(''):defaultCode;
  const candidates=profiles.filter(p=>p.code===code);
  if(candidates.length!==1)throw new Error('Type mapping must resolve to one profile');
  return {scores,counts,answered,valid:true,code,candidates,mode:answered?'single':'default',sufficient:answered>=20&&counts.every(n=>n>=4),weightedTotals:totals,weightSums:weights};
}
export function percentages(score) {
  if(score===null)return [null,null];
  let digits=2;
  while(score!==50&&Number(score.toFixed(digits))===50&&digits<6)digits++;
  const left=score.toFixed(digits),right=(100-Number(left)).toFixed(digits);
  return [left,right];
}
export function preference(score) {
  if(score===null)return '未作答';
  const d=Math.abs(score-50);
  return d<10?'两端接近':d<25?'稍偏这一端':d<40?'较偏这一端':'本次作答明显偏这一端';
}
