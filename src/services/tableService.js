const STORAGE_KEY = "odoo_cafe_tables";

const DEFAULT_TABLES = [
  // Ground Floor (floorId: "1")
  { id: "g1", number: "T01", capacity: 2, floorId: "1", status: "Available" },
  { id: "g2", number: "T02", capacity: 4, floorId: "1", status: "Occupied" },
  { id: "g3", number: "T03", capacity: 4, floorId: "1", status: "Available" },
  { id: "g4", number: "T04", capacity: 6, floorId: "1", status: "Reserved" },
  { id: "g5", number: "T05", capacity: 2, floorId: "1", status: "Disabled" },
  { id: "g6", number: "T06", capacity: 8, floorId: "1", status: "Available" },

  // First Floor (floorId: "2")
  { id: "f1", number: "T11", capacity: 4, floorId: "2", status: "Available" },
  { id: "f2", number: "T12", capacity: 4, floorId: "2", status: "Occupied" },
  { id: "f3", number: "T13", capacity: 2, floorId: "2", status: "Reserved" },
  { id: "f4", number: "T14", capacity: 6, floorId: "2", status: "Available" },
  { id: "f5", number: "T15", capacity: 2, floorId: "2", status: "Disabled" },

  // Rooftop Garden (floorId: "3")
  { id: "r1", number: "T21", capacity: 4, floorId: "3", status: "Available" },
  { id: "r2", number: "T22", capacity: 6, floorId: "3", status: "Occupied" },
  { id: "r3", number: "T23", capacity: 2, floorId: "3", status: "Available" },
  { id: "r4", number: "T24", capacity: 4, floorId: "3", status: "Reserved" }
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
