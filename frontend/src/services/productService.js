const STORAGE_KEY = "odoo_cafe_products";

const DEFAULT_PRODUCTS = [
  { id: "1", name: "Masala Tea", category: "Beverages", price: 20, status: "Active" },
  { id: "2", name: "Coffee", category: "Beverages", price: 30, status: "Active" },
  { id: "3", name: "Lassi", category: "Beverages", price: 30, status: "Active" },
  { id: "4", name: "Cheese Burger", category: "Meals", price: 80, status: "Active" }
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
