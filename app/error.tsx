'use client';
export default function Error({reset}:{error:Error;reset:()=>void}){
 return <main style={{minHeight:'100dvh',display:'grid',placeItems:'center',padding:24,background:'#0D0D1A',color:'#f5f5f5',fontFamily:'Space Grotesk, sans-serif',textAlign:'center'}}>
  <div><h1 style={{fontSize:24}}>Something hiccuped.</h1><p style={{color:'#bda4cc',maxWidth:360}}>The page hit an unexpected problem. Your wallet and any pool are untouched. Reload to continue.</p>
  <button onClick={reset} style={{marginTop:12,padding:'10px 18px',border:'1px solid #FFD54F',color:'#FFD54F',background:'none'}}>Try again</button></div></main>}
