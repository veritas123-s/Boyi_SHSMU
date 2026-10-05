export const AXIS_LETTERS = [['P','S'],['A','E'],['H','T'],['C','I']];
export function validAnswer(value) { return Number.isInteger(value) && value >= 1 && value <= 5; }
export function calculate(answers, questions, profiles) {
  const totals = [0,0,0,0], counts = [0,0,0,0];
  for (const q of questions) {
    const value = answers[q.id];
    if (!validAnswer(value)) continue;
    totals[q.axis] += (q.forward ? 1 : -1) * (3 - value);
    counts[q.axis]++;
  }
  const answered = counts.reduce((a,b)=>a+b,0);
  const scores = counts.map((n,i)=>n >= 4 ? 50 + 25*totals[i]/n : null);
  const valid = answered >= 20 && counts.every(n=>n >= 4);
  const choices = scores.map((s,i)=>s === null ? [] : s >= 60 ? [AXIS_LETTERS[i][0]] : s <= 40 ? [AXIS_LETTERS[i][1]] : AXIS_LETTERS[i]);
  const mixed = choices.filter(a=>a.length===2).length;
  const candidates = valid ? profiles.filter(p=>[...p.code].every((c,i)=>choices[i].includes(c))) : [];
  return {scores, counts, answered, valid, mixed, candidates, mode: !valid ? 'incomplete' : mixed===0 ? 'single' : mixed<=2 ? 'candidates' : 'explore'};
}
export function preference(score) {
  if(score===null) return '还需要多答几题';
  const d = Math.abs(score-50);
  return d < 10 ? '两端接近' : d < 25 ? '稍偏这一端' : d < 40 ? '较偏这一端' : '本次作答明显偏这一端';
}
