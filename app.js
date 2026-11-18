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
  trainMotif: false,
};

const $ = (selector) => document.querySelector(selector);
const toppingGrid = $("#topping-options");
let toastTimeout;

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
  bar.style.setProperty("--bar-light", light);
  bar.style.setProperty("--bar-dark", dark);
  bar.style.setProperty("--piece-light", light);
  bar.style.setProperty("--piece-dark", piece);
  bar.setAttribute("aria-label", `${chocolate.name}plate`);
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
  $("#bar-motif").toggleAttribute("hidden", !state.trainMotif);

  const paidToppings = selected.filter((topping) => topping.paid).length;
  const imageFee = state.imageUrl ? 29 : 0;
  $("#preview-price").textContent = `${179 + paidToppings * 9 + imageFee} kr`;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.hidden = false;
  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => { toast.hidden = true; }, 5000);
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

$("#image-upload").addEventListener("change", (event) => {
  const [file] = event.target.files;
  if (!file) return;
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    showToast("Velg et JPG-, PNG- eller WebP-bilde.");
    event.target.value = "";
    return;
  }
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
  state.imageUrl = URL.createObjectURL(file);
  $("#bar-image").src = state.imageUrl;
  $("#bar-image").hidden = false;
  $("#remove-image").hidden = false;
  updatePreview();
});

$("#remove-image").addEventListener("click", () => {
  if (state.imageUrl) URL.revokeObjectURL(state.imageUrl);
  state.imageUrl = null;
  $("#bar-image").removeAttribute("src");
  $("#bar-image").hidden = true;
  $("#remove-image").hidden = true;
  $("#image-upload").value = "";
  updatePreview();
});

$("#train-motif").addEventListener("click", (event) => {
  state.trainMotif = !state.trainMotif;
  event.currentTarget.setAttribute("aria-pressed", String(state.trainMotif));
  $("#bar-motif").toggleAttribute("hidden", !state.trainMotif);
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

$("#order-button").addEventListener("click", () => {
  showToast("Bestilling og betaling er ikke koblet til ennå. Designet ditt er klart som forhåndsvisning.");
});

$("#share-design").addEventListener("click", async () => {
  const chocolate = chocolates[state.chocolate].name;
  const selected = [...state.selectedToppings];
  const description = `Min sjokoladeplate: ${chocolate}${selected.length ? ` med ${selected.join(", ")}` : ""}${state.trainMotif ? " og togmotiv" : ""}. Eksempelpris ${$("#preview-price").textContent}.`;

  if (navigator.share) {
    try {
      await navigator.share({ title: "Min sjokoladeplate", text: description });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) {
        showToast("Kunne ikke dele designet akkurat nå.");
      }
    }
    return;
  }

  if (!navigator.clipboard?.writeText) {
    showToast("Deling er ikke tilgjengelig i denne nettleseren.");
    return;
  }

  try {
    await navigator.clipboard.writeText(description);
    showToast("Beskrivelsen av designet er kopiert.");
  } catch {
    showToast("Kunne ikke kopiere designet. Prøv igjen i en nettleser med kopiering aktivert.");
  }
});

renderToppings();
updatePreview();
