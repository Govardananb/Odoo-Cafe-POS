"use client";

import React, { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageHeader from "@/components/layout/PageHeader";
import StatusBadge from "@/components/shared/StatusBadge";
import { employeeService } from "@/services/employeeService";
import { Users, Plus } from "lucide-react";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    employeeService.getEmployees().then(data => {
      setEmployees(data);
      setLoading(false);
    });
  }, []);

  return (
    <DashboardLayout>
      <PageHeader
        title="Employees Directory"
        description="Manage POS access credentials and cashier permissions."
        action={{
          label: "Add Employee",
          icon: Plus,
          onClick: () => alert("Add Employee CRUD action placeholder")
        }}
      />

      <div className="border border-[#252525] rounded-2xl bg-[#141414] overflow-hidden">
        <table className="w-full text-left border-collapse font-sans">
          <thead>
            <tr className="border-b border-[#252525]">
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Employee</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Role</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold">Email</th>
              <th className="py-3 px-5 text-[10px] uppercase tracking-wider text-[#A3A3A3] font-semibold text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#252525]/40 text-xs">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-[#252525]/10 transition-colors">
                <td className="py-3 px-5 font-semibold text-[#F4F1EA]">{emp.name}</td>
                <td className="py-3 px-5 text-[#A3A3A3]">{emp.role}</td>
                <td className="py-3 px-5 text-[#A3A3A3]">{emp.email}</td>
                <td className="py-3 px-5 text-center">
                  <StatusBadge status={emp.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}
