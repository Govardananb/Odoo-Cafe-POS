"use client";

import React from "react";
import DataTable from "../shared/DataTable";
import StatusBadge from "../shared/StatusBadge";
import { Edit2, Trash2 } from "lucide-react";

export default function ProductTable({ products, loading, onEdit, onDelete }) {
  const headers = [
    { label: "Product" },
    { label: "Category" },
    { label: "Price", align: "right" },
    { label: "Status", align: "center" },
    { label: "Actions", align: "center" }
  ];

  const renderRow = (product) => (
    <tr key={product.id} className="hover:bg-[#252525]/10 transition-colors">
      <td className="py-3 px-5 text-xs font-semibold text-[#F4F1EA]">{product.name}</td>
      <td className="py-3 px-5 text-xs text-[#A3A3A3]">{product.category}</td>
      <td className="py-3 px-5 text-xs font-bold text-[#FF6B1A] text-right">₹{product.price}</td>
      <td className="py-3 px-5 text-center">
        <StatusBadge status={product.status} />
      </td>
      <td className="py-3 px-5 text-center">
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-1 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#FF6B1A] transition-colors cursor-pointer"
            title="Edit Product"
          >
            <Edit2 size={13} />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-1 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-red-500 transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <DataTable
      headers={headers}
      data={products}
      loading={loading}
      renderRow={renderRow}
      emptyMessage="No products match your criteria. Get started by adding one!"
    />
  );
}
