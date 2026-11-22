const chocolates = {
  milk: { name: "Melkesjokolade", colors: ["#a9562c", "#732c0a", "#9f4d23"] },
  dark: { name: "Mørk sjokolade", colors: ["#803f1d", "#542104", "#783716"] },
  white: { name: "Hvit sjokolade", colors: ["#f8ebc3", "#b79865", "#fff5d0"] },
  pink: { name: "Rosa sjokolade", colors: ["#f19cab", "#a23f4c", "#ffb0bd"] },
};

const chocolateMotifs = {
  dark: {
    flower: "./assets/dark-blomst.png",
    train: "./assets/dark-tog.png",
    congratulations: "./assets/dark-gratulerer.png",
  },
  milk: {
    flower: "./assets/milk-blomst.png",
    train: "./assets/milk-tog.png",
    congratulations: "./assets/milk-gratulerer.png",
  },
  white: {
    flower: "./assets/white-blomst.png",
    train: "./assets/white-tog.png",
    congratulations: "./assets/white-gratulerer.png",
  },
  pink: {
    flower: "./assets/pink-blomst.png",
    train: "./assets/pink-tog.png",
    congratulations: "./assets/pink-gratulerer.png",
  },
};

const motifNames = {
  flower: "Blomsterrelieff",
  train: "Sjokoladetog",
  congratulations: "Gratulerer med dagen",
};

const toppings = [
  { name: "Nonstop", category: "Sjokolade", allergens: ["Melk", "Soya"], paid: true, color: "#cb4b42", shape: "candy" },
  { name: "Seigmenn", category: "Søtt", allergens: [], paid: true, color: "#e5aa54", shape: "gummy" },
  { name: "Salt lakris", category: "Salt", allergens: ["Hvete"], color: "#382828", shape: "licorice" },
  { name: "Myk karamell", category: "Søtt", allergens: ["Melk"], paid: true, color: "#aa7047", shape: "caramel" },
  { name: "Bringebærbiter", category: "Fruktig", allergens: [], paid: true, color: "#b7395f", shape: "raspberry" },
  { name: "Havsalt", category: "Salt", paid: true, color: "#f0e5c8", shape: "salt" },
  { name: "Mini-marshmallows", category: "Søtt", allergens: [], paid: true, color: "#e9c2c8", shape: "marshmallow" },
  { name: "Kjeksbiter", category: "Sjokolade", allergens: ["Hvete", "Melk"], paid: true, color: "#ad805c", shape: "cookie" },
  { name: "Salte kringler", category: "Salt", allergens: ["Hvete"], paid: true, color: "#865537", shape: "pretzel" },
  { name: "Surt eple", category: "Syrlig", allergens: [], paid: true, color: "#86a65c", shape: "apple" },
  { name: "Sure jordbær", category: "Syrlig", allergens: [], paid: true, color: "#d85d69", shape: "strawberry" },
  { name: "Sitronbiter", category: "Syrlig", allergens: [], paid: true, color: "#e8d75c", shape: "lemon" },
  { name: "Jordbærbiter", category: "Fruktig", allergens: [], paid: true, color: "#ce6271", shape: "strawberry-piece" },
  { name: "Appelsinskall", category: "Fruktig", allergens: [], paid: true, color: "#e78a3b", shape: "orange" },
  { name: "Krokankrønsj", category: "Sprøtt", allergens: ["Mandler", "Melk"], paid: true, color: "#b1814e", shape: "brittle" },
  { name: "Hasselnøtter", category: "Nøtter", allergens: ["Hasselnøtter"], paid: true, color: "#95643d", shape: "hazelnut" },
  { name: "Marsipanbiter", category: "Nøtter", allergens: ["Mandler"], paid: true, color: "#d4ad83", shape: "marzipan" },
  { name: "Vaniljefudge", category: "Søtt", allergens: ["Melk"], paid: true, color: "#e5cba1", shape: "fudge" },
  { name: "Surt colagodteri", category: "Syrlig", allergens: [], paid: true, color: "#6e4850", shape: "cola" },
  { name: "Chiliflak", category: "Sterkt", allergens: [], paid: true, color: "#ba3c30", shape: "chili" },
  { name: "Salt karamell", category: "Salt", allergens: ["Melk"], paid: true, color: "#bd8151", shape: "salted-caramel" },
];

const state = {
  chocolate: "milk",
  selectedToppings: new Set(),
  filter: "Alle",
  query: "",
  shape: "rektangel",
  plateName: "",
  occasion: "",
  packaging: "standard",
  allergenFilter: { excluded: [], severe: false },
  imageUrl: null,
  imageMode: "",
  imageProcessing: false,
  sourceFile: null,
  imageJob: 0,
  focusX: 0.5,
  focusY: 0.5,
  backgroundSoftness: 0.8,
  selectedMotif: "",
  ownsImageUrl: false,
  demoImage: false,
  demoImageName: "",
  previewBack: true,
  decoration: "none",
  text: "",
  font: "classic",
};

const $ = (selector) => document.querySelector(selector);
const toppingGrid = $("#topping-options");
let toastTimeout;
let shareImageUrl;
let shareImageFile;

const allergenOptions = [
  { id: "gluten", name: "Glutenholdige kornslag", matches: ["Hvete", "Gluten"] },
  { id: "milk", name: "Melk", matches: ["Melk"] },
  { id: "eggs", name: "Egg", matches: ["Egg"] },
  { id: "soy", name: "Soya", matches: ["Soya"] },
  { id: "peanuts", name: "Peanøtter", matches: ["Peanøtter"] },
  { id: "tree-nuts", name: "Nøtter", matches: ["Nøtter", "Mandler", "Hasselnøtter"] },
  { id: "sesame", name: "Sesam", matches: ["Sesam"] },
];

function createToppingShape(topping, preview = false) {
  const shape = document.createElement("span");
  shape.className = `topping-shape topping-shape--${topping.shape}${preview ? " topping-shape--preview" : ""}`;
  shape.style.setProperty("--topping-color", topping.color);
  shape.setAttribute("aria-hidden", "true");
  const piece = document.createElement("span");
  piece.className = "topping-shape__piece";
  shape.append(piece);
  return shape;
}

