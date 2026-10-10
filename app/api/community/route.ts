import {NextResponse} from 'next/server';
import {readPosts,writePosts,Post} from '@/lib/store';
export const runtime='nodejs';
const brief=(p:Post)=>({id:p.id,kind:p.kind,topic:p.topic,createdAt:p.createdAt,judge:p.judge,likes:p.likes.length,comments:p.comments.length});
export async function GET(){const posts=await readPosts();return NextResponse.json({posts:posts.sort((a,b)=>b.createdAt-a.createdAt).map(brief)})}
export async function POST(req:Request){
 let b:any;try{b=await req.json()}catch{return NextResponse.json({error:'bad json'},{status:400})}
 const topic=String(b.topic||'').trim().slice(0,200);const kind=b.kind==='thinkalong'?'thinkalong':'debate';
 const st=Array.isArray(b.statements)?b.statements.slice(0,40).map((s:any)=>({agentId:String(s.agentId||'').slice(0,12),type:String(s.type||'').slice(0,20),text:String(s.text||'').slice(0,1500)})):[];
 if(!topic||st.length<4)return NextResponse.json({error:'nothing to post'},{status:400});
 const j=b.judge||{};
 const posts=await readPosts();
 const dup=posts.find(p=>p.topic===topic&&p.kind===kind&&p.statements[0]?.text===st[0].text);if(dup)return NextResponse.json({id:dup.id,existing:true});
 const post:Post={id:Math.random().toString(36).slice(2,10),kind,topic,style:String(b.style||'balanced').slice(0,20),createdAt:Date.now(),judge:{winner:j.winner==='A'?'A':'B',a:Number(j.a)||0,b:Number(j.b)||0,reason:String(j.reason||'').slice(0,600),strongest:String(j.strongest||'').slice(0,400)},statements:st,sources:(Array.isArray(b.sources)?b.sources:[]).slice(0,6).map((x:any)=>({title:String(x.title||'').slice(0,120),url:String(x.url||'').slice(0,300)})).filter((x:any)=>/^https?:\/\//.test(x.url)),likes:[],comments:[]};
 posts.push(post);await writePosts(posts.slice(-300));
 return NextResponse.json({id:post.id});
}
