import {describe,it,expect} from 'vitest';
import {kw,goodSrc,host,cites,clean,onTopic,runChain,rankGoodFirst} from '@/lib/debate-utils';

describe('kw keyword extraction',()=>{
 it('drops stopwords and short words, lowercases',()=>{
  expect(kw('Should cities ban CARS from their centres?')).toEqual(['cities','cars','centres']);
 });
 it('strips punctuation',()=>{
  expect(kw('AI: friend, or foe?')).toEqual(['friend']);
 });
});

describe('host / goodSrc source filter',()=>{
 it('parses hostnames and tolerates bad URLs',()=>{
  expect(host('https://ArXiv.org/abs/1234')).toBe('arxiv.org');
  expect(host('not a url')).toBe('');
 });
 it('blocks essay mills and content farms',()=>{
  expect(goodSrc({url:'https://grademiners.com/essay'})).toBe(false);
  expect(goodSrc({url:'https://chegg.com/homework'})).toBe(false);
  expect(goodSrc({url:'https://reddit.com/r/ask'})).toBe(false);
 });
 it('allows reputable sources and rejects empties',()=>{
  expect(goodSrc({url:'https://arxiv.org/abs/2401.00001'})).toBe(true);
  expect(goodSrc({url:'https://theguardian.com/tech/x'})).toBe(true);
  expect(goodSrc({url:''})).toBe(false);
 });
 it('rankGoodFirst floats reputable domains without losing others',()=>{
  const ranked=rankGoodFirst([{url:'https://randomblog.io/x'},{url:'https://arxiv.org/abs/1'}]);
  expect(ranked[0].url).toContain('arxiv.org');
  expect(ranked).toHaveLength(2);
 });
});

describe('cites statement-to-source matching',()=>{
 const src=[
  {title:'Guardian: cities rethink cars',url:'https://theguardian.com/cities',snippet:'urban traffic policy cars city centre ban'},
  {title:'arXiv: transformer models',url:'https://arxiv.org/abs/1',snippet:'neural language models attention'},
 ];
 it('matches each statement to its best-overlap source',()=>{
  const out=cites(['City centres see less traffic when cars are banned','Transformers use attention mechanisms'],src);
  expect(out[0]!.url).toContain('theguardian');
  expect(out[1]!.url).toContain('arxiv');
 });
 it('never invents a link when there are no sources',()=>{
  expect(cites(['anything'],[])).toEqual([null]);
 });
});

describe('clean output normaliser',()=>{
 it('strips persona name prefixes and wrapping quotes',()=>{
    const o=clean({statements:['Dr. Kavya Sharma: "We agree with that."','Rajan Mehta - I disagree.']});
    expect(o.statements[0]).toBe('We agree with that.');
    expect(o.statements[1]).toBe('I disagree.');
 });
 it('leaves other fields untouched',()=>{
  const o=clean({statements:['plain'],winner:'A'});
  expect(o.winner).toBe('A');
 });
});

describe('onTopic drift rejection',()=>{
 const mk=(texts:string[])=>({statements:texts});
 const eight=(t:string)=>Array(8).fill(t);
 it('accepts a debate that keeps using the motion words',()=>{
  expect(onTopic(mk(eight('Cities should ban cars because urban traffic chokes centres')),'Should cities ban cars?')).toBe(true);
 });
 it('rejects when fewer than 3 statements touch the motion',()=>{
  expect(onTopic(mk(['Cities should ban cars now',...eight('Completely unrelated point about cooking recipes')]),'Should cities ban cars?')).toBe(false);
 });
 it('rejects AGI drift on non-AI motions',()=>{
  expect(onTopic(mk(eight('Cities should ban cars, and AGI changes everything')),'Should cities ban cars?')).toBe(false);
 });
 it('allows AGI talk on AI motions',()=>{
  expect(onTopic(mk(eight('AGI alignment research needs funding and artificial intelligence safety')),'Should AGI research be funded?')).toBe(true);
 });
 it('rejects rambling statements over 70 words',()=>{
  const long=eight('cities cars ban').map((t,i)=>i===0?Array(71).fill('cities').join(' '):t);
  expect(onTopic(mk(long),'Should cities ban cars?')).toBe(false);
 });
});

describe('runChain fallback behaviour',()=>{
 const good=()=>({statements:Array(8).fill('cities ban cars traffic urban'),winner:'A',scoreA:80,scoreB:70,reasoning:'r',strongest:'s'});
 const okTopic=()=>true;
 it('returns the first passing attempt with its source name',async()=>{
  const r=await runChain([['gemini',async()=>good()]],okTopic);
  expect(r!.source).toBe('gemini');
  expect(r!.o.statements).toHaveLength(8);
 });
 it('skips bad-shape outputs and tries the next attempt',async()=>{
  const calls:string[]=[];
  const r=await runChain([
   ['gemini',async()=>{calls.push('g');return {statements:['too short'],winner:'A'}}],
   ['groq',async()=>{calls.push('q');return good()}],
  ],okTopic);
  expect(r!.source).toBe('groq');
  expect(calls).toEqual(['g','g','q']);
 });
 it('moves on when validation rejects the debate',async()=>{
  const r=await runChain([
   ['gemini',async()=>good()],
   ['groq',async()=>good()],
  ],()=>false);
  expect(r).toBeNull();
 });
 it('stops retrying an attempt on 429 but continues the chain',async()=>{
  const calls:string[]=[];
  const r=await runChain([
   ['gemini',async()=>{calls.push('g');throw new Error('gemini 429 quota')}],
   ['groq',async()=>{calls.push('q');return good()}],
  ],okTopic);
  expect(r!.source).toBe('groq');
  expect(calls).toEqual(['g','q']);
 });
 it('retries a non-quota error once before moving on',async()=>{
  let n=0;
  const r=await runChain([
   ['gemini',async()=>{n++;throw new Error('gemini 500 boom')}],
  ],okTopic);
  expect(r).toBeNull();
  expect(n).toBe(2);
 });
 it('returns null when every provider is down',async()=>{
  const r=await runChain([
   ['gemini',async()=>{throw new Error('gemini 503 down')}],
   ['groq',async()=>{throw new Error('groq 429 down')}],
  ],okTopic);
  expect(r).toBeNull();
 });
});
