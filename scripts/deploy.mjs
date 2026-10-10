import {createWalletClient,createPublicClient,http,defineChain,formatEther} from 'viem';
import {privateKeyToAccount,generatePrivateKey} from 'viem/accounts';
import fs from 'fs';
const chain=defineChain({id:10143,name:'Monad Testnet',nativeCurrency:{name:'MON',symbol:'MON',decimals:18},rpcUrls:{default:{http:['https://testnet-rpc.monad.xyz']}},blockExplorers:{default:{name:'MonadVision',url:'https://testnet.monadvision.com'}}});
const keyFile=process.env.KEY_FILE||'.deployer.key'; // local only, gitignored
let pk=process.env.DEPLOYER_PRIVATE_KEY||(fs.existsSync(keyFile)?fs.readFileSync(keyFile,'utf8').trim():null);
if(!pk){pk=generatePrivateKey();fs.writeFileSync(keyFile,pk,{mode:0o600});}
const account=privateKeyToAccount(pk);
const pub=createPublicClient({chain,transport:http()});
const bal=await pub.getBalance({address:account.address});
console.log('deployer',account.address,'balance',formatEther(bal),'MON');
if(process.argv[2]!=='deploy')process.exit(0);
const wallet=createWalletClient({account,chain,transport:http()});
const {abi,bytecode}=JSON.parse(fs.readFileSync('artifacts/TheBate.json','utf8'));
const hash=await wallet.deployContract({abi,bytecode});
const r=await pub.waitForTransactionReceipt({hash});
console.log('deploy tx',hash,'address',r.contractAddress);
fs.writeFileSync('deployment.json',JSON.stringify({chainId:10143,address:r.contractAddress,deployTx:hash,deployer:account.address},null,1));
