// Unknown commercial facts are null, never inferred. Prices are integer EUR cents.
export const catalog = {
  version: '2026-11-07', currency: 'EUR', salesEnabled: false,
  shipping: { NL: { grossCents: null, vatBps: null } },
  products: [
    { id: 'de-klok', name: 'De Klok', number: '01', material: 'Bamboe',
      description: 'Een bamboe klok, met ruimte voor een persoonlijk verhaal. Met de hand te personaliseren.',
      status: 'preparation', image: null, leadTime: null,
      variants: [{id: 'persoonlijk', label: 'Met personalisatie', grossCents: null, vatBps: null}],
      personalization: {enabled: true, maxLength: 120} },
    { id: 'de-bureaulader', name: 'De Bureaulader', number: '02', material: 'Bamboe',
      description: 'Een draadloze Qi-bureaulader van bamboe. Een praktisch object met een persoonlijke toevoeging.',
      status: 'preparation', image: null, leadTime: null,
      variants: [{id: 'persoonlijk', label: 'Met personalisatie', grossCents: null, vatBps: null}],
      personalization: {enabled: true, maxLength: 120} },
    { id: 'de-wijnset', name: 'De Wijnset', number: '03', material: 'Bamboe',
      description: 'Een wijnaccessoireset van bamboe. Een volgende toevoeging aan de Objects-collectie.',
      status: 'coming_soon', image: null, leadTime: null,
      variants: [], personalization: {enabled: false, maxLength: 0} }
  ]
};
