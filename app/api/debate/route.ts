import {NextResponse} from 'next/server';
export const runtime='nodejs';
export const maxDuration=60;
const PERSONAS=`Speakers in order (statement number: persona and how they talk):
1 Dr. Kavya Sharma (Team A, cognitive scientist): precise and curious, leans on evidence, opens the case.
2 Rajan Mehta (Team B, AI safety analyst): blunt, asks "what breaks?", answers statement 1 directly.
3 Neha Joshi (Team A, tech journalist): vivid, short sentences, real-world scenes and examples.
4 Arjun Das (Team B, philosopher): reframes the question, one pointed question, dry humour.
5 Dr. Priya Rao (Team A, researcher): concedes a small point, then pushes harder with a specific.
6 Dr. Leela Sen (Team B, academic): evidence-first skeptic, calls out the weakest claim so far.
7 Vikram Singh (Team A, systems engineer): practical, trade-offs, numbers, closing for A.
8 Kabir Shah (Team B, policy researcher): consequences for ordinary people, closing for B.
Each persona argues from their own expertise APPLIED TO THE MOTION, even if the motion is outside their field (an engineer talks logistics, a philosopher talks values).`;
const STYLES:Record<string,string>={balanced:'Tone: thoughtful but lively, like a good podcast panel.',heated:'Tone: heated and combative but respectful. People interrupt, push back, show irritation.',academic:'Tone: rigorous seminar. Careful claims, precise terms, still readable.',playful:'Tone: witty and light, jokes allowed, but every point still lands.'};
const OPENERS=['a concrete everyday scene','a surprising fact from the research','a blunt one-line claim','a pointed question','a short story about one person affected'];
function system(style:string){return `You write a debate that sounds like real people talking, not an essay. Reply with ONLY valid JSON: {"statements":[8 strings],"winner":"A"|"B","scoreA":int,"scoreB":int,"reasoning":string,"strongest":string}.
Team A ALWAYS argues that the motion is TRUE (the answer is YES, do it). Team B ALWAYS argues it is FALSE (the answer is NO, don't). Check each statement: odd numbers = Team A = pro-motion, even numbers = Team B = anti-motion. Never swap sides. 3 rounds: statements 1-2 openings, 3-6 middle, 7-8 closings.
${PERSONAS}
Example of the VOICE only (different motion, do not reuse its words), motion 'Should schools start later?': 1 (A) "My daughter falls asleep on the bus at 7:10. Teenage body clocks run late, and we keep scheduling against biology." 2 (B) "Biology's real, but later start means later dismissal. Tell the kid with a 4pm job or the coach with no daylight left."
Hard rules:
- Stay strictly on the motion. Use its own key nouns and specifics in every statement. Never drift to other topics (do not mention AGI or AI unless the motion is about it).
- 1 to 3 sentences, max 45 words each. Plain words, contractions, natural rhythm.
- Statements 2,4,6,8 must answer the exact claim just made before them (echo a few of its words). Statements 3,5,7 add a new angle or build on a teammate.
- Every statement opens differently. No two share a first word or sentence shape. Use real examples, numbers or named places where the research gives them.
- At least three statements use a specific fact from the research, said naturally ("A Guardian piece argued...") and never invented.
- Closings 7 and 8 each concede one fair point from the other side, then land their strongest line.
- Speak in FIRST PERSON as the speaker. Never write your own name or describe yourself or others in third person (no 'Leela points out'). Address the other side directly (you, your).
- Numbers: only use figures that appear in the research below. If the research has none, use no numbers at all. Never invent statistics, quotes or studies.
- Use single quotes inside statements, never double quotes (JSON safety).
- Banned phrases: "it's important to note", "in conclusion", "delve", "landscape", "tapestry", "multifaceted", "at the end of the day", "double-edged sword", "game-changer", "nuanced".
${STYLES[style]||STYLES.balanced}
Then act as an impartial judge: pick the winner by argument quality, scores 0-100 (winner higher), reasoning max 35 words in a natural voice, strongest = one real quote copied from the winning side.`}
async function research(topic:string):Promise<{title:string;url:string;snippet:string}[]>{
 const key=process.env.TAVILY_API_KEY; if(!key) return [];
 try{const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({query:topic,max_results:6,search_depth:'basic'})});
  if(!r.ok) return [];const j=await r.json();
  return (j.results||[]).slice(0,6).map((x:any)=>({title:String(x.title||'').slice(0,120),url:String(x.url||''),snippet:String(x.content||'').slice(0,300)}));
 }catch{return []}
}