function renderToppings() {
  const query = state.query.trim().toLocaleLowerCase("nb");
  const visible = toppings.filter((topping) => {
    const matchesFilter = state.filter === "Alle" || topping.category === state.filter;
    const matchesQuery = !query || topping.name.toLocaleLowerCase("nb").includes(query);
    return matchesFilter && matchesQuery;
  });

  toppingGrid.replaceChildren(...visible.map((topping) => {
    const selected = state.selectedToppings.has(topping.name);
    const button = document.createElement("button");
    button.type = "button";
    button.className = `topping-option${selected ? " selected" : ""}`;
    button.setAttribute("aria-pressed", String(selected));
    button.disabled = (!selected && state.selectedToppings.size >= 6) || !toppingAllowedByFilter(topping);

    const name = document.createElement("span");
    name.className = "topping-name";
    name.textContent = topping.name;

    const note = document.createElement("span");
    note.className = "topping-note";
    note.textContent = topping.note || (topping.paid ? "+ 9 kr" : "");

    button.append(createToppingShape(topping), name, note);
    button.addEventListener("click", () => toggleTopping(topping.name));
    return button;
  }));
  updateSelection();
}

function toggleTopping(name) {
  if (state.selectedToppings.has(name)) {
    state.selectedToppings.delete(name);
  } else if (state.selectedToppings.size < 6) {
    state.selectedToppings.add(name);
    state.previewBack = true;
  } else {
    showToast("Du kan velge opptil 6 typer smågodt.");
    return;
  }
  renderToppings();
  updatePreview();
}

function updateSelection() {
  const selected = [...state.selectedToppings];
  $("#selection-count").textContent = `${selected.length} av 6 valgt${selected.length ? ` · ${selected.join(", ")}` : ""}`;
}

function getAllergens() {
  const selected = toppings.filter((topping) => state.selectedToppings.has(topping.name));
  const allergens = new Set(["Melk", "Soya"]);
  selected.forEach((topping) => (topping.allergens || []).forEach((allergen) => allergens.add(allergen)));
  return [...allergens].sort((a, b) => a.localeCompare(b, "nb"));
}

function toppingAllowedByFilter(topping) {
  if (state.allergenFilter.severe) return false;
  if (!state.allergenFilter.excluded.length) return true;
  return !state.allergenFilter.excluded.some((allergenId) => {
    const allergen = allergenOptions.find((option) => option.id === allergenId);
    return allergen?.matches.some((name) => (topping.allergens || []).includes(name));
  });
}

function renderAllergenOptions() {
  $("#allergen-options").replaceChildren(...allergenOptions.map((allergen) => {
    const label = document.createElement("label");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = allergen.id;
    input.checked = state.allergenFilter.excluded.includes(allergen.id);
    input.addEventListener("change", readAllergenFilter);
    const text = document.createElement("span");
    text.textContent = allergen.name;
    label.append(input, text);
    return label;
  }));
  $("#severe-allergy").checked = state.allergenFilter.severe;
  $("#allergen-filter-status").textContent = state.allergenFilter.excluded.length || state.allergenFilter.severe
    ? "Filter aktivt. Allergerisk kontroll må fortsatt avklares med leverandøren."
    : "Ingen allergener er valgt.";
}

function readAllergenFilter() {
  state.allergenFilter = {
    excluded: [...document.querySelectorAll("#allergen-options input:checked")].map((input) => input.value),
    severe: $("#severe-allergy").checked,
  };
  renderAllergenOptions();
  renderToppings();
  updatePreview();
}

function updatePackagingPreview() {
  const labels = {
    standard: "Standardemballasje",
    gave: "Gaveinnpakning",
    premium: "Premium gaveeske",
  };
  const preview = $("#selected-packaging");
  preview.dataset.packaging = state.packaging;
  $("#selected-packaging-text").textContent = labels[state.packaging];
  document.querySelectorAll(".packaging-option").forEach((option) => {
    option.classList.toggle("selected", option.dataset.packaging === state.packaging);
  });
}

