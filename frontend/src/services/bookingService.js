const STORAGE_KEY = "odoo_cafe_bookings";

const DEFAULT_BOOKINGS = [
  {
    id: "RSV-101",
    name: "Aditya Kumar",
    phone: "9876543210",
    tableId: "t1", // table 1
    tableNumber: "1",
    date: new Date().toISOString().split("T")[0], // Today
    time: "18:30",
    partySize: 4,
    notes: "Window seating preferred. Celebrating birthday.",
    status: "Confirmed"
  },
  {
    id: "RSV-102",
    name: "Sneha Menon",
    phone: "8765432109",
    tableId: "t3", // table 3
    tableNumber: "3",
    date: new Date().toISOString().split("T")[0], // Today
    time: "20:00",
    partySize: 2,
    notes: "Quiet table requested.",
    status: "Confirmed"
  },
  {
    id: "RSV-103",
    name: "Rahul Varma",
    phone: "7654321098",
    tableId: "t5", // table 5
    tableNumber: "5",
    date: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
    time: "19:00",
    partySize: 6,
    notes: "Large group gathering.",
    status: "Confirmed"
  }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_BOOKINGS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_BOOKINGS));
    return DEFAULT_BOOKINGS;
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return DEFAULT_BOOKINGS;
  }
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const bookingService = {
  getBookings: () => Promise.resolve(getStored()),
  addBooking: (item) => {
    const list = getStored();
    const newItem = {
      ...item,
      id: "RSV-" + Math.floor(100 + Math.random() * 900),
      partySize: parseInt(item.partySize) || 2,
      status: item.status || "Confirmed"
    };
    list.push(newItem);
    save(list);
    return Promise.resolve(newItem);
  },
  updateBooking: (id, fields) => {
    const list = getStored();
    const idx = list.findIndex((b) => b.id === id);
    if (idx !== -1) {
      const updated = {
        ...list[idx],
        ...fields,
        partySize: fields.partySize !== undefined ? parseInt(fields.partySize) : list[idx].partySize
      };
      list[idx] = updated;
      save(list);
      return Promise.resolve(updated);
    }
    return Promise.reject(new Error("Booking not found"));
  },
  deleteBooking: (id) => {
    const filtered = getStored().filter((b) => b.id !== id);
    save(filtered);
    return Promise.resolve(true);
  }
};
