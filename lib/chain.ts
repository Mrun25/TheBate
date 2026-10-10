import {createPublicClient,createWalletClient,custom,defineChain,fallback,http,parseEther,formatEther} from 'viem';
import {THEBATE_ABI} from './abi';
export const monadTestnet=defineChain({id:10143,name:'Monad Testnet',nativeCurrency:{name:'MON',symbol:'MON',decimals:18},rpcUrls:{default:{http:['https://testnet-rpc.monad.xyz']}},blockExplorers:{default:{name:'MonadVision',url:'https://testnet.monadvision.com'}},testnet:true});
export const CONTRACT=(process.env.NEXT_PUBLIC_THEBATE_ADDRESS||'0x6e06e99cc6f4bb56cc10927483d72667b5f0d20c') as `0x${string}`;
export const EXPLORER='https://testnet.monadvision.com';
export const RPCS=['https://testnet-rpc.monad.xyz','https://rpc-testnet.monadinfra.com','https://monad-testnet.drpc.org','https://rpc.ankr.com/monad_testnet'];
export const publicClient=createPublicClient({chain:monadTestnet,transport:fallback(RPCS.map(u=>http(u,{timeout:8000,retryCount:1})),{rank:false})});
export {THEBATE_ABI,parseEther,formatEther};
declare global{interface Window{ethereum?:any}}
export async function connect(){
 const eth=window.ethereum; if(!eth) throw new Error('NO_WALLET');
 const [address]=await eth.request({method:'eth_requestAccounts'});
 try{await eth.request({method:'wallet_switchEthereumChain',params:[{chainId:'0x279f'}]})}
 catch(e:any){ if(e?.code===4902||e?.code===-32603||/Unrecognized|not added/i.test(e?.message||'')){await eth.request({method:'wallet_addEthereumChain',params:[{chainId:'0x279f',chainName:'Monad Testnet',nativeCurrency:{name:'MON',symbol:'MON',decimals:18},rpcUrls:['https://testnet-rpc.monad.xyz'],blockExplorerUrls:[EXPLORER]}]})} else throw e }
 const wallet=createWalletClient({account:address,chain:monadTestnet,transport:custom(eth)});
 return {address:address as `0x${string}`,wallet};
}
export async function readDebate(id:bigint){
 const r=await publicClient.readContract({address:CONTRACT,abi:THEBATE_ABI,functionName:'getDebate',args:[id]}) as any;
 return {creator:r[0] as string,topic:r[1] as string,poolA:r[2] as bigint,poolB:r[3] as bigint,resolved:r[4] as boolean,winner:Number(r[5]),voided:r[6] as boolean};
}
