import {NextResponse} from 'next/server';
import {rateLimit,clientIp} from '@/lib/ratelimit';
export const runtime='nodejs';
export const maxDuration=40;
type Src={title:string;url:string;snippet:string};
async function research(q:string):Promise<Src[]>{
 const key=process.env.TAVILY_API_KEY;if(!key)return [];
 try{const r=await fetch('https://api.tavily.com/search',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({query:q,max_results:3,search_depth:'basic'})});
  if(!r.ok)return [];const j=await r.json();
  return (j.results||[]).slice(0,3).map((x:any)=>({title:String(x.title||'').slice(0,120),url:String(x.url||''),snippet:String(x.content||'').slice(0,300)}));
 }catch{return []}
}
function prompts(topic:string,q:string,name:string,role:string,recent:string[],src:Src[]){
 const system=`You are ${name}, a ${role}, taking part in a live debate. A viewer just asked you a question. Answer THEIR question directly in the first sentence, then add one specific supporting point. 2 to 4 sentences, plain spoken first person, no lists, no filler, no greeting. Use facts from the research when they help; never invent statistics or sources. If the question is not about the debate, still answer it briefly and honestly, then tie it back to the motion in one clause.`;
 const user=`Debate motion: ${topic}\nRecent lines:\n${recent.slice(-4).map(x=>'- '+x.slice(0,260)).join('\n')}\n${src.length?'Research:\n'+src.map((x,i)=>`${i+1}. ${x.title}: ${x.snippet}`).join('\n')+'\n':''}\nViewer question: ${q}`;
 return {system,user};
}
async function groq(key:string,p:{system:string;user:string}){
 const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({model:process.env.GROQ_MODEL||'openai/gpt-oss-120b',reasoning_effort:'low',max_tokens:700,temperature:0.7,messages:[{role:'system',content:p.system},{role:'user',content:p.user}]})});
 if(!r.ok)throw new Error('groq '+r.status);const j=await r.json();return String(j.choices[0].message.content||'').replace(/<think>[\s\S]*?<\/think>/g,'').trim();
}
async function gemini(key:string,p:{system:string;user:string}){
 const model=process.env.GEMINI_MODEL||'gemini-3.5-flash';
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:p.system}]},contents:[{role:'user',parts:[{text:p.user}]}],generationConfig:{temperature:0.7}})});
 if(!r.ok)throw new Error('gemini '+r.status);const j=await r.json();return String(j.candidates[0].content.parts[0].text||'').trim();
}
export async function POST(req:Request){
 const rl=rateLimit('ask|'+clientIp(req),30,3600000);
 if(!rl.ok)return NextResponse.json({error:'rate limited, try again later'},{status:429,headers:{'retry-after':String(rl.retryAfter)}});
 let b:any;try{b=await req.json()}catch{return NextResponse.json({error:'bad json'},{status:400})}
 const topic=String(b.topic||'').slice(0,200),q=String(b.question||'').trim().slice(0,500),name=String(b.name||'Dr. Kavya Sharma').slice(0,60),role=String(b.role||'Cognitive scientist').slice(0,60);
 const recent=Array.isArray(b.recent)?b.recent.map((x:any)=>String(x)).slice(-6):[];
 if(!q)return NextResponse.json({error:'no question'},{status:400});
 const src=await research(`${q} ${topic}`.slice(0,300));const p=prompts(topic,q,name,role,recent,src);
 const attempts:[string,()=>Promise<string>][]=[];
 if(process.env.GEMINI_API_KEY)attempts.push(['gemini',()=>gemini(process.env.GEMINI_API_KEY!,p)]);
 if(process.env.GROQ_API_KEY)attempts.push(['groq',()=>groq(process.env.GROQ_API_KEY!,p)]);
  for(const [source,fn] of attempts){for(let t=0;t<2;t++){try{const a=await fn();if(a.length>20)return NextResponse.json({source,answer:a,sources:src.map(({title,url})=>({title,url}))})}catch(e){console.error('ask fail',source,String(e).slice(0,120))}}}
 const s=src[0];
 const answer=s?`Short answer from what I can find: ${s.snippet.replace(/\s+/g,' ').slice(0,240)}... (${s.title}). The live AI engine is busy, so that is a quick research-only reply.`:`I can't reach the live engine right now, so I can't give you a researched answer to that. Try asking again in a few seconds.`;
 return NextResponse.json({source:'research',answer,sources:src.map(({title,url})=>({title,url}))});
}