function updatePreview() {
  const chocolate = chocolates[state.chocolate];
  const [light, dark, piece] = chocolate.colors;
  const bar = $("#chocolate-bar");
  const hasDesign = Boolean(state.imageUrl) || (state.decoration === "text" && state.text.trim());
  const hasToppings = state.selectedToppings.size > 0;
  const hasPlateArtwork = Boolean(state.imageUrl && state.imageMode === "plate");
  bar.dataset.shape = state.shape;
  bar.dataset.artwork = String(hasPlateArtwork);
  bar.dataset.imageRelief = String(hasPlateArtwork && !state.previewBack);
  bar.style.setProperty("--bar-light", light);
  bar.style.setProperty("--bar-dark", dark);
  bar.style.setProperty("--piece-light", light);
  bar.style.setProperty("--piece-dark", piece);
  bar.classList.toggle("is-flipped", state.previewBack);
  bar.setAttribute("aria-label", `${chocolate.name}plate i ${state.shape}form, ${state.previewBack ? "bakside" : "forside"}`);
  $(".chocolate-face--front").setAttribute("aria-hidden", String(state.previewBack));
  $(".chocolate-face--back").setAttribute("aria-hidden", String(!state.previewBack));
  $("#flip-hint").textContent = state.previewBack
    ? "Bakside · toppingene"
    : state.decoration === "text" && state.text.trim()
      ? "Forside · din tekst"
      : hasPlateArtwork ? `Forside · ${state.demoImageName}` : "Forside · toppingene";
  $("#flip-chocolate").hidden = !(hasDesign || hasToppings);
  $("#flip-chocolate").setAttribute("aria-pressed", String(state.previewBack));
  $("#bar-artwork").hidden = !hasPlateArtwork;
  if (hasPlateArtwork) {
    if (typeof $("#bar-artwork").removeAttribute === "function") $("#bar-artwork").removeAttribute("src");
    $("#bar-artwork").alt = `Forhåndsvisning av sjokoladeplate: ${state.demoImageName}`;
  } else {
    if (typeof $("#bar-artwork").removeAttribute === "function") $("#bar-artwork").removeAttribute("src");
    $("#bar-artwork").alt = "";
  }
  const showGreeting = state.decoration === "text" && Boolean(state.text.trim()) && !state.previewBack;
  bar.dataset.textDecoration = String(showGreeting);
  const barName = $("#bar-name");
  const showBarName = Boolean(state.plateName) && !state.previewBack && !showGreeting && !hasPlateArtwork;
  barName.hidden = !showBarName;
  barName.textContent = state.plateName;
  const backImage = state.imageMode === "back" ? state.imageUrl : null;
  bar.dataset.backArtwork = String(Boolean(backImage));
  $("#bar-image").hidden = !backImage;
  if (backImage) {
    if ($("#bar-image").src !== backImage) $("#bar-image").src = backImage;
  } else if (state.imageMode !== "plate") {
    if (typeof $("#bar-image").removeAttribute === "function") $("#bar-image").removeAttribute("src");
  }
  $("#bar-image").alt = backImage ? `${state.demoImageName} på baksiden av ${chocolate.name.toLocaleLowerCase("nb")}` : "";
  $("#preview-chocolate").textContent = chocolate.name;

  const selected = toppings.filter((topping) => state.selectedToppings.has(topping.name));
  $("#preview-toppings").textContent = selected.length
    ? selected.map((topping) => topping.name).join(" · ")
    : "Uten topping";

  const pieces = selected.flatMap((topping, toppingIndex) =>
    Array.from({ length: 4 }, (_, index) => {
      const piece = createToppingShape(topping, true);
      piece.style.left = `${8 + ((index * 23 + toppingIndex * 17) % 82)}%`;
      piece.style.top = `${8 + ((index * 31 + toppingIndex * 19) % 80)}%`;
      piece.style.setProperty("--piece-rotation", `${(index * 37 + toppingIndex * 23) % 360}deg`);
      return piece;
    }));
  $("#bar-toppings").replaceChildren(...pieces);
  renderRelief();

  const paidToppings = selected.filter((topping) => topping.paid).length;
  const imageFee = state.imageUrl ? 29 : 0;
  const shapeFee = state.shape === "rektangel" ? 0 : 19;
  const packagingFee = state.packaging === "gave" ? 39 : state.packaging === "premium" ? 79 : 0;
  $("#preview-price").textContent = `${179 + paidToppings * 9 + imageFee + shapeFee + packagingFee} kr`;
  $("#preview-allergens").textContent = `Allergener: ${getAllergens().join(", ")}`;
  updatePackagingPreview();
}

function releaseUploadedImage() {
  if (state.ownsImageUrl && state.imageUrl) URL.revokeObjectURL(state.imageUrl);
}

function buildTextRelief(pixels, w, h) {
  const height=3.5*1.94/160;
  const tones=new Float32Array(w*h);
  const mask=new Float32Array(w*h);
  const distance=new Float32Array(w*h);
  for(let i=0;i<w*h;i++) {
    mask[i]=pixels[i*4+3]/255;
    distance[i]=mask[i]>0.05 ? w+h : 0;
    tones[i]=1;
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const i=y*w+x;
    if(x>0) distance[i]=Math.min(distance[i],distance[i-1]+1);
    if(y>0) distance[i]=Math.min(distance[i],distance[i-w]+1);
  }
  for(let y=h-1;y>=0;y--) for(let x=w-1;x>=0;x--) {
    const i=y*w+x;
    if(x<w-1) distance[i]=Math.min(distance[i],distance[i+1]+1);
    if(y<h-1) distance[i]=Math.min(distance[i],distance[i+w]+1);
  }
  const heights=new Float32Array(w*h);
  for(let i=0;i<w*h;i++) {
    const edge=Math.min(1,distance[i]/2);
    const bevel=edge*edge*(3-2*edge);
    heights[i]=height*mask[i]*bevel;
  }
  return {heights,tones};
}

function buildImageRelief(pixels, w, h, settings) {
  const tones=new Float32Array(w*h);
  const alpha=new Float32Array(w*h);
  const histogram=new Uint32Array(256);
  for(let i=0;i<w*h;i++) {
    alpha[i]=pixels[i*4+3]/255;
    tones[i]=(pixels[i*4]*0.2126+pixels[i*4+1]*0.7152+pixels[i*4+2]*0.0722)/255;
    if(alpha[i]>0.5) histogram[Math.round(tones[i]*255)]++;
  }
  const count=histogram.reduce((a,b)=>a+b,0);
  const percentile=(fraction)=>{
    let sum=0;
    for(let i=0;i<256;i++) {
      sum+=histogram[i];
      if(sum>count*fraction) return i/255;
    }
    return 1;
  };
  const low=percentile(0.02), range=Math.max(0.15,percentile(0.98)-low);
  let softened=tones.slice();
  {
    const stride=w+1;
    const sums=new Float64Array((w+1)*(h+1));
    const weights=new Float64Array(sums.length);
    for(let y=0;y<h;y++) {
      let rowSum=0,rowWeight=0;
      for(let x=0;x<w;x++) {
        const i=y*w+x,p=(y+1)*stride+x+1;
        rowSum+=tones[i]*alpha[i];rowWeight+=alpha[i];
        sums[p]=sums[p-stride]+rowSum;
        weights[p]=weights[p-stride]+rowWeight;
      }
    }
    const average=(x,y,radius)=>{
      const x0=Math.max(0,x-radius),x1=Math.min(w,x+radius+1);
      const y0=Math.max(0,y-radius),y1=Math.min(h,y+radius+1);
      const a=y0*stride+x0,b=y0*stride+x1,c=y1*stride+x0,d=y1*stride+x1;
      const weight=weights[d]-weights[b]-weights[c]+weights[a];
      return weight>0?(sums[d]-sums[b]-sums[c]+sums[a])/weight:0;
    };
    for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
      const dx=(x/w-settings.focusX)/0.3,dy=(y/h-settings.focusY)/0.4;
      const focus=Math.exp(-(dx*dx+dy*dy)*1.5);
      const blend=settings.backgroundSoftness*(1-focus);
      softened[y*w+x]=average(x,y,1)*(1-blend)+average(x,y,8)*blend;
    }
  }
  const distance=new Float32Array(w*h);
  for(let i=0;i<w*h;i++) distance[i]=alpha[i]>0.12?w+h:0;
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const i=y*w+x;
    if(x>0) distance[i]=Math.min(distance[i],distance[i-1]+1);
    if(y>0) distance[i]=Math.min(distance[i],distance[i-w]+1);
  }
  for(let y=h-1;y>=0;y--) for(let x=w-1;x>=0;x--) {
    const i=y*w+x;
    if(x<w-1) distance[i]=Math.min(distance[i],distance[i+1]+1);
    if(y<h-1) distance[i]=Math.min(distance[i],distance[i+w]+1);
  }
  const mmToPreview=1.94/160;
  const ramp=(value,start,end)=>{
    const t=Math.max(0,Math.min(1,(value-start)/(end-start)));
    return t*t*(3-2*t);
  };
  const blendWidthPx=Math.max(8,Math.min(w,h)*0.10);
  let heights=new Float32Array(w*h);
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    const i=y*w+x;
    const tone=Math.max(0,Math.min(1,(softened[i]-low)/range));
    tones[i]=tone;
    const toBoundary=Math.min(x,y,w-1-x,h-1-y);
    const edge=Math.min(1,Math.min(distance[i],toBoundary)/blendWidthPx);
    const roundedEdge=edge*edge*edge*(edge*(edge*6-15)+10);
    const buildup=(ramp(tone,0.02,0.42)+ramp(tone,0.28,0.72)+ramp(tone,0.58,0.98))/3;
    heights[i]=alpha[i]>0.12?alpha[i]*roundedEdge*(0.5+buildup*9)*mmToPreview:0;
  }
  const horizontal=new Float32Array(w*h);
  const rounded=new Float32Array(w*h);
  const kernel=[0,1,6,1,0];
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    let sum=0;
    for(let k=-2;k<=2;k++) sum+=heights[y*w+Math.max(0,Math.min(w-1,x+k))]*kernel[k+2];
    horizontal[y*w+x]=sum/8;
  }
  for(let y=0;y<h;y++) for(let x=0;x<w;x++) {
    let sum=0;
    for(let k=-2;k<=2;k++) sum+=horizontal[Math.max(0,Math.min(h-1,y+k))*w+x]*kernel[k+2];
    rounded[y*w+x]=(x===0||y===0||x===w-1||y===h-1)?0:sum/8;
  }
  return {heights:rounded,tones};
}

