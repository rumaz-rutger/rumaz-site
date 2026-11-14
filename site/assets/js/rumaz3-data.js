import {getClient} from './rumaz3-client.js';
const draftKey='rumaz_place_draft_v1';
const returnKey='rumaz_return_to';
function checked(result){if(result.error)throw result.error;return result.data;}
export class RumazData {
 constructor(api=getClient()){this.api=api;this.user=null;}
 async session(){const {data,error}=await this.api.auth.getUser();this.user=!error&&data.user?.email_confirmed_at?data.user:null;return this.user;}
 async load(){
  if(!await this.session())return {name:'',places:[]};
  const tables=['profiles','places','place_memberships','place_settings','booking_requests','place_posts','place_tips','place_guides','place_tasks','post_replies','place_events','post_likes','event_attendees'];
  const rows=await Promise.all(tables.map(t=>this.api.from(t).select('*').then(checked)));
  const [profiles,places,members,settings,bookings,posts,tips,guides,tasks,replies,events,likes,attendees]=rows;
  const photos=new Map();
  await Promise.all(posts.filter(p=>p.photo_path&&p.photo_path.startsWith(p.place_id+'/')).map(async p=>{const {data,error}=await this.api.storage.from('rumaz-photos').createSignedUrl(p.photo_path,60);if(!error)photos.set(p.id,data.signedUrl);}));
  const names=new Map(profiles.map(p=>[p.id,p.display_name]));
  const name=id=>id===this.user.id?'Jij':names.get(id)||'Kringlid';
  return {name:names.get(this.user.id)||this.user.user_metadata?.display_name||'Jij',places:places.map(p=>({
   id:p.id,type:p.kind,role:p.relationship,name:p.name,location:p.location_label,circle:p.circle_label,fields:p.details,
   accessRole:members.find(m=>m.place_id===p.id&&m.user_id===this.user.id&&m.state==='active')?.role,
   members:members.filter(m=>m.place_id===p.id&&m.state==='active').map(m=>({id:m.user_id,name:name(m.user_id),role:({admin:'Beheerder',member:'Familie of vriend',guest:'Gast'})[m.role]})),
   ...{requireApproval:settings.find(s=>s.place_id===p.id)?.require_approval!==false,showActivities:settings.find(s=>s.place_id===p.id)?.show_activities===true},
   posts:posts.filter(x=>x.place_id===p.id).sort((a,b)=>b.created_at.localeCompare(a.created_at)).map(x=>({id:x.id,author:name(x.author_id),date:new Date(x.created_at).toLocaleDateString('nl-NL'),text:x.content,photo:photos.get(x.id)||'',mentions:[],likes:likes.filter(l=>l.post_id===x.id).length,liked:likes.some(l=>l.post_id===x.id&&l.user_id===this.user.id),replies:replies.filter(r=>r.post_id===x.id).sort((a,b)=>a.created_at.localeCompare(b.created_at)).map(r=>name(r.author_id)+': '+r.content)})),
   bookings:bookings.filter(x=>x.place_id===p.id).map(x=>({id:x.id,start:x.arrives_on,end:x.leaves_on,person:name(x.requester_id),status:x.status,note:x.note})),
   planner:tasks.filter(x=>x.place_id===p.id).map(x=>({id:x.id,phase:x.phase,text:x.content,done:x.done})),
   guides:guides.filter(x=>x.place_id===p.id).map(x=>({id:x.id,title:x.title,text:x.body})),
   tips:tips.filter(x=>x.place_id===p.id).map(x=>({id:x.id,title:x.title,note:x.note,url:x.source_url,kind:'tip'})),events:events.filter(x=>x.place_id===p.id).map(x=>({id:x.id,title:x.title,date:x.event_date,time:x.event_time,who:x.audience,going:attendees.some(a=>a.event_id===x.id&&a.user_id===this.user.id)}))
  }))};
 }
 async identity(){if(!this.user&&!await this.session())throw new Error('AUTH_REQUIRED');return this.user.id;}
 async add(table,values){const author_id=await this.identity();return checked(await this.api.from(table).insert({...values,author_id}).select().single());}
 async createPlace(draft){
  await this.identity();
  return checked(await this.api.rpc('create_place',{p_id:draft.id,p_name:draft.name,p_kind:draft.type,p_relationship:draft.role,p_location:draft.location,p_circle:draft.circle||'Familie en vrienden',p_fields:draft.fields||[],p_guide:draft.guides?.[0]?.text||'',p_note:draft.posts?.[0]?.text||''}));
 }
 async requestStay(place,start,end,note){return checked(await this.api.rpc('request_stay',{p_place_id:place,p_arrival:start,p_departure:end,p_note:note}));}
 async decideStay(id,approve){return checked(await this.api.rpc('decide_stay',{p_booking_id:id,p_approve:approve}));}
 async taskDone(id,done){return checked(await this.api.from('place_tasks').update({done}).eq('id',id).select('id').single());}
 async approval(place,value){return checked(await this.api.from('place_settings').update({require_approval:value}).eq('place_id',place).select('place_id').single());}
 async saveName(display_name){await this.identity();const existing=checked(await this.api.from('profiles').select('id').eq('id',this.user.id).maybeSingle());return checked(await (existing?this.api.from('profiles').update({display_name}).eq('id',this.user.id):this.api.from('profiles').insert({id:this.user.id,display_name})).select().single());}
 async post(place,content,file){
  let path;
  if(file){if(file.size>2097152||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('PHOTO_INVALID');
   const uid=await this.identity();path=place+'/'+uid+'/'+crypto.randomUUID();checked(await this.api.storage.from('rumaz-photos').upload(path,file,{contentType:file.type,upsert:false}));}
  try{return await this.add('place_posts',{place_id:place,content,photo_path:path||null});}
  catch(error){if(path)await this.api.storage.from('rumaz-photos').remove([path]);throw error;}
 }
 async activities(place,value){return checked(await this.api.from('place_settings').update({show_activities:value}).eq('place_id',place).select('place_id').single());}
 async toggle(table,column,id,on){const user_id=await this.identity();return checked(await (on?this.api.from(table).insert({[column]:id,user_id}):this.api.from(table).delete().eq(column,id).eq('user_id',user_id)));}
 async invite(place,email,role){const {data,error}=await this.api.auth.getSession();if(error||!data.session)throw new Error('AUTH_REQUIRED');const response=await fetch('/.netlify/functions/invitation',{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer '+data.session.access_token},body:JSON.stringify({place,email,role})});if(!response.ok)throw new Error('INVITATION_FAILED');return response.json();}
 async accept(token){return checked(await this.api.rpc('accept_invitation',{p_token:token}));}
 async logout(){checked(await this.api.auth.signOut());sessionStorage.removeItem(returnKey);}
}
export function saveDraft(draft){
 const value={...draft,id:crypto.randomUUID(),savedAt:Date.now()};
 sessionStorage.setItem(draftKey,JSON.stringify(value));sessionStorage.setItem(returnKey,'/app/#plekken');return value;
}
export function readDraft(){
 try{const d=JSON.parse(sessionStorage.getItem(draftKey)||'null');
 if(!d||typeof d.savedAt!=='number'||Date.now()-d.savedAt>86400000||!Array.isArray(d.fields)){sessionStorage.removeItem(draftKey);return null;}return d;
 }catch{sessionStorage.removeItem(draftKey);return null;}
}
export function clearDraft(){sessionStorage.removeItem(draftKey);}
