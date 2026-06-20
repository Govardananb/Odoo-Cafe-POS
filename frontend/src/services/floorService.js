const STORAGE_KEY = "odoo_cafe_floors";

const DEFAULT_FLOORS = [
  { id: "1", name: "Ground Floor", status: "Active" },
  { id: "2", name: "First Floor", status: "Active" },
  { id: "3", name: "Rooftop Garden", status: "Active" }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_FLOORS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FLOORS));
    return DEFAULT_FLOORS;
  }
  return JSON.parse(data);
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const floorService = {
  getFloors: () => Promise.resolve(getStored()),
  addFloor: (item) => {
    const list = getStored();
    const newItem = { ...item, id: Date.now().toString(), status: "Active" };
    list.push(newItem);
    save(list);
    return Promise.resolve(newItem);
  },
  updateFloor: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      save(list);
      return Promise.resolve(list[idx]);
    }
    return Promise.reject(new Error("Floor not found"));
  },
  deleteFloor: (id) => {
    const filtered = getStored().filter(i => i.id !== id);
    save(filtered);
    return Promise.resolve(true);
  }
};
