const assert = require('node:assert/strict');
const { test } = require('node:test');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');
const source = fs.readFileSync(path.join(__dirname, '../app.js'), 'utf8');

function heightField(pixels, w, h, isText = false, options = {}) {
  const context = { pixels, w, h, state: { focusX: 0.5, focusY: 0.5, backgroundSoftness: 0.8, ...options } };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('function buildTextRelief('),source.indexOf('function renderRelief()')),context);
  vm.runInContext(isText ? 'this.result=buildTextRelief(pixels,w,h).heights' : 'this.result=buildImageRelief(pixels,w,h,state).heights',context);
  return context.result;
}

test('only the cut-out subject rises; transparent background remains at zero', () => {
  const w = 40, h = 40, pixels = new Uint8ClampedArray(w * h * 4);
  for (let y = 8; y < 32; y++) for (let x = 8; x < 32; x++) {
    const i = (y * w + x) * 4;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = x < 20 ? 60 : 200;
    pixels[i + 3] = 255;
  }
  const heights = heightField(pixels, w, h);
  assert.equal(heights[20 * w + 3], 0);
  assert.equal(heights[3 * w + 20], 0);
  assert.ok(heights[20 * w + 14] > 0);
  assert.ok(heights[20 * w + 26] > 0);

  assert.ok(heights[20 * w + 8] < heights[20 * w + 14]);
  assert.ok(heights.every(value => Number.isFinite(value) && value >= 0));
});

test('softening retains the full image while reducing busy background detail', () => {
  const w = 96, h = 64, pixels = new Uint8ClampedArray(w * h * 4);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    pixels[i] = pixels[i + 1] = pixels[i + 2] = Math.floor(x / 3) % 2 ? 60 : 200;
    pixels[i + 3] = 255;
  }
  const sharp = heightField(pixels, w, h, false, { focusX: 0.8, backgroundSoftness: 0 });
  const soft = heightField(pixels, w, h, false, { focusX: 0.8, backgroundSoftness: 1 });
  const variation = heights => {
    let total = 0;
    for (let x = 10; x < 30; x++) total += Math.abs(heights[32 * w + x + 1] - heights[32 * w + x]);
    return total;
  };
  assert.ok(variation(soft) < variation(sharp) * 0.4);
  assert.ok(soft[32 * w + 12] > 0);
  assert.ok(soft[32 * w + 80] > 0);
});

test('text remains raised instead of being inverted by the photo processing', () => {
  const w = 24, h = 24, pixels = new Uint8ClampedArray(w * h * 4);
  for (let y = 5; y < 19; y++) for (let x = 5; x < 19; x++) {
    pixels.fill(255, (y * w + x) * 4, (y * w + x) * 4 + 4);
  }
  const heights = heightField(pixels, w, h, true);
  assert.equal(heights[0], 0);
  assert.ok(Math.abs(heights[12 * w + 12] - 3.5 * 1.94 / 160) < 1e-6);
  const withDifferentPhotoSettings = heightField(pixels, w, h, true, {
    backgroundSoftness: 1, focusX: 0, focusY: 0,
  });
  assert.deepEqual([...heights], [...withDifferentPhotoSettings]);
  assert.ok(heights[12 * w + 5] > 0);
  assert.ok(heights[12 * w + 5] < heights[12 * w + 12]);
});

test('image tones remain at least 0.5 mm raised inside the blended perimeter', () => {
  const w = 64, h = 48, unitsPerMm = 1.94 / 160;
  for (const value of [0, 60, 128, 200, 255]) {
    const pixels = new Uint8ClampedArray(w * h * 4);
    for (let i = 0; i < w * h; i++) {
      pixels[i * 4] = pixels[i * 4 + 1] = pixels[i * 4 + 2] = value;
      pixels[i * 4 + 3] = 255;
    }
    const heights = heightField(pixels, w, h);
    for (let y = 12; y < h - 12; y++) for (let x = 12; x < w - 12; x++) {
      assert.ok(heights[y * w + x] >= 0.5 * unitsPerMm - 1e-8);
      assert.ok(heights[y * w + x] <= 9.5 * unitsPerMm + 1e-8);
    }
  }
});

test('image perimeter joins the bar at zero height through a gradual rounded transition', () => {
  const w = 120, h = 80, pixels = new Uint8ClampedArray(w * h * 4);
  pixels.fill(255);
  const heights = heightField(pixels, w, h);
  const row = 40 * w;
  assert.equal(heights[row], 0);
  assert.ok(heights[row + 2] < heights[row + 5]);
  assert.ok(heights[row + 5] < heights[row + 10]);
  assert.ok(Math.abs(heights[row + 12] - heights[row + 30]) < 1e-8);
  assert.ok(heights[row + 1] < heights[row + 30] * 0.08);
});
test('removing an image while it is processing prevents the old result from returning', async () => {
  let finishReading;
  const elements = new Map();
  const element = selector => {
    if (!elements.has(selector)) elements.set(selector, { setAttribute() {}, removeAttribute() {}, decode: () => new Promise(resolve => { finishReading = resolve; }) });
    return elements.get(selector);
  };
  const context = {
    state: { imageUrl: null }, imageJob: 0,
    $: element, URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },

    updatePreview() {}, console,
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('async function prepareImage(file)')), context);
  const pending = vm.runInContext('prepareImage({name:"old.png"})', context);
  context.imageJob++;
  context.state.sourceFile = null;
  context.state.imageUrl = null;
  context.state.imageProcessing = false;
  finishReading();
  await pending;
  assert.equal(context.state.imageUrl, null);
  assert.equal(context.state.sourceFile, null);
  assert.equal(context.state.imageProcessing, false);
});

test('changing chocolate reuses the image geometry instead of rebuilding it', () => {
  let reads = 0, uploads = 0, draws = 0;
  const pixels = new Uint8ClampedArray(640 * 360 * 4);
  pixels.fill(255);
  const gl = new Proxy({
    createShader: () => ({}), createProgram: () => ({}), createBuffer: () => ({}),
    getShaderParameter: () => true, getProgramParameter: () => true,
    getAttribLocation: () => 0,
    bufferData: () => { uploads++; }, drawArrays: () => { draws++; },
  }, { get: (object, key) => key in object ? object[key] : () => {} });
  const canvas = { width: 1280, height: 720, getContext: () => gl };
  const image = { complete: true, naturalWidth: 640, naturalHeight: 360 };
  const context = {
    state: { decoration: 'image', imageUrl: 'same-subject', side: 'front', chocolate: 'milk', focusX: 0.5, focusY: 0.5, backgroundSoftness: 0.8 },
    chocolates: { milk: { colors: ['#a34c27'] }, dark: { colors: ['#71351f'] } },
    $: selector => selector === '#bar-relief' ? canvas : image,
    document: { createElement: () => ({ getContext: () => ({
      drawImage() {}, getImageData: () => { reads++; return { data: pixels }; },
    }) }) },
    showToast: () => assert.fail('WebGL should be available'),
  };
  vm.createContext(context);
  const start = source.indexOf('function buildTextRelief(');
  const end = source.indexOf('async function prepareImage', start);
  vm.runInContext(source.slice(start, end), context);
  vm.runInContext('renderRelief()', context);
  context.state.chocolate = 'dark';
  vm.runInContext('renderRelief()', context);
  assert.equal(reads, 1);
  assert.equal(uploads, 1);
  assert.equal(draws, 2);
});
