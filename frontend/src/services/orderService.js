import { posEventBus } from "@/utils/posEventBus";
const STORAGE_KEY = "odoo_cafe_pos_orders";

const DEFAULT_ORDERS = [
  {
    id: "ORD-10042",
    tableNumber: "T01",
    tableId: "g1",
    floorName: "Ground Floor",
    items: [
      {
        id: "item1",
        product: { id: "1", name: "Masala Tea", category: "Beverages", price: 20, status: "Active" },
        quantity: 2
      }
    ],
    subtotal: 40,
    tax: 2,
    discount: 0,
    discountPct: 0,
    total: 42,
    paymentMethod: null,
    customer: { name: "John Doe", email: "john@example.com", phone: "9876543210" },
    cashier: "Sneha M",
    status: "Draft",
    createdAt: "2026-06-20T10:30:00.000Z"
  },
  {
    id: "ORD-10043",
    tableNumber: "T02",
    tableId: "g2",
    floorName: "Ground Floor",
    items: [
      {
        id: "item2",
        product: { id: "4", name: "Cheese Burger", category: "Meals", price: 80, status: "Active" },
        quantity: 1
      }
    ],
    subtotal: 80,
    tax: 4,
    discount: 8,
    discountPct: 10,
    total: 76,
    paymentMethod: "Cash",
    customer: null,
    cashier: "Govardanan B",
    status: "Paid",
    createdAt: "2026-06-20T11:15:00.000Z"
  },
  {
    id: "ORD-10044",
    tableNumber: "T11",
    tableId: "f1",
    floorName: "First Floor",
    items: [
      {
        id: "item3",
        product: { id: "2", name: "Coffee", category: "Beverages", price: 30, status: "Active" },
        quantity: 3
      }
    ],
    subtotal: 90,
    tax: 4.5,
    discount: 0,
    discountPct: 0,
    total: 94.5,
    paymentMethod: "UPI QR",
    customer: { name: "Jane Smith", email: "jane@example.com", phone: "9988776655" },
    cashier: "Aditya K",
    status: "Paid",
    createdAt: "2026-06-20T12:00:00.000Z"
  },
  {
    id: "ORD-10045",
    tableNumber: "Direct",
    tableId: "direct",
    floorName: "",
    items: [
      {
        id: "item4",
        product: { id: "3", name: "Lassi", category: "Beverages", price: 30, status: "Active" },
        quantity: 1
      }
    ],
    subtotal: 30,
    tax: 1.5,
    discount: 0,
    discountPct: 0,
    total: 31.5,
    paymentMethod: null,
    customer: null,
    cashier: "Sneha M",
    status: "Cancelled",
    createdAt: "2026-06-20T09:45:00.000Z"
  }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_ORDERS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ORDERS));
    return DEFAULT_ORDERS;
  }
  return JSON.parse(data);
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const orderService = {
  getOrders: () => Promise.resolve(getStored()),
  addOrder: (order) => {
    const list = getStored();
    const newOrder = { 
      ...order, 
      id: order.id || ("ORD-" + Math.floor(10000 + Math.random() * 90000)),
      createdAt: order.createdAt || new Date().toISOString()
    };
    list.unshift(newOrder); // Add to the top of list
    save(list);
    return Promise.resolve(newOrder);
  },
  updateOrder: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex(i => i.id === id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...fields };
      save(list);
      return Promise.resolve(list[idx]);
    }
    return Promise.reject(new Error("Order not found"));
  },
  deleteOrder: (id) => {
    const filtered = getStored().filter(i => i.id !== id);
    save(filtered);
    return Promise.resolve(true);
  }
};
