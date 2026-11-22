(function (root) {
  const catalog = typeof module !== 'undefined' && module.exports ? require('./catalog.js') : root.FRYDA_CATALOG;
  const combinations = typeof module !== 'undefined' && module.exports ? require('./flavor-combinations.js') : root.FRYDA_COMBINATIONS;
  const products = new Map([...catalog.chocolates, ...catalog.toppings].map(p => [p.id, p]));
  const normalize = text => String(text).toLowerCase().replace(/ø/g, 'o').replace(/æ/g, 'ae').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const aliases = {
    raspberry: ['bringebaer'], strawberry: ['jordbaer'], blueberry: ['blabaer'], hazelnut: ['hasselnotter', 'hasselnot'], almond: ['mandler', 'mandel'],
    'salted-caramel': ['salt karamell', 'karamell'], licorice: ['lakris'], marshmallow: ['marshmallows', 'marshmallow'],
    'chocolate-chips': ['sjokoladebiter'], 'sea-salt': ['havsalt'], 'cookie-crunch': ['kjeksknas', 'kjeks'], 'sugar-pearls': ['sukkerperler'],
  };
  const tagPatterns = { sweet: /\b(sott|sot|sotere|sodme|sote)\b/, salt: /\b(salt|saltere|salte)\b/, fruit: /\b(friskt|frisk|friskere|fruktig|frukt|baer)\b/, crunch: /\b(sprott|spro|knas|notter|crunch)\b/, intense: /\b(kraftig|intens|bitter)\b/ };
  const chocolatePatterns = { milk: /\b(melk|melkesjokolade)\b/, dark: /\b(mork|morke|morkere|morkt)\b/, white: /\b(hvit|hvitere)\b/, pink: /\b(rosa|ruby)\b/ };
  function createState(saved = {}) {
    return {
      chocolateId: catalog.chocolates.some(p => p.id === saved.chocolateId) ? saved.chocolateId : null,
      excludedChocolates: Array.isArray(saved.excludedChocolates) ? saved.excludedChocolates.filter(id => catalog.chocolates.some(p => p.id === id)) : [],
      tags: Array.isArray(saved.tags) ? saved.tags.filter(tag => Object.hasOwn(tagPatterns, tag)) : [],
      liked: Array.isArray(saved.liked) ? saved.liked.filter(id => Object.hasOwn(aliases, id)) : [],
      excluded: Array.isArray(saved.excluded) ? saved.excluded.filter(id => Object.hasOwn(aliases, id)) : [],
      previous: Array.isArray(saved.previous) ? saved.previous.filter(id => combinations.some(c => c.id === id)).slice(-20) : [],
    };
  }
  function isAllowed(combination, filter = { excluded: [] }) {
    if (!combination || !products.has(combination.chocolateId) || combination.toppingIds.length < 2 || combination.toppingIds.length > 4 || new Set(combination.toppingIds).size !== combination.toppingIds.length) return false;
    if (!filter.excluded.length && !filter.severe && !filter.needsReview) return combination.toppingIds.every(id => products.has(id));
    if (filter.severe || filter.needsReview) return false;
    return [combination.chocolateId, ...combination.toppingIds].every(id => {
      const info = products.get(id)?.allergens;
      return info?.status === 'verified' && info.source && info.verifiedAt && Array.isArray(info.contains) && Array.isArray(info.mayContain) && !filter.excluded.some(a => info.contains.includes(a) || info.mayContain.includes(a));
    });
  }
  function respond(message, previousState, selection, currentFilter) {
    const state = createState(previousState);
    const text = normalize(message);
    const filter = { excluded: [...(currentFilter.excluded || [])], severe: !!currentFilter.severe, needsReview: !!currentFilter.needsReview };
    const allergy = /allerg|intoleran|coliaki|glutenfri|melkefri|nottefri|uten\s+(melk|gluten|notter|peanotter)/.test(text);
    if (allergy) {
      filter.needsReview = true;
      if (/melk|laktose/.test(text)) filter.excluded.push('milk');
      if (/gluten|coliaki/.test(text)) filter.excluded.push('gluten');
      if (/notter|mandler|hassel/.test(text)) filter.excluded.push('tree-nuts');
      if (/peanott/.test(text)) filter.excluded.push('peanuts');
      filter.excluded = [...new Set(filter.excluded)];
    }
    const blocked = filter.excluded.length || filter.severe || filter.needsReview;
    if (blocked) return { state, allergenFilter: filter, combination: null, reply: 'Allergenopplysningene er ikke bekreftet, så jeg kan ikke velge en kombinasjon som passer allergibehovet ditt. Fryda AS må avklare ingredienser og krysskontakt først. Matinfo er ikke tilkoblet.' };
    let matched = false;
    for (const [id, pattern] of Object.entries(chocolatePatterns)) {
      const word = text.match(pattern)?.[0];
      if (!word) continue;
      matched = true;
      if (new RegExp(`(?:uten|ikke(?:\\s+ha)?)\\s+${word}\\b`).test(text)) {
        if (!state.excludedChocolates.includes(id)) state.excludedChocolates.push(id);
        if (state.chocolateId === id) state.chocolateId = null;
      } else { state.chocolateId = id; state.excludedChocolates = state.excludedChocolates.filter(value => value !== id); }
    }
    for (const [tag, pattern] of Object.entries(tagPatterns)) if (pattern.test(text)) { if (!state.tags.includes(tag)) state.tags.push(tag); matched = true; }
    for (const [id, words] of Object.entries(aliases)) {
      const word = words.find(alias => new RegExp(`\\b${alias}\\b`).test(text));
      if (!word) continue;
      matched = true;
      const negative = new RegExp(`(?:uten|ikke(?:\\s+ha)?|unng[aå])\\s+(?:noen?\\s+)?${word}\\b`).test(text);
      if (negative) { if (!state.excluded.includes(id)) state.excluded.push(id); state.liked = state.liked.filter(value => value !== id); }
      else { if (!state.liked.includes(id)) state.liked.push(id); state.excluded = state.excluded.filter(value => value !== id); }
    }
    const another = /overrask|annet|annen|andre|forslag|kombinasjon|gave|pro[vb]|anbefal/.test(text);
    if (!matched && !another) return { state, allergenFilter: filter, combination: null, reply: 'Jeg finner forslag i lagrede smakskombinasjoner, og er ikke KI. Vil du ha søtt og salt, friskt og fruktig, noe sprøtt eller en bestemt sjokoladetype?' };
    const preferredChocolate = state.chocolateId || selection.chocolateId;
    const candidates = combinations.filter(c => isAllowed(c, filter) && !state.excludedChocolates.includes(c.chocolateId) && (!state.chocolateId || c.chocolateId === state.chocolateId) && !c.toppingIds.some(id => state.excluded.includes(id)));
    if (!candidates.length) return { state, allergenFilter: filter, combination: null, reply: 'Jeg har ingen lagret kombinasjon som passer alle disse ønskene. Prøv en annen sjokoladetype eller et annet smakstema.' };
    const score = c => (c.chocolateId === preferredChocolate ? 2 : 0) + c.tags.filter(tag => state.tags.includes(tag)).length * 4 + c.toppingIds.filter(id => state.liked.includes(id)).length * 7 + c.toppingIds.filter(id => selection.toppingIds.includes(id)).length - (state.previous.includes(c.id) ? 20 : 0);
    const combination = [...candidates].sort((a, b) => score(b) - score(a))[0];
    state.previous.push(combination.id); state.previous = state.previous.slice(-20);
    return { state, allergenFilter: filter, combination, reply: `Fra smaksboken: ${combination.name}. ${combination.explanation}` };
  }
  const api = { combinations, createState, isAllowed, respond };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FRYDA_TASTE_CHAT = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
