'use client';
import {useEffect,useState} from 'react';
import {CONTRACT,EXPLORER,THEBATE_ABI,connect,formatEther,parseEther,publicClient,readDebate} from '@/lib/chain';
type D=Awaited<ReturnType<typeof readDebate>>;
function friendly(e:any):string{
 const m=String(e?.shortMessage||e?.message||e||'');
 if(m==='NO_WALLET'||/No wallet/i.test(m)) return 'NO_WALLET';
 if(/reject|denied|cancel/i.test(m)) return 'You cancelled the request in your wallet. Nothing was sent.';
 if(/insufficient|exceeds the balance|funds/i.test(m)) return 'Not enough testnet MON in this wallet. Get free MON at faucet.monad.xyz and try again.';
 if(/reserve balance/i.test(m)) return 'Monad needs a moment between transactions from a low-balance wallet. Wait a few seconds and retry.';
 if(/timeout|timed out|fetch|network|HTTP request failed/i.test(m)) return 'The network is slow right now. Your transaction may still land - check the pool in a few seconds.';
 return m.slice(0,140)||'Something went wrong. Please retry.';
}
export default function ChainPanel({topic,verdict,winner,demo}:{topic:string;verdict:boolean;winner:'A'|'B';demo?:boolean}){
 if(demo) return <DemoPool verdict={verdict} winner={winner}/>
 return <LivePool topic={topic} verdict={verdict} winner={winner}/>}
function DemoPool({verdict,winner}:{verdict:boolean;winner:'A'|'B'}){
 const [open,setOpen]=useState(false),[a,setA]=useState(0),[b,setB]=useState(0),[res,setRes]=useState(false),[claimed,setClaimed]=useState(false);
 const won=winner==='A'?a:b,tot=a+b;
 return <div className="chain-panel"><div className="chain-head"><b>PREDICTION POOL · SIMULATED DEMO</b><a href={`${EXPLORER}/address/${CONTRACT}`} target="_blank" rel="noreferrer">real contract {CONTRACT.slice(0,8)}…{CONTRACT.slice(-6)}</a></div>
  <p className="chain-note">Nothing here touches a wallet or the chain. It mimics the real flow so you can see how it works. Run a live debate to use the real contract on Monad Testnet.</p>
  {!open?<button className="new-button" onClick={()=>setOpen(true)}>Open pool (simulated)</button>:<><p>Team A <b className="ca">{a} MON</b> vs Team B <b className="cb">{b} MON</b>{res&&<> · Team {winner} won</>}</p>
  {!res&&<div className="chain-row"><button className="outline" onClick={()=>setA(a+0.05)}>Stake Team A +0.05</button><button className="outline" onClick={()=>setB(b+0.05)}>Stake Team B +0.05</button>{verdict?<button className="wildcard" onClick={()=>setRes(true)}>Settle (judge: Team {winner})</button>:<span className="chain-hint">Settle unlocks when the verdict is in.</span>}</div>}
  {res&&!claimed&&<button className="wildcard" onClick={()=>setClaimed(true)}>Claim winnings</button>}
  {claimed&&<p className="cg">Winners split the pot: {(tot*0.95).toFixed(3)} MON paid out, {(tot*0.05).toFixed(3)} MON protocol cut (simulated). {won===0&&'Stake on the winning side to see a payout.'}</p>}</>}</div>}
