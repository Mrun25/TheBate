import {seed} from './data';
// Topic-aware offline fallback. Not AI research: structured arguments built around the chosen motion, labelled as offline in the UI.
const pick=<T,>(arr:T[],n:number)=>arr[(n>>>0)%arr.length];
export function subjectOf(topic:string){return topic.trim().replace(/[?!.]+$/,'');}
export function offlineDebate(topic:string){
 const m=subjectOf(topic),h=seed(topic),q=`"${m}"`;
 const S:string[]=[
  pick([`Let's be specific about ${q}. If we get this right, real people benefit in ways we can already point to. I'll argue yes, and I'll show where.`,`Start with the people ${q} touches. Most of them want a straight answer, and the honest one is yes, with some conditions.`,`${q}: my answer is yes. Not because it's fashionable, but because the alternative has a cost we rarely count.`],h),
  pick([`That's the optimistic version. Ask what breaks when ${q} meets messy reality: money, habits, people who weren't consulted. I say no, not yet.`,`Notice what was skipped: who pays, and who gets left out. On ${q}, the burden of proof sits with the yes side, and it hasn't been met.`,`Confident, but vague. Name one concrete case where ${q} worked without hurting someone. I'll wait.`],h>>>2),
  pick([`Picture the day after ${q} becomes real. Small things change first: routines, prices, who shows up. Those early signs are mostly good.`,`Look at what happens in places that already tried something like ${q}. Not perfect, but the trend line points my way.`,`Forget theory for a second. Talk to anyone living with the problem behind ${q} and ask what they'd choose.`],h>>>4),
  pick([`Anecdotes aren't evidence. A few good stories about ${q} don't tell us what happens at scale, or who quietly loses.`,`Here's the real question under ${q}: are we solving the problem or just moving it somewhere less visible?`,`Fair story, wrong sample. Success stories get repeated; the failures around ${q} rarely make the news.`],h>>>6),
  pick([`Fine, I'll give you the risk. But a risk you can manage isn't a reason to refuse. Pilot ${q}, measure it, and adjust.`,`You're right that it isn't free. Still, doing nothing about ${q} isn't free either, and that bill keeps growing.`,`Granted, the downside is real. That's an argument for doing ${q} carefully, not for not doing it.`],h>>>8),
  pick([`"Carefully" is carrying a lot of weight there. Who audits it, who can stop it, and what happens when the pilot for ${q} just becomes permanent?`,`Notice the retreat from "yes" to "yes, carefully". That's close to my position on ${q}: not until the safeguards exist.`,`Pilots have a way of becoming policy. Before ${q} goes anywhere, I want the exit plan in writing.`],h>>>10),
  pick([`Here's where we land. ${q} is workable if it's built in stages with honest measurement. Yes, the other side's caution is fair. It's a reason to start smart, not to stall.`,`I'll concede the uncertainty. But on ${q}, waiting is also a decision, and the people affected are already living with it. Start, measure, fix.`,`Grant them the caution about ${q}. My answer holds anyway: a staged, reversible start beats another year of arguing.`],h>>>12),
  pick([`I'll grant that progress is possible. But on ${q}, "start and fix later" shifts the risk onto people who never agreed to it. Prove it's safe first, then yes.`,`They've been honest, and I respect it. Still, ${q} isn't ready: the safeguards are promises, not mechanisms. Not yet.`,`One fair point to my opponents: doing nothing has costs. But ${q} done badly costs more, and it's harder to undo.`],h>>>14)
 ];
 const winner:'A'|'B'=(h%100)<50?'A':'B';
 return {statements:S,winner,scoreA:winner==='A'?68+(h%9):52+(h%9),scoreB:winner==='B'?68+(((h>>>3)>>>0)%9):52+((h>>>3)%9),
  reasoning:`Offline script, no live AI. On ${q}, ${winner==='A'?'Team A made the more concrete case for a staged start':'Team B pressed harder on safeguards and who carries the risk'}.`,
  strongest:winner==='A'?S[6].split('. ').slice(-1)[0]:S[7].split('. ').slice(-1)[0]};
}
