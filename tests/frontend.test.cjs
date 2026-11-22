const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createBrowser } = require('./dom-helper.cjs');
const { createServer } = require('../server.js');
const chat = require('../taste-chat.js');
const catalog = require('../catalog.js');
const selection = { chocolateId: 'milk', toppingIds: [] };
const filter = { excluded: [], severe: false, needsReview: false };
const offline = () => assert.fail('stored-flavor chat must not make a network request');

test('all saved combinations use real catalog products and 2–4 unique toppings', () => {
  const ids = new Set(catalog.toppings.map(p => p.id));
  assert.equal(chat.combinations.length, 14);
  for (const combo of chat.combinations) {
    assert.ok(catalog.chocolates.some(p => p.id === combo.chocolateId));
    assert.ok(combo.toppingIds.length >= 2 && combo.toppingIds.length <= 4);
    assert.equal(new Set(combo.toppingIds).size, combo.toppingIds.length);
    assert.ok(combo.toppingIds.every(id => ids.has(id)));
  }
});

test('stored replies match preferences, remember exclusions and offer another saved combination', () => {
  const first = chat.respond('mørk og fruktig, uten lakris', chat.createState(), selection, filter);
  assert.equal(first.combination.chocolateId, 'dark');
  assert.ok(first.combination.tags.includes('fruit'));
  assert.ok(!first.combination.toppingIds.includes('licorice'));
  const next = chat.respond('et annet forslag', first.state, selection, filter);
  assert.equal(next.combination.chocolateId, 'dark');
  assert.ok(!next.combination.toppingIds.includes('licorice'));
  assert.notEqual(next.combination.id, first.combination.id);
  assert.notEqual(chat.respond('ikke hvit', chat.createState(), selection, filter).combination.chocolateId, 'white');
});

test('unknown input is explained honestly, and allergy requests never imply safety', () => {
  const unknown = chat.respond('Hva er været i morgen?', chat.createState(), selection, filter);
  assert.equal(unknown.combination, null); assert.match(unknown.reply, /ikke KI/);
  for (const message of ['Jeg har melkeallergi', 'glutenfri', 'uten melk']) {
    const result = chat.respond(message, chat.createState(), selection, filter);
    assert.equal(result.combination, null); assert.equal(result.allergenFilter.needsReview, true);
  }
  assert.equal(chat.respond('søtt og salt', chat.createState(), selection, { ...filter, excluded: ['milk'] }).combination, null);
});

test('chat works fully offline: text/shortcut → saved card → plate; Enter and Escape work', async () => {
  const { document, context } = createBrowser(offline);
  const $ = selector => document.querySelector(selector);
  assert.equal($('#chat-send').disabled, false);
  await $('#professor-toggle').click(); assert.equal($('#professor-panel').hidden, false);
  await document.querySelectorAll('[data-prompt]').find(button => button.dataset.prompt === 'Søtt og salt').click();
  assert.equal(document.querySelectorAll('.taste-suggestion').length, 1);
  await document.querySelector('.apply-suggestion').click();
  assert.ok(context.FrydaDesigner.getSelection().toppingIds.includes('salted-caramel'));
  assert.match($('#preview-toppings').textContent, /Salt karamell/);
  $('#chat-input').value = 'rosa og fruktig'; await $('#chat-form').emit('submit');
  assert.equal(document.querySelectorAll('.taste-suggestion').length, 2);
  await document.querySelectorAll('.apply-suggestion')[1].click();
  assert.equal(context.FrydaDesigner.getSelection().chocolateId, 'pink');
  await $('#professor-panel').emit('keydown', { key: 'Escape' });
  assert.equal($('#professor-panel').hidden, true); assert.equal(document.activeElement, $('#professor-toggle'));
});

test('history and preferences survive reload in this browser session; reset retains allergen restrictions', async () => {
  const storage = new Map();
  const first = createBrowser(offline, storage);
  first.document.querySelector('#chat-input').value = 'mørk uten lakris';
  await first.document.querySelector('#chat-form').emit('submit');
  const second = createBrowser(offline, storage);
  assert.equal(second.document.querySelectorAll('.chat-message').length, 2);
  second.document.querySelector('#chat-input').value = 'et annet forslag';
  await second.document.querySelector('#chat-form').emit('submit');
  await second.document.querySelectorAll('.apply-suggestion')[1].click();
  assert.equal(second.context.FrydaDesigner.getSelection().chocolateId, 'dark');
  assert.ok(!second.context.FrydaDesigner.getSelection().toppingIds.includes('licorice'));
  second.context.FrydaDesigner.setAllergenFilter({ ...filter, excluded: ['milk'] });
  assert.ok(second.document.querySelectorAll('.apply-suggestion').every(button => button.disabled));
  await second.document.querySelector('#chat-reset').click();
  assert.equal(second.document.querySelectorAll('.chat-message').length, 0);
  assert.deepEqual([...second.context.FrydaDesigner.getAllergenFilter().excluded], ['milk']);
});

test('optional server serves chat files but has no model endpoints or public secrets', async t => {
  const server = createServer(); server.listen(0, '127.0.0.1'); await once(server, 'listening');
  t.after(() => new Promise(resolve => { server.closeAllConnections(); server.close(resolve); }));
  const base = `http://127.0.0.1:${server.address().port}`;
  for (const file of ['/', '/professor.js', '/flavor-combinations.js', '/taste-chat.js']) assert.equal((await fetch(base + file)).status, 200);
  for (const file of ['/.env', '/.git/config', '/api/chat', '/api/status', '/server.js']) assert.equal((await fetch(base + file)).status, 404);
});
