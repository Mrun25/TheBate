import {NextResponse} from 'next/server';
export const runtime='nodejs';
export const maxDuration=60;
const SYS=`You write a short two-sided AI debate. Reply with ONLY valid JSON: {"statements":[8 strings],"winner":"A"|"B","scoreA":int,"scoreB":int,"reasoning":string,"strongest":string}.
Statements in order: 1 Team A opening, 2 Team B opening/counter, 3 Team A second angle, 4 Team B rebuttal, 5 Team A reinforce, 6 Team B rebuttal, 7 Team A closing, 8 Team B closing. Each statement is 1-2 sentences, max 40 words, concrete, in plain words. Team A argues FOR the motion, Team B AGAINST. Then act as an impartial judge: pick the winner by argument quality, scores 0-100 (winner higher), reasoning max 35 words, strongest = one quote from the winning side.`;
async function research(topic:string):Promise<{title:string;url:string;snippet:string}[]>{
 const key=process.env.TAVILY_API_KEY; if(!key) return [];
 try{const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({query:topic,max_results:4,search_depth:'basic'})});
  if(!r.ok) return [];const j=await r.json();
  return (j.results||[]).slice(0,4).map((x:any)=>({title:String(x.title||'').slice(0,120),url:String(x.url||''),snippet:String(x.content||'').slice(0,300)}));
 }catch{return []}
}
function ctx(src:{title:string;snippet:string}[]){return src.length?'\nBackground research (use facts from it where useful, do not invent sources):\n'+src.map((x,i)=>`${i+1}. ${x.title}: ${x.snippet}`).join('\n'):''}
async function gemini(topic:string,key:string,c:string){
 const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents:[{role:'user',parts:[{text:`Motion: ${topic}${c}`}]}],generationConfig:{responseMimeType:'application/json',temperature:0.8}})});
 if(!r.ok) throw new Error('gemini '+r.status+' '+(await r.text()).slice(0,160));
 const j=await r.json();return JSON.parse(j.candidates[0].content.parts[0].text);
}
async function groq(topic:string,key:string,c:string){
 const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({model:process.env.GROQ_MODEL||'openai/gpt-oss-120b',reasoning_effort:'low',max_tokens:1800,temperature:0.7,response_format:{type:'json_object'},messages:[{role:'system',content:SYS},{role:'user',content:`Motion: ${topic}${c}`}]})});
 if(!r.ok) throw new Error('groq '+r.status+' '+(await r.text()).slice(0,200));
 const j=await r.json();return JSON.parse(j.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g,''));
}
export async function POST(req:Request){
 const {topic}=await req.json();
 if(typeof topic!=='string'||!topic.trim()||topic.length>200) return NextResponse.json({error:'bad topic'},{status:400});
 const sources=await research(topic);const c=ctx(sources);
 const attempts:[string,()=>Promise<any>][]=[];
 if(process.env.GROQ_API_KEY) attempts.push(['groq',()=>groq(topic,process.env.GROQ_API_KEY!,c)]);
 if(process.env.GEMINI_API_KEY) attempts.push(['gemini',()=>gemini(topic,process.env.GEMINI_API_KEY!,c)]);
 for(const [source,fn] of attempts){
  try{const o=await fn();
   if(Array.isArray(o.statements)&&o.statements.length===8&&['A','B'].includes(o.winner)) return NextResponse.json({source,...o,sources:sources.map(({title,url})=>({title,url}))});
   console.error('llm bad shape',source,JSON.stringify(o).slice(0,300));
  }catch(e){console.error('llm fail',source,String(e).slice(0,200))}
 }
 return NextResponse.json({source:'mock',sources:sources.map(({title,url})=>({title,url}))},{status:200});
}
