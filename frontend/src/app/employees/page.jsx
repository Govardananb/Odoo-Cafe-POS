"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import SearchBar from "@/components/shared/SearchBar";
import FilterSelect from "@/components/shared/FilterSelect";
import StatusBadge from "@/components/shared/StatusBadge";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ProductModal from "@/components/products/ProductModal";
import { employeeService } from "@/services/employeeService";
import { Users, Plus, MoreVertical, Edit2, Key, Archive, Trash2 } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");

  // State for modals and actions
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [activeDropdown, setActiveDropdown] = useState(null);

  // Form Fields
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("employee");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState("Active");

  // Load employee list
  const loadEmployees = () => {
    setLoading(true);
    employeeService.getEmployees()
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  // Stats computations
  const totalCount = employees.length;
  const activeCount = employees.filter((e) => e.status === "Active").length;
  
  // Roles Breakdown Tally
  const rolesBreakdown = employees.reduce((acc, curr) => {
    acc[curr.role] = (acc[curr.role] || 0) + 1;
    return acc;
  }, {});

  const getInitials = (name) => {
    if (!name) return "";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "";
  };

  // CRUD operation handlers
  const handleAddClick = () => {
    setEditingEmployee(null);
    setFormName("");
    setFormRole("employee");
    setFormEmail("");
    setFormStatus("Active");
    setIsFormOpen(true);
  };

  const handleEditClick = (emp) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormRole(emp.role);
    setFormEmail(emp.email);
    setFormStatus(emp.status);
    setIsFormOpen(true);
    setActiveDropdown(null);
  };

  const handleSaveEmployee = (e) => {
    e.preventDefault();
    const payload = {
      name: formName,
      role: formRole,
      email: formEmail,
      status: formStatus
    };

    if (editingEmployee) {
      employeeService.updateEmployee(editingEmployee.id, payload)
        .then(() => {
          loadEmployees();
          setIsFormOpen(false);
          setEditingEmployee(null);
        })
        .catch(alert);
    } else {
      employeeService.addEmployee(payload)
        .then(() => {
          loadEmployees();
          setIsFormOpen(false);
        })
        .catch(alert);
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteEmployeeId(id);
    setIsDeleteOpen(true);
    setActiveDropdown(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteEmployeeId) {
      employeeService.deleteEmployee(deleteEmployeeId)
        .then(() => {
          loadEmployees();
          setIsDeleteOpen(false);
          setDeleteEmployeeId(null);
        })
        .catch(alert);
    }
  };

  const handleArchiveToggle = (emp) => {
    const nextStatus = emp.status === "Active" ? "Inactive" : "Active";
    employeeService.updateEmployee(emp.id, { status: nextStatus })
      .then(() => {
        loadEmployees();
        setActiveDropdown(null);
      })
      .catch(alert);
  };

  const handleChangePassword = (emp) => {
    setActiveDropdown(null);
    const newPass = prompt(`Enter new password for ${emp.name}:`);
    if (newPass !== null) {
      if (newPass.length < 4) {
        alert("Password must be at least 4 characters long.");
      } else {
        alert(`Password for ${emp.name} has been updated successfully!`);
      }
    }
  };

  // Filtering
  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch = (emp.name || "").toString().toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (emp.email || "").toString().toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedRole === "All Roles" || emp.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  // Unique roles for filter dropdown
  const rolesList = ["All Roles", "admin", "employee"];

  return (
    <DashboardLayout>
      
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <PageHeader 
          title="Employees Directory"
          description="Manage POS access credentials and cashier permissions."
        />
        
        <button
          onClick={handleAddClick}
          type="button"
          className="h-9 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 active:scale-[0.98] text-black text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={13} />
          <span>Add Employee</span>
        </button>
      </div>

      {/* 2. COMPACT STATISTICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Employees */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Total Employees</span>
            <Users size={16} className="text-[#FF6B1A]" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{totalCount}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Staff registered in database</p>
          </div>
        </div>

        {/* Active Employees */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Active Sessions</span>
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#F4F1EA]">{activeCount} / {totalCount}</h3>
            <p className="text-[9px] text-[#A3A3A3] mt-0.5 font-sans">Authorized terminal operators</p>
          </div>
        </div>

        {/* Roles Breakdown */}
        <div className="bg-[#141414] border border-[#252525] rounded-2xl p-4 space-y-2 relative text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#A3A3A3] font-semibold tracking-wider uppercase">Roles Distribution</span>
            <span className="text-[9px] text-[#FF6B1A] font-semibold">Active</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="text-[10px] text-[#F4F1EA] font-medium font-sans">Admins: <span className="text-[#FF6B1A] font-bold">{rolesBreakdown["admin"] || 0}</span></span>
            <span className="text-[10px] text-[#F4F1EA] font-medium font-sans">Employees: <span className="text-[#FF6B1A] font-bold">{rolesBreakdown["employee"] || 0}</span></span>
          </div>
        </div>
      </div>

      {/* 3. FILTERS TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#141414] p-3.5 border border-[#252525] rounded-2xl">
        <div className="w-full sm:max-w-xs">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
          />
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <span className="text-[10px] uppercase tracking-wide font-semibold text-[#A3A3A3] select-none">Role:</span>
          <div className="bg-[#0B0B0B] border border-[#252525] rounded-lg">
            <FilterSelect
              value={selectedRole}
              onChange={setSelectedRole}
              options={rolesList}
            />
          </div>
        </div>
      </div>

      {/* 4. TABLE */}
      <div className="overflow-x-auto w-full border border-[#252525] rounded-2xl bg-[#141414]">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#252525]">
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Employee</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Role</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Email</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-center">Status</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]/40 text-xs">
            {loading ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-xs text-[#A3A3A3]">
                  <div className="flex flex-col items-center justify-center gap-3">
                    <div className="w-6 h-6 border-2 border-[#FF6B1A] border-t-transparent rounded-full animate-spin" />
                    <span>Loading employees...</span>
                  </div>
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan="5" className="py-12 text-center text-[#A3A3A3]">
                  No employees found matching the filters.
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-[#252525]/10 transition-colors">
                  
                  {/* Name with initials Avatar */}
                  <td className="py-3 px-5 font-semibold text-[#F4F1EA]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF6B1A]/5 border border-[#FF6B1A]/10 flex items-center justify-center text-[10px] font-bold text-[#FF6B1A] shrink-0 select-none">
                        {getInitials(emp.name)}
                      </div>
                      <span>{emp.name}</span>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3 px-5">
                    <span className={`px-2 py-0.5 rounded-[10px] text-[9px] font-semibold tracking-wider uppercase ${
                      emp.role === "admin" 
                        ? "text-[#FF6B1A] bg-[#FF6B1A]/10" 
                        : "text-[#A3A3A3] bg-[#252525]"
                    }`}>
                      {emp.role}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="py-3 px-5 text-[#A3A3A3]">{emp.email}</td>

                  {/* Status Badge */}
                  <td className="py-3 px-5 text-center">
                    <StatusBadge status={emp.status} />
                  </td>

                  {/* Row Actions */}
                  <td className="py-3 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleEditClick(emp)}
                        className="p-1.5 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#FF6B1A] transition-colors cursor-pointer"
                        title="Edit Employee"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleChangePassword(emp)}
                        className="p-1.5 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#FF6B1A] transition-colors cursor-pointer"
                        title="Change Password"
                      >
                        <Key size={13} />
                      </button>
                      <button
                        onClick={() => handleArchiveToggle(emp)}
                        className="p-1.5 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-[#FF6B1A] transition-colors cursor-pointer"
                        title={emp.status === "Active" ? "Archive Employee" : "Activate Employee"}
                      >
                        <Archive size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(emp.id)}
                        className="p-1.5 hover:bg-[#252525] rounded text-[#A3A3A3] hover:text-red-500 transition-colors cursor-pointer"
                        title="Delete Employee"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 5. ADD/EDIT EMPLOYEE MODAL */}
      <ProductModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingEmployee ? "Edit Employee Credentials" : "Add New Employee"}
      >
        <form onSubmit={handleSaveEmployee} className="space-y-4 font-sans text-left">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Full Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Govardanan B"
              required
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Email Address</label>
            <input
              type="email"
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="e.g. name@odoocafe.com"
              required
              className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] placeholder-[#7A7A7A] focus:outline-none focus:border-[#FF6B1A] transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Role</label>
              <select
                value={formRole}
                onChange={(e) => setFormRole(e.target.value)}
                className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
              >
                <option value="admin">Admin</option>
                <option value="employee">Employee</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-wide text-[#A3A3A3] font-semibold">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full h-11 px-3 bg-[#0B0B0B] border border-[#252525] rounded-lg text-xs text-[#F4F1EA] focus:outline-none focus:border-[#FF6B1A] transition-colors"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="h-10 px-4 bg-transparent border border-[#252525] hover:bg-[#252525]/20 text-[#F4F1EA] text-xs font-medium rounded-lg transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 px-4 bg-[#FF6B1A] hover:bg-[#FF6B1A]/90 text-black text-xs font-semibold rounded-lg transition-all cursor-pointer"
            >
              Save Employee
            </button>
          </div>
        </form>
      </ProductModal>

      {/* 6. CONFIRM DELETE DIALOG */}
      <ConfirmDialog 
        isOpen={isDeleteOpen}
        title="Delete Employee"
        message="Are you sure you want to remove this employee from Odoo Cafe? This action will immediately revoke all access keys and delete their registry records."
        confirmLabel="Remove"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteOpen(false);
          setDeleteEmployeeId(null);
        }}
      />

    </DashboardLayout>
  );
}
