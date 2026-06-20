const STORAGE_KEY = "odoo_cafe_categories";

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Beverages", description: "Teas, coffees, and soft drinks", color: "#FF6B1A", status: "Active" },
  { id: "2", name: "Meals", description: "Burgers, sandwiches, and mains", color: "#10B981", status: "Active" },
  { id: "3", name: "Desserts", description: "Cakes, ice creams, and sweets", color: "#EC4899", status: "Active" },
  { id: "4", name: "Snacks", description: "Quick bites and appetizers", color: "#F59E0B", status: "Active" }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_CATEGORIES;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_CATEGORIES));
    return DEFAULT_CATEGORIES;
  }
  return JSON.parse(data);
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const categoryService = {
  getCategories: () => Promise.resolve(getStored()),
  addCategory: (item) => {
    const list = getStored();
    const newItem = { color: "#FF6B1A", ...item, id: Date.now().toString(), status: "Active" };
    list.push(newItem);
    save(list);
    return Promise.resolve(newItem);
  },
  updateCategory: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      save(list);
      return Promise.resolve(list[idx]);
    }
    return Promise.reject(new Error("Category not found"));
  },
  deleteCategory: (id) => {
    const filtered = getStored().filter(i => i.id !== id);
    save(filtered);
    return Promise.resolve(true);
  }
};
