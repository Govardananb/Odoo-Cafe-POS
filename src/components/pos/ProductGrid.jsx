"use client";

import React, { useState, useEffect } from "react";
import { usePOS } from "@/context/POSContext";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { Search, Coffee, Utensils, IceCream, Cookie, Plus } from "lucide-react";

export default function ProductGrid() {
  const { addToCart, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory } = usePOS();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productService.getProducts(),
      categoryService.getCategories()
    ]).then(([productsData, categoriesData]) => {
      setProducts(productsData.filter(p => p.status === "Active"));
      setCategories(categoriesData.filter(c => c.status === "Active"));
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  // Filter products by search query and category tab
  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = 
      selectedCategory === "All Categories" || 
      p.category?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Get matching category color
  const getCategoryColor = (catName) => {
    const cat = categories.find(c => c.name.toLowerCase() === catName?.toLowerCase());
    return cat ? cat.color : "#FF6B1A";
  };

  // Render dynamic icon based on product name/category
  const renderProductIcon = (product) => {
    const name = product.name?.toLowerCase() || "";
    const cat = product.category?.toLowerCase() || "";

    if (name.includes("tea") || name.includes("coffee") || name.includes("lassi") || cat.includes("beverage")) {
      return <Coffee size={24} className="text-[#FF6B1A]/80 group-hover:scale-110 transition-transform" />;
    }
    if (name.includes("burger") || name.includes("sandwich") || cat.includes("meal")) {
      return <Utensils size={24} className="text-[#FF6B1A]/80 group-hover:scale-110 transition-transform" />;
    }
    if (name.includes("cake") || name.includes("ice") || cat.includes("dessert")) {
      return <IceCream size={24} className="text-[#FF6B1A]/80 group-hover:scale-110 transition-transform" />;
    }
    return <Cookie size={24} className="text-[#FF6B1A]/80 group-hover:scale-110 transition-transform" />;
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden select-none p-4 space-y-4">
      
      {/* 1. Category Tabs Scrollbar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
        <button
          onClick={() => setSelectedCategory("All Categories")}
          type="button"
          className={`h-9 px-4 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            selectedCategory === "All Categories"
              ? "bg-[#FF6B1A] border-[#FF6B1A] text-black"
              : "bg-[#141414] border-[#252525] text-[#A3A3A3] hover:text-[#F4F1EA]"
          }`}
        >
          All Items
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory.toLowerCase() === cat.name.toLowerCase();
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name)}
              type="button"
              className="h-9 px-4 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer"
              style={{
                backgroundColor: isSelected ? cat.color : "#141414",
                borderColor: isSelected ? cat.color : "#252525",
                color: isSelected ? "#000" : "#A3A3A3"
              }}
            >
              <span 
                className="w-1.5 h-1.5 rounded-full shrink-0" 
                style={{ backgroundColor: isSelected ? "#000" : cat.color }}
              />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Mobile/Small Screen Search bar */}
      <div className="relative md:hidden shrink-0">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search items..."
          className="w-full h-11 pl-9 pr-4 bg-[#141414] border border-[#252525] rounded-xl text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A]"
        />
        <Search size={14} className="absolute left-3 top-3.5 text-[#7A7A7A]" />
      </div>

      {/* 2. Products Grid view */}
      <div className="flex-1 overflow-y-auto scrollbar-none">
        {loading ? (
          <div className="py-24 text-center text-xs text-[#A3A3A3]">
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
              <span>Loading POS menu...</span>
            </div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center text-xs text-[#A3A3A3]">
            No products found matching the filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
            {filteredProducts.map((product) => {
              const catColor = getCategoryColor(product.category);
              return (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  className="group bg-[#141414] border border-[#252525] hover:border-[#FF6B1A]/40 active:scale-[0.98] rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all duration-200"
                >
                  {/* Visual Image Area */}
                  <div className="aspect-[4/3] rounded-xl bg-[#0B0B0B] border border-white/5 flex items-center justify-center relative overflow-hidden mb-3">
                    {renderProductIcon(product)}
                    
                    {/* Category Label Overlay */}
                    <span 
                      className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold text-black select-none tracking-wide"
                      style={{ backgroundColor: catColor }}
                    >
                      {product.category}
                    </span>
                  </div>

                  {/* Product Metadata & Price */}
                  <div className="text-left flex flex-col justify-between flex-1">
                    <h4 className="text-xs font-bold text-[#F4F1EA] line-clamp-1">
                      {product.name}
                    </h4>
                    
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#252525]/30">
                      <span className="text-xs font-extrabold text-[#FF6B1A]">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <div className="w-6 h-6 rounded-lg bg-[#FF6B1A] text-black flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Plus size={12} strokeWidth={3} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