function renderRelief() {
  const canvas=$("#bar-relief");
  const image=$("#bar-image");
  const isText=state.decoration==="text"&&state.text.trim();
  const isImage=state.decoration==="image"&&state.imageUrl&&!state.imageProcessing&&image.complete&&image.naturalWidth;
  canvas.hidden=state.previewBack||(!isText&&!isImage);
  if(canvas.hidden)return;
  const gl=canvas.getContext("webgl",{alpha:true,antialias:true});
  if(!gl){canvas.hidden=true;showToast("Nettleseren må støtte WebGL for å vise sjokoladerelieffet.");return;}
  if(!canvas.reliefProgram){
    const compile=(type,source)=>{
      const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);
      if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));
      return shader;
    };
    const program=gl.createProgram();
    const shaders=[
      compile(gl.VERTEX_SHADER,`attribute vec3 position;attribute vec3 normal;attribute vec2 detail;varying vec3 n;varying vec2 surface;void main(){n=normal;surface=detail;gl_Position=vec4(position.x+position.z*.10,position.y+position.z*.55,-position.z,1.0);}`),
      compile(gl.FRAGMENT_SHADER,`precision highp float;varying vec3 n;varying vec2 surface;uniform vec3 chocolate;void main(){vec3 N=normalize(n);vec3 L=normalize(vec3(-.55,.8,1.4));float diffuse=max(dot(N,L),0.0);float sheen=pow(max(dot(N,normalize(L+vec3(0.0,0.0,1.0))),0.0),24.0);float crest=1.0+clamp(surface.y,0.0,.12);float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);vec3 material=chocolate*(.40+.60*diffuse)*crest*(.994+grain*.012);gl_FragColor=vec4(material+vec3(.085,.071,.055)*sheen,1.0);}`)
    ];
    shaders.forEach(shader=>gl.attachShader(program,shader));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));
    shaders.forEach(shader=>gl.deleteShader(shader));
    canvas.reliefProgram=program;
    canvas.reliefBuffer=gl.createBuffer();
  }
  const reliefKey=isText?`text:${state.font}:${state.text}`:`${state.imageUrl}:${state.focusX}:${state.focusY}:${state.backgroundSoftness}`;
  if(canvas.reliefKey!==reliefKey){
    const w=640,h=360,source=document.createElement("canvas");
    source.width=w;source.height=h;
    const ctx=source.getContext("2d",{willReadFrequently:true});
    let imageWidth=w-8,imageHeight=h-8;
    if(isImage){
      const scale=Math.min(imageWidth/image.naturalWidth,imageHeight/image.naturalHeight);
      imageWidth=image.naturalWidth*scale;imageHeight=image.naturalHeight*scale;
      ctx.drawImage(image,(w-imageWidth)/2,(h-imageHeight)/2,imageWidth,imageHeight);
    }else{
      const family=state.font==="handwriting"?"cursive":state.font==="modern"?"sans-serif":"serif";
      ctx.fillStyle="white";ctx.textAlign="center";ctx.textBaseline="middle";
      let size=100;
      do{ctx.font=`bold ${size--}px ${family}`}while(ctx.measureText(state.text).width>w-18&&size>5);
      ctx.fillText(state.text,w/2,h/2);
    }
    const pixels=ctx.getImageData(0,0,w,h).data;
    const {heights,tones}=isText?buildTextRelief(pixels,w,h):buildImageRelief(pixels,w,h,state);
    const vertices=new Float32Array((w-1)*(h-1)*6*8);
    let vertexOffset=0;
    const emit=(x,y)=>{
      const z=heights[y*w+x];
      const dx=(heights[y*w+Math.min(w-1,x+2)]-heights[y*w+Math.max(0,x-2)])*w/8;
      const dy=(heights[Math.min(h-1,y+2)*w+x]-heights[Math.max(0,y-2)*w+x])*h/8;
      const neighbor=(heights[y*w+Math.max(0,x-2)]+heights[y*w+Math.min(w-1,x+2)]+heights[Math.max(0,y-2)*w+x]+heights[Math.min(h-1,y+2)*w+x])/4;
      const cavity=(z-neighbor)*24;
      vertices.set([x/(w-1)*1.94-.97,.94-y/(h-1)*1.88,z,-dx,dy,1,tones[y*w+x],cavity],vertexOffset);vertexOffset+=8;
    };
    for(let y=0;y<h-1;y++)for(let x=0;x<w-1;x++){
      if(!heights[y*w+x]&&!heights[y*w+x+1]&&!heights[(y+1)*w+x]&&!heights[(y+1)*w+x+1])continue;
      emit(x,y);emit(x+1,y);emit(x,y+1);emit(x+1,y);emit(x+1,y+1);emit(x,y+1);
    }
    gl.bindBuffer(gl.ARRAY_BUFFER,canvas.reliefBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,vertices.subarray(0,vertexOffset),gl.STATIC_DRAW);
    canvas.reliefVertexCount=vertexOffset/8;canvas.reliefKey=reliefKey;
  }
  gl.viewport(0,0,canvas.width,canvas.height);
  gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);gl.useProgram(canvas.reliefProgram);
  gl.bindBuffer(gl.ARRAY_BUFFER,canvas.reliefBuffer);
  for(const [name,offset] of [["position",0],["normal",12],["detail",24]]){
    const location=gl.getAttribLocation(canvas.reliefProgram,name);
    gl.enableVertexAttribArray(location);gl.vertexAttribPointer(location,name==="detail"?2:3,gl.FLOAT,false,32,offset);
  }
  const color=chocolates[state.chocolate].colors[0];
  gl.uniform3f(gl.getUniformLocation(canvas.reliefProgram,"chocolate"),...[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255));
  gl.drawArrays(gl.TRIANGLES,0,canvas.reliefVertexCount);
}