const STOP=new Set(['should','would','could','about','their','there','which','these','those','have','does','will','with','that','this','from','what','when','then','than','they','your','into','more','most','been','being','were','also','just','like','only','very','much','many','some','such','because','where','while','still','even','every','people']);
function kw(t:string){return t.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w))}
async function papers(topic:string):Promise<{title:string;url:string;snippet:string}[]>{
 const ws=Array.from(new Set(kw(topic))).slice(0,4);if(!ws.length)return [];
 for(const op of ['AND','OR']){
  try{const q=ws.map(w=>'all:'+encodeURIComponent(w)).join('+'+op+'+');
   const r=await fetch('https://export.arxiv.org/api/query?search_query='+q+'&max_results=4&sortBy=relevance',{signal:AbortSignal.timeout(4000)});
   if(!r.ok)continue;const x=await r.text();
   const out=[...x.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(m=>{const e=m[1];const id=(e.match(/<id>(https?:\/\/arxiv\.org\/abs\/[^<]+)<\/id>/)||[])[1];const ti=(e.match(/<title>([\s\S]*?)<\/title>/)||[])[1];const su=(e.match(/<summary>([\s\S]*?)<\/summary>/)||[])[1];return id&&ti?{title:'[arXiv] '+ti.replace(/\s+/g,' ').trim().slice(0,120),url:id.replace('http://','https://'),snippet:(su||'').replace(/\s+/g,' ').slice(0,300)}:null}).filter(Boolean) as any[];
   if(out.length)return out;
  }catch{}
 }
 return [];
}
function cites(statements:string[],src:{title:string;url:string;snippet:string}[]){
 return statements.map(st=>{const sw=new Set(kw(st));let best:any=src[0]||null,bs=0;
  for(const x of src){const xw=new Set(kw(x.title+' '+x.snippet));let n=0;sw.forEach(w=>{if(xw.has(w))n++});if(n>bs){bs=n;best=x}}
  return best&&(bs>=2||src.length)?{title:best.title,url:best.url}:null})}
function ctx(src:{title:string;snippet:string}[]){return src.length?'\nBackground research (use facts from it where useful, do not invent sources):\n'+src.map((x,i)=>`${i+1}. ${x.title}: ${x.snippet}`).join('\n'):''}
async function gemini(topic:string,key:string,c:string,style:string,mdl?:string){
 const model=mdl||process.env.GEMINI_MODEL||'gemini-3.5-flash';
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:system(style)}]},contents:[{role:'user',parts:[{text:`Motion: ${topic}\nMake every statement about this motion specifically. Open with ${OPENERS[Math.floor(Math.random()*OPENERS.length)]}. Variation seed ${Math.random().toString(36).slice(2,8)}.${c}`}]}],generationConfig:{responseMimeType:'application/json',temperature:0.85}})});
 if(!r.ok) throw new Error('gemini '+r.status+' '+(await r.text()).slice(0,160));
 const j=await r.json();return JSON.parse(j.candidates[0].content.parts[0].text);
}
async function groq(topic:string,key:string,c:string,style:string,model?:string){
 const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({model:model||process.env.GROQ_MODEL||'openai/gpt-oss-120b',reasoning_effort:'low',max_tokens:3500,temperature:0.9,response_format:{type:'json_schema',json_schema:{name:'debate',strict:true,schema:{type:'object',additionalProperties:false,required:['statements','winner','scoreA','scoreB','reasoning','strongest'],properties:{statements:{type:'array',items:{type:'string'},minItems:8,maxItems:8},winner:{type:'string',enum:['A','B']},scoreA:{type:'integer'},scoreB:{type:'integer'},reasoning:{type:'string'},strongest:{type:'string'}}}}},messages:[{role:'system',content:system(style)},{role:'user',content:`Motion: ${topic}\nMake every statement about this motion specifically. Open with ${OPENERS[Math.floor(Math.random()*OPENERS.length)]}. Variation seed ${Math.random().toString(36).slice(2,8)}.${c}`}]})});
 if(!r.ok){const tx=await r.text();try{const fg=JSON.parse(tx)?.error?.failed_generation;if(fg){const m=String(fg).match(/\{[\s\S]*\}/);if(m)return JSON.parse(m[0])}}catch{}throw new Error('groq '+r.status+' '+tx.slice(0,200))}
 const j=await r.json();return JSON.parse(j.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g,''));
}
const NAMES=/^\s*(Dr\.\s*)?(Kavya Sharma|Rajan Mehta|Neha Joshi|Arjun Das|Priya Rao|Leela Sen|Vikram Singh|Kabir Shah)\s*[:\-\u2013]\s*/i;
function clean(o:any){if(Array.isArray(o?.statements))o.statements=o.statements.map((x:any)=>String(x).replace(NAMES,'').replace(/^["\u201c]|["\u201d]$/g,'').trim());return o}
function onTopic(o:any,topic:string){const words=topic.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3&&!['should','would','could','about','their','there','which','these','those','have','does','will'].includes(w)).map(w=>w.slice(0,5));if(!words.length)return true;const hit=o.statements.filter((t:string)=>words.some(w=>t.toLowerCase().includes(w))).length;const longest=Math.max(...o.statements.map((t:string)=>t.split(/\s+/).length));const drift=!/\b(ai|agi|artificial)\b/i.test(topic)&&o.statements.some((t:string)=>/\bAGI\b/.test(t));return hit>=3&&longest<=70&&!drift}
export async function POST(req:Request){
 const {topic,style:st}=await req.json();const style=typeof st==='string'&&st in STYLES?st:'balanced';
 if(typeof topic!=='string'||!topic.trim()||topic.length>200) return NextResponse.json({error:'bad topic'},{status:400});
 const [web,pap]=await Promise.all([research(topic),papers(topic)]);const sources=[...web,...pap];const c=ctx(sources);
 const attempts:[string,()=>Promise<any>][]=[];
 if(process.env.GEMINI_API_KEY) attempts.push(['gemini',()=>gemini(topic,process.env.GEMINI_API_KEY!,c,style)]);
 if(process.env.GEMINI_API_KEY) attempts.push(['gemini-lite',()=>gemini(topic,process.env.GEMINI_API_KEY!,c,style,'gemini-3.1-flash-lite')]);
 if(process.env.GROQ_API_KEY) attempts.push(['groq',()=>groq(topic,process.env.GROQ_API_KEY!,c,style)]);
 if(process.env.GROQ_API_KEY) attempts.push(['groq-20b',()=>groq(topic,process.env.GROQ_API_KEY!,c,style,'openai/gpt-oss-20b')]);
 for(const [source,fn] of attempts){
  for(let t=0;t<2;t++){
   try{const o=clean(await fn());
    const ok=Array.isArray(o?.statements)&&o.statements.length===8&&['A','B'].includes(o.winner);
    if(ok&&onTopic(o,topic)) return NextResponse.json({source,...o,cites:cites(o.statements,sources),sources:sources.map(({title,url})=>({title,url}))});
    console.error('llm rejected',source,t,ok?'off-topic':'bad shape',JSON.stringify(o?.statements||o).slice(0,500));
   }catch(e){console.error('llm fail',source,t,String(e).slice(0,160))}
  }
 }
 return NextResponse.json({source:'mock',sources:sources.map(({title,url})=>({title,url}))},{status:200});
}
