export class ShopError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
export const money = cents => new Intl.NumberFormat('nl-NL', {style: 'currency', currency: 'EUR'}).format(cents / 100);
export const net = (gross, bps) => Math.round(gross * 10000 / (10000 + bps));
const validPrice = x => Number.isSafeInteger(x) && x >= 0 && x <= 10000000;
const validVat = x => Number.isInteger(x) && x >= 0 && x <= 10000;
export function normalizeItems(items, catalog) {
  if (!Array.isArray(items) || !items.length || items.length > 30) throw new ShopError('Kies tussen 1 en 30 productregels.');
  const merged = new Map();
  for (const item of items) {
    if (!item || typeof item !== 'object') throw new ShopError('Ongeldig product.');
    const p = catalog.products.find(p => p.id === item.productId);
    const v = p?.variants.find(v => v.id === item.variantId);
    if (!p || !v || p.status === 'coming_soon' || p.status === 'unavailable') throw new ShopError('Dit product of deze uitvoering is niet beschikbaar.');
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) throw new ShopError('Kies een geheel aantal van 1 tot en met 20.');
    if (typeof item.personalization !== 'string') throw new ShopError('Vul de personalisatie als tekst in.');
    const personalization = item.personalization.normalize('NFC').trim();
    if (/[\u0000-\u001f\u007f]/u.test(personalization) || personalization.length > p.personalization.maxLength || (p.personalization.enabled && !personalization)) throw new ShopError('Vul een korte personalisatietekst in (maximaal 120 tekens).');
    const key = JSON.stringify([p.id, v.id, personalization]);
    const existing = merged.get(key);
    const quantity = item.quantity + (existing?.quantity || 0);
    if (quantity > 20) throw new ShopError('Maximaal 20 stuks per personalisatie.');
    merged.set(key, {productId:p.id, variantId:v.id, personalization, quantity});
  }
  return [...merged.values()];
}
export function quote(items, country, catalog) {
  if (country !== 'NL') throw new ShopError('Verzending naar dit land is nog niet ingericht.');
  const clean = normalizeItems(items, catalog), missing = new Set();
  const lines = clean.map(item => {
    const p = catalog.products.find(p=>p.id===item.productId), v=p.variants.find(v=>v.id===item.variantId);
    const priced = validPrice(v.grossCents) && validVat(v.vatBps);
    if (!priced) missing.add('De productprijs en btw zijn nog niet vastgesteld.');
    const grossCents = priced ? v.grossCents * item.quantity : null;
    const netCents = priced ? net(grossCents,v.vatBps) : null;
    return {...item, name:p.name, variant:v.label, unitGrossCents:priced?v.grossCents:null, grossCents, netCents, vatCents:priced?grossCents-netCents:null, vatBps:v.vatBps};
  });
  const s=catalog.shipping[country];
  const shippingReady=s && validPrice(s.grossCents) && validVat(s.vatBps);
  if (!shippingReady) missing.add('Het verzendtarief is nog niet vastgesteld.');
  const complete = !missing.size;
  const subtotal=lines.every(l=>l.grossCents!==null)?lines.reduce((n,l)=>n+l.grossCents,0):null;
  const grossCents=complete?subtotal+s.grossCents:null;
  const netCents=complete?lines.reduce((n,l)=>n+l.netCents,0)+net(s.grossCents,s.vatBps):null;
  const available=clean.every(i=>catalog.products.find(p=>p.id===i.productId).status==='available');
  return {currency:'EUR',catalogVersion:catalog.version,lines,subtotalCents:subtotal,shippingCents:shippingReady?s.grossCents:null,grossCents,netCents,vatCents:complete?grossCents-netCents:null,complete,checkoutAllowed:complete && available && catalog.salesEnabled,missing:[...missing]};
}
export function customer(input) {
  if (!input || typeof input!=='object') throw new ShopError('Vul je bezorggegevens in.');
  const c={};
  for(const [key,max] of Object.entries({name:100,email:200,street:160,postalCode:10,city:100,country:2})) {
    if(typeof input[key]!=='string') throw new ShopError('Vul alle bezorggegevens in.');
    c[key]=input[key].trim();
    if(!c[key] || c[key].length>max || /[\u0000-\u001f]/.test(c[key])) throw new ShopError('Controleer je bezorggegevens.');
  }
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email) || !/^[1-9][0-9]{3}\s?[a-z]{2}$/i.test(c.postalCode) || c.country!=='NL') throw new ShopError('Controleer je e-mailadres en Nederlandse postcode.');
  return c;
}
