const chocolates = {
  milk: { name: "Melkesjokolade", colors: ["#a34c27", "#512417", "#843b20"] },
  dark: { name: "Mørk sjokolade", colors: ["#71351f", "#2d1610", "#542614"] },
  white: { name: "Hvit sjokolade", colors: ["#f3e7c9", "#d6bd92", "#ead8b4"] },
};

const toppings = [
  { name: "Nonstop", category: "Søtt", note: "Eks.: Melk, soya", color: "#cb4b42", shape: "candy" },
  { name: "Seigmenn", category: "Søtt", paid: true, color: "#e5aa54", shape: "gummy" },
  { name: "Salt lakris", category: "Salt", note: "Eks.: Hvete", color: "#382828", shape: "licorice" },
  { name: "Myk karamell", category: "Søtt", note: "Eks.: Melk", color: "#aa7047", shape: "caramel" },
  { name: "Bringebærbiter", category: "Fruktig", paid: true, color: "#b7395f", shape: "raspberry" },
  { name: "Havsalt", category: "Salt", paid: true, color: "#f0e5c8", shape: "salt" },
  { name: "Mini-marshmallows", category: "Søtt", paid: true, color: "#e9c2c8", shape: "marshmallow" },
  { name: "Kjeksbiter", category: "Sprøtt", note: "Eks.: Hvete, melk", color: "#ad805c", shape: "cookie" },
  { name: "Salte kringler", category: "Salt", note: "Eks.: Hvete", color: "#865537", shape: "pretzel" },
  { name: "Surt eple", category: "Syrlig", paid: true, color: "#86a65c", shape: "apple" },
  { name: "Sure jordbær", category: "Syrlig", paid: true, color: "#d85d69", shape: "strawberry" },
  { name: "Sitronbiter", category: "Syrlig", paid: true, color: "#e8d75c", shape: "lemon" },
  { name: "Jordbærbiter", category: "Fruktig", paid: true, color: "#ce6271", shape: "strawberry-piece" },
  { name: "Appelsinskall", category: "Fruktig", paid: true, color: "#e78a3b", shape: "orange" },
  { name: "Krokankrønsj", category: "Sprøtt", note: "Eks.: Mandler, melk", color: "#b1814e", shape: "brittle" },
  { name: "Hasselnøtter", category: "Sprøtt", note: "Eks.: Hasselnøtter", color: "#95643d", shape: "hazelnut" },
  { name: "Marsipanbiter", category: "Søtt", note: "Eks.: Mandler", color: "#d4ad83", shape: "marzipan" },
  { name: "Vaniljefudge", category: "Søtt", note: "Eks.: Melk", color: "#e5cba1", shape: "fudge" },
  { name: "Surt colagodteri", category: "Syrlig", paid: true, color: "#6e4850", shape: "cola" },
  { name: "Chiliflak", category: "Sterkt", paid: true, color: "#ba3c30", shape: "chili" },
  { name: "Salt karamell", category: "Salt", note: "Eks.: Melk", color: "#bd8151", shape: "salted-caramel" },
];

const state = {
  chocolate: "milk",
  selectedToppings: new Set(),
  filter: "Alle",
  query: "",
  imageUrl: null,
  ownsImageUrl: false,
  demoImage: false,
  demoImageName: "",
  previewBack: false,
};

const $ = (selector) => document.querySelector(selector);
const toppingGrid = $("#topping-options");
let toastTimeout;
let shareImageUrl;
let shareImageFile;

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
    button.disabled = !selected && state.selectedToppings.size >= 6;

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

function updatePreview() {
  const chocolate = chocolates[state.chocolate];
  const [light, dark, piece] = chocolate.colors;
  const bar = $("#chocolate-bar");
  const hasBackDesign = Boolean(state.imageUrl);
  if (!hasBackDesign) state.previewBack = false;
  bar.style.setProperty("--bar-light", light);
  bar.style.setProperty("--bar-dark", dark);
  bar.style.setProperty("--piece-light", light);
  bar.style.setProperty("--piece-dark", piece);
  bar.classList.toggle("is-flipped", state.previewBack);
  bar.setAttribute("aria-label", `${chocolate.name}plate, ${state.previewBack ? "bakside" : "forside"}`);
  $(".chocolate-face--front").setAttribute("aria-hidden", String(state.previewBack));
  $(".chocolate-face--back").setAttribute("aria-hidden", String(!state.previewBack));
  $("#flip-hint").textContent = state.previewBack
    ? `Bakside · ${state.demoImageName || "bildet"}`
    : "Forside · toppingene";
  $("#flip-chocolate").hidden = !hasBackDesign;
  $("#flip-chocolate").setAttribute("aria-pressed", String(state.previewBack));
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

  const paidToppings = selected.filter((topping) => topping.paid).length;
  const imageFee = state.imageUrl ? 29 : 0;
  $("#preview-price").textContent = `${179 + paidToppings * 9 + imageFee} kr`;
}

function releaseUploadedImage() {
  if (state.ownsImageUrl && state.imageUrl) URL.revokeObjectURL(state.imageUrl);
}

