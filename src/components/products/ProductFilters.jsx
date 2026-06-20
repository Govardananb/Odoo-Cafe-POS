"use client";

import React from "react";
import SearchBar from "../shared/SearchBar";
import FilterSelect from "../shared/FilterSelect";

export default function ProductFilters({ 
  query, 
  onQueryChange, 
  category, 
  onCategoryChange, 
  categoriesList 
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-3.5 border border-[#252525] rounded-2xl">
      <div className="w-full sm:max-w-xs">
        <SearchBar
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search products by name..."
        />
      </div>

      <div className="flex items-center justify-end gap-2.5">
        <span className="text-[10px] uppercase tracking-wide font-semibold text-[#A3A3A3] select-none">Category:</span>
        <div className="bg-[#0B0B0B] border border-[#252525] rounded-lg">
          <FilterSelect
            value={category}
            onChange={onCategoryChange}
            options={categoriesList}
          />
        </div>
      </div>
    </div>
  );
}