function setSelectedImage(url, ownsObjectUrl = false, demoImageName = "", imageMode = "plate") {
  releaseUploadedImage();
  state.imageUrl = url;
  state.imageMode = imageMode;
  state.ownsImageUrl = ownsObjectUrl;
  state.demoImage = Boolean(demoImageName);
  state.demoImageName = demoImageName;
  state.previewBack = imageMode === "back";
  if (imageMode === "plate" || imageMode === "back") {
    state.shape = "rektangel";
    if ($("#plate-shape")) $("#plate-shape").value = state.shape;
  }
  $("#bar-image").src = url;
  $("#bar-image").alt = imageMode === "back" ? "Valgt bilde på baksiden av sjokoladeplaten" : "";
  $("#bar-image").hidden = imageMode !== "back";
  $("#remove-image").hidden = false;
  updatePreview();
}

function selectChocolateMotif(motif) {
  state.selectedMotif = motif;
  setSelectedImage(chocolateMotifs[state.chocolate][motif], false, motifNames[motif], "plate");
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => { toast.hidden = true; }, 5000);
}

function drawRoundedRect(context, x, y, width, height, radius) {
  context.beginPath();
  if (typeof context.roundRect === "function") {
    context.roundRect(x, y, width, height, radius);
    return;
  }
  context.moveTo(x + radius, y);
  context.lineTo(x + width - radius, y);
  context.quadraticCurveTo(x + width, y, x + width, y + radius);
  context.lineTo(x + width, y + height - radius);
  context.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  context.lineTo(x + radius, y + height);
  context.quadraticCurveTo(x, y + height, x, y + height - radius);
  context.lineTo(x, y + radius);
  context.quadraticCurveTo(x, y, x + radius, y);
  context.closePath();
}

function drawChocolateShape(context, x, y, width, height, shape) {
  if (shape === "rektangel") {
    drawRoundedRect(context, x, y, width, height, 30);
    return;
  }

  context.beginPath();
  if (shape === "hjerte") {
    context.moveTo(x + width * 0.5, y + height * 0.94);
    context.bezierCurveTo(x + width * 0.39, y + height * 0.83, x + width * 0.05, y + height * 0.59, x + width * 0.04, y + height * 0.31);
    context.bezierCurveTo(x + width * 0.03, y + height * 0.1, x + width * 0.22, y + height * 0.02, x + width * 0.38, y + height * 0.08);
    context.bezierCurveTo(x + width * 0.44, y + height * 0.1, x + width * 0.48, y + height * 0.15, x + width * 0.5, y + height * 0.21);
    context.bezierCurveTo(x + width * 0.55, y + height * 0.08, x + width * 0.7, y + height * 0.02, x + width * 0.84, y + height * 0.07);
    context.bezierCurveTo(x + width, y + height * 0.13, x + width * 0.98, y + height * 0.35, x + width * 0.92, y + height * 0.5);
    context.bezierCurveTo(x + width * 0.84, y + height * 0.69, x + width * 0.63, y + height * 0.86, x + width * 0.5, y + height * 0.94);
  } else {
    context.moveTo(x + width * 0.5, y + height * 0.96);
    context.bezierCurveTo(x + width * 0.31, y + height * 0.96, x + width * 0.16, y + height * 0.82, x + width * 0.14, y + height * 0.64);
    context.bezierCurveTo(x + width * 0.02, y + height * 0.57, x + width * 0.03, y + height * 0.4, x + width * 0.13, y + height * 0.34);
    context.bezierCurveTo(x + width * 0.07, y + height * 0.22, x + width * 0.14, y + height * 0.07, x + width * 0.27, y + height * 0.07);
    context.bezierCurveTo(x + width * 0.37, y + height * 0.07, x + width * 0.44, y + height * 0.14, x + width * 0.46, y + height * 0.24);
    context.bezierCurveTo(x + width * 0.49, y + height * 0.22, x + width * 0.52, y + height * 0.22, x + width * 0.55, y + height * 0.24);
    context.bezierCurveTo(x + width * 0.58, y + height * 0.14, x + width * 0.66, y + height * 0.07, x + width * 0.76, y + height * 0.07);
    context.bezierCurveTo(x + width * 0.89, y + height * 0.07, x + width * 0.96, y + height * 0.22, x + width * 0.88, y + height * 0.34);
    context.bezierCurveTo(x + width * 0.98, y + height * 0.4, x + width * 0.98, y + height * 0.57, x + width * 0.86, y + height * 0.64);
    context.bezierCurveTo(x + width * 0.84, y + height * 0.82, x + width * 0.69, y + height * 0.96, x + width * 0.5, y + height * 0.96);
  }
  context.closePath();
}

