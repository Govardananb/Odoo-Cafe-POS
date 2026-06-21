const STORAGE_KEY = "odoo_cafe_coupons";

const DEFAULT_COUPONS = [
  { id: "1", code: "OFFLINE20", type: "percent", value: 20, minOrderAmount: 0, status: "Active", description: "20% off all orders - puts your phone down!" },
  { id: "2", code: "MATCHALOVER", type: "percent", value: 15, minOrderAmount: 200, status: "Active", description: "15% off orders above ₹200 for Matcha lovers" },
  { id: "3", code: "CAFE50", type: "flat", value: 50, minOrderAmount: 300, status: "Active", description: "Flat ₹50 off on orders above ₹300" },
  { id: "4", code: "FREECOFFEE", type: "flat", value: 150, minOrderAmount: 150, status: "Active", description: "Flat ₹150 off for free beverage trial" }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_COUPONS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_COUPONS));
    return DEFAULT_COUPONS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_COUPONS;
  }
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const couponService = {
  getCoupons: () => Promise.resolve(getStored()),
  addCoupon: (item) => {
    const list = getStored();
    const newItem = {
      ...item,
      id: Date.now().toString(),
      code: item.code.trim().toUpperCase(),
      value: parseFloat(item.value) || 0,
      minOrderAmount: parseFloat(item.minOrderAmount) || 0,
      status: item.status || "Active"
    };
    list.push(newItem);
    save(list);
    return Promise.resolve(newItem);
  },
  updateCoupon: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex((c) => c.id === id);
    if (idx !== -1) {
      const updated = {
        ...list[idx],
        ...fields,
        code: fields.code ? fields.code.trim().toUpperCase() : list[idx].code,
        value: fields.value !== undefined ? parseFloat(fields.value) : list[idx].value,
        minOrderAmount: fields.minOrderAmount !== undefined ? parseFloat(fields.minOrderAmount) : list[idx].minOrderAmount
      };
      list[idx] = updated;
      save(list);
      return Promise.resolve(updated);
    }
    return Promise.reject(new Error("Coupon not found"));
  },
  deleteCoupon: (id) => {
    const filtered = getStored().filter((c) => c.id !== id);
    save(filtered);
    return Promise.resolve(true);
  },
  validateCoupon: (code, orderAmount) => {
    const coupons = getStored();
    const match = coupons.find(c => c.code === code.trim().toUpperCase() && c.status === "Active");
    if (!match) {
      return Promise.reject(new Error("Invalid or inactive coupon code"));
    }
    if (orderAmount < match.minOrderAmount) {
      return Promise.reject(new Error(`Minimum order of ₹${match.minOrderAmount} required for this coupon`));
    }
    return Promise.resolve(match);
  }
};
