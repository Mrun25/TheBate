import {describe,it,expect} from 'vitest';
import {rateLimit} from '@/lib/ratelimit';

describe('rateLimit sliding window',()=>{
 it('allows up to the limit then blocks with a retry hint',()=>{
  const k='test|'+Math.random();
  for(let i=0;i<3;i++)expect(rateLimit(k,3,60000).ok).toBe(true);
  const blocked=rateLimit(k,3,60000);
  expect(blocked.ok).toBe(false);
  expect(blocked.retryAfter).toBeGreaterThan(0);
 });
 it('tracks keys independently',()=>{
  const a='a|'+Math.random(),b='b|'+Math.random();
  rateLimit(a,1,60000);
  expect(rateLimit(a,1,60000).ok).toBe(false);
  expect(rateLimit(b,1,60000).ok).toBe(true);
 });
});
