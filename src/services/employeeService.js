const STORAGE_KEY = "odoo_cafe_employees";

const DEFAULT_EMPLOYEES = [
  { id: "1", name: "Govardanan B", role: "Manager", email: "govardanan@odoocafe.com", status: "Active" },
  { id: "2", name: "Sneha M", role: "Cashier", email: "sneha@odoocafe.com", status: "Active" },
  { id: "3", name: "Aditya K", role: "Chef", email: "aditya@odoocafe.com", status: "Active" }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_EMPLOYEES;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }
  return JSON.parse(data);
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const employeeService = {
  getEmployees: () => Promise.resolve(getStored()),
  addEmployee: (item) => {
    const list = getStored();
    const newItem = { ...item, id: Date.now().toString(), status: "Active" };
    list.push(newItem);
    save(list);
    return Promise.resolve(newItem);
  },
  updateEmployee: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      save(list);
      return Promise.resolve(list[idx]);
    }
    return Promise.reject(new Error("Employee not found"));
  },
  deleteEmployee: (id) => {
    const filtered = getStored().filter(i => i.id !== id);
    save(filtered);
    return Promise.resolve(true);
  }
};
