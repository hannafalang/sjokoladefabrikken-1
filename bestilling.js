const params = new URLSearchParams(window.location.search);
const chocolate = params.get("chocolate") || "Melkesjokolade";
const toppings = params.get("toppings") || "Uten topping";
const image = params.get("image");
const imagePosition = params.get("imagePosition") || "på baksiden";
const price = params.get("price") || "179 kr";
const plateName = params.get("name") || "";
const packaging = params.get("packaging") || "standard";
const allergens = params.get("allergens") || "Melk, Soya";

const packagingLabels = { standard: "Standardemballasje", gave: "Gaveinnpakning", premium: "Premium gaveeske" };

document.querySelector("#order-design").textContent = `${chocolate} · ${toppings}`;
document.querySelector("#order-details").textContent =
  `${plateName ? `Navn: ${plateName} · ` : ""}${packagingLabels[packaging]}`;
document.querySelector("#order-allergens").textContent = `Oppgitte allergener for hele platen: ${allergens}`;
const allergenNote = params.get("allergenNote");
if (allergenNote) document.querySelector("#order-allergen-note").textContent = allergenNote;
document.querySelector("#order-price").textContent = price;
const breakdown = params.get("breakdown");
if (breakdown) {
  const priceBreakdown = document.querySelector("#order-price-breakdown");
  priceBreakdown.textContent = breakdown;
  priceBreakdown.hidden = false;
}
if (image) {
  const imageSummary = document.querySelector("#order-image");
  imageSummary.textContent = `${image} ${imagePosition}`;
  imageSummary.hidden = false;
}

const fulfillment = document.querySelector("#fulfillment");
const deliveryFields = document.querySelector("#delivery-fields");
const orderNote = document.querySelector("#order-note");

function updateDeliveryFields() {
  const delivery = fulfillment.value === "Levering";
  deliveryFields.hidden = !delivery;
  deliveryFields.disabled = !delivery;
  orderNote.placeholder = delivery ? "For eksempel portkode eller hvor pakken kan settes" : "For eksempel ønsket hentetid";
}

fulfillment.addEventListener("change", updateDeliveryFields);
updateDeliveryFields();

function restoreOrderPlate(snapshot) {
  const image = typeof snapshot.image === "string" && snapshot.image.startsWith("data:image/png;base64,");
  const element = document.createElement(image ? "img" : snapshot.inline ? "span" : "div");
  element.className = snapshot.className;
  if (snapshot.style) element.style.cssText = snapshot.style;
  if (image) {
    element.src = snapshot.image;
    element.alt = "";
  } else {
    element.textContent = snapshot.text || "";
    element.append(...snapshot.children.map(restoreOrderPlate));
  }
  return element;
}

document.querySelector("#order-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  const name = formData.get("name").trim().replace(/(^|[\s-])(\p{L})/gu,
    (_, separator, initial) => separator + initial.toLocaleUpperCase("nb-NO"));
  document.querySelector("#confirmation-name").textContent = name;
  document.querySelector("#confirmation-details").textContent =
    `${formData.get("fulfillment")} · ${price} · ${formData.get("payment")} (demo)`;
  if (formData.get("fulfillment") === "Levering") {
    const deliverySummary = document.querySelector("#confirmation-delivery");
    deliverySummary.textContent = `Leveringsadresse: ${formData.get("address")}, ${formData.get("postcode")} ${formData.get("city")}`;
    deliverySummary.hidden = false;
  }
  const unavailable = document.querySelector("#confirmation-preview-unavailable");
  unavailable.hidden = false;
  try {
    const preview = JSON.parse(sessionStorage.getItem("chocolate-order-preview"));
    if (preview?.query === params.toString() && preview.plate) {
      const plate = restoreOrderPlate(preview.plate);
      plate.id = "chocolate-bar";
      Object.assign(plate.dataset, preview.appearance);
      plate.setAttribute("role", "img");
      plate.setAttribute("aria-label", preview.label);
      const label = document.createElement("p");
      label.className = "flip-hint";
      label.textContent = preview.label;
      document.querySelector("#confirmation-plate-stage").replaceChildren(label, plate);
      document.querySelector("#confirmation-preview").hidden = false;
      unavailable.hidden = true;
    }
  } catch {
    // The confirmation is still available when browser storage is unavailable.
  }
  event.currentTarget.hidden = true;
  document.querySelector("#order-confirmation").hidden = false;
  document.querySelector("#order-page-title").textContent = "Demo-bestilling bekreftet";
});
