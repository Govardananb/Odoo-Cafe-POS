"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { tableService } from "@/services/tableService";
import { floorService } from "@/services/floorService";

const POSContext = createContext();

export function POSProvider({ children }) {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  // Terminal state
  const [currentFloor, setCurrentFloor] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);
  
  // Table carts dictionary: { [tableId]: { cart, activeCustomer, discount } }
  const [tableCarts, setTableCarts] = useState({});
  
  // Active states (loaded from active table cart)
  const [cart, setCart] = useState([]);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);

  // Modal visibilities
  const [isFloorPopupOpen, setIsFloorPopupOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // POS view selector: 'cart' | 'payment'
  const [posView, setPosView] = useState("cart");

  // POS shift session state
  const [activePOSSession, setActivePOSSession] = useState(null);
  const [isCloseSessionModalOpen, setIsCloseSessionModalOpen] = useState(false);

  // Completed Orders
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Load employee and completed orders on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const empRaw = localStorage.getItem("currentUser");
      if (empRaw) {
        setCurrentEmployee(JSON.parse(empRaw));
      }
      
      const ordersRaw = localStorage.getItem("odoo_cafe_pos_orders");
      if (ordersRaw) {
        setOrders(JSON.parse(ordersRaw));
      }

      const tableCartsRaw = localStorage.getItem("odoo_cafe_pos_table_carts");
      if (tableCartsRaw) {
        setTableCarts(JSON.parse(tableCartsRaw));
      }

      const sessionRaw = localStorage.getItem("activePOSSession");
      if (sessionRaw) {
        setActivePOSSession(JSON.parse(sessionRaw));
      }
    }
  }, []);

  // Save table carts whenever they change
  const saveTableCarts = (newCarts) => {
    setTableCarts(newCarts);
    if (typeof window !== "undefined") {
      localStorage.setItem("odoo_cafe_pos_table_carts", JSON.stringify(newCarts));
    }
  };

  // Save orders whenever they change
  const saveOrders = (newOrders) => {
    setOrders(newOrders);
    if (typeof window !== "undefined") {
      localStorage.setItem("odoo_cafe_pos_orders", JSON.stringify(newOrders));
    }
  };

  // Select Floor and Dining Table
  const selectTable = (floor, table) => {
    setCurrentFloor(floor);
    setCurrentTable(table);

    // Load saved cart state for this table, or initialize new
    const saved = tableCarts[table.id];
    if (saved) {
      setCart(saved.cart || []);
      setActiveCustomer(saved.activeCustomer || null);
      setDiscount(saved.discount || 0);
    } else {
      setCart([]);
      setActiveCustomer(null);
      setDiscount(0);
    }
    
    // Automatically close Floor Popup after selection
    setIsFloorPopupOpen(false);
  };

  // Update context active state and write back to tableCarts
  const updateActiveTableCart = (newCart, newCustomer = activeCustomer, newDiscount = discount) => {
    setCart(newCart);
    setActiveCustomer(newCustomer);
    setDiscount(newDiscount);

    if (currentTable) {
      const updatedCarts = {
        ...tableCarts,
        [currentTable.id]: {
          cart: newCart,
          activeCustomer: newCustomer,
          discount: newDiscount
        }
      };
      saveTableCarts(updatedCarts);
    }
  };

  // Add Item to Cart
  const addToCart = (product) => {
    if (!currentTable) {
      setIsFloorPopupOpen(true);
      return;
    }

    const newCart = [...cart];
    const existingIdx = newCart.findIndex((item) => item.product.id === product.id);

    if (existingIdx !== -1) {
      newCart[existingIdx].quantity += 1;
    } else {
      newCart.push({
        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
        product,
        quantity: 1
      });
    }

    updateActiveTableCart(newCart);
  };

  // Remove / Decrement Item from Cart
  const removeFromCart = (productId) => {
    const newCart = cart.map((item) => {
      if (item.product.id === productId) {
        return { ...item, quantity: item.quantity - 1 };
      }
      return item;
    }).filter((item) => item.quantity > 0);

    updateActiveTableCart(newCart);
  };

  // Update Item Quantity directly
  const updateQuantity = (productId, newQty) => {
    let newCart = [];
    if (newQty <= 0) {
      newCart = cart.filter((item) => item.product.id !== productId);
    } else {
      newCart = cart.map((item) => {
        if (item.product.id === productId) {
          return { ...item, quantity: parseInt(newQty) || 1 };
        }
        return item;
      });
    }
    updateActiveTableCart(newCart);
  };

  // Set Customer for current order
  const setTableCustomer = (customerObj) => {
    if (!currentTable) return;
    updateActiveTableCart(cart, customerObj, discount);
  };

  // Set Discount for current order
  const applyTableDiscount = (pct) => {
    if (!currentTable) return;
    updateActiveTableCart(cart, activeCustomer, pct);
  };

  // Send Order to Kitchen (KDS)
  const sendToKitchen = () => {
    if (!currentTable || cart.length === 0) return Promise.resolve(false);

    // Update table status in database
    return tableService.updateTable(currentTable.id, { status: "Occupied" })
      .then((updatedTable) => {
        setCurrentTable(updatedTable);
        
        // Expose order details to KDS via localStorage
        const kdsOrdersRaw = localStorage.getItem("odoo_cafe_kds_orders") || "[]";
        const kdsOrders = JSON.parse(kdsOrdersRaw);
        
        const newKdsOrder = {
          id: "KDS-" + Math.floor(1000 + Math.random() * 9000),
          tableNumber: currentTable.number,
          floorName: currentFloor ? currentFloor.name : "",
          items: cart.map(i => ({ name: i.product.name, quantity: i.quantity })),
          status: "Pending", // Pending, Preparing, Ready
          createdAt: new Date().toISOString()
        };
        
        kdsOrders.push(newKdsOrder);
        localStorage.setItem("odoo_cafe_kds_orders", JSON.stringify(kdsOrders));
        
        return true;
      });
  };

  // Open POS Shift Session
  const openPOSSession = (openingCash) => {
    const floatVal = parseFloat(openingCash) || 0;
    const session = {
      id: "SESS-" + Math.floor(10000 + Math.random() * 90000),
      openingCash: floatVal,
      cashSales: 0,
      cardSales: 0,
      upiSales: 0,
      totalSales: 0,
      transactionCount: 0,
      employeeId: currentEmployee ? currentEmployee.id : "unknown",
      employeeName: currentEmployee ? currentEmployee.name : "System",
      openedAt: new Date().toISOString()
    };
    setActivePOSSession(session);
    if (typeof window !== "undefined") {
      localStorage.setItem("activePOSSession", JSON.stringify(session));
    }
  };

  // Close POS Shift Session
  const closePOSSession = () => {
    if (activePOSSession) {
      const closedSession = {
        ...activePOSSession,
        closedAt: new Date().toISOString()
      };
      
      if (typeof window !== "undefined") {
        const historyRaw = localStorage.getItem("odoo_cafe_pos_session_history") || "[]";
        const history = JSON.parse(historyRaw);
        history.push(closedSession);
        localStorage.setItem("odoo_cafe_pos_session_history", JSON.stringify(history));
        
        localStorage.removeItem("activePOSSession");
      }
    }
    setActivePOSSession(null);
    setIsCloseSessionModalOpen(false);
  };

  // Settle Payment
  const completePayment = (paymentMethod) => {
    if (!currentTable || cart.length === 0) return Promise.resolve(false);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const tax = subtotal * 0.05; // 5% tax
    const discountAmt = subtotal * (discount / 100);
    const total = subtotal + tax - discountAmt;

    const newOrder = {
      id: "ORD-" + Math.floor(10000 + Math.random() * 90000),
      tableNumber: currentTable.number,
      tableId: currentTable.id,
      floorName: currentFloor ? currentFloor.name : "",
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmt,
      discountPct: discount,
      total,
      paymentMethod,
      customer: activeCustomer,
      cashier: currentEmployee ? currentEmployee.name : "System",
      createdAt: new Date().toISOString()
    };

    // Save order
    const updatedOrders = [newOrder, ...orders];
    saveOrders(updatedOrders);

    // Remove from active table carts
    const updatedCarts = { ...tableCarts };
    delete updatedCarts[currentTable.id];
    saveTableCarts(updatedCarts);

    // Update active shift session totals if one is active
    if (activePOSSession) {
      const updatedSession = { ...activePOSSession };
      updatedSession.transactionCount += 1;
      updatedSession.totalSales += total;
      
      const method = (paymentMethod || "").toLowerCase();
      if (method.includes("cash")) {
        updatedSession.cashSales += total;
      } else if (method.includes("card")) {
        updatedSession.cardSales += total;
      } else {
        updatedSession.upiSales += total;
      }
      
      setActivePOSSession(updatedSession);
      if (typeof window !== "undefined") {
        localStorage.setItem("activePOSSession", JSON.stringify(updatedSession));
      }
    }

    // Update table status in database back to Available
    return tableService.updateTable(currentTable.id, { status: "Available" })
      .then((updatedTable) => {
        setCurrentTable(updatedTable);
        setCart([]);
        setActiveCustomer(null);
        setDiscount(0);
        
        // Open receipt modal with order
        setActiveOrder(newOrder);
        setIsReceiptModalOpen(true);
        setPosView("cart");
        return true;
      });
  };

  return (
    <POSContext.Provider
      value={{
        currentEmployee,
        currentFloor,
        currentTable,
        tableCarts,
        cart,
        activeCustomer,
        discount,
        orders,
        activeOrder,
        searchQuery,
        selectedCategory,
        isFloorPopupOpen,
        isCustomerModalOpen,
        isDiscountModalOpen,
        isReceiptModalOpen,
        posView,
        activePOSSession,
        isCloseSessionModalOpen,
        
        // Setters
        setCurrentEmployee,
        setSearchQuery,
        setSelectedCategory,
        setIsFloorPopupOpen,
        setIsCustomerModalOpen,
        setIsDiscountModalOpen,
        setIsReceiptModalOpen,
        setPosView,
        setActiveOrder,
        setActivePOSSession,
        setIsCloseSessionModalOpen,
        
        // Operational Actions
        selectTable,
        addToCart,
        removeFromCart,
        updateQuantity,
        setTableCustomer,
        applyTableDiscount,
        sendToKitchen,
        completePayment,
        openPOSSession,
        closePOSSession
      }}
    >
      {children}
    </POSContext.Provider>
  );
}

export function usePOS() {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error("usePOS must be used within a POSProvider");
  }
  return context;
}
