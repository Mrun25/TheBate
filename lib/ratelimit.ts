// Per-instance in-memory rate limiting. On serverless each instance keeps
// its own bucket, so this is a quota guard, not a hard global limit - it
// still stops a single client from burning the free-tier AI budget.
const BUCKETS=new Map<string,number[]>();

export function rateLimit(key:string,limit:number,windowMs:number):{ok:boolean;retryAfter:number}{
 const now=Date.now();const arr=(BUCKETS.get(key)||[]).filter(t=>now-t<windowMs);
 if(arr.length>=limit)return{ok:false,retryAfter:Math.ceil((arr[0]+windowMs-now)/1000)};
 arr.push(now);BUCKETS.set(key,arr);return{ok:true,retryAfter:0};
}

export function clientIp(req:Request):string{
 const fwd=req.headers.get('x-forwarded-for');
 return (fwd?fwd.split(',')[0].trim():'')||'unknown';
}
