(function (root) {
  const unknownAllergens = () => ({
    status: "unknown", contains: null, mayContain: null, source: null, verifiedAt: null,
  });
  const catalog = {
    version: "2026-11-17.1",
    brand: "Fryda AS",
    matinfoConnected: false,
    allergens: [
      { id: "gluten", name: "Glutenholdige kornslag" },
      { id: "milk", name: "Melk" },
      { id: "eggs", name: "Egg" },
      { id: "soy", name: "Soya" },
      { id: "peanuts", name: "Peanøtter" },
      { id: "tree-nuts", name: "Nøtter" },
      { id: "sesame", name: "Sesam" },
      { id: "fish", name: "Fisk" },
      { id: "crustaceans", name: "Krepsdyr" },
      { id: "molluscs", name: "Bløtdyr" },
      { id: "celery", name: "Selleri" },
      { id: "mustard", name: "Sennep" },
      { id: "sulphites", name: "Svoveldioksid og sulfitter" },
      { id: "lupin", name: "Lupin" },
    ],
    chocolates: [
      { id: "milk", name: "Melkesjokolade", colors: ["#865238", "#3d2217", "#633b28"] },
      { id: "dark", name: "Mørk sjokolade", colors: ["#4c3026", "#20130f", "#382118"] },
      { id: "white", name: "Hvit sjokolade", colors: ["#ead8b2", "#bda077", "#d3b98c"] },
      { id: "pink", name: "Rosa sjokolade", colors: ["#bd7584", "#723c4c", "#a15e70"] },
    ].map(product => ({ ...product, kind: "chocolate", allergens: unknownAllergens() })),
    toppings: [
      { id: "raspberry", name: "Bringebær", category: "Fruktig", color: "#b7395f", shape: "raspberry" },
      { id: "strawberry", name: "Jordbær", category: "Fruktig", color: "#ce6271", shape: "strawberry" },
      { id: "blueberry", name: "Blåbær", category: "Fruktig", color: "#55528c", shape: "candy" },
      { id: "hazelnut", name: "Hasselnøtter", category: "Sprøtt", color: "#95643d", shape: "hazelnut" },
      { id: "almond", name: "Mandler", category: "Sprøtt", color: "#c69e71", shape: "hazelnut" },
      { id: "salted-caramel", name: "Salt karamell", category: "Salt", color: "#bd8151", shape: "salted-caramel" },
      { id: "licorice", name: "Lakris", category: "Salt", color: "#382828", shape: "licorice" },
      { id: "marshmallow", name: "Marshmallows", category: "Søtt", color: "#e9c2c8", shape: "marshmallow" },
      { id: "chocolate-chips", name: "Sjokoladebiter", category: "Søtt", color: "#623b29", shape: "cookie" },
      { id: "sea-salt", name: "Havsalt", category: "Salt", color: "#f0e5c8", shape: "salt" },
      { id: "cookie-crunch", name: "Kjeksknas", category: "Sprøtt", color: "#ad805c", shape: "cookie" },
      { id: "sugar-pearls", name: "Sukkerperler", category: "Søtt", color: "#f2e1be", shape: "candy" },
    ].map(product => ({ ...product, kind: "topping", paid: true, allergens: unknownAllergens() })),
  };
  if (typeof module !== "undefined" && module.exports) module.exports = catalog;
  else root.FRYDA_CATALOG = catalog;
})(typeof globalThis !== "undefined" ? globalThis : this);
