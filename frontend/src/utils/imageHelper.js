// Mapowanie nazw produktów na nazwy plików
const PRODUCT_IMAGE_MAP = {
  "Big Mac": "354267-big-mac-na-www-1090x664px-big-mac-2.png",
  Cheeseburger: "cheeseburger.png",
  McChicken: "mcchicken.png",
  "Burger Drwala": "356326-maestro-na-www-1090x664px-maestro-grand-classic.png",
  "Frytki małe": "frytki_male.jpg",
  "Frytki duże": "frytki_duze.png",
  McNuggets: "czikiNuggets.png",
  "Coca-Cola": "1090x664kubek.png",
  "Woda mineralna": "06-04-woda.png",
  Kawa: "353846-nowe-kubki-mccafe-2024-na-www-1090x664px-kawa-czarna.png",
  McFlurry: "lody.png",
  "Ciastko jabłkowe": "mcd-www-singlepage-ciastko-jablko-1.png",
};

// Mapowanie nazw kategorii na foldery
const CATEGORY_FOLDER_MAP = {
  Burgery: "burgery",
  "Frytki i dodatki": "frytki i dodatki",
  Napoje: "napoje",
  Desery: "lody i desery",
};

// Mapowanie kategorii na obrazki kategorii
const CATEGORY_IMAGE_MAP = {
  Burgery: "wies-mac MAIN.png",
  "Frytki i dodatki": "frytki_duze.png",
  Napoje: "1090x664kubek.png",
  Desery: "lody.png",
};

// Zwraca nazwę pliku obrazka dla produktu
export const getProductImageName = (productName) => {
  return PRODUCT_IMAGE_MAP[productName] || "default-product.jpg";
};

// Zwraca ścieżkę do obrazka produktu z odpowiednim folderem
export const getProductImagePath = (productName, categoryName) => {
  const fileName = getProductImageName(productName);
  const folderName = CATEGORY_FOLDER_MAP[categoryName] || "products";
  return `/images/products/${folderName}/${fileName}`;
};

// Zwraca nazwę pliku obrazka dla kategorii
export const getCategoryImageName = (categoryName) => {
  return CATEGORY_IMAGE_MAP[categoryName] || "default-category.jpg";
};

// Zwraca ścieżkę do obrazka kategorii
export const getCategoryImagePath = (categoryName) => {
  const fileName = getCategoryImageName(categoryName);
  return `/images/categories/${fileName}`;
};

// Defaultowe obrazki jeśli nie znajdzie
export const getDefaultProductImage = () => {
  return "/images/products/default-product.jpg";
};

export const getDefaultCategoryImage = () => {
  return "/images/categories/default-category.jpg";
};
