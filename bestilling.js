const params = new URLSearchParams(window.location.search);
const chocolate = params.get("chocolate") || "Melkesjokolade";
const toppings = params.get("toppings") || "Uten topping";
const image = params.get("image");
const price = params.get("price") || "179 kr";

document.querySelector("#order-design").textContent = `${chocolate} · ${toppings}`;
document.querySelector("#order-price").textContent = price;
if (image) {
  const imageSummary = document.querySelector("#order-image");
  imageSummary.textContent = `${image} på baksiden`;
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
