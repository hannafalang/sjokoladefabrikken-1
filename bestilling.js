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
  try {
    const preview = JSON.parse(sessionStorage.getItem("chocolate-order-preview"));
    if (preview?.query === params.toString() && preview.image.startsWith("data:image/jpeg;base64,")) {
      document.querySelector("#confirmation-plate").src = preview.image;
      document.querySelector("#confirmation-preview").hidden = false;
    }
  } catch {
    // The confirmation is still available when browser storage is unavailable.
  }
  event.currentTarget.hidden = true;
  document.querySelector("#order-confirmation").hidden = false;
  document.querySelector("#order-page-title").textContent = "Demo-bestilling bekreftet";
});
