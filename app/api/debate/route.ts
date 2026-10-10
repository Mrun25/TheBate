import {NextResponse} from 'next/server';
export const runtime='nodejs';
export const maxDuration=60;
const SYS=`You write a short two-sided AI debate. Reply with ONLY valid JSON: {"statements":[8 strings],"winner":"A"|"B","scoreA":int,"scoreB":int,"reasoning":string,"strongest":string}.
Statements in order: 1 Team A opening, 2 Team B opening/counter, 3 Team A second angle, 4 Team B rebuttal, 5 Team A reinforce, 6 Team B rebuttal, 7 Team A closing, 8 Team B closing. Each statement is 1-2 sentences, max 40 words, concrete, in plain words. Team A argues FOR the motion, Team B AGAINST. Then act as an impartial judge: pick the winner by argument quality, scores 0-100 (winner higher), reasoning max 35 words, strongest = one quote from the winning side.`;
async function gemini(topic:string,key:string){
 const model=process.env.GEMINI_MODEL||'gemini-2.5-flash';
 const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{method:'POST',headers:{'content-type':'application/json','x-goog-api-key':key},body:JSON.stringify({systemInstruction:{parts:[{text:SYS}]},contents:[{role:'user',parts:[{text:`Motion: ${topic}`}]}],generationConfig:{responseMimeType:'application/json',temperature:0.8}})});
 if(!r.ok) throw new Error('gemini '+r.status);
 const j=await r.json();return JSON.parse(j.candidates[0].content.parts[0].text);
}
async function groq(topic:string,key:string){
 const r=await fetch('https://api.groq.com/openai/v1/chat/completions',{method:'POST',headers:{'content-type':'application/json',authorization:'Bearer '+key},body:JSON.stringify({model:process.env.GROQ_MODEL||'qwen/qwen3-32b',response_format:{type:'json_object'},messages:[{role:'system',content:SYS},{role:'user',content:`Motion: ${topic}`}]})});
 if(!r.ok) throw new Error('groq '+r.status);
 const j=await r.json();return JSON.parse(j.choices[0].message.content.replace(/<think>[\s\S]*?<\/think>/g,''));
}
export async function POST(req:Request){
 const {topic}=await req.json();
 if(typeof topic!=='string'||!topic.trim()||topic.length>200) return NextResponse.json({error:'bad topic'},{status:400});
 const attempts:[string,()=>Promise<any>][]=[];
 if(process.env.GEMINI_API_KEY) attempts.push(['gemini',()=>gemini(topic,process.env.GEMINI_API_KEY!)]);
 if(process.env.GROQ_API_KEY) attempts.push(['groq',()=>groq(topic,process.env.GROQ_API_KEY!)]);
 for(const [source,fn] of attempts){
  try{const o=await fn();
   if(Array.isArray(o.statements)&&o.statements.length===8&&['A','B'].includes(o.winner)) return NextResponse.json({source,...o});
  }catch{}
 }
 return NextResponse.json({source:'mock'},{status:200});
}
