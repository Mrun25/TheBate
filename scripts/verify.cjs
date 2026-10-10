// Verify on MonadVision's Sourcify instance
const fs=require('fs');
const {address}=JSON.parse(fs.readFileSync('deployment.json','utf8'));
const src=fs.readFileSync('contracts/TheBate.sol','utf8');
const input={language:'Solidity',sources:{'TheBate.sol':{content:src}},settings:{optimizer:{enabled:true,runs:200},evmVersion:'cancun',outputSelection:{'*':{'*':['abi','evm.bytecode.object','metadata']}}}};
const solc=require('solc');
const out=JSON.parse(solc.compile(JSON.stringify(input)));
const metadata=out.contracts['TheBate.sol'].TheBate.metadata;
(async()=>{
 const r=await fetch('https://sourcify-api-monad.blockvision.org/verify',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({address,chain:'10143',files:{'metadata.json':metadata,'TheBate.sol':src}})});
 console.log(r.status,(await r.text()).slice(0,600));
})();
