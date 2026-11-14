import pg from 'pg';
import {catalog} from '../../commerce/catalog.mjs';
import {postgresStore} from '../../commerce/store.mjs';
import {mollieProvider} from '../../commerce/mollie.mjs';
import {createShop} from '../../commerce/api.mjs';
let handler;
export default async req => {
  if(!handler) {
    const env=key=>Netlify.env.get(key);
    const enabled=env('RUMAZ_CHECKOUT_MODE')==='test';
    const key=env('MOLLIE_TEST_API_KEY');
    const origin=env('RUMAZ_STAGING_ORIGIN');
    // No live mode exists. Fail closed even if a live key or production URL is supplied.
    const safeOrigin=origin && /^https:\/\//.test(origin) && !['rumaz.nl','www.rumaz.nl'].includes(new URL(origin).hostname);
    const ready=enabled && safeOrigin && key?.startsWith('test_') && !!env('RUMAZ_TEST_DATABASE_URL') && (env('RUMAZ_ORDER_SECRET')?.length>=32);
    handler=createShop({catalog,origin:origin||new URL(req.url).origin,secret:env('RUMAZ_ORDER_SECRET'),testEnabled:ready,
      provider:ready?mollieProvider(key):null,
      store:ready?postgresStore(new pg.Pool({connectionString:env('RUMAZ_TEST_DATABASE_URL'),max:2})):null});
  }
  return handler(req);
};
export const config={path:'/api/*',rateLimit:{action:'rate_limit',aggregateBy:'ip',windowSize:60,windowLimit:60}};
