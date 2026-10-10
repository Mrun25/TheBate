'use client';
import {useEffect,useRef} from 'react';
let ctx:AudioContext|null=null;
function ac():AudioContext|null{if(typeof window==='undefined')return null;try{let c=ctx;if(!c){const C=(window as any).AudioContext||(window as any).webkitAudioContext;if(!C)return null;c=new C() as AudioContext;ctx=c}if(c.state==='suspended')c.resume();return c}catch{return null}}
function tone(f:number,d:number,t0=0,type:OscillatorType='square',vol=0.05,slide=0){const c=ac();if(!c)return;const o=c.createOscillator(),g=c.createGain();o.type=type;const s=c.currentTime+t0;o.frequency.setValueAtTime(f,s);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(40,f+slide),s+d);g.gain.setValueAtTime(vol,s);g.gain.exponentialRampToValueAtTime(0.0001,s+d);o.connect(g);g.connect(c.destination);o.start(s);o.stop(s+d+0.02)}
export function sfx(k:'click'|'a'|'b'|'win'|'coin'|'wild'){
 if(k==='click')tone(660,0.06,0,'square',0.04,200);
 else if(k==='a')tone(523,0.09,0,'square',0.04);
 else if(k==='b')tone(392,0.09,0,'square',0.04);
 else if(k==='coin'){tone(988,0.07,0,'square',0.05);tone(1319,0.16,0.07,'square',0.05)}
 else if(k==='wild'){tone(300,0.25,0,'sawtooth',0.04,600)}
 else if(k==='win'){[523,659,784,1047].forEach((f,i)=>tone(f,0.16,i*0.11,'square',0.05));tone(1047,0.4,0.5,'triangle',0.05)}
}
export function SfxEngine({on,count,verdict,running}:{on:boolean;count:number;verdict:boolean;running:boolean}){
 const onRef=useRef(on);onRef.current=on;
 useEffect(()=>{const h=(e:MouseEvent)=>{if(!onRef.current)return;const el=(e.target as HTMLElement)?.closest?.('button,a,[role=button]') as HTMLElement|null;if(!el)return;const tx=(el.textContent||'').toLowerCase();sfx(/stake|claim|pool|settle/.test(tx)?'coin':'click')};document.addEventListener('click',h,true);return()=>document.removeEventListener('click',h,true)},[]);
 useEffect(()=>{if(on&&running&&!verdict&&count>1)sfx(count%2===0?'b':'a')},[count]);
 useEffect(()=>{if(on&&verdict)sfx('win')},[verdict]);
 return null}
