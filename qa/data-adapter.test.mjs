import {test} from 'node:test';
import assert from 'node:assert/strict';
globalThis.window={RUMAZ_AUTH_CONFIG:{}};
const {RumazData}=await import('../site/assets/js/rumaz3-data.js');
test('unconfirmed user never loads private tables',async()=>{
 const db=new RumazData({auth:{getUser:async()=>({data:{user:{id:'a'}},error:null})},from(){throw Error('Private query attempted')}});
 assert.deepEqual(await db.load(),{name:'',places:[]});
});
test('server booking refusal is propagated rather than reporting success',async()=>{
 const error={code:'42501'};const db=new RumazData({rpc:async()=>({data:null,error})});
 await assert.rejects(db.decideStay('booking',true),e=>e===error);
});
test('task update requires a returned authorized row',async()=>{
 const error={code:'PGRST116'};const chain={update(){return this},eq(){return this},select(){return this},single:async()=>({data:null,error})};
 const db=new RumazData({from:()=>chain});await assert.rejects(db.taskDone('hidden-task',true),e=>e===error);
});
test('post authorship comes from authenticated identity',async()=>{
 let inserted;const chain={insert(v){inserted=v;return this},select(){return this},single:async()=>({data:inserted,error:null})};
 const db=new RumazData({from:()=>chain});db.user={id:'actual-user'};
 await db.add('place_posts',{author_id:'forged-user',place_id:'place',content:'hello'});assert.equal(inserted.author_id,'actual-user');
});
