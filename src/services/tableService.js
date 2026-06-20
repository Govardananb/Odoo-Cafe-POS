const STORAGE_KEY = "odoo_cafe_tables";

const DEFAULT_TABLES = [
  { id: "1", name: "Table 1", capacity: 2, status: "Available" },
  { id: "2", name: "Table 2", capacity: 4, status: "Available" },
  { id: "3", name: "Table 3", capacity: 4, status: "Occupied" },
  { id: "4", name: "Table 4", capacity: 6, status: "Available" },
  { id: "5", name: "Table 5", capacity: 2, status: "Available" }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_TABLES;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TABLES));
    return DEFAULT_TABLES;
  }
  return JSON.parse(data);
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const tableService = {
  getTables: () => Promise.resolve(getStored()),
  addTable: (item) => {
    const list = getStored();
    const newItem = { ...item, id: Date.now().toString(), status: "Available" };
    list.push(newItem);
    save(list);
    return Promise.resolve(newItem);
  },
  updateTable: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      save(list);
      return Promise.resolve(list[idx]);
    }
    return Promise.reject(new Error("Table not found"));
  },
  deleteTable: (id) => {
    const filtered = getStored().filter(i => i.id !== id);
    save(filtered);
    return Promise.resolve(true);
  }
};
