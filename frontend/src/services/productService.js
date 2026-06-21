const STORAGE_KEY = "odoo_cafe_products";

export const DEFAULT_PRODUCTS = [
  { id: "1", name: "No Signal Latte", category: "Coffee", price: 180, status: "Active", arEnabled: true, glbModel: "https://modelviewer.dev/shared-assets/models/glTF-Sample-Assets/Models/CoffeeCup/glTF-Binary/CoffeeCup.glb", usdzModel: null, description: "Double espresso with textured milk and a touch of honey.", prepTime: "5 mins" },
  { id: "2", name: "Double Espresso", category: "Coffee", price: 120, status: "Active", arEnabled: false, glbModel: null, usdzModel: null, description: "Rich, bold, and concentrated shot of espresso.", prepTime: "3 mins" },
  { id: "3", name: "Matcha Green Tea", category: "Tea", price: 160, status: "Active", arEnabled: false, glbModel: null, usdzModel: null, description: "Ceremonial grade Japanese matcha whisked with creamy oat milk.", prepTime: "4 mins" },
  { id: "4", name: "Masala Chai", category: "Tea", price: 80, status: "Active", arEnabled: false, glbModel: null, usdzModel: null, description: "Classic Indian spiced tea brewed with ginger and cardamom.", prepTime: "5 mins" },
  { id: "5", name: "New York Cheesecake", category: "Desserts", price: 220, status: "Active", arEnabled: false, glbModel: null, usdzModel: null, description: "Creamy, rich cheesecake on a buttery graham cracker crust.", prepTime: "2 mins" },
  { id: "6", name: "Chocolate Fudge Cake", category: "Desserts", price: 190, status: "Active", arEnabled: false, glbModel: null, usdzModel: null, description: "Decadent double chocolate cake with warm fudge glaze.", prepTime: "2 mins" },
  { id: "7", name: "Shish Kebab Platter", category: "Meals", price: 280, status: "Active", arEnabled: true, glbModel: "https://modelviewer.dev/shared-assets/models/shishkebab.glb", usdzModel: null, description: "Tender grilled skewers served with roasted vegetables and seasoned rice.", prepTime: "10 mins" },
  { id: "8", name: "Avocado Sourdough Toast", category: "Meals", price: 210, status: "Active", arEnabled: true, glbModel: "https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/Avocado/glTF-Binary/Avocado.glb", usdzModel: null, description: "Smashed avocado, cherry tomatoes, and feta on toasted sourdough.", prepTime: "7 mins" },
  { id: "9", name: "Breakfast Combo", category: "Combos", price: 320, status: "Active", arEnabled: false, glbModel: null, usdzModel: null, description: "Any Coffee + Avocado Toast + Butter Croissant.", prepTime: "12 mins" },
  { id: "10", name: "Sweet Tooth Combo", category: "Combos", price: 280, status: "Active", arEnabled: false, glbModel: null, usdzModel: null, description: "Filter Coffee + Slice of NY Cheesecake.", prepTime: "5 mins" }
];

const getStoredProducts = () => {
  if (typeof window === "undefined") return DEFAULT_PRODUCTS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PRODUCTS));
    return DEFAULT_PRODUCTS;
  }
  return JSON.parse(data);
};

const saveProducts = (products) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
};

export const productService = {
  getProducts: () => {
    return Promise.resolve(getStoredProducts());
  },

  addProduct: (product) => {
    const products = getStoredProducts();
    const newProduct = {
      ...product,
      id: Date.now().toString(),
      price: parseFloat(product.price) || 0,
      status: product.status || "Active"
    };
    products.push(newProduct);
    saveProducts(products);
    return Promise.resolve(newProduct);
  },

  updateProduct: (id, updatedFields) => {
    const products = getStoredProducts();
    const idx = products.findIndex((p) => p.id === id);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        ...updatedFields,
        price: parseFloat(updatedFields.price) || 0
      };
      saveProducts(products);
      return Promise.resolve(products[idx]);
    }
    return Promise.reject(new Error("Product not found"));
  },

  deleteProduct: (id) => {
    const products = getStoredProducts();
    const filtered = products.filter((p) => p.id !== id);
    saveProducts(filtered);
    return Promise.resolve(true);
  }
};
