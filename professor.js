(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const designer = window.FrydaDesigner;
  const library = window.FRYDA_TASTE_CHAT;
  const products = new Map([...window.FRYDA_CATALOG.chocolates, ...window.FRYDA_CATALOG.toppings].map(p => [p.id, p]));
  const panel = $('#professor-panel'), log = $('#chat-log'), input = $('#chat-input');
  const storageKey = 'fryda-stored-flavors-v1';
  const cards = [];
  let preferences = library.createState(), messages = [], nextId = 0;
  function showError(text) { $('#chat-error').textContent = text; $('#chat-error').hidden = !text; }
  function updateCards() {
    for (const card of cards) {
      const allowed = library.isAllowed(card.combination, designer.getAllergenFilter());
      card.button.disabled = card.applied || !allowed;
      card.note.textContent = allowed ? 'Allergenopplysninger er ikke bekreftet. Avklar med Fryda AS før bestilling.' : 'Kan ikke brukes med gjeldende allergenfilter. Produktopplysningene må avklares.';
    }
  }
  function save() {
    try { window.sessionStorage?.setItem(storageKey, JSON.stringify({ preferences, messages: messages.slice(-60), allergenFilter: designer.getAllergenFilter() })); } catch {}
  }
  function makeCard(combination) {
    const card = document.createElement('div'); card.className = 'taste-suggestion';
    const title = document.createElement('h4'); title.textContent = combination.name;
    const chocolate = document.createElement('p'); chocolate.textContent = products.get(combination.chocolateId).name;
    const list = document.createElement('ul');
    combination.toppingIds.forEach(id => { const item = document.createElement('li'); item.textContent = products.get(id).name; list.append(item); });
    const note = document.createElement('p'); note.className = 'suggestion-allergens';
    const button = document.createElement('button'); button.type = 'button'; button.className = 'apply-suggestion'; button.textContent = 'Prøv denne kombinasjonen';
    const entry = { combination, button, note, applied: false }; cards.push(entry);
    button.addEventListener('click', () => {
      showError('');
      try {
        if (!library.isAllowed(combination, designer.getAllergenFilter())) throw new Error('Forslaget kan ikke brukes med gjeldende allergenfilter.');
        designer.applySelection({ chocolateId: combination.chocolateId, toppingIds: [...combination.toppingIds] });
        entry.applied = true; button.textContent = 'Lagt på platen'; updateCards();
      } catch (error) { showError(error.message); }
    });
    card.append(title, chocolate, list, note, button); return card;
  }
  function renderMessage(message) {
    log.querySelector('.chat-empty')?.remove();
    const element = document.createElement('article');
    element.className = `chat-message chat-message--${message.role === 'user' ? 'user' : 'professor'}`;
    const label = document.createElement('strong'); label.textContent = message.role === 'user' ? 'Du' : 'Smaksprofessoren';
    const body = document.createElement('p'); body.textContent = message.content;
    element.append(label, body);
    const combination = library.combinations.find(c => c.id === message.combinationId);
    if (combination) element.append(makeCard(combination));
    log.append(element); log.scrollTop = log.scrollHeight;
  }
  function emptyState() {
    const empty = document.createElement('p'); empty.className = 'chat-empty';
    empty.textContent = 'Skriv for eksempel «mørk og fruktig», «søtt og salt» eller «uten lakris». Jeg velger fra lagrede kombinasjoner.';
    log.append(empty);
  }
  function send(text) {
    const content = text.trim();
    if (!content) { input.focus(); return; }
    if (content.length > 1500) { showError('Meldingen kan være maksimalt 1500 tegn.'); return; }
    showError(''); input.value = '';
    const result = library.respond(content, preferences, designer.getSelection(), designer.getAllergenFilter());
    preferences = result.state;
    designer.setAllergenFilter(result.allergenFilter);
    const user = { id: ++nextId, role: 'user', content };
    const answer = { id: ++nextId, role: 'assistant', content: result.reply, combinationId: result.combination?.id || null };
    messages.push(user, answer); messages = messages.slice(-60);
    renderMessage(user); renderMessage(answer); updateCards(); save();
    if (!panel.hidden) input.focus();
  }
  $('#professor-toggle').addEventListener('click', () => {
    panel.hidden = !panel.hidden; $('#professor-toggle').setAttribute('aria-expanded', String(!panel.hidden));
    if (!panel.hidden) input.focus();
  });
  function close() { panel.hidden = true; $('#professor-toggle').setAttribute('aria-expanded', 'false'); $('#professor-toggle').focus(); }
  $('#close-professor').addEventListener('click', close);
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); close(); } });
  $('#chat-form').addEventListener('submit', event => { event.preventDefault(); send(input.value); });
  document.querySelectorAll('[data-prompt]').forEach(button => { button.addEventListener('click', () => send(button.dataset.prompt)); });
  $('#chat-reset').addEventListener('click', () => {
    preferences = library.createState(); messages = []; cards.length = 0; log.replaceChildren(); showError(''); emptyState(); save(); input.focus();
  });
  window.addEventListener('fryda:filterchange', () => { updateCards(); save(); });
  try {
    const saved = JSON.parse(window.sessionStorage?.getItem(storageKey) || 'null');
    if (saved && typeof saved === 'object') {
      preferences = library.createState(saved.preferences);
      messages = Array.isArray(saved.messages) ? saved.messages.filter(m => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.length <= 1600).slice(-60) : [];
      nextId = messages.length;
      const filter = saved.allergenFilter;
      if (filter && Array.isArray(filter.excluded)) {
        const current = designer.getAllergenFilter();
        const known = new Set(window.FRYDA_CATALOG.allergens.map(a => a.id));
        designer.setAllergenFilter({ excluded: [...new Set([...current.excluded, ...filter.excluded.filter(id => known.has(id))])], severe: current.severe || filter.severe === true, needsReview: current.needsReview || filter.needsReview === true });
      }
    }
  } catch {}
  if (messages.length) messages.forEach(renderMessage); else emptyState();
  updateCards();
})();
