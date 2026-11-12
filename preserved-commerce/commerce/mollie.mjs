import {ShopError} from './core.mjs';
export function mollieProvider(key, fetcher = fetch) {
  if(!key?.startsWith('test_')) throw new ShopError('Alleen een Mollie-testsleutel is toegestaan.',503);
  async function call(path,options={}) {
    const res=await fetcher('https://api.mollie.com/v2/'+path,{...options,signal:AbortSignal.timeout(12000),headers:{Authorization:`Bearer ${key}`,'Content-Type':'application/json',...options.headers}});
    if(!res.ok)throw new ShopError('De betaalomgeving reageert niet. Probeer het opnieuw met dezelfde bestelling.',502);
    return res.json();
  }
  return {
    async create(order, origin, token) {
      const payment = await call('payments',{method:'POST',headers:{'Idempotency-Key':order.id},body:JSON.stringify({amount:{currency:'EUR',value:(order.data.quote.grossCents/100).toFixed(2)},description:`RuMaZ testbestelling ${order.id.slice(0,12)}`,metadata:{orderId:order.id},redirectUrl:`${origin}/bestelling/#${order.id}.${token}`,webhookUrl:`${origin}/api/payment-webhook`})});
      if(payment.mode!=='test')throw new ShopError('Live betalingen zijn geblokkeerd.',503);
      const href=payment._links?.checkout?.href;
      if(!href || new URL(href).protocol!=='https:' || !new URL(href).hostname.endsWith('.mollie.com'))throw new ShopError('Ongeldige betaalverwijzing.',502);
      return {id:payment.id,url:href};
    },
    async get(id) { return call('payments/'+encodeURIComponent(id)); }
  };
}
