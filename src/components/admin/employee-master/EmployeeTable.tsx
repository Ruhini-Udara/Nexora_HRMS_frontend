import React from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, User } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  designation: string;
  joiningDate: string;
  employmentStatus: string;
}

const allEmployees: Employee[] = [
  {
    id: "#EMP-2024-001",
    name: "John Doe",
    email: "john.doe@hrmate.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8iMLpzmmJmH7j3dbMXxnj4o5iYoSo8h_zjUTmVHpYIwAVF7vqW3eLIenoCIfYXRA9T17LjtjGeSzHsUpsSaPwaRhuF8aKyp5kUl3eoeo-0NN3Mmjb2XGcs7Wlwp4f27828GGHCTdfvlmsm4-2Kv59ViPhmoN6NpcYdAtVUmHUoTx-ufs2DlGo-FlYQcmniS3XSCNeldflnQy762x-5IG-TC247VYHQ67KgeW9qp4_IJwDtYPwgRYiQT_Pbo7Kp68tLydES_5qRpLe",
    department: "Product Development",
    designation: "Senior Engineer",
    joiningDate: "Jan 15, 2021",
    employmentStatus: "Full-time",
  },
  {
    id: "#EMP-2024-002",
    name: "Sarah Smith",
    email: "sarah.s@hrmate.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDURttzoY6PQtU6lRECoWc7rVhwE63NwlG9TNRUatsVZX4lek9dh3S7IUZCihwIUC2kv34I7jCRlYEpBu0EDg1i7gh3ziAQsSFCXgdab5c_d8cZvV7T4f_BQQzuWYS8SPmdHXMA8TEmzEvJ47WboIAJYvphaGsUL2yHnIsJJDqx7baeCBv_QMqpUq3tLq3LFUf6SChDBtyN9vtAZY6rQ3LkxhHTasFbmzLW1R92vQ4wwrcdIe_a8Yiq7cmzrBQFfs-0ES7Cmg-S30_2",
    department: "Human Resources",
    designation: "HR Manager",
    joiningDate: "Mar 22, 2022",
    employmentStatus: "Full-time",
  },
  {
    id: "#EMP-2024-045",
    name: "Michael Kearney",
    email: "m.kearney@hrmate.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1Yg9pfj8NjSM-sr4GG-WR_G58fse0e6MyHmlTxVUkrqaU6RTFDxdM7g_R3ZGZln6zlTHUWR2xCODW3tl5D1ULjEB_nwLhT4XlTavV3y-O2OAtCpW1Zstk_H7eDCRVbSkBSktUgXwtd9YElkL3io233GFZFgQtz8FjS1mF9BDLAqzjTHWlPTeVk0JKN0HdUi3p7-26KwSTmPcKrChMUNNgLWQ4fU3n_C1ddgDdVl8PD0IGipLnM3H5mTXkzMA61UVKfGLGHWqUFwBh",
    department: "Engineering",
    designation: "Backend Lead",
    joiningDate: "Jul 10, 2020",
    employmentStatus: "Full-time",
  },
  {
    id: "#EMP-2024-098",
    name: "Emily Watson",
    email: "emily.w@hrmate.com",
    department: "Sales & Marketing",
    designation: "Marketing Head",
    joiningDate: "Oct 05, 2023",
    employmentStatus: "Contract",
  },
  {
    id: "#EMP-2024-112",
    name: "David Chen",
    email: "david.chen@hrmate.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-YbZuyJW9xRrJ8SFGCU1rojUwZZE-sKnQDGsd0zyeV7Q8AwXbs3Dl6cKIQiLq7cJjC7aeNJEpJkXskJ3REDiHEMEUP4JJHKGTmhQHQh_0erz_RzFz1ikTkpkywUX9QTFQVTEGODcbK7KxViTwaWdrRFmWKkFjvI02s6BlpKEFsuGXUuBVEz_xoROU5Gfwx0gC5_H9Fto8kC6WDUv3epAYcqUKx0EAMfnAAOezaSiRDWm0sOFAXD1NJ_aIxDCDh1RuXY4SqFiRBQqt",
    department: "Operations",
    designation: "Operations Lead",
    joiningDate: "Feb 28, 2019",
    employmentStatus: "Full-time",
  },
];

interface EmployeeTableProps {
  department: string;
  jobTitle: string;
  status: string;
}

export default function EmployeeTable({ department, jobTitle, status }: EmployeeTableProps) {
  // Filter employees based on selected filters
  const filteredEmployees = allEmployees.filter((employee) => {
    const matchesDepartment = !department || employee.department === department;
    const matchesJobTitle = !jobTitle || employee.designation === jobTitle;
    const matchesStatus = !status || employee.employmentStatus === status;
    
    return matchesDepartment && matchesJobTitle && matchesStatus;
  });

  const employees = filteredEmployees;
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Employee ID
            </th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Full Name
            </th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Department
            </th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Designation
            </th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
              Joining Date
            </th>
            <th className="px-6 py-4 text-xs font-bold text-slate-500 text-right uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {employees.map((employee) => (
            <tr
              key={employee.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-6 py-5 font-bold text-amber-900">
                {employee.id}
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center gap-3">
                  {employee.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={employee.name}
                      className="w-10 h-10 rounded-full"
                      src={employee.avatar}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                      <User className="text-slate-400" size={20} />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-[#111827]">{employee.name}</p>
                    <p className="text-xs text-slate-500">{employee.email}</p>
                  </div>
                </div>
              </td>
              <td className="px-6 py-5 text-sm text-slate-600">
                {employee.department}
              </td>
              <td className="px-6 py-5 text-sm text-slate-600">
                {employee.designation}
              </td>
              <td className="px-6 py-5 text-sm text-slate-600">
                {employee.joiningDate}
              </td>
              <td className="px-6 py-5">
                <div className="flex items-center justify-end gap-3 text-slate-500">
                  <button className="hover:text-amber-400 transition-colors">
                    <Eye size={18} />
                  </button>
                  <button className="hover:text-amber-400 transition-colors">
                    <Edit size={18} />
                  </button>
                  <button className="hover:text-red-500 transition-colors">
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="px-6 py-4 flex items-center justify-between bg-slate-50 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          Showing {employees.length > 0 ? 1 : 0} to {employees.length} of {employees.length} entries
        </p>
        <div className="flex items-center gap-2">
          <button
            className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50"
            disabled
          >
            <ChevronLeft size={16} />
          </button>
          <button className="w-10 h-10 bg-amber-900 text-white rounded-lg font-medium">
            1
          </button>
          <button className="w-10 h-10 border border-slate-200 rounded-lg font-medium hover:bg-white">
            2
          </button>
          <button className="w-10 h-10 border border-slate-200 rounded-lg font-medium hover:bg-white">
            3
          </button>
          <span className="text-slate-400 px-1">...</span>
          <button className="w-10 h-10 border border-slate-200 rounded-lg font-medium hover:bg-white">
            250
          </button>
          <button className="p-2 border border-slate-200 rounded-lg hover:bg-white">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
