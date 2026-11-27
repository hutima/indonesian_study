import test from 'node:test';
import assert from 'node:assert/strict';
import {retentionDayKey, normalizeRetention, retentionDeck, reviewRetention} from '../retention-deck.js';
import {normalizeProgress, recordVocabReview} from '../progress.js';
const cards=Array.from({length:70},(_,i)=>({id:`word-${i}`,form:`kata${i}`,meaning:`word${i}`}));
const now=new Date(2026,10,27,12).getTime();
for(const spaced of [true,false]) test(`retention retries, neutral Pass, completion, persistence, and new batch (${spaced})`,()=>{
 let progress=normalizeProgress(null);
 let {state,deck}=retentionDeck(cards,progress,null,'deck',spaced,'i2e',{now,random:()=>0});
 assert.equal(deck.total,20);assert.equal(new Set(deck.active).size,20);
 const original=[...deck.active];
 let before=JSON.stringify(progress);
 ({state,progress,deck}=reviewRetention(progress,state,'deck','next',spaced,now));
 assert.equal(JSON.stringify(progress),before);assert.equal(deck.active.at(-1),original[0]);
 for(const action of ['again','unsure']) {
  ({state,progress,deck}=reviewRetention(progress,state,'deck',action,spaced,now));assert.equal(deck.active.length,20);
 }
 ({state,progress,deck}=reviewRetention(progress,state,'deck','know',spaced,now));
 assert.equal(deck.completed,1);assert.equal(deck.active.length,19);
 const restored=retentionDeck(cards,progress,JSON.parse(JSON.stringify(state)),'deck',spaced,'i2e',{now});
 assert.deepEqual(restored.deck,deck);
 while(deck.active.length)({state,progress,deck}=reviewRetention(progress,state,'deck','know',spaced,now));
 assert.equal(retentionDeck(cards,progress,state,'deck',spaced,'i2e',{now}).deck.active.length,0);
 const next=retentionDeck(cards,progress,state,'deck',spaced,'i2e',{now,replace:true});
 assert.equal(next.deck.active.length,20);assert.ok(next.deck.active.every(id=>!original.includes(id)));
});

test('mid-batch replacement favors other eligible words and leaves grades intact',()=>{
 const progress=normalizeProgress(null);const first=retentionDeck(cards,progress,null,'deck',true,'i2e',{now});
 const before=JSON.stringify(progress);
 const next=retentionDeck(cards,progress,first.state,'deck',true,'i2e',{now,replace:true});
 assert.ok(next.deck.active.every(id=>!first.deck.active.includes(id)));assert.equal(JSON.stringify(progress),before);
});

test('only due cards are sampled; a small or empty eligible pool is valid',()=>{
 let progress=normalizeProgress(null);for(const card of cards.slice(0,65))progress=recordVocabReview(progress,card.id,'know',true,now,'i2e');
 assert.equal(retentionDeck(cards,progress,null,'deck',true,'i2e',{now}).deck.total,5);
 assert.equal(retentionDeck([],progress,null,'empty',true,'i2e',{now}).deck.total,0);
 assert.equal(retentionDeck([cards[0],cards[0]],progress,null,'dup',false,'i2e',{now}).deck.total,1);
});

test('daily reset happens at local 5 AM, including completed unspaced decks',()=>{
 const at=(d,h,m=0)=>new Date(2026,10,d,h,m).getTime();
 const progress=normalizeProgress(null);
 let {state,deck}=retentionDeck(cards.slice(0,3),progress,null,'deck',false,'i2e',{now:at(27,23)});
 while(deck.active.length)({state,deck}=reviewRetention(progress,state,'deck','know',false,at(27,23)));
 assert.equal(retentionDeck(cards.slice(0,3),progress,state,'deck',false,'i2e',{now:at(28,4,59)}).deck.active.length,0);
 assert.equal(retentionDeck(cards.slice(0,3),progress,state,'deck',false,'i2e',{now:at(28,5)}).deck.active.length,3);
 assert.equal(retentionDayKey(at(28,4)),'2026-11-27');
});

test('directions and selections resume independently; corrupt queues are filtered',()=>{
 const p=normalizeProgress(null);const first=retentionDeck(cards,p,null,'forward',false,'i2e',{now});
 const second=retentionDeck(cards,p,first.state,'reverse',false,'e2i',{now});
 assert.deepEqual(retentionDeck(cards,p,second.state,'forward',false,'i2e',{now}).deck,first.deck);
 const clean=normalizeRetention({day:retentionDayKey(now),sessions:{bad:null,a:{ids:['x','x',3],pending:['x','y','x'],cleared:[]}}},now);
 assert.deepEqual(clean.sessions.a.pending,['x']);assert.deepEqual(clean.sessions.a.ids,['x']);
});