function LivePool({topic,verdict,winner}:{topic:string;verdict:boolean;winner:'A'|'B'}){
 const [acct,setAcct]=useState<any>(null),[id,setId]=useState<bigint|null>(null),[d,setD]=useState<D|null>(null),[amt,setAmt]=useState('0.05'),[busy,setBusy]=useState(''),[msg,setMsg]=useState(''),[tx,setTx]=useState(''),[readErr,setReadErr]=useState(false),[noWallet,setNoWallet]=useState(false),[host,setHost]=useState('');
 useEffect(()=>{setHost(location.host);setNoWallet(!(window as any).ethereum)},[]);
 useEffect(()=>{try{const s=localStorage.getItem('thebate-debate:'+topic);setId(s?BigInt(s):null);setD(null)}catch{}},[topic]);
 useEffect(()=>{if(id===null)return;let on=true;const f=()=>readDebate(id).then(x=>{if(on){setD(x);setReadErr(false)}}).catch(()=>{if(on)setReadErr(true)});f();const t=setInterval(f,5000);return()=>{on=false;clearInterval(t)}},[id]);
 async function run(label:string,fn:()=>Promise<`0x${string}`|void>){setBusy(label);setMsg('');try{const h=await fn();if(h){setTx(h);await publicClient.waitForTransactionReceipt({hash:h,timeout:60000});}if(id!==null)setD(await readDebate(id))}catch(e:any){const f=friendly(e);if(f==='NO_WALLET'){setNoWallet(true);setMsg('')}else setMsg(f)}setBusy('')}
 async function ensure(){if(acct)return acct;const a=await connect();setAcct(a);return a}
 const create=()=>run('create',async()=>{const a=await ensure();const h=await a.wallet.writeContract({address:CONTRACT,abi:THEBATE_ABI,functionName:'createDebate',args:[topic],value:parseEther('0.1'),gas:250000n});const r=await publicClient.waitForTransactionReceipt({hash:h,timeout:60000});const n=await publicClient.readContract({address:CONTRACT,abi:THEBATE_ABI,functionName:'debateCount'}) as bigint;const log=r.logs[0];const nid=log?.topics[1]?BigInt(log.topics[1]):n;setId(nid);localStorage.setItem('thebate-debate:'+topic,String(nid));setTx(h);return undefined});
 const stake=(side:0|1)=>run('stake'+side,async()=>{const a=await ensure();return a.wallet.writeContract({address:CONTRACT,abi:THEBATE_ABI,functionName:'stake',args:[id!,side],value:parseEther(amt||'0'),gas:250000n})});
 const resolve=()=>run('resolve',async()=>{const r=await fetch('/api/resolve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:String(id),winner:winner==='A'?0:1})});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error(j.error||'Settlement service is busy. Retry in a moment.');setTx(j.hash);return undefined});
 const claim=()=>run('claim',async()=>{const a=await ensure();return a.wallet.writeContract({address:CONTRACT,abi:THEBATE_ABI,functionName:'claim',args:[id!],gas:250000n})});
 const pa=d?Number(formatEther(d.poolA)):0,pb=d?Number(formatEther(d.poolB)):0;
 const mm=host?`https://metamask.app.link/dapp/${host}`:'https://metamask.io/download/';
 return <div className="chain-panel">
  <div className="chain-head"><b>PREDICTION POOL · MONAD TESTNET</b><a href={`${EXPLORER}/address/${CONTRACT}`} target="_blank" rel="noreferrer">{CONTRACT.slice(0,8)}…{CONTRACT.slice(-6)}</a></div>
  {noWallet&&<p className="chain-note">No wallet detected in this browser. You can still read the pool and the verified contract. To stake, open this page inside a wallet app browser (<a href={mm} target="_blank" rel="noreferrer">open in MetaMask</a>) or install MetaMask, Rabby or Phantom on desktop. Free testnet MON: <a href="https://faucet.monad.xyz" target="_blank" rel="noreferrer">faucet.monad.xyz</a>.</p>}
  {id===null?<><p>Open an on-chain pool for this debate (0.1 MON). The audience then stakes MON on a side. Winners split the pot, 5% protocol cut.</p><button className="new-button" disabled={!!busy||noWallet} onClick={create}>{busy==='create'?'Confirm in wallet…':noWallet?'Wallet needed to open a pool':'Open pool · 0.1 MON'}</button></>:
  <><p>Pool #{String(id)} · Team A <b className="ca">{d?`${pa} MON`:'…'}</b> vs Team B <b className="cb">{d?`${pb} MON`:'…'}</b>{d?.resolved&&<> · {d.voided?'VOID (refunds)':`Team ${d.winner===0?'A':'B'} won`}</>}</p>
  {readErr&&<p className="chain-warn">Live pool data is slow to load. Showing the last known values; retrying every few seconds.</p>}
  {!d?.resolved&&<div className="chain-row"><input value={amt} inputMode="decimal" onChange={e=>setAmt(e.target.value)} aria-label="Stake amount in MON"/><span>MON</span><button className="outline" disabled={!!busy||noWallet} onClick={()=>stake(0)}>{busy==='stake0'?'Confirm…':'Stake Team A'}</button><button className="outline" disabled={!!busy||noWallet} onClick={()=>stake(1)}>{busy==='stake1'?'Confirm…':'Stake Team B'}</button>{verdict?<button className="wildcard" disabled={!!busy} onClick={resolve}>{busy==='resolve'?'Settling…':`Settle (judge: Team ${winner})`}</button>:<span className="chain-hint">Settle unlocks when the verdict is in.</span>}</div>}
  {d?.resolved&&<button className="wildcard" disabled={!!busy||noWallet} onClick={claim}>{busy==='claim'?'Confirm…':'Claim winnings'}</button>}</>}
  {tx&&<p>Last tx: <a href={`${EXPLORER}/tx/${tx}`} target="_blank" rel="noreferrer" className="cg">{tx.slice(0,12)}…</a></p>}
  {msg&&<p className="chain-warn" role="alert">{msg}</p>}</div>}
