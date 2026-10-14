// Pure helpers for the debate engine, extracted from app/api/debate/route.ts
// so they can be unit-tested directly. Behavior must stay identical.

const BAD=['mypaperhelp','studymode','123helpme','grademiners','paperap','essaytyper','bartleby','coursehero','brainly','chegg','scribd','studocu','ukessays','essaypro','writemyessay','samplius','ipl.org','gradesfixer','phdessay','edubirdie','essayshark','papersowl','bookrags','cliffsnotes','quizlet','academia.edu','pinterest','quora','medium.com','linkedin.com','facebook.com','reddit.com','youtube.com','tiktok.com'];
const GOOD=/(arxiv\.org|doi\.org|nature\.com|science\.org|\.edu$|\.gov$|\.ac\.[a-z]+$|brookings|pewresearch|who\.int|oecd|worldbank|nih\.gov|reuters|bbc\.|nytimes|theguardian|economist|wsj\.com|bloomberg|apnews|npr\.org|ft\.com|wikipedia\.org|hbr\.org|mckinsey|stanford|mit\.edu|ieee|acm\.org|springer|sciencedirect|wiley|jstor)/i;
export function host(u:string){try{return new URL(u).hostname.toLowerCase()}catch{return ''}}
export function goodSrc(x:{url:string}){const h=host(x.url);return !!h&&!BAD.some(b=>h.includes(b))}
export function rankGoodFirst<T extends {url:string}>(arr:T[]):T[]{return [...arr].sort((a,b)=>Number(GOOD.test(host(b.url)))-Number(GOOD.test(host(a.url))))}

const STOP=new Set(['should','would','could','about','their','there','which','these','those','have','does','will','with','that','this','from','what','when','then','than','they','your','into','more','most','been','being','were','also','just','like','only','very','much','many','some','such','because','where','while','still','even','every','people']);
export function kw(t:string){return t.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3&&!STOP.has(w))}

// Attach the best-matching source to each statement by keyword overlap.
// The model never writes URLs; links come only from real search results.
export function cites(statements:string[],src:{title:string;url:string;snippet:string}[]){
 return statements.map(st=>{const sw=new Set(kw(st));let best:any=src[0]||null,bs=0;
  for(const x of src){const xw=new Set(kw(x.title+' '+x.snippet));let n=0;sw.forEach(w=>{if(xw.has(w))n++});if(n>bs){bs=n;best=x}}
  return best&&(bs>=2||src.length)?{title:best.title,url:best.url}:null})}

const NAMES=/^\s*(Dr\.\s*)?(Kavya Sharma|Rajan Mehta|Neha Joshi|Arjun Das|Priya Rao|Leela Sen|Vikram Singh|Kabir Shah)\s*[:\-\u2013]\s*/i;
export function clean(o:any){if(Array.isArray(o?.statements))o.statements=o.statements.map((x:any)=>String(x).replace(NAMES,'').replace(/^["\u201c]|["\u201d]$/g,'').trim());return o}

// Reject debates that drift off the motion, ramble, or slide into AGI talk
// when the motion is not about AI.
export function onTopic(o:any,topic:string){const words=topic.toLowerCase().replace(/[^a-z0-9 ]/g,' ').split(/\s+/).filter(w=>w.length>3&&!['should','would','could','about','their','there','which','these','those','have','does','will'].includes(w)).map(w=>w.slice(0,5));if(!words.length)return true;const hit=o.statements.filter((t:string)=>words.some(w=>t.toLowerCase().includes(w))).length;const longest=Math.max(...o.statements.map((t:string)=>t.split(/\s+/).length));const drift=!/\b(ai|agi|artificial)\b/i.test(topic)&&o.statements.some((t:string)=>/\bAGI\b/.test(t));return hit>=3&&longest<=70&&!drift}

// Run the provider fallback chain: 2 tries per attempt, skip invalid or
// off-topic outputs, stop retrying an attempt on 429/503, move to the next.
export async function runChain(
  attempts:[string,()=>Promise<any>][],
  validate:(o:any)=>boolean,
):Promise<{source:string;o:any}|null>{
 for(const [source,fn] of attempts){
  for(let t=0;t<2;t++){
   try{const o=clean(await fn());
    const ok=Array.isArray(o?.statements)&&o.statements.length===8&&['A','B'].includes(o.winner);
    if(ok&&validate(o))return {source,o};
    console.error('llm rejected',source,t,ok?'off-topic':'bad shape',JSON.stringify(o?.statements||o).slice(0,500));
   }catch(e){console.error('llm fail',source,t,String(e).slice(0,160));if(/ (429|503)/.test(String(e)))break}
  }
 }
 return null;
}
