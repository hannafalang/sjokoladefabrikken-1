// Minimal DOM harness for event/data integration. This is not a visual browser test.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function createBrowser(fetchImpl, storage = new Map()) {
  let document;
  class Element {
    constructor(tagName) {
      this.tagName = tagName.toLowerCase(); this.children = []; this.parent = null;
      this.dataset = {}; this.attributes = {}; this.listeners = new Map();
      this.className = ''; this.hidden = false; this.disabled = false; this.checked = false;
      this.value = ''; this._text = ''; this.scrollTop = 0;
      this.style = { setProperty(name, value) { this[name] = value; } };
      this.classList = {
        contains: name => this.className.split(/\s+/).includes(name),
        add: name => { if (!this.classList.contains(name)) this.className += ` ${name}`; },
        toggle: (name, on) => {
          const values = new Set(this.className.split(/\s+/).filter(Boolean));
          if (on ?? !values.has(name)) values.add(name); else values.delete(name);
          this.className = [...values].join(' ');
        },
      };
    }
    set textContent(value) { this._text = String(value); this.children.forEach(child => { child.parent = null; }); this.children = []; }
    get textContent() { return this._text + this.children.map(child => child.textContent).join(''); }
    get scrollHeight() { return this.children.length * 100; }
    append(...nodes) { for (const node of nodes) { node.parent = this; this.children.push(node); } }
    replaceChildren(...nodes) { this._text = ''; this.children.forEach(child => { child.parent = null; }); this.children = []; this.append(...nodes); }
    remove() { if (this.parent) this.parent.children = this.parent.children.filter(child => child !== this); this.parent = null; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    getAttribute(name) { return this.attributes[name]; }
    addEventListener(name, listener) { if (!this.listeners.has(name)) this.listeners.set(name, []); this.listeners.get(name).push(listener); }
    async emit(type, properties = {}) {
      const event = { type, target: this, currentTarget: this, preventDefault() {}, ...properties };
      await Promise.all((this.listeners.get(type) || []).map(listener => listener(event)));
    }
    click() { if (!this.disabled) return this.emit('click'); return Promise.resolve(); }
    focus() { document.activeElement = this; }
    querySelector(selector) { return query(this, selector)[0] || null; }
    querySelectorAll(selector) { return query(this, selector); }
  }
  const root = new Element('body');
  function descendants(element) { return element.children.flatMap(child => [child, ...descendants(child)]); }
  function matches(element, selector) {
    if (selector.startsWith('#')) return element.id === selector.slice(1);
    if (selector.startsWith('.')) return element.classList.contains(selector.slice(1));
    const data = selector.match(/^\[data-([a-z-]+)\]$/);
    if (data) return Object.hasOwn(element.dataset, data[1].replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()));
    if (selector === 'input:checked') return element.tagName === 'input' && element.checked;
    return element.tagName === selector;
  }
  function query(element, selector) {
    const parts = selector.split(' ');
    if (parts.length > 1) return query(element, parts[0]).flatMap(scope => query(scope, parts.slice(1).join(' ')));
    return descendants(element).filter(node => matches(node, selector));
  }
  document = { createElement: tag => new Element(tag), querySelector: selector => query(root, selector)[0] || null, querySelectorAll: selector => query(root, selector) };
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  for (const match of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)) {
    const [, tag, attributes] = match;
    const element = new Element(tag);
    for (const attr of attributes.matchAll(/([\w-]+)="([^"]*)"/g)) {
      const [, name, value] = attr;
      if (name === 'id') element.id = value;
      else if (name === 'class') element.className = value;
      else if (name === 'value' || name === 'type') element[name] = value;
      else if (name.startsWith('data-')) element.dataset[name.slice(5).replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())] = value;
      element.setAttribute(name, value);
    }
    element.hidden = /\bhidden\b/.test(attributes);
    root.append(element);
  }
  const listeners = new Map();
  const context = { document, fetch: fetchImpl, AbortSignal, Event, console,
    sessionStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
    setTimeout: () => 0, clearTimeout() {},
    addEventListener(type, callback) { if (!listeners.has(type)) listeners.set(type, []); listeners.get(type).push(callback); },
    dispatchEvent(event) { for (const callback of listeners.get(event.type) || []) callback(event); },
  };
  context.window = context;
  vm.createContext(context);
  for (const file of ['catalog.js', 'flavor-combinations.js', 'taste-chat.js', 'app.js', 'professor.js']) {
    vm.runInContext(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), context, { filename: file });
  }
  return { context, document };
}

async function waitFor(predicate) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > 3000) throw new Error('Timed out waiting for frontend state');
    await new Promise(resolve => setTimeout(resolve, 5));
  }
}

module.exports = { createBrowser, waitFor };
