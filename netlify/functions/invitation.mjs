import {actor,body,result,origin,reply,fail,mail} from '../../server/common.mjs';
import {renderMail} from '../../server/templates.mjs';
export default async req=>{
 let db,invitation;
 try{
  ({db}=await actor(req));const input=await body(req);if(typeof input.email!=='string'||input.email.length>254||/[<>,;\r\n]/.test(input.email))throw new Error('INPUT');
  invitation=result(await db.rpc('create_invitation',{p_place_id:input.place,p_email:input.email,p_role:input.role}));
  const place=result(await db.from('places').select('name').eq('id',input.place).single());
  const content=renderMail('invitation',{pleknaam:place.name,voornaam:'',uitnodiger:'De beheerder',UITNODIGING_URL:origin()+'/app/#uitnodiging='+invitation.token});
  await mail(input.email.trim().toLowerCase(),content.subject,content.text,invitation.id);
  return reply({sent:true});
 }catch(e){if(invitation&&db)await db.rpc('revoke_invitation',{p_invitation_id:invitation.id});return fail(e);}
};