function drawBearFace(context, x, y, width, height) {
  const darkBrown = "#46291f";
  context.fillStyle = "#8b4e27";
  [0.245, 0.755].forEach((position) => {
    context.beginPath();
    context.arc(x + width * position, y + height * 0.225, width * 0.115, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = darkBrown;
    context.beginPath();
    context.arc(x + width * position, y + height * 0.225, width * 0.077, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#8b4e27";
  });

  context.fillStyle = "#090909";
  [0.315, 0.685].forEach((position) => {
    context.beginPath();
    context.arc(x + width * position, y + height * 0.455, width * 0.045, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#fff";
    context.beginPath();
    context.arc(x + width * (position - 0.012), y + height * 0.44, width * 0.012, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#090909";
  });

  context.fillStyle = "#3a251d";
  context.beginPath();
  context.ellipse(x + width * 0.5, y + height * 0.55, width * 0.052, height * 0.047, 0, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.moveTo(x + width * 0.5, y + height * 0.58);
  context.lineTo(x + width * 0.5, y + height * 0.62);
  context.moveTo(x + width * 0.5, y + height * 0.62);
  context.bezierCurveTo(x + width * 0.47, y + height * 0.67, x + width * 0.435, y + height * 0.67, x + width * 0.415, y + height * 0.64);
  context.moveTo(x + width * 0.5, y + height * 0.62);
  context.bezierCurveTo(x + width * 0.53, y + height * 0.67, x + width * 0.565, y + height * 0.67, x + width * 0.585, y + height * 0.64);
  context.lineWidth = Math.max(4, width * 0.009);
  context.lineCap = "round";
  context.stroke();
}

async function createDesignImage() {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 820;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Kunne ikke lage et bilde av designet.");

  context.fillStyle = "#faefe2";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#361c1b";
  context.font = "700 48px Georgia, serif";
  context.fillText("Min sjokoladeplate", 80, 90);
  context.fillStyle = "#6e5d58";
  context.font = "24px Arial, sans-serif";

  const organicShape = state.shape !== "rektangel";
  const barWidth = organicShape ? 570 : 990;
  const barHeight = organicShape ? 560 : 470;
  const barX = (canvas.width - barWidth) / 2;
  const barY = organicShape ? 155 : 190;
  if (state.imageMode === "plate" && state.imageUrl && !state.previewBack) {
    const image = new Image();
    image.src = state.imageUrl;
    await image.decode();
    context.drawImage(image, barX, barY, barWidth, barHeight);
  } else {
  const [light, dark, piece] = chocolates[state.chocolate].colors;
  drawChocolateShape(context, barX, barY, barWidth, barHeight, state.shape);
  const barGradient = context.createLinearGradient(barX, barY, barX + barWidth, barY + barHeight);
  barGradient.addColorStop(0, light);
  barGradient.addColorStop(1, dark);
  context.fillStyle = barGradient;
  context.fill();
  context.strokeStyle = "rgba(76, 43, 32, .48)";
  context.lineWidth = 7;
  context.stroke();

  context.save();
  drawChocolateShape(context, barX, barY, barWidth, barHeight, state.shape);
  context.clip();
  if (state.previewBack && state.imageUrl && state.imageMode === "back") {
    const image = new Image();
    image.src = state.imageUrl;
    await image.decode();
    context.drawImage(image, barX, barY, barWidth, barHeight);
  } else {
    if (!state.previewBack && state.imageMode !== "plate") {
      const selectedToppings = toppings.filter((topping) => state.selectedToppings.has(topping.name));
      selectedToppings.forEach((topping, toppingIndex) => {
        for (let index = 0; index < 4; index += 1) {
          const x = barX + 55 + ((index * 227 + toppingIndex * 173) % (barWidth - 110));
          const y = barY + 45 + ((index * 131 + toppingIndex * 97) % (barHeight - 90));
          const radius = 16 + ((index + toppingIndex) % 4) * 2;
          context.beginPath();
          context.arc(x, y, radius, 0, Math.PI * 2);
          context.fillStyle = topping.color;
          context.fill();
          context.strokeStyle = "rgba(67, 39, 29, .45)";
          context.lineWidth = 3;
          context.stroke();
          context.beginPath();
          context.arc(x - radius / 3, y - radius / 3, 4, 0, Math.PI * 2);
          context.fillStyle = "rgba(255, 255, 255, .55)";
          context.fill();
        }
      });
    }

    if (state.shape === "bamse") {
      drawBearFace(context, barX, barY, barWidth, barHeight);
    }

  }
  context.restore();

  context.strokeStyle = "rgba(76, 43, 32, .48)";
  context.lineWidth = 7;
  drawChocolateShape(context, barX, barY, barWidth, barHeight, state.shape);
  context.stroke();
  }

  const selectedToppings = toppings.filter((topping) => state.selectedToppings.has(topping.name));
  const sideDescription = state.previewBack
    ? state.imageUrl ? `Bakside · ${state.demoImageName || "bilde"}` : "Bakside"
    : state.imageMode === "plate" ? `Forside · ${state.demoImageName}`
      : selectedToppings.length ? selectedToppings.map((topping) => topping.name).join(" · ") : "Forside · uten topping";
  const packagingLabels = {
    standard: "Standardemballasje",
    gave: "Gaveinnpakning",
    premium: "Premium gaveeske",
  };
  context.fillStyle = "#361c1b";
  context.font = "600 22px Arial, sans-serif";
  context.fillText(`${sideDescription} · ${packagingLabels[state.packaging]} · ${getAllergens().join(", ")}`, 82, 715, 1035);
  context.font = "700 25px Arial, sans-serif";
  context.textAlign = "right";
  context.fillText(`Eksempelpris ${$("#preview-price").textContent}`, 1118, 765);
  context.textAlign = "left";

  const blob = await new Promise((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Kunne ikke eksportere bildet."));
    }, "image/png");
  });
  return new File([blob], "min-sjokoladeplate.png", { type: "image/png" });
}

function downloadDesignImage(file) {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function getDesignDescription() {
  const chocolate = chocolates[state.chocolate].name;
  const selected = [...state.selectedToppings];
  const name = state.plateName ? ` Navn: ${state.plateName}.` : "";
  return `Min sjokoladeplate: ${chocolate}${selected.length ? ` med ${selected.join(", ")}` : ""}.${name} Eksempelpris ${$("#preview-price").textContent}.`;
}

async function openShareDialog() {
  const dialog = $("#share-dialog");
  const preview = $("#share-image-preview");
  const controls = [...dialog.querySelectorAll("button[data-share-target], #share-more, #download-design")];
  if (shareImageUrl) URL.revokeObjectURL(shareImageUrl);
  shareImageFile = null;
  preview.hidden = true;
  $("#share-image-loading").hidden = false;
  controls.forEach((button) => { button.disabled = true; });
  dialog.showModal();

  try {
    const file = await createDesignImage();
    if (!dialog.open) return;
    shareImageFile = file;
    shareImageUrl = URL.createObjectURL(shareImageFile);
    preview.src = shareImageUrl;
    preview.hidden = false;
    $("#share-image-loading").hidden = true;
    controls.forEach((button) => { button.disabled = false; });
  } catch (error) {
    $("#share-image-loading").textContent = error instanceof Error
      ? error.message
      : "Kunne ikke lage bildet av designet.";
  }
}

function closeShareDialog() {
  $("#share-dialog").close();
  if (shareImageUrl) URL.revokeObjectURL(shareImageUrl);
  shareImageUrl = null;
  shareImageFile = null;
  $("#share-image-preview").removeAttribute("src");
}

async function shareWithOtherApps() {
  if (!shareImageFile) return;
  if (navigator.share && navigator.canShare?.({ files: [shareImageFile] })) {
    try {
      await navigator.share({
        files: [shareImageFile],
        title: "Min sjokoladeplate",
        text: getDesignDescription(),
      });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        showToast("Kunne ikke dele bildet akkurat nå.");
      }
    }
    return;
  }

  downloadDesignImage(shareImageFile);
  showToast("Bildet er lastet ned, klart til å deles i en annen app.");
}

function shareWithPlatform(platform) {
  if (!shareImageFile) return;
  const platformUrls = {
    Instagram: "https://www.instagram.com/",
    Facebook: "https://www.facebook.com/",
    WhatsApp: "https://web.whatsapp.com/",
  };
  downloadDesignImage(shareImageFile);
  window.open(platformUrls[platform], "_blank", "noopener,noreferrer");
  showToast(`Bildet er lastet ned. Velg bildet fra enheten din når du deler på ${platform}.`);
}

function appendChatMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `chat-message chat-message--${sender}`;
  const label = document.createElement("strong");
  label.textContent = sender === "user" ? "Du" : "Smaksprofessoren";
  const body = document.createElement("p");
  body.textContent = text;
  message.append(label, body);
  $("#chat-log").append(message);
  message.scrollIntoView({ block: "nearest" });
}

function suggestCombination(prompt) {
  const isNew = prompt === "nytt";
  const combo = isNew
    ? { chocolate: "dark", toppings: ["Bringebærbiter", "Havsalt", "Chiliflak"], message: "Prøv mørk sjokolade med bringebærbiter, havsalt og et lite sting av chili. Vil du prøve kombinasjonen?" }
    : { chocolate: "milk", toppings: ["Myk karamell", "Havsalt", "Krokankrønsj"], message: "Til en gave foreslår jeg melkesjokolade med karamell, havsalt og krokankrønsj. Vil du prøve kombinasjonen?" };
  state.pendingSuggestion = combo;
  appendChatMessage(combo.message, "professor");

  const apply = document.createElement("button");
  apply.type = "button";
  apply.className = "apply-suggestion";
  apply.textContent = "Prøv på platen";
  apply.addEventListener("click", () => {
    state.chocolate = combo.chocolate;
    state.selectedToppings = new Set(combo.toppings);
    document.querySelectorAll("[data-chocolate]").forEach((button) => {
      const selected = button.dataset.chocolate === state.chocolate;
      button.classList.toggle("selected", selected);
      button.setAttribute("aria-pressed", String(selected));
    });
    renderToppings();
    updatePreview();
    appendChatMessage("Forslaget er lagt til på platen din.", "professor");
    apply.remove();
  });
  const wrapper = document.createElement("div");
  wrapper.className = "chat-message chat-message--professor";
  wrapper.append(apply);
  $("#chat-log").append(wrapper);
}

document.querySelectorAll("[data-chocolate]").forEach((button) => {
  button.addEventListener("click", () => {
    state.chocolate = button.dataset.chocolate;
    if (state.selectedMotif) {
      state.imageUrl = chocolateMotifs[state.chocolate][state.selectedMotif];
      state.demoImageName = motifNames[state.selectedMotif];
    }
    document.querySelectorAll("[data-chocolate]").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    updatePreview();
  });
});

$("#plate-name").addEventListener("input", (event) => {
  state.plateName = event.target.value.trim();
  updatePreview();
});

document.querySelectorAll('input[name="packaging"]').forEach((input) => {
  input.addEventListener("change", (event) => {
    state.packaging = event.target.value;
    updatePreview();
  });
});

document.querySelectorAll("[data-decoration]").forEach((button) => {
  button.addEventListener("click", () => {
    state.decoration = button.dataset.decoration;
    state.previewBack = false;
    if (state.decoration !== "image") {
      releaseUploadedImage();
      state.imageUrl = null;
      state.imageMode = "";
      state.selectedMotif = "";
      state.ownsImageUrl = false;
      state.demoImage = false;
      state.demoImageName = "";
    }
    if (state.decoration !== "text") {
      state.text = "";
      $("#decoration-text").value = "";
    }
    document.querySelectorAll("[data-decoration]").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    $("#image-fields").hidden = state.decoration !== "image";
    $("#text-fields").hidden = state.decoration !== "text";
    updatePreview();
  });
});

$("#decoration-text").addEventListener("input", (event) => {
  state.text = event.target.value;
  updatePreview();
});

$("#decoration-font").addEventListener("change", (event) => {
  state.font = event.target.value;
  updatePreview();
});
$("#bar-image").addEventListener("load", updatePreview);

$("#topping-filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach((filter) => {
    const selected = filter === button;
    filter.classList.toggle("selected", selected);
    filter.setAttribute("aria-pressed", String(selected));
  });
  renderToppings();
});

