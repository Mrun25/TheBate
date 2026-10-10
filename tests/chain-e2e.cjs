// Drives the real UI against Monad Testnet using a Node-side signer injected as window.ethereum. Needs DEPLOYER_KEY env.
const {chromium}=require('playwright');
(async()=>{
 const {createWalletClient,http,defineChain}=await import('viem');const {privateKeyToAccount}=await import('viem/accounts');
 const chain=defineChain({id:10143,name:'Monad',nativeCurrency:{name:'MON',symbol:'MON',decimals:18},rpcUrls:{default:{http:['https://testnet-rpc.monad.xyz']}}});
 const acct=privateKeyToAccount(process.env.DEPLOYER_KEY);const w=createWalletClient({account:acct,chain,transport:http()});
 const b=await chromium.launch();const pg=await b.newPage({viewport:{width:1440,height:900}});
 await pg.exposeFunction('__rpc',async(m,p)=>{
  if(m==='eth_requestAccounts'||m==='eth_accounts')return [acct.address];
  if(m==='wallet_switchEthereumChain')return null;
  if(m==='eth_chainId')return '0x279f';
  if(m==='eth_sendTransaction'){const t=p[0];await new Promise(r=>setTimeout(r,2000));return await w.sendTransaction({to:t.to,data:t.data,value:t.value?BigInt(t.value):0n,gas:t.gas?BigInt(t.gas):undefined});}
  const r=await fetch('https://testnet-rpc.monad.xyz',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method:m,params:p})});return (await r.json()).result;});
 await pg.addInitScript(()=>{window.ethereum={request:({method,params})=>window.__rpc(method,params||[])}});
 pg.on('pageerror',e=>console.log('PAGEERR',e.message));
 await pg.goto(process.env.BASE+'/debate/demo?topic='+encodeURIComponent('Should AI replace judges?'));
 await pg.waitForSelector('text=Open pool');
 await pg.click('text=Jump to verdict');
 await pg.click('text=Open pool');await pg.waitForSelector('text=Pool #',{timeout:30000});
 await pg.screenshot({path:'tests/chain-1-pool.png'});
 await pg.click('text=Stake Team A');await pg.waitForTimeout(6000);
 await pg.click('text=Stake Team B');await pg.waitForTimeout(6000);
 await pg.click('text=/Settle/');await pg.waitForSelector('text=Claim winnings',{timeout:30000});
 await pg.screenshot({path:'tests/chain-2-settled.png'});
 console.log('POOL',await pg.textContent('.chain-panel'));
 await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
