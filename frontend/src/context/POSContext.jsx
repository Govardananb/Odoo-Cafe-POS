"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { tableService } from "@/services/tableService";
import { floorService } from "@/services/floorService";
import { orderService } from "@/services/orderService";
import { settingsService } from "@/services/settingsService";

const POSContext = createContext();

export function POSProvider({ children }) {
  const [currentEmployee, setCurrentEmployee] = useState(null);
  
  // Settings state
  const [settings, setSettings] = useState({
    cafeName: "OFFLINE CLUB",
    address: "12, Khader Nawaz Khan Rd, Nungambakkam, Chennai - 600006",
    phone: "+91 44 4567 8901",
    taxRate: 5,
    serviceCharge: 2,
    currencySymbol: "₹",
    wifiSsid: "OFFLINE_CLUB_5G",
    wifiPassword: "putyourphonedown"
  });

  // Terminal state
  const [currentFloor, setCurrentFloor] = useState(null);
  const [currentTable, setCurrentTable] = useState(null);
  
  // Table carts dictionary: { [tableId]: { cart, activeCustomer, discount, appliedCoupon } }
  const [tableCarts, setTableCarts] = useState({});
  
  // Active states (loaded from active table cart)
  const [cart, setCart] = useState([]);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Modal visibilities
  const [isFloorPopupOpen, setIsFloorPopupOpen] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // POS view selector: 'cart' | 'payment'
  const [posView, setPosView] = useState("cart");

  // Completed Orders
  const [orders, setOrders] = useState([]);
  const [activeOrder, setActiveOrder] = useState(null);
  const [editingOrderId, setEditingOrderId] = useState(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Load settings, employee and completed orders on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Load Settings
      settingsService.getSettings().then((data) => {
        setSettings(data);
      });

      const empRaw = localStorage.getItem("currentUser");
      if (empRaw) {
        setCurrentEmployee(JSON.parse(empRaw));
      }
      
      orderService.getOrders().then((updatedList) => {
        setOrders(updatedList);
        
        // Check if there is a draft order requested to be loaded/edited from the admin page
        const draftIdToLoad = localStorage.getItem("odoo_cafe_pos_load_draft_id");
        if (draftIdToLoad) {
          const draftToLoad = updatedList.find(o => o.id === draftIdToLoad && o.status === "Draft");
          if (draftToLoad) {
            loadDraftOrder(draftToLoad);
          }
          localStorage.removeItem("odoo_cafe_pos_load_draft_id");
        }
      });

      const tableCartsRaw = localStorage.getItem("odoo_cafe_pos_table_carts");
      if (tableCartsRaw) {
        setTableCarts(JSON.parse(tableCartsRaw));
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
      setAppliedCoupon(saved.appliedCoupon || null);
    } else {
      setCart([]);
      setActiveCustomer(null);
      setDiscount(0);
      setAppliedCoupon(null);
    }
    
    // Automatically close Floor Popup after selection
    setIsFloorPopupOpen(false);
  };

  // Update context active state and write back to tableCarts
  const updateActiveTableCart = (newCart, newCustomer = activeCustomer, newDiscount = discount, newCoupon = appliedCoupon) => {
    setCart(newCart);
    setActiveCustomer(newCustomer);
    setDiscount(newDiscount);
    setAppliedCoupon(newCoupon);

    if (currentTable) {
      const updatedCarts = {
        ...tableCarts,
        [currentTable.id]: {
          cart: newCart,
          activeCustomer: newCustomer,
          discount: newDiscount,
          appliedCoupon: newCoupon
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
    updateActiveTableCart(cart, customerObj, discount, appliedCoupon);
  };

  // Set Discount for current order
  const applyTableDiscount = (pct) => {
    if (!currentTable) return;
    updateActiveTableCart(cart, activeCustomer, pct, appliedCoupon);
  };

  // Apply Coupon object for current order
  const applyTableCoupon = (couponObj) => {
    if (!currentTable) return;
    updateActiveTableCart(cart, activeCustomer, discount, couponObj);
  };

  // Update Settings Configuration
  const updateSettings = (fields) => {
    return settingsService.updateSettings(fields).then((updated) => {
      setSettings(updated);
      return updated;
    });
  };

  // Helper to calculate discount amounts
  const getDiscountAmount = (subtotalVal) => {
    let manualAmt = subtotalVal * (discount / 100);
    let couponAmt = 0;
    if (appliedCoupon) {
      if (appliedCoupon.type === "percent") {
        couponAmt = subtotalVal * (appliedCoupon.value / 100);
      } else if (appliedCoupon.type === "flat") {
        couponAmt = appliedCoupon.value;
      }
    }
    const totalD = manualAmt + couponAmt;
    return totalD > subtotalVal ? subtotalVal : totalD;
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
        
        // Trigger storage event manually for other tabs
        window.dispatchEvent(new Event("storage"));
        
        return true;
      });
  };

  // Save active cart as Draft
  const saveDraftOrder = () => {
    if (!currentTable || cart.length === 0) return Promise.resolve(false);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const taxRate = settings ? settings.taxRate : 5;
    const tax = subtotal * (taxRate / 100);
    const discountAmt = getDiscountAmount(subtotal);
    const total = Math.max(0, subtotal + tax - discountAmt);

    const draftOrder = {
      id: editingOrderId || ("ORD-" + Math.floor(10000 + Math.random() * 90000)),
      tableNumber: currentTable.number,
      tableId: currentTable.id,
      floorName: currentFloor ? currentFloor.name : "",
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmt,
      discountPct: discount,
      appliedCoupon: appliedCoupon,
      total,
      paymentMethod: null,
      customer: activeCustomer,
      cashier: currentEmployee ? currentEmployee.name : "System",
      status: "Draft",
      createdAt: new Date().toISOString()
    };

    return orderService.addOrder(draftOrder).then(() => {
      // Clear active table cart
      const updatedCarts = { ...tableCarts };
      delete updatedCarts[currentTable.id];
      saveTableCarts(updatedCarts);

      // Reset states
      setCart([]);
      setActiveCustomer(null);
      setDiscount(0);
      setAppliedCoupon(null);
      setEditingOrderId(null);

      // Update local orders list
      return orderService.getOrders().then((updatedList) => {
        setOrders(updatedList);
        return true;
      });
    });
  };

  // Load a Draft order into current active cart
  const loadDraftOrder = (order) => {
    return Promise.all([
      floorService.getFloors(),
      tableService.getTables()
    ]).then(([floors, tables]) => {
      const targetFloor = floors.find(f => f.name === order.floorName);
      const targetTable = tables.find(t => t.id === order.tableId || t.number === order.tableNumber);

      if (targetTable) {
        // Select table
        setCurrentFloor(targetFloor || null);
        setCurrentTable(targetTable);

        // Populate cart items, customer, discount, and coupons
        setCart(order.items || []);
        setActiveCustomer(order.customer || null);
        setDiscount(order.discountPct || 0);
        setAppliedCoupon(order.appliedCoupon || null);
        setEditingOrderId(order.id);

        // Update active table cart in tableCarts dictionary
        const updatedCarts = {
          ...tableCarts,
          [targetTable.id]: {
            cart: order.items || [],
            activeCustomer: order.customer || null,
            discount: order.discountPct || 0,
            appliedCoupon: order.appliedCoupon || null
          }
        };
        saveTableCarts(updatedCarts);

        // Delete from saved orders list to prevent duplicate drafts
        return orderService.deleteOrder(order.id).then(() => {
          return orderService.getOrders().then((updatedList) => {
            setOrders(updatedList);
            return true;
          });
        });
      }
      return false;
    });
  };

  // Settle Payment
  const completePayment = (paymentMethod) => {
    if (!currentTable || cart.length === 0) return Promise.resolve(false);

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const taxRate = settings ? settings.taxRate : 5;
    const tax = subtotal * (taxRate / 100);
    const discountAmt = getDiscountAmount(subtotal);
    const total = Math.max(0, subtotal + tax - discountAmt);

    const newOrder = {
      id: editingOrderId || ("ORD-" + Math.floor(10000 + Math.random() * 90000)),
      tableNumber: currentTable.number,
      tableId: currentTable.id,
      floorName: currentFloor ? currentFloor.name : "",
      items: [...cart],
      subtotal,
      tax,
      discount: discountAmt,
      discountPct: discount,
      appliedCoupon: appliedCoupon,
      total,
      paymentMethod,
      customer: activeCustomer,
      cashier: currentEmployee ? currentEmployee.name : "System",
      status: "Paid",
      createdAt: new Date().toISOString()
    };

    // Save order
    return orderService.addOrder(newOrder).then((savedOrder) => {
      // Refresh local orders list
      return orderService.getOrders().then((updatedList) => {
        setOrders(updatedList);

        // Remove from active table carts
        const updatedCarts = { ...tableCarts };
        delete updatedCarts[currentTable.id];
        saveTableCarts(updatedCarts);

        // Update table status in database back to Available
        return tableService.updateTable(currentTable.id, { status: "Available" })
          .then((updatedTable) => {
            setCurrentTable(updatedTable);
            setCart([]);
            setActiveCustomer(null);
            setDiscount(0);
            setAppliedCoupon(null);
            setEditingOrderId(null);
            
            // Open receipt modal with order
            setActiveOrder(savedOrder);
            setIsReceiptModalOpen(true);
            setPosView("cart");
            return true;
          });
      });
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
        appliedCoupon,
        settings,
        orders,
        activeOrder,
        editingOrderId,
        searchQuery,
        selectedCategory,
        isFloorPopupOpen,
        isCustomerModalOpen,
        isDiscountModalOpen,
        isReceiptModalOpen,
        posView,
        
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
        setEditingOrderId,
        
        // Operational Actions
        selectTable,
        addToCart,
        removeFromCart,
        updateQuantity,
        setTableCustomer,
        applyTableDiscount,
        applyTableCoupon,
        updateSettings,
        sendToKitchen,
        completePayment,
        saveDraftOrder,
        loadDraftOrder
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
