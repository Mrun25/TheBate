import {put,get} from '@vercel/blob';
const PATH='community/posts.json';
export type Post={id:string;kind:'debate'|'thinkalong';topic:string;style:string;createdAt:number;judge:{winner:string;a:number;b:number;reason:string;strongest:string};statements:{agentId:string;type:string;text:string}[];sources:{title:string;url:string}[];likes:string[];comments:{id:string;name:string;text:string;ts:number}[];poolId?:string};
export async function readPosts():Promise<Post[]>{
 try{const r:any=await get(PATH,{access:'private',useCache:false});if(!r||!r.stream)return [];const t=await new Response(r.stream).text();const j=JSON.parse(t);return Array.isArray(j)?j:[]}catch{return []}
}
export async function writePosts(p:Post[]){await put(PATH,JSON.stringify(p),{access:'private',allowOverwrite:true,addRandomSuffix:false,contentType:'application/json'})}
