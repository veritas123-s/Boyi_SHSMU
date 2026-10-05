export const AXIS_LETTERS = [['P','S'],['A','E'],['H','T'],['C','I']];
export function validAnswer(value) { return Number.isInteger(value) && value >= 1 && value <= 5; }
export function calculate(answers, questions, profiles) {
  const totals = [0,0,0,0], counts = [0,0,0,0], firstDirections = [0,0,0,0];
  for (const q of questions) {
    const value = answers[q.id];
    if (!validAnswer(value)) continue;
    const direction = (q.forward ? 1 : -1) * (3 - value);
    totals[q.axis] += direction;
    if (!firstDirections[q.axis] && direction) firstDirections[q.axis] = direction;
    counts[q.axis]++;
  }
  const answered = counts.reduce((a,b)=>a+b,0);
  const scores = counts.map((n,i)=>n >= 4 ? 50 + 25*totals[i]/n : null);
  const valid = answered >= 20 && counts.every(n=>n >= 4);
  // A tied axis follows its first non-neutral answer in questionnaire order.
  // Entirely neutral axes use the left letter, so identical answers stay stable.
  const code = valid ? totals.map((total,i)=>AXIS_LETTERS[i][(total || firstDirections[i]) < 0 ? 1 : 0]).join('') : null;
  const candidates = valid ? profiles.filter(p=>p.code === code) : [];
  return {scores, counts, answered, valid, code, candidates, mode: valid ? 'single' : 'incomplete'};
}
export function preference(score) {
  if(score===null) return '还需要多答几题';
  const d = Math.abs(score-50);
  return d < 10 ? '两端接近' : d < 25 ? '稍偏这一端' : d < 40 ? '较偏这一端' : '本次作答明显偏这一端';
}
