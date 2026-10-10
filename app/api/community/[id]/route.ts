import {NextResponse} from 'next/server';
import {readPosts,writePosts} from '@/lib/store';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const {id}=await params;const p=(await readPosts()).find(x=>x.id===id);if(!p)return NextResponse.json({error:'not found'},{status:404});return NextResponse.json({post:{...p,likes:p.likes.length,likedBy:undefined},likeIds:p.likes})}
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;let b:any;try{b=await req.json()}catch{return NextResponse.json({error:'bad json'},{status:400})}
 const posts=await readPosts();const p=posts.find(x=>x.id===id);if(!p)return NextResponse.json({error:'not found'},{status:404});
 const cid=String(b.clientId||'').slice(0,40);
 if(b.action==='like'){if(!cid)return NextResponse.json({error:'no client'},{status:400});const i=p.likes.indexOf(cid);if(i>=0)p.likes.splice(i,1);else p.likes.push(cid)}
 else if(b.action==='comment'){const text=String(b.text||'').trim().slice(0,500);if(!text)return NextResponse.json({error:'empty'},{status:400});p.comments.push({id:Math.random().toString(36).slice(2,9),name:String(b.name||'Guest').trim().slice(0,30)||'Guest',text,ts:Date.now()});if(p.comments.length>200)p.comments.shift()}
 else return NextResponse.json({error:'bad action'},{status:400});
 await writePosts(posts);
 return NextResponse.json({likes:p.likes.length,likeIds:p.likes,comments:p.comments});
}
