const STORAGE_KEY = "odoo_cafe_settings";

const DEFAULT_SETTINGS = {
  cafeName: "OFFLINE CLUB",
  address: "12, Khader Nawaz Khan Rd, Nungambakkam, Chennai - 600006",
  phone: "+91 44 4567 8901",
  taxRate: 5,
  serviceCharge: 2,
  currencySymbol: "₹",
  wifiSsid: "OFFLINE_CLUB_5G",
  wifiPassword: "putyourphonedown"
};

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    return DEFAULT_SETTINGS;
  }
  try {
    return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const settingsService = {
  getSettings: () => Promise.resolve(getStored()),
  updateSettings: (fields) => {
    const current = getStored();
    const updated = { ...current, ...fields };
    save(updated);
    return Promise.resolve(updated);
  }
};
