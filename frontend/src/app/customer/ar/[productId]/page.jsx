"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProductById } from "@/services/customerOrderService";
import { ArrowLeft, ShoppingCart, Sparkles } from "lucide-react";

export default function ARViewerPage() {
  const { productId } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [tableId, setTableId] = useState(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [arSupported, setArSupported] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem("customer_table");
    if (stored) setTableId(JSON.parse(stored).tableId);

    const p = getProductById(productId);
    setProduct(p);

    // Load model-viewer script from CDN once
    if (!document.getElementById("model-viewer-script")) {
      const script = document.createElement("script");
      script.id = "model-viewer-script";
      script.type = "module";
      script.src =
        "https://ajax.googleapis.com/ajax/libs/model-viewer/3.4.0/model-viewer.min.js";
      document.head.appendChild(script);
      script.onload = () => setModelLoaded(true);
    } else {
      setModelLoaded(true);
    }

    // Detect AR support (WebXR or iOS quicklook)
    if (
      typeof navigator !== "undefined" &&
      !navigator.xr &&
      !/iphone|ipad/i.test(navigator.userAgent)
    ) {
      setArSupported(false);
    }
  }, [productId]);

  const addToCart = () => {
    if (!product || !tableId) return;
    const key = "customer_cart_" + tableId;
    const raw = sessionStorage.getItem(key);
    const cart = raw ? JSON.parse(raw) : [];
    const idx = cart.findIndex((i) => i.product.id === product.id);
    if (idx >= 0) {
      cart[idx].quantity += 1;
    } else {
      cart.push({ product, quantity: 1 });
    }
    sessionStorage.setItem(key, JSON.stringify(cart));
    router.push("/customer/cart");
  };

  if (!product) {
    return (
      <div style={styles.centered}>
        <p style={{ color: "#555", fontSize: 14 }}>Product not found.</p>
        <button onClick={() => router.back()} style={styles.backLink}>
          ← Go Back
        </button>
      </div>
    );
  }

  // The .glb model to use: product-specific or fallback demo
  const glbSrc =
    product.glbModel ||
    "https://modelviewer.dev/shared-assets/models/Astronaut.glb";
  const iosSrc = product.usdzModel || undefined;

  return (
    <div style={styles.page}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <button onClick={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={17} />
        </button>
        <div style={styles.arLabel}>
          <Sparkles size={13} color="#FF6B1A" />
          <span style={{ fontSize: 12, fontWeight: 700, color: "#FF6B1A" }}>
            AR View
          </span>
        </div>
      </div>

      {/* model-viewer container */}
      <div style={styles.viewerWrap}>
        {modelLoaded ? (
          // model-viewer is a Web Component — use lowercase tag
          // eslint-disable-next-line react/no-unknown-property
          <model-viewer
            src={glbSrc}
            ios-src={iosSrc}
            alt={product.name}
            ar={arSupported ? true : undefined}
            ar-modes="webxr scene-viewer quick-look"
            camera-controls
            auto-rotate
            shadow-intensity="1"
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
            }}
          />
        ) : (
          <div style={styles.loadingViewer}>
            <div style={styles.spinner} />
            <p style={{ color: "#555", fontSize: 13, marginTop: 12 }}>
              Loading 3D model…
            </p>
          </div>
        )}
      </div>

      {/* Instructions */}
      {arSupported && (
        <div style={styles.instructions}>
          <Sparkles size={13} color="#888" />
          <span style={styles.instructionText}>
            Tap the AR button inside the viewer to place food on your table
          </span>
        </div>
      )}

      {!arSupported && (
        <div style={styles.noArBanner}>
          <span style={styles.noArText}>
            AR not supported on this device — enjoy the 360° 3D viewer above
          </span>
        </div>
      )}

      {/* Product info */}
      <div style={styles.productCard}>
        <div style={styles.productInfo}>
          <div style={styles.productName}>{product.name}</div>
          <div style={styles.productCat}>{product.category}</div>
        </div>
        <div style={styles.productRight}>
          <div style={styles.productPrice}>₹{product.price}</div>
          <button onClick={addToCart} style={styles.addBtn}>
            <ShoppingCart size={15} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: "flex",
    flexDirection: "column",
    minHeight: "calc(100dvh - 130px)",
    background: "#0B0B0B",
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    gap: 12,
    padding: 24,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
  },
  backBtn: {
    background: "#141414",
    border: "1px solid #222",
    borderRadius: 10,
    color: "#888",
    width: 36,
    height: 36,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  },
  arLabel: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#1A0F08",
    border: "1px solid #3A1F0A",
    borderRadius: 8,
    padding: "5px 12px",
  },
  viewerWrap: {
    flex: 1,
    minHeight: 300,
    background: "#0F0F0F",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  loadingViewer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 300,
  },
  spinner: {
    width: 32,
    height: 32,
    border: "3px solid #222",
    borderTop: "3px solid #FF6B1A",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  instructions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    background: "#111",
    borderTop: "1px solid #1A1A1A",
  },
  instructionText: {
    fontSize: 12,
    color: "#555",
  },
  noArBanner: {
    padding: "10px 16px",
    background: "#111",
    borderTop: "1px solid #1A1A1A",
  },
  noArText: {
    fontSize: 12,
    color: "#444",
  },
  productCard: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px",
    background: "#141414",
    borderTop: "1px solid #1E1E1E",
    gap: 12,
  },
  productInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: 3,
  },
  productName: {
    fontSize: 16,
    fontWeight: 800,
    color: "#F4F4F4",
  },
  productCat: {
    fontSize: 12,
    color: "#555",
  },
  productRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  productPrice: {
    fontSize: 17,
    fontWeight: 800,
    color: "#FF6B1A",
  },
  addBtn: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    background: "#FF6B1A",
    border: "none",
    borderRadius: 10,
    color: "#000",
    fontSize: 13,
    fontWeight: 800,
    padding: "10px 16px",
    cursor: "pointer",
  },
  backLink: {
    background: "none",
    border: "none",
    color: "#FF6B1A",
    fontSize: 14,
    cursor: "pointer",
    padding: 0,
  },
};
