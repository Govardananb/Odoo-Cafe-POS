"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { categoryService } from "@/services/categoryService";
import { FolderTree, Plus } from "lucide-react";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    categoryService.getCategories().then((data) => {
      setCategories(data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Categories Management"
        description="Organize POS items into menus and categories."
        action={{
          label: "Add Category",
          icon: Plus,
          onClick: () => alert("Add Category CRUD action placeholder")
        }}
      />

      <div className="border border-[#252525] rounded-2xl bg-[#141414] overflow-hidden">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-[#252525]">
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Category</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Description</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]/40 text-xs">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-[#252525]/10 transition-colors">
                <td className="py-3 px-5 font-semibold text-[#F4F1EA]">{cat.name}</td>
                <td className="py-3 px-5 text-[#A3A3A3]">{cat.description}</td>
                <td className="py-3 px-5 text-center">
                  <span className="px-2 py-0.5 rounded-[10px] text-[9px] font-semibold bg-green-500/10 text-green-500 uppercase tracking-wide">
                    {cat.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
