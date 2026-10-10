import {createHmac,createHash,timingSafeEqual} from 'crypto';
function k(){const s=process.env.ORACLE_PRIVATE_KEY;return s?createHash('sha256').update('thebate-verdict|'+s).digest():null}
const norm=(t:string)=>t.trim().toLowerCase().replace(/\s+/g,' ');
export function signVerdict(topic:string,winner:0|1):string{const key=k();if(!key)return '';const ts=Date.now();const sig=createHmac('sha256',key).update(`${norm(topic)}|${winner}|${ts}`).digest('hex');return `${ts}.${sig}`}
export function verifyVerdict(topic:string,winner:0|1,token:unknown):boolean{const key=k();if(!key||typeof token!=='string')return false;const [ts,sig]=token.split('.');const n=Number(ts);if(!n||!sig||Date.now()-n>6*3600e3||n>Date.now()+60e3)return false;const exp=createHmac('sha256',key).update(`${norm(topic)}|${winner}|${n}`).digest('hex');try{return timingSafeEqual(Buffer.from(exp),Buffer.from(sig))}catch{return false}}
