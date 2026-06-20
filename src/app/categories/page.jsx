"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import EmptyState from "@/components/shared/EmptyState";

import { categoryService } from "@/services/categoryService";
import { productService } from "@/services/productService";

import CategoryCard from "@/components/categories/CategoryCard";
import CategoryFormModal from "@/components/categories/CategoryFormModal";

import { FolderTree, Plus, Coffee, LayoutGrid, CheckCircle } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modals & Dialogs States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const [deleteCategoryId, setDeleteCategoryId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Load Categories & Products
  const loadData = () => {
    setLoading(true);
    Promise.all([categoryService.getCategories(), productService.getProducts()])
      .then(([categoriesData, productsData]) => {
        setCategories(categoriesData);
        setProducts(productsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD Actions
  const handleAddClick = () => {
    setEditingCategory(null);
    setIsFormModalOpen(true);
  };

  const handleEditClick = (cat) => {
    setEditingCategory(cat);
    setIsFormModalOpen(true);
  };

  const handleSaveCategory = (payload) => {
    if (editingCategory) {
      categoryService.updateCategory(editingCategory.id, payload)
        .then(() => {
          loadData();
          setIsFormModalOpen(false);
          setEditingCategory(null);
        })
        .catch(alert);
    } else {
      categoryService.addCategory(payload)
        .then(() => {
          loadData();
          setIsFormModalOpen(false);
        })
        .catch(alert);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteCategoryId(id);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteCategoryId) {
      categoryService.deleteCategory(deleteCategoryId)
        .then(() => {
          loadData();
          setIsDeleteOpen(false);
          setDeleteCategoryId(null);
        })
        .catch(alert);
    }
  };

  // Stats Computations
  const totalCategoriesCount = categories.length;
  const activeCategoriesCount = categories.filter((c) => c.status === "Active").length;
  
  // Products count mapping to categories
  const getProductCountForCategory = (catName) => {
    return products.filter((p) => p.category?.toLowerCase() === catName?.toLowerCase()).length;
  };

  const totalProductsAssigned = products.filter((p) => 
    categories.some((c) => c.name.toLowerCase() === p.category?.toLowerCase())
  ).length;

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    return (cat.name || "").toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <DashboardLayout>
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <PageHeader
          title="Categories Management"
          description="Organize POS items into menus, sections, and category lists."
        />

        <button
          onClick={handleAddClick}
          type="button"
          className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={13} />
          <span>Add Category</span>
        </button>
      </div>

      {/* 2. STATS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Categories */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Total Categories</span>
            <LayoutGrid size={16} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{totalCategoriesCount}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Active and inactive groups</p>
          </div>
        </div>

        {/* Active Categories */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Active Categories</span>
            <CheckCircle size={16} className="text-green-500" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{activeCategoriesCount}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Visible in POS terminals</p>
          </div>
        </div>

        {/* Total Products Assigned */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Assigned Products</span>
            <Coffee size={16} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{totalProductsAssigned} Items</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Simultaneous menu offerings</p>
          </div>
        </div>
      </div>

      {/* 3. SEARCH TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-3.5 border border-[#252525] rounded-2xl">
        <div className="w-full sm:max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by category name..."
          />
        </div>
      </div>

      {/* 4. CARDS GRID / EMPTY STATE */}
      {loading ? (
        <div className="py-24 text-center text-xs text-[#A3A3A3]">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
            <span>Loading categories data...</span>
          </div>
        </div>
      ) : categories.length === 0 ? (
        <div className="py-20 border border-[#252525] rounded-2xl bg-[#141414] flex justify-center">
          <EmptyState
            title="No Categories Registered"
            message="Please add your first category to start organizing Hot Eats, Drinks, and Sweet Treats."
            icon={FolderTree}
          />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="py-20 border border-[#252525] rounded-2xl bg-[#141414] flex justify-center">
          <EmptyState
            title="No Results Found"
            message={`No categories match the query "${searchQuery}". Try modifying your search criteria.`}
            icon={FolderTree}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredCategories.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              productCount={getProductCountForCategory(cat.name)}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      {/* 5. ADD/EDIT CATEGORY MODAL */}
      <CategoryFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        onSave={handleSaveCategory}
      />

      {/* 6. CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        title="Delete POS Category"
        message="Are you sure you want to remove this category? Deleting it will decouple all currently assigned menu products."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteCategoryId(null);
        }}
      />
    </DashboardLayout>
  );
}
