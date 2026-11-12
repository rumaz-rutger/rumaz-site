import {admin,result,origin,mail} from '../../server/common.mjs';
import {renderMail} from '../../server/templates.mjs';
export default async()=>{
 const db=admin(),jobs=result(await db.rpc('claim_notifications'));
 for(const job of jobs){
  try{
   const u=result(await db.auth.admin.getUserById(job.user_id)).user;
   const member=result(await db.from('place_memberships').select('role,state').eq('place_id',job.place_id).eq('user_id',job.user_id).maybeSingle());
   if(!u?.email_confirmed_at||member?.state!=='active'||(job.type==='booking_request'&&member.role!=='admin'))throw new Error('RECIPIENT_NO_ACCESS');
   const p=result(await db.from('places').select('name').eq('id',job.place_id).single());
   const b=result(await db.from('booking_requests').select('*').eq('id',job.booking_id).single());
   const a=result(await db.from('profiles').select('display_name').eq('id',b.requester_id).maybeSingle());
   const url=origin()+'/app/?place='+encodeURIComponent(p.id||job.place_id)+'#plek-agenda';
   const content=renderMail(job.type,{pleknaam:p.name,beheerder:'',aanvrager:a?.display_name||'Een kringlid',aankomst:b.arrives_on,vertrek:b.leaves_on,AANVRAAG_URL:url,AGENDA_URL:url});
   await mail(u.email,content.subject,content.text,job.id);
   result(await db.from('notification_outbox').update({state:'sent',sent_at:new Date().toISOString()}).eq('id',job.id).eq('state','sending'));
  }catch{await db.from('notification_outbox').update({state:'failed'}).eq('id',job.id).eq('state','sending');}
 }
 return new Response(null,{status:204});
};
