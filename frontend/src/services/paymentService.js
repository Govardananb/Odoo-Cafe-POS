const STORAGE_KEY = "odoo_cafe_payment_methods";

const DEFAULT_METHODS = [
  { 
    id: "1", 
    name: "Cash", 
    type: "Cash", 
    status: "Enabled", 
    description: "Standard cash drawer payment method", 
    upiId: "" 
  },
  { 
    id: "2", 
    name: "Card / Digital", 
    type: "Card", 
    status: "Enabled", 
    description: "Accept debit/credit cards via external terminals", 
    upiId: "" 
  },
  { 
    id: "3", 
    name: "UPI QR", 
    type: "UPI", 
    status: "Enabled", 
    description: "Direct bank transfer using dynamic UPI QR scanner", 
    upiId: "cafe@ybl" 
  }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_METHODS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_METHODS));
    return DEFAULT_METHODS;
  }
  return JSON.parse(data);
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const paymentService = {
  getMethods: () => Promise.resolve(getStored()),
  addMethod: (item) => {
    const list = getStored();
    const newItem = { ...item, id: Date.now().toString() };
    list.push(newItem);
    save(list);
    return Promise.resolve(newItem);
  },
  updateMethod: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      save(list);
      return Promise.resolve(list[idx]);
    }
    return Promise.reject(new Error("Payment method not found"));
  },
  deleteMethod: (id) => {
    const filtered = getStored().filter(i => i.id !== id);
    save(filtered);
    return Promise.resolve(true);
  }
};
