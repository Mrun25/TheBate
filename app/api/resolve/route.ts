import {NextResponse} from 'next/server';
import {createWalletClient,createPublicClient,http} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {CONTRACT,THEBATE_ABI,monadTestnet} from '@/lib/chain';
export const runtime='nodejs';
// Judge oracle: only the contract owner can resolve. Key lives in the ORACLE_PRIVATE_KEY env var (never in the repo).
export async function POST(req:Request){
 const key=process.env.ORACLE_PRIVATE_KEY; if(!key) return NextResponse.json({error:'oracle not configured'},{status:503});
 const {id,winner}=await req.json();
 if(!/^\d+$/.test(String(id))||![0,1].includes(winner)) return NextResponse.json({error:'bad input'},{status:400});
 const pub=createPublicClient({chain:monadTestnet,transport:http()});
 const d=await pub.readContract({address:CONTRACT,abi:THEBATE_ABI,functionName:'getDebate',args:[BigInt(id)]}) as any;
 if(d[0]==='0x0000000000000000000000000000000000000000') return NextResponse.json({error:'unknown debate'},{status:404});
 if(d[4]) return NextResponse.json({error:'already resolved'},{status:409});
 const account=privateKeyToAccount((key.startsWith('0x')?key:'0x'+key) as `0x${string}`);
 const w=createWalletClient({account,chain:monadTestnet,transport:http()});
 try{const hash=await w.writeContract({address:CONTRACT,abi:THEBATE_ABI,functionName:'resolve',args:[BigInt(id),winner],gas:250000n});await pub.waitForTransactionReceipt({hash});return NextResponse.json({hash})}
 catch(e:any){return NextResponse.json({error:(e.shortMessage||'tx failed')},{status:500})}
}
