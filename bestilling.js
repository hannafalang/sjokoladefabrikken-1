const params = new URLSearchParams(window.location.search);
const chocolate = params.get("chocolate") || "Melkesjokolade";
const toppings = params.get("toppings") || "Uten topping";
const image = params.get("image");
const imagePosition = params.get("imagePosition") || "på baksiden";
const price = params.get("price") || "179 kr";
const shape = params.get("shape") || "rektangel";
const plateName = params.get("name") || "";
const occasion = params.get("occasion") || "";
const packaging = params.get("packaging") || "standard";
const allergens = params.get("allergens") || "Melk, Soya";

const shapeLabels = { rektangel: "Rektangelform", hjerte: "Hjerteform", bamse: "Bamseform" };
const packagingLabels = { standard: "Standardemballasje", gave: "Gaveinnpakning", premium: "Premium gaveeske" };
const occasionLabels = { bursdag: "Bursdag", bryllup: "Bryllup", firma: "Firma eller lansering", gave: "Gave", annet: "Annet" };

document.querySelector("#order-design").textContent = `${chocolate} · ${toppings}`;
document.querySelector("#order-details").textContent =
  `${plateName ? `Navn: ${plateName} · ` : ""}${shapeLabels[shape]} · ${packagingLabels[packaging]}${occasion ? ` · ${occasionLabels[occasion] || occasion}` : ""}`;
document.querySelector("#order-allergens").textContent = `Allergener: ${allergens}`;
document.querySelector("#order-price").textContent = price;
if (image) {
  const imageSummary = document.querySelector("#order-image");
  imageSummary.textContent = `${image} ${imagePosition}`;
  imageSummary.hidden = false;
}

document.querySelector("#order-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.currentTarget);
  document.querySelector("#confirmation-name").textContent = formData.get("name");
  document.querySelector("#confirmation-details").textContent =
    `${formData.get("fulfillment")} · ${price} · Bekreftelse vises kun i denne prototypen.`;
  event.currentTarget.hidden = true;
  document.querySelector("#order-confirmation").hidden = false;
  document.querySelector("#order-page-title").textContent = "Demo-bestilling bekreftet";
});