$("#topping-search").addEventListener("input", (event) => {
  state.query = event.target.value;
  renderToppings();
});

async function prepareImage(file) {
  const job=++state.imageJob;
  state.sourceFile=file;
  state.imageProcessing=true;
  state.focusX=0.5;
  state.focusY=0.5;
  if(state.imageUrl&&state.ownsImageUrl)URL.revokeObjectURL(state.imageUrl);
  state.imageUrl=null;
  state.imageMode="plate";
  state.ownsImageUrl=false;
  state.previewBack=false;
  $("#remove-image").hidden=false;
  updatePreview();
  try{
    const url=URL.createObjectURL(file);
    state.imageUrl=url;
    state.ownsImageUrl=true;
    const image=$("#bar-image");
    image.src=url;
    await image.decode();
    if(job!==state.imageJob)return;
  }catch(error){
    if(job!==state.imageJob)return;
    if(state.imageUrl&&state.ownsImageUrl)URL.revokeObjectURL(state.imageUrl);
    state.imageUrl=null;
    state.imageMode="";
    state.ownsImageUrl=false;
    $("#bar-image").removeAttribute("src");
    showToast("Bildet kunne ikke leses. Velg et annet bilde.");
  }finally{
    if(job===state.imageJob){
      state.imageProcessing=false;
      $("#remove-image").hidden=!state.imageUrl;
      updatePreview();
    }
  }
}