function setSelectedImage(url, ownsObjectUrl = false, demoImageName = "") {
  releaseUploadedImage();
  state.imageUrl = url;
  state.ownsImageUrl = ownsObjectUrl;
  state.demoImage = Boolean(demoImageName);
  state.demoImageName = demoImageName;
  state.previewBack = true;
  $("#bar-image").src = url;
  $("#bar-image").alt = demoImageName
    ? `Eksempelbilde av sjokoladeplate: ${demoImageName}`
    : "Valgt bilde på baksiden av sjokoladeplaten";
  $("#bar-image").hidden = false;
  $("#remove-image").hidden = false;
  updatePreview();
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
  context.fillText(chocolates[state.chocolate].name, 82, 132);

  const barX = 105;
  const barY = 190;
  const barWidth = 990;
  const barHeight = 470;
  const [light, dark, piece] = chocolates[state.chocolate].colors;
  drawRoundedRect(context, barX, barY, barWidth, barHeight, 30);
  const barGradient = context.createLinearGradient(barX, barY, barX + barWidth, barY + barHeight);
  barGradient.addColorStop(0, light);
  barGradient.addColorStop(1, dark);
  context.fillStyle = barGradient;
  context.fill();
  context.strokeStyle = "rgba(76, 43, 32, .48)";
  context.lineWidth = 7;
  context.stroke();

  if (state.previewBack && state.imageUrl) {
    const image = new Image();
    image.src = state.imageUrl;
    await image.decode();
    context.save();
    drawRoundedRect(context, barX, barY, barWidth, barHeight, 30);
    context.clip();
    context.drawImage(image, barX, barY, barWidth, barHeight);
    context.restore();
  } else {
    const padding = 22;
    const gap = 10;
    const cellWidth = (barWidth - padding * 2 - gap * 5) / 6;
    const cellHeight = (barHeight - padding * 2 - gap * 3) / 4;
    for (let row = 0; row < 4; row += 1) {
      for (let column = 0; column < 6; column += 1) {
        const x = barX + padding + column * (cellWidth + gap);
        const y = barY + padding + row * (cellHeight + gap);
        drawRoundedRect(context, x, y, cellWidth, cellHeight, 13);
        const cellGradient = context.createLinearGradient(x, y, x + cellWidth, y + cellHeight);
        cellGradient.addColorStop(0, light);
        cellGradient.addColorStop(1, piece);
        context.fillStyle = cellGradient;
        context.fill();
        context.strokeStyle = "rgba(64, 35, 27, .3)";
        context.lineWidth = 2;
        context.stroke();
      }
    }

    if (!state.previewBack) {
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

  }

  context.strokeStyle = "rgba(76, 43, 32, .48)";
  context.lineWidth = 7;
  drawRoundedRect(context, barX, barY, barWidth, barHeight, 30);
  context.stroke();

  const selectedToppings = toppings.filter((topping) => state.selectedToppings.has(topping.name));
  const sideDescription = state.previewBack
    ? state.imageUrl ? (state.demoImage ? "Bakside · togbilde" : "Bakside · bilde") : "Bakside"
    : selectedToppings.length ? selectedToppings.map((topping) => topping.name).join(" · ") : "Forside · uten topping";
  context.fillStyle = "#361c1b";
  context.font = "600 22px Arial, sans-serif";
  context.fillText(sideDescription, 82, 715, 1035);
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
  return `Min sjokoladeplate: ${chocolate}${selected.length ? ` med ${selected.join(", ")}` : ""}. Eksempelpris ${$("#preview-price").textContent}.`;
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
    document.querySelectorAll("[data-chocolate]").forEach((option) => {
      const selected = option === button;
      option.classList.toggle("selected", selected);
      option.setAttribute("aria-pressed", String(selected));
    });
    updatePreview();
  });
});

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

$("#open-image-picker").addEventListener("click", () => {
  $("#image-picker-dialog").showModal();
});

$("#close-image-picker").addEventListener("click", () => {
  $("#image-picker-dialog").close();
});

$("#image-picker-dialog").addEventListener("click", (event) => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

$("#choose-train-image").addEventListener("click", () => {
  setSelectedImage("./assets/sjokoladetog-demo.png", false, "togmotiv");
  $("#image-picker-dialog").close();
});

$("#choose-flower-image").addEventListener("click", () => {
  setSelectedImage("./assets/blomstmotiv.png", false, "blomstmotiv");
  $("#image-picker-dialog").close();
});

$("#choose-congratulations-image").addEventListener("click", () => {
  setSelectedImage("./assets/gratulerer-motiv.png", false, "gratulasjonsmotiv");
  $("#image-picker-dialog").close();
});

$("#remove-image").addEventListener("click", () => {
  releaseUploadedImage();
  state.imageUrl = null;
  state.ownsImageUrl = false;
  state.demoImage = false;
  state.demoImageName = "";
  state.previewBack = false;
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
    price: $("#preview-price").textContent,
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

renderToppings();
updatePreview();
