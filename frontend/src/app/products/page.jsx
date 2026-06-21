"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import ProductTable from "@/components/products/ProductTable";
import ProductForm from "@/components/products/ProductForm";
import ProductModal from "@/components/products/ProductModal";
import ProductFilters from "@/components/products/ProductFilters";
import ProductActions from "@/components/products/ProductActions";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { productService } from "@/services/productService";
import { Coffee } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");

  // Modal & Dialog States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [deleteProductId, setDeleteProductId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Load products from service
  const loadProducts = () => {
    setLoading(true);
    productService.getProducts()
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // CRUD Operations
  const handleSaveProduct = (formData) => {
    if (editingProduct) {
      // Edit mode
      productService.updateProduct(editingProduct.id, formData)
        .then(() => {
          loadProducts();
          setIsModalOpen(false);
          setEditingProduct(null);
        })
        .catch(alert);
    } else {
      // Create mode
      productService.addProduct(formData)
        .then(() => {
          loadProducts();
          setIsModalOpen(false);
        })
        .catch(alert);
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteProductId) {
      productService.deleteProduct(deleteProductId)
        .then(() => {
          loadProducts();
          setIsDeleteOpen(false);
          setDeleteProductId(null);
        })
        .catch(alert);
    }
  };

  // Triggering edit/delete modals
  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeleteProductId(id);
    setIsDeleteOpen(true);
  };

  // Filter products based on search and category
  const filteredProducts = products.filter((product) => {
    const matchesSearch = (product.name || "").toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All Categories" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <DashboardLayout>
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <PageHeader 
          title="Products Management"
          description="View, create, edit, and organize restaurant products."
        />
        
        <ProductActions 
          onAddClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          onExport={() => alert("Exporting products to CSV...")}
          onImport={() => alert("Importing products...")}
        />
      </div>

      {/* Filters Area */}
      <ProductFilters 
        query={searchQuery}
        onQueryChange={setSearchQuery}
        category={selectedCategory}
        onCategoryChange={setSelectedCategory}
        categoriesList={["All Categories", "Coffee", "Tea", "Desserts", "Meals", "Combos"]}
      />

      {/* Products Listing Table */}
      <ProductTable 
        products={filteredProducts}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      {/* CRUD Form Modal (Add / Edit) */}
      <ProductModal 
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? "Edit Product Details" : "Add New POS Product"}
      >
        <ProductForm 
          initialData={editingProduct}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </ProductModal>

      {/* Deletion Dialog Confirmation */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Delete Product"
        message="Are you sure you want to remove this product? This action will permanently delete it from the POS terminal databases."
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteProductId(null);
        }}
      />

    </DashboardLayout>
  );
}
