const STORAGE_KEY = "odoo_cafe_categories";

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Coffee", description: "Premium hot and cold coffee brews", color: "#FF6B1A", status: "Active" },
  { id: "2", name: "Tea", description: "Traditional teas and herbal infusions", color: "#10B981", status: "Active" },
  { id: "3", name: "Desserts", description: "Cakes, pastries, and sweet treats", color: "#EC4899", status: "Active" },
  { id: "4", name: "Meals", description: "Fresh burgers, sandwiches, and mains", color: "#F59E0B", status: "Active" },
  { id: "5", name: "Combos", description: "Curated coffee and meal pairings", color: "#8B5CF6", status: "Active" }
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
  getCategories: async () => {
    try {
      const res = await fetch("/api/categories");
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return body.data;
        }
      }
    } catch (err) {
      console.warn("[categoryService] Backend offline, using localStorage fallback:", err);
    }
    return getStored();
  },

  addCategory: async (item) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item)
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return body.data;
        }
      }
    } catch (err) {
      console.warn("[categoryService] Backend add failed, using localStorage fallback:", err);
    }

    const list = getStored();
    const newItem = { color: "#FF6B1A", ...item, id: Date.now().toString(), status: "Active" };
    list.push(newItem);
    save(list);
    return newItem;
  },

  updateCategory: async (id, fields) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields)
      });
      if (res.ok) {
        const body = await res.json();
        if (body.success && body.data) {
          return body.data;
        }
      }
    } catch (err) {
      console.warn("[categoryService] Backend update failed, using localStorage fallback:", err);
    }

    const list = getStored();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      save(list);
      return list[idx];
    }
    return Promise.reject(new Error("Category not found"));
  },

  deleteCategory: async (id) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE"
      });
      if (res.ok) {
        return true;
      }
    } catch (err) {
      console.warn("[categoryService] Backend delete failed, using localStorage fallback:", err);
    }

    const filtered = getStored().filter(i => i.id !== id);
    save(filtered);
    return true;
  }
};