function handleImageFile(file) {
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    showToast("Velg et JPG-, PNG- eller WebP-bilde.");
    return;
  }
  state.decoration = "image";
  state.text = "";
  state.demoImageName = file.name;
  $("#decoration-text").value = "";
  void prepareImage(file);
  document.querySelectorAll("[data-decoration]").forEach((option) => {
    const selected = option.dataset.decoration === "image";
    option.classList.toggle("selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });
  $("#image-fields").hidden = false;
  $("#text-fields").hidden = true;
}

$("#image-upload").addEventListener("change", (event) => {
  const [file] = event.target.files;
  handleImageFile(file);
  event.target.value = "";
});

const imageDropZone = $("#image-drop-zone");
imageDropZone.addEventListener("dragover", (event) => {
  event.preventDefault();
  imageDropZone.classList.add("dragging");
});
imageDropZone.addEventListener("dragleave", () => {
  imageDropZone.classList.remove("dragging");
});
imageDropZone.addEventListener("drop", (event) => {
  event.preventDefault();
  imageDropZone.classList.remove("dragging");
  handleImageFile(event.dataTransfer.files[0]);
});
imageDropZone.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    $("#image-upload").click();
  }
});

$("#remove-image").addEventListener("click", () => {
  state.imageJob++;
  state.imageProcessing=false;
  releaseUploadedImage();
  state.imageUrl = null;
  state.imageMode = "";
  state.selectedMotif = "";
  state.ownsImageUrl = false;
  state.demoImage = false;
  state.demoImageName = "";
  state.previewBack = false;
  state.decoration = "none";
  state.text = "";
  $("#decoration-text").value = "";
  document.querySelectorAll("[data-decoration]").forEach((option) => {
    const selected = option.dataset.decoration === "none";
    option.classList.toggle("selected", selected);
    option.setAttribute("aria-pressed", String(selected));
  });
  $("#image-fields").hidden = true;
  $("#text-fields").hidden = true;
  $("#bar-image").removeAttribute("src");
  $("#bar-image").alt = "";
  $("#bar-image").hidden = true;
  $("#remove-image").hidden = true;
  updatePreview();
});

$("#flip-chocolate").addEventListener("click", () => {
  state.previewBack = !state.previewBack;
  updatePreview();
});

$("#professor-toggle").addEventListener("click", () => {
  const panel = $("#professor-panel");
  panel.hidden = !panel.hidden;
  $("#professor-toggle").setAttribute("aria-expanded", String(!panel.hidden));
});

$("#close-professor").addEventListener("click", () => {
  $("#professor-panel").hidden = true;
  $("#professor-toggle").setAttribute("aria-expanded", "false");
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => suggestCombination(button.dataset.prompt));
});

$("#chat-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const input = $("#chat-input");
  const text = input.value.trim();
  if (!text) {
    input.focus();
    return;
  }
  appendChatMessage(text, "user");
  input.value = "";
  const answer = /mørk/i.test(text)
    ? "Mørk sjokolade passer godt med bringebær, havsalt eller litt chili. Velg en kombinasjon, eller bruk forslaget mitt."
    : "Karamell, havsalt og litt sprøtt er en god kombinasjon. Prøv en av knappene over for å legge et forslag på platen.";
  appendChatMessage(answer, "professor");
});

$("#order-button").addEventListener("click", (event) => {
  event.preventDefault();
  const params = new URLSearchParams({
    chocolate: chocolates[state.chocolate].name,
    toppings: [...state.selectedToppings].join(", "),
    image: state.imageUrl ? (state.demoImageName || "eget bilde") : "",
    imagePosition: state.imageMode === "plate" ? "på forsiden" : "på baksiden",
    price: $("#preview-price").textContent,
    name: state.plateName,
    packaging: state.packaging,
    allergens: getAllergens().join(", "),
  });
  window.location.href = `bestilling.html?${params}`;
});

$("#share-design").addEventListener("click", openShareDialog);
$("#close-share").addEventListener("click", closeShareDialog);
$("#share-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) closeShareDialog();
});
$("#download-design").addEventListener("click", () => {
  if (!shareImageFile) return;
  downloadDesignImage(shareImageFile);
  showToast("Bildet av sjokoladeplaten er lastet ned.");
});
document.querySelectorAll("[data-share-target]").forEach((button) => {
  button.addEventListener("click", () => shareWithPlatform(button.dataset.shareTarget));
});
$("#share-more").addEventListener("click", shareWithOtherApps);

$("#severe-allergy").addEventListener("change", readAllergenFilter);
renderAllergenOptions();
renderToppings();
updatePreview();
