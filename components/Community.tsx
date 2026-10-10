'use client';
import {useEffect,useState} from 'react';
import {usePathname,useRouter} from 'next/navigation';
import {agents} from '@/lib/data';
type Brief={id:string;kind:'debate'|'thinkalong';topic:string;createdAt:number;judge:{winner:string;a:number;b:number};likes:number;comments:number};
function cid(){let c=localStorage.getItem('thebate-client');if(!c){c=Math.random().toString(36).slice(2,12);localStorage.setItem('thebate-client',c)}return c}
function ago(t:number){const s=(Date.now()-t)/1000;return s<60?'just now':s<3600?Math.floor(s/60)+'m ago':s<86400?Math.floor(s/3600)+'h ago':Math.floor(s/86400)+'d ago'}
function Card({p,open}:{p:Brief;open:(id:string)=>void}){return <article className="debate-card"><div className="card-body"><span className="eyebrow">{p.kind==='debate'?'DEBATE':'THINK-ALONG'} / {ago(p.createdAt)}</span><h2>{p.topic}</h2><div className="verdict" style={{margin:'10px 0',padding:'10px 12px'}}><p className="eyebrow gold-text">JUDGE VERDICT</p><b>Team {p.judge.winner} wins</b> <small>A {p.judge.a} - B {p.judge.b}</small></div><div className="card-bottom"><span>♥ {p.likes} · 💬 {p.comments}</span><button onClick={()=>open(p.id)}>View full {p.kind==='debate'?'debate':'think-along'} →</button></div></div></article>}
function Detail({id,back}:{id:string;back:()=>void}){
 const [d,setD]=useState<any>(null),[likeIds,setLikeIds]=useState<string[]>([]),[cm,setCm]=useState<any[]>([]),[name,setName]=useState(''),[text,setText]=useState(''),[copied,setCopied]=useState(false),[err,setErr]=useState('');
 useEffect(()=>{fetch('/api/community/'+id).then(r=>r.ok?r.json():Promise.reject()).then(o=>{setD(o.post);setLikeIds(o.likeIds||[]);setCm(o.post.comments||[])}).catch(()=>setErr('This post could not be found.'))},[id]);
 if(err)return <div className="gallery-note">{err} <button className="crumb" onClick={back}>Back to community</button></div>;
 if(!d)return <div className="gallery-note">Loading...</div>;
 const me=typeof window!=='undefined'?cid():'';const liked=likeIds.includes(me);
 async function like(){const r=await fetch('/api/community/'+id,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'like',clientId:cid()})});if(r.ok){const o=await r.json();setLikeIds(o.likeIds)}}
 async function comment(){if(!text.trim())return;const r=await fetch('/api/community/'+id,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action:'comment',name,text})});if(r.ok){const o=await r.json();setCm(o.comments);setText('')}}
 function share(){navigator.clipboard?.writeText(location.origin+'/community/'+id).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),1800)})}
 return <div style={{maxWidth:820,margin:'0 auto',textAlign:'left'}}>
  <button className="crumb" onClick={back}>← COMMUNITY</button>
  <p className="eyebrow">{d.kind==='debate'?'DEBATE':'THINK-ALONG'}</p><h1>{d.topic}</h1>
  <div className="verdict" style={{margin:'14px 0'}}><p className="eyebrow gold-text">⚖ THE JUDGE'S VERDICT</p><h2>Team {d.judge.winner} takes the floor.</h2><p>Team A {d.judge.a} / Team B {d.judge.b}</p>{d.judge.reason&&<p>{d.judge.reason}</p>}{d.judge.strongest&&<blockquote>"{d.judge.strongest}"</blockquote>}</div>
  <div style={{display:'flex',gap:10,margin:'10px 0'}}><button className="outline" onClick={like}>{liked?'♥ Liked':'♡ Like'} · {likeIds.length}</button><button className="outline" onClick={share}>{copied?'Link copied':'Share link'}</button></div>
  <h3>Full transcript</h3>
  {d.statements.map((s:any,i:number)=>{const a=agents.find(x=>x.id===s.agentId);return <article key={i} className="statement" style={{margin:'10px 0'}}><div className="statement-head"><div><strong>{a?.name||'Viewer'}</strong><span>{a?.role||'From the audience'}{a?' · Team '+a.team:''}</span></div></div><p>{s.text}</p></article>})}
  {d.sources?.length>0&&<><h3>Research sources</h3><ul>{d.sources.map((x:any)=><li key={x.url}><a href={x.url} target="_blank" rel="noreferrer">{x.title||x.url}</a></li>)}</ul></>}
  <h3>Comments ({cm.length})</h3>
  {cm.map(c=><p key={c.id}><b>{c.name}</b> <small>{ago(c.ts)}</small><br/>{c.text}</p>)}
  <div style={{display:'grid',gap:8,margin:'12px 0 40px'}}><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" maxLength={30} aria-label="Your name"/><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Add a comment..." maxLength={500} aria-label="Comment"/><button className="begin" disabled={!text.trim()} onClick={comment}>POST COMMENT</button></div>
 </div>
}
export default function Community({onNew}:{onNew:()=>void}){
 const [posts,setPosts]=useState<Brief[]|null>(null),pathname=usePathname(),router=useRouter();const m0=pathname.match(/^\/community\/([a-z0-9]+)/);const id=m0?m0[1]:null;
 useEffect(()=>{fetch('/api/community').then(r=>r.json()).then(o=>setPosts(o.posts||[])).catch(()=>setPosts([]))},[pathname]);
 function open(i:string){router.push('/community/'+i)}
 function back(){router.push('/community')}
 if(id)return <section className="gallery"><Detail id={id} back={back}/></section>;
 const sec=(k:'debate'|'thinkalong',title:string)=>{const l=(posts||[]).filter(p=>p.kind===k);return <div style={{margin:'26px 0'}}><h2 className="eyebrow" style={{fontSize:14}}>{title} ({l.length})</h2>{l.length===0?<div className="gallery-note">Nothing here yet. Finish a {k==='debate'?'debate':'think-along'} and hit "Post to community".</div>:<div className="gallery-grid">{l.map(p=><Card key={p.id} p={p} open={open}/>)}</div>}</div>};
 return <section className="gallery"><p className="eyebrow">THE DEBATE HOUSE / COMMUNITY</p><h1>Debates and think-alongs from the community.</h1><p className="subtitle">Every post has the judge's verdict, the full transcript, likes and comments.</p>{posts===null?<div className="gallery-note">Loading...</div>:<>{sec('debate','DEBATES')}{sec('thinkalong','THINK-ALONGS')}</>}<button className="new-button" onClick={onNew}>Start a debate</button></section>
}
