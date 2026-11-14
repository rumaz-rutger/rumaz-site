import {createClient} from './vendor/supabase.js';
const cfg = window.RUMAZ_AUTH_CONFIG || {};
let client;
export function getClient() {
  if (!cfg.enabled || location.origin !== cfg.siteOrigin) throw new Error('AUTH_NOT_CONFIGURED');
  if (!client) client = createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {auth:{
    flowType:'pkce', detectSessionInUrl:true, autoRefreshToken:true, persistSession:true,
    storageKey:'rumaz-auth-'+new URL(cfg.supabaseUrl).hostname.split('.')[0]
  }});
  return client;
}
export function safeReturn(value) {
  try {
    const url = new URL(value || '/app/', location.origin);
    return url.origin === location.origin && url.pathname.startsWith('/app/') && !url.pathname.startsWith('/app/account/')
      ? url.pathname + url.search + url.hash : '/app/';
  } catch { return '/app/'; }
}
export async function verifiedUser() {
  const {data,error} = await getClient().auth.getUser();
  if(error || !data.user?.email_confirmed_at) return null;
  return data.user;
}
