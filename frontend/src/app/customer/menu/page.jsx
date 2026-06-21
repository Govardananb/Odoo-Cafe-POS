"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getProducts, getCategories, getActiveOrder, placeOrder } from "@/services/customerOrderService";
import { couponService } from "@/services/couponService";
import { 
  Search, X, Sparkles, Plus, Minus, Check, ShoppingCart, 
  MapPin, User, ChevronRight, MessageSquare, Tag, AlertCircle, ShoppingBag 
} from "lucide-react";

export default function CustomerMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tableInfo, setTableInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  
  // Onboarding States
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [onboardingError, setOnboardingError] = useState("");

  // Cart States
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartNotes, setCartNotes] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  // Active Order State
  const [activeOrder, setActiveOrder] = useState(null);

  // UI state
  const [addedMap, setAddedMap] = useState({}); // productId -> flash feedback

  // Initial Load
  useEffect(() => {
    // Resolve Table Context
    const storedTable = sessionStorage.getItem("customer_table");
    if (storedTable) {
      const parsedTable = JSON.parse(storedTable);
      setTableInfo(parsedTable);

      // Load Cart
      const cartRaw = sessionStorage.getItem("customer_cart_" + parsedTable.tableId);
      if (cartRaw) setCart(JSON.parse(cartRaw));

      // Load Active Order
      const order = getActiveOrder(parsedTable.tableId);
      setActiveOrder(order);
    }

    // Check Onboarding status
    const storedName = sessionStorage.getItem("customer_name");
    if (!storedName) {
      setShowOnboarding(true);
    } else {
      setCustomerName(storedName);
      setCustomerPhone(sessionStorage.getItem("customer_phone") || "");
    }

    // Load Products dynamically
    const allProducts = getProducts();
    setProducts(allProducts);

    // Group categories dynamically
    const activeCats = [...new Set(allProducts.map((p) => p.category).filter(Boolean))];
    setCategories(["All", ...activeCats]);

    // Open cart if redirected with openCart query param
    if (searchParams.get("openCart") === "true") {
      setIsCartOpen(true);
    }
  }, [searchParams]);

  // Handle onboarding submission
  const handleOnboardingSubmit = (e) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setOnboardingError("Please enter your name to continue.");
      return;
    }
    sessionStorage.setItem("customer_name", customerName.trim());
    if (customerPhone.trim()) {
      sessionStorage.setItem("customer_phone", customerPhone.trim());
    }
    setShowOnboarding(false);
  };

  // Add to cart
  const handleAdd = useCallback(
    (product) => {
      if (!tableInfo) return;
      const key = "customer_cart_" + tableInfo.tableId;
      const newCart = [...cart];
      const idx = newCart.findIndex((i) => i.product.id === product.id);
      if (idx >= 0) {
        newCart[idx].quantity += 1;
      } else {
        newCart.push({ product, quantity: 1 });
      }
      setCart(newCart);
      sessionStorage.setItem(key, JSON.stringify(newCart));

      // Flash feedback
      setAddedMap((prev) => ({ ...prev, [product.id]: true }));
      setTimeout(() => setAddedMap((prev) => ({ ...prev, [product.id]: false })), 800);
    },
    [tableInfo, cart]
  );

  // Update Cart Quantity
  const updateCartQty = (productId, delta) => {
    if (!tableInfo) return;
    const key = "customer_cart_" + tableInfo.tableId;
    const newCart = cart
      .map((item) =>
        item.product.id === productId ? { ...item, quantity: item.quantity + delta } : item
      )
      .filter((item) => item.quantity > 0);
    setCart(newCart);
    sessionStorage.setItem(key, JSON.stringify(newCart));
  };

  // Apply Coupon
  const handleApplyCoupon = async () => {
    setCouponError("");
    if (!couponCode.trim()) return;

    try {
      const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
      const coupon = await couponService.validateCoupon(couponCode.trim(), subtotal);
      setAppliedCoupon(coupon);
    } catch (err) {
      setCouponError(err.message || "Invalid coupon code.");
      setAppliedCoupon(null);
    }
  };

  // Remove Coupon
  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
  };

  // Checkout
  const handleCheckout = async () => {
    if (!tableInfo || cart.length === 0) return;
    setPlacingOrder(true);

    const subtotal = cart.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const discountAmt = appliedCoupon
      ? appliedCoupon.type === "percent"
        ? subtotal * (appliedCoupon.value / 100)
        : Math.min(appliedCoupon.value, subtotal)
      : 0;
    const taxable = subtotal - discountAmt;
    const tax = taxable * 0.05;
    const total = taxable + tax;

    try {
      // Create new order on server side
      const customer = {
        name: customerName,
        phone: customerPhone || undefined
      };

      const newOrder = placeOrder({
        tableId: tableInfo.tableId,
        tableNumber: tableInfo.tableNumber,
        floorName: tableInfo.floorName,
        items: cart,
        coupon: appliedCoupon,
        subtotal: +subtotal.toFixed(2),
        tax: +tax.toFixed(2),
        discount: +discountAmt.toFixed(2),
        total: +total.toFixed(2),
        customer,
      });

      // Save order context for tracking
      sessionStorage.setItem("customer_last_order", JSON.stringify(newOrder));
      
      // Clear Cart
      sessionStorage.removeItem("customer_cart_" + tableInfo.tableId);
      setCart([]);
      setIsCartOpen(false);

      router.push("/customer/tracking");
    } catch (err) {
      console.error(err);
    } finally {
      setPlacingOrder(false);
    }
  };

  // Filter products by category and search
  const filtered = products.filter((p) => {
    const matchCat = activeCategory === "All" || p.category === activeCategory;
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Empty states
  if (!tableInfo) {
    return (
      <div style={styles.errorCentered}>
        <AlertCircle size={44} color="#EF4444" />
        <h2 style={styles.errorTitle}>Invalid QR Code</h2>
        <p style={styles.errorMsg}>Please scan the QR code on your table to start ordering.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* ONBOARDING OVERLAY */}
      {showOnboarding && (
        <div style={styles.onboardingOverlay}>
          <div style={styles.onboardingCard}>
            <div style={styles.logoBadge}>
              <User size={30} color="#FF6B1A" />
            </div>
            <h2 style={styles.onboardingTitle}>Welcome to Odoo Cafe</h2>
            <p style={styles.onboardingDesc}>
              Please enter your details to order directly from <span style={{ color: "#FF6B1A", fontWeight: 700 }}>{tableInfo.tableNumber}</span> ({tableInfo.floorName}).
            </p>

            <form onSubmit={handleOnboardingSubmit} style={styles.form}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Your Name <span style={{ color: "#FF6B1A" }}>*</span></label>
                <input
                  type="text"
                  placeholder="e.g. Govardanan"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="e.g. +91 98765 43210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  style={styles.input}
                />
              </div>

              {onboardingError && <p style={styles.errorText}>{onboardingError}</p>}

              <button type="submit" style={styles.submitBtn}>
                Continue to Menu
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ACTIVE ORDER BANNER */}
      {activeOrder && (
        <div style={styles.activeOrderBanner}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <span style={styles.pulseDot} />
            <div>
              <div style={styles.bannerTitle}>Active Order Status</div>
              <div style={styles.bannerStatus}>Kitchen is preparing your meal</div>
            </div>
          </div>
          <button 
            onClick={() => router.push("/customer/tracking")} 
            style={styles.bannerTrackBtn}
          >
            Track <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* SEARCH AND CATEGORIES */}
      <div style={styles.headerSpacer}>
        <div style={styles.searchBar}>
          <Search size={16} color="#666" />
          <input
            type="text"
            placeholder="Search our delicious menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          {search && (
            <button onClick={() => setSearch("")} style={styles.clearBtn}>
              <X size={15} />
            </button>
          )}
        </div>

        {/* Categories horizontal scroll */}
        <div style={styles.categoryScroll}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                ...styles.categoryChip,
                ...(activeCategory === cat ? styles.categoryChipActive : {}),
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* PRODUCT GRID */}
      {filtered.length === 0 ? (
        <div style={styles.emptyContainer}>
          <p style={{ color: "#666", fontSize: 14 }}>Menu is currently unavailable.</p>
        </div>
      ) : (
        <div style={styles.productGrid}>
          {filtered.map((product) => {
            const qty = cart.find((i) => i.product.id === product.id)?.quantity || 0;
            const added = addedMap[product.id];
            
            return (
              <div key={product.id} style={styles.productCard}>
                {product.arEnabled && (
                  <button 
                    onClick={() => router.push(`/customer/ar/${product.id}`)}
                    style={styles.arBadge}
                  >
                    <Sparkles size={11} /> AR
                  </button>
                )}

                <div style={styles.productImageWrap}>
                  <span style={styles.productEmoji}>{getCategoryEmoji(product.category)}</span>
                </div>

                <div style={styles.productInfo}>
                  <div style={styles.productHeader}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <span style={styles.prepBadge}>{product.prepTime || "5 mins"}</span>
                  </div>
                  <p style={styles.productDesc}>{product.description || "Freshly prepared house special."}</p>
                  
                  <div style={styles.productFooter}>
                    <span style={styles.productPrice}>₹{product.price}</span>
                    <button
                      onClick={() => handleAdd(product)}
                      style={{
                        ...styles.addBtn,
                        ...(added ? styles.addBtnAdded : {}),
                      }}
                    >
                      {added ? <Check size={14} /> : <Plus size={14} />}
                      {qty > 0 && !added && <span style={styles.qtyCount}>{qty}</span>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STICKY FLOATING CART BUTTON */}
      {totalQty > 0 && (
        <button 
          onClick={() => setIsCartOpen(true)}
          style={styles.stickyCartBtn}
        >
          <div style={styles.cartIconWrapper}>
            <ShoppingCart size={18} color="#000" />
            <span style={styles.cartFloatingBadge}>{totalQty}</span>
          </div>
          <span style={styles.cartBtnText}>View Cart</span>
          <span style={styles.cartBtnPrice}>₹{cartSubtotal}</span>
        </button>
      )}

      {/* CART DRAWER */}
      {isCartOpen && (
        <div style={styles.drawerOverlay} onClick={() => setIsCartOpen(false)}>
          <div style={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
            {/* Handle bar */}
            <div style={styles.drawerHandle} onClick={() => setIsCartOpen(false)} />
            
            <div style={styles.drawerHeader}>
              <h2 style={styles.drawerTitle}>Your Cart ({totalQty})</h2>
              <button onClick={() => setIsCartOpen(false)} style={styles.closeDrawerBtn}>
                <X size={18} />
              </button>
            </div>

            {/* Scrollable list */}
            <div style={styles.drawerBody}>
              {cart.map((item) => (
                <div key={item.product.id} style={styles.cartItemRow}>
                  <div style={{ flex: 1 }}>
                    <div style={styles.cartItemName}>{item.product.name}</div>
                    <div style={styles.cartItemPrice}>₹{item.product.price}</div>
                  </div>
                  
                  <div style={styles.cartItemQtyControls}>
                    <button onClick={() => updateCartQty(item.product.id, -1)} style={styles.qtyControlBtn}>
                      <Minus size={12} />
                    </button>
                    <span style={styles.qtyControlNum}>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.product.id, 1)} style={styles.qtyControlBtn}>
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
              ))}

              {/* Order Notes */}
              <div style={styles.drawerSection}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <MessageSquare size={13} color="#888" />
                  <span style={styles.sectionLabel}>Add Kitchen Notes</span>
                </div>
                <textarea
                  placeholder="e.g. Less sugar, extra ice, lactose-free milk..."
                  value={cartNotes}
                  onChange={(e) => setCartNotes(e.target.value)}
                  style={styles.notesTextarea}
                  rows={2}
                />
              </div>

              {/* Coupon Code */}
              <div style={styles.drawerSection}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                  <Tag size={13} color="#888" />
                  <span style={styles.sectionLabel}>Apply Promo Code</span>
                </div>
                {appliedCoupon ? (
                  <div style={styles.couponBadge}>
                    <span style={styles.couponBadgeText}>{appliedCoupon.code} applied</span>
                    <button onClick={handleRemoveCoupon} style={styles.removeCouponBtn}>
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <div style={styles.couponInputWrapper}>
                    <input
                      type="text"
                      placeholder="Enter promo code (e.g. OFFLINE20)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      style={styles.couponInput}
                    />
                    <button onClick={handleApplyCoupon} style={styles.couponApplyBtn}>
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p style={styles.couponErrorText}>{couponError}</p>}
              </div>

              {/* Summary */}
              <div style={styles.drawerSummary}>
                <div style={styles.summaryRow}>
                  <span>Subtotal</span>
                  <span>₹{cartSubtotal}</span>
                </div>
                {appliedCoupon && (
                  <div style={styles.summaryRow}>
                    <span style={{ color: "#22C55E" }}>Discount ({appliedCoupon.type === "percent" ? `${appliedCoupon.value}%` : `₹${appliedCoupon.value}`})</span>
                    <span style={{ color: "#22C55E" }}>
                      -₹{appliedCoupon.type === "percent" ? (cartSubtotal * (appliedCoupon.value / 100)).toFixed(2) : Math.min(appliedCoupon.value, cartSubtotal).toFixed(2)}
                    </span>
                  </div>
                )}
                <div style={styles.summaryRow}>
                  <span>Tax (5%)</span>
                  <span>₹{(cartSubtotal * 0.05).toFixed(2)}</span>
                </div>
                <div style={styles.totalRow}>
                  <span>Total Amount</span>
                  <span>
                    ₹{(
                      cartSubtotal - 
                      (appliedCoupon ? (appliedCoupon.type === "percent" ? (cartSubtotal * (appliedCoupon.value / 100)) : Math.min(appliedCoupon.value, cartSubtotal)) : 0) + 
                      (cartSubtotal * 0.05)
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={styles.drawerFooter}>
              <button 
                onClick={() => setIsCartOpen(false)}
                style={styles.continueBrowsingBtn}
              >
                Continue Browsing
              </button>
              <button 
                onClick={handleCheckout}
                disabled={placingOrder}
                style={styles.placeOrderBtn}
              >
                {placingOrder ? "Placing Order..." : "Place Order"}
              </button>
            </div>
          </div>
        </div>
      )}
      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.9); }
        }
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

function getCategoryEmoji(category) {
  const map = {
    Coffee: "☕",
    Tea: "🍵",
    Desserts: "🍰",
    Meals: "🍱",
    Combos: "🛍️",
  };
  return map[category] || "🍽️";
}

const styles = {
  container: {
    padding: "16px 16px 100px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    color: "#F4F1EA",
  },
  headerSpacer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 12,
    padding: "10px 14px",
  },
  searchInput: {
    flex: 1,
    background: "transparent",
    border: "none",
    outline: "none",
    color: "#F4F4F4",
    fontSize: 14,
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
    display: "flex",
  },
  categoryScroll: {
    display: "flex",
    gap: 8,
    overflowX: "auto",
    paddingBottom: 2,
    scrollbarWidth: "none",
  },
  categoryChip: {
    flexShrink: 0,
    padding: "6px 14px",
    borderRadius: 20,
    border: "1px solid #222",
    background: "#141414",
    color: "#888",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  categoryChipActive: {
    background: "#FF6B1A",
    border: "1px solid #FF6B1A",
    color: "#000",
  },
  productGrid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  productCard: {
    display: "flex",
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 16,
    padding: 12,
    gap: 12,
    position: "relative",
    overflow: "hidden",
  },
  arBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    background: "#FF6B1A",
    color: "#000",
    border: "none",
    borderRadius: 6,
    padding: "3px 6px",
    fontSize: 10,
    fontWeight: 800,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 3,
    letterSpacing: "0.5px",
    zIndex: 2,
  },
  productImageWrap: {
    width: 80,
    height: 80,
    background: "#1C1C1C",
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  productEmoji: {
    fontSize: 32,
  },
  productInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  productHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  productName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#F4F4F4",
    margin: 0,
  },
  prepBadge: {
    fontSize: 10,
    color: "#888",
    background: "#222",
    borderRadius: 6,
    padding: "2px 6px",
    fontWeight: 500,
  },
  productDesc: {
    fontSize: 12,
    color: "#777",
    margin: 0,
    lineHeight: 1.4,
  },
  productFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 800,
    color: "#FF6B1A",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    background: "#FF6B1A",
    border: "none",
    color: "#000",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    position: "relative",
    transition: "background 0.2s",
  },
  addBtnAdded: {
    background: "#22C55E",
  },
  qtyCount: {
    position: "absolute",
    top: -6,
    right: -6,
    background: "#0B0B0B",
    border: "1px solid #FF6B1A",
    color: "#FF6B1A",
    borderRadius: "50%",
    width: 14,
    height: 14,
    fontSize: 9,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    display: "flex",
    justifyContent: "center",
    padding: "64px 0",
  },
  // Sticky Cart
  stickyCartBtn: {
    position: "fixed",
    bottom: 74,
    left: "50%",
    transform: "translateX(-50%)",
    width: "calc(100% - 32px)",
    maxWidth: 448,
    height: 52,
    background: "#FF6B1A",
    borderRadius: 14,
    padding: "0 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    border: "none",
    boxShadow: "0 8px 32px rgba(255, 107, 26, 0.35)",
    cursor: "pointer",
    zIndex: 40,
    transition: "transform 0.2s active:scale-[0.99]",
  },
  cartIconWrapper: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  cartFloatingBadge: {
    position: "absolute",
    top: -7,
    right: -8,
    background: "#000",
    color: "#FF6B1A",
    borderRadius: "50%",
    width: 15,
    height: 15,
    fontSize: 9,
    fontWeight: 800,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cartBtnText: {
    fontSize: 14,
    fontWeight: 800,
    color: "#000",
    flex: 1,
    textAlign: "left",
    marginLeft: 18,
  },
  cartBtnPrice: {
    fontSize: 15,
    fontWeight: 800,
    color: "#000",
    background: "rgba(0,0,0,0.08)",
    padding: "4px 8px",
    borderRadius: 6,
  },
  // ONBOARDING OVERLAY
  onboardingOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.9)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backdropFilter: "blur(4px)",
  },
  onboardingCard: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 24,
    width: "100%",
    maxWidth: 400,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  logoBadge: {
    width: 64,
    height: 64,
    background: "#FF6B1A10",
    border: "1px solid #FF6B1A20",
    borderRadius: 20,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  onboardingTitle: {
    fontSize: 20,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  onboardingDesc: {
    fontSize: 13,
    color: "#666",
    marginTop: 8,
    marginBottom: 20,
    lineHeight: 1.4,
  },
  form: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: 14,
    textAlign: "left",
  },
  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
  },
  label: {
    fontSize: 10,
    fontWeight: 600,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  input: {
    height: 48,
    borderRadius: 12,
    border: "1px solid #222",
    background: "#0D0D0D",
    color: "#F4F4F4",
    padding: "0 14px",
    fontSize: 14,
    outline: "none",
    focusBorderColor: "#FF6B1A",
  },
  submitBtn: {
    height: 48,
    borderRadius: 12,
    border: "none",
    background: "#FF6B1A",
    color: "#000",
    fontWeight: 750,
    fontSize: 14,
    cursor: "pointer",
    marginTop: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    margin: 0,
    textAlign: "center",
  },
  errorCentered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    textAlign: "center",
    minHeight: "60vh",
    gap: 12,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 850,
    color: "#F4F4F4",
    margin: 0,
  },
  errorMsg: {
    fontSize: 13,
    color: "#666",
    margin: 0,
    maxWidth: 260,
    lineHeight: 1.4,
  },
  // ACTIVE ORDER BANNER
  activeOrderBanner: {
    display: "flex",
    alignItems: "center",
    background: "#1E1700",
    border: "1px solid #3A2C00",
    borderRadius: 14,
    padding: "10px 14px",
    marginBottom: 4,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: "#FBBF24",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  bannerTitle: {
    fontSize: 11,
    fontWeight: 650,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  bannerStatus: {
    fontSize: 12,
    fontWeight: 600,
    color: "#FBBF24",
    marginTop: 1,
  },
  bannerTrackBtn: {
    background: "#FBBF24",
    border: "none",
    color: "#000",
    borderRadius: 8,
    padding: "6px 12px",
    fontSize: 11,
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: 2,
  },
  // CART DRAWER
  drawerOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.8)",
    backdropFilter: "blur(3px)",
    zIndex: 90,
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  drawerContent: {
    width: "100%",
    maxWidth: 480,
    background: "#0D0D0D",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    display: "flex",
    flexDirection: "column",
    maxHeight: "88dvh",
    boxShadow: "0 -10px 40px rgba(0,0,0,0.5)",
    borderTop: "1px solid #1E1E1E",
    animation: "slideUp 0.3s ease-out",
  },
  drawerHandle: {
    width: 40,
    height: 4,
    background: "#222",
    borderRadius: 2,
    margin: "10px auto 4px",
    cursor: "pointer",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "14px 20px",
    borderBottom: "1px solid #1E1E1E",
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 800,
    color: "#F4F4F4",
    margin: 0,
  },
  closeDrawerBtn: {
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
    padding: 0,
    display: "flex",
  },
  drawerBody: {
    flex: 1,
    overflowY: "auto",
    padding: "16px 20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  cartItemRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#141414",
    border: "1px solid #1E1E1E",
    padding: "12px 14px",
    borderRadius: 14,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: 700,
    color: "#F4F4F4",
  },
  cartItemPrice: {
    fontSize: 12,
    color: "#FF6B1A",
    fontWeight: 600,
    marginTop: 2,
  },
  cartItemQtyControls: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  qtyControlBtn: {
    width: 24,
    height: 24,
    background: "#222",
    border: "none",
    color: "#F4F4F4",
    borderRadius: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  qtyControlNum: {
    fontSize: 13,
    fontWeight: 700,
    color: "#F4F4F4",
    minWidth: 16,
    textAlign: "center",
  },
  drawerSection: {
    display: "flex",
    flexDirection: "column",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 650,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  notesTextarea: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 10,
    color: "#F4F4F4",
    padding: 10,
    fontSize: 12,
    outline: "none",
    resize: "none",
    fontFamily: "sans-serif",
  },
  couponInputWrapper: {
    display: "flex",
    gap: 8,
  },
  couponInput: {
    flex: 1,
    height: 38,
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 10,
    color: "#F4F4F4",
    padding: "0 12px",
    fontSize: 12,
    outline: "none",
  },
  couponApplyBtn: {
    height: 38,
    padding: "0 14px",
    background: "#FF6B1A",
    color: "#000",
    fontWeight: 700,
    fontSize: 12,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
  },
  couponBadge: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    background: "#0F2A0F",
    border: "1px solid #1E4E1E",
    borderRadius: 10,
    padding: "8px 12px",
  },
  couponBadgeText: {
    color: "#22C55E",
    fontSize: 12,
    fontWeight: 700,
  },
  removeCouponBtn: {
    background: "none",
    border: "none",
    color: "#555",
    cursor: "pointer",
    display: "flex",
  },
  couponErrorText: {
    fontSize: 11,
    color: "#EF4444",
    marginTop: 4,
    marginHorizontal: 0,
  },
  drawerSummary: {
    background: "#141414",
    border: "1px solid #1E1E1E",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 13,
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    color: "#888",
  },
  totalRow: {
    display: "flex",
    justifyContent: "space-between",
    fontWeight: 800,
    fontSize: 15,
    color: "#F4F4F4",
    borderTop: "1px solid #1E1E1E",
    paddingTop: 8,
    marginTop: 2,
  },
  drawerFooter: {
    display: "flex",
    gap: 10,
    padding: "16px 20px 24px",
    borderTop: "1px solid #1E1E1E",
    background: "#0D0D0D",
  },
  continueBrowsingBtn: {
    flex: 1,
    height: 48,
    background: "transparent",
    color: "#F4F4F4",
    border: "1px solid #222",
    borderRadius: 12,
    fontWeight: 650,
    fontSize: 13,
    cursor: "pointer",
  },
  placeOrderBtn: {
    flex: 1,
    height: 48,
    background: "#FF6B1A",
    color: "#000",
    border: "none",
    borderRadius: 12,
    fontWeight: 800,
    fontSize: 14,
    cursor: "pointer",
  },
};
