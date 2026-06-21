const STORAGE_KEY = "odoo_cafe_employees";

const DEFAULT_EMPLOYEES = [
  { id: "1", name: "Govardanan B", role: "admin", email: "govardanan@odoocafe.com", status: "Active" },
  { id: "2", name: "Sneha M", role: "employee", email: "sneha@odoocafe.com", status: "Active" },
  { id: "3", name: "Aditya K", role: "employee", email: "aditya@odoocafe.com", status: "Active" }
];

const getStored = () => {
  if (typeof window === "undefined") return DEFAULT_EMPLOYEES;
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }
  
  // Normalize legacy roles
  let list = JSON.parse(data);
  let migrated = false;
  list = list.map(emp => {
    if (emp.role === "Manager" || emp.role === "Admin") {
      emp.role = "admin";
      migrated = true;
    } else if (emp.role === "Cashier" || emp.role === "Chef") {
      emp.role = "employee";
      migrated = true;
    }
    return emp;
  });
  if (migrated) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  return list;
};

const save = (data) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
};

export const employeeService = {
  getEmployees: () => Promise.resolve(getStored()),

  login: async (email, password) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const body = await res.json();
      if (res.ok && body.success) {
        return body.data; // contains token and user { id, name, email, role }
      }
      throw new Error(body.message || "Invalid credentials");
    } catch (err) {
      console.warn("[employeeService] Backend login failed, checking fallback:", err);
      // Fallback to local storage
      const employees = getStored();
      const emp = employees.find(e => e.email.toLowerCase() === email.toLowerCase());
      if (emp) {
        return {
          token: "mock-jwt-token",
          user: emp
        };
      }
      throw err;
    }
  },

  signup: async (name, email, password, role) => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role: role.toUpperCase() })
      });
      const body = await res.json();
      if (res.ok && body.success) {
        return body.data.user;
      }
      throw new Error(body.message || "Failed to sign up");
    } catch (err) {
      console.warn("[employeeService] Backend signup failed, checking fallback:", err);
      // Fallback to local storage
      return employeeService.addEmployee({ name, email, role, status: "Active" });
    }
  },

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
