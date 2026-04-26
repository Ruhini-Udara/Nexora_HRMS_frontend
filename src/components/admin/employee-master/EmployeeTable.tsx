import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, X, Mail, Building2, Briefcase, BadgeCheck } from "lucide-react";

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
    designation: "Product Manager",
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
    designation: "Engineer",
    joiningDate: "Jul 10, 2020",
    employmentStatus: "Full-time",
  },
  {
    id: "#EMP-2024-098",
    name: "Emily Watson",
    email: "emily.w@hrmate.com",
    department: "Sales & Marketing",
    designation: "Sales Executive",
    joiningDate: "Oct 05, 2023",
    employmentStatus: "Contract",
  },
  {
    id: "#EMP-2024-112",
    name: "David Chen",
    email: "david.chen@hrmate.com",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-YbZuyJW9xRrJ8SFGCU1rojUwZZE-sKnQDGsd0zyeV7Q8AwXbs3Dl6cKIQiLq7cJjC7aeNJEpJkXskJ3REDiHEMEUP4JJHKGTmhQHQh_0erz_RzFz1ikTkpkywUX9QTFQVTEGODcbK7KxViTwaWdrRFmWKkFjvI02s6BlpKEFsuGXUuBVEz_xoROU5Gfwx0gC5_H9Fto8kC6WDUv3epAYcqUKx0EAMfnAAOezaSiRDWm0sOFAXD1NJ_aIxDCDh1RuXY4SqFiRBQqt",
    department: "Operations",
    designation: "Support Staff",
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
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetch("http://localhost:8080/api/employees")
      .then(res => res.json())
      .then((data) => {
        const fetchedEmployees: Employee[] = data.map((emp: any) => ({
          id: emp.employeeCode || "",
          name: emp.fullName || "",
          email: emp.email || "",
          avatar: "", 
          department: emp.department || "",
          designation: emp.designation?.designationName || "",
          joiningDate: emp.dateJoined || "",
          employmentStatus: emp.employeeType || "",
        }));

        // Sort employees by Employee Code in ascending order
        fetchedEmployees.sort((a, b) => a.id.localeCompare(b.id));

        setEmployees(fetchedEmployees);
      })
      .catch(err => console.error("Error fetching employees:", err));
  }, []);

  // Filter employees based on selected filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment = !department || employee.department === department;
    const matchesJobTitle = !jobTitle || employee.designation === jobTitle;
    const matchesStatus = !status || employee.employmentStatus === status;

    return matchesDepartment && matchesJobTitle && matchesStatus;
  });

  const handleDelete = (employeeId: string) => {
    setEmployees(employees.filter((emp) => emp.id !== employeeId));
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditForm({ ...employee });
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  const handleSave = () => {
    if (editForm) {
      setEmployees(employees.map((emp) =>
        emp.id === editForm.id ? editForm : emp
      ));
      setEditingEmployee(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingEmployee(null);
    setEditForm(null);
  };

  const displayedEmployees = filteredEmployees;
  return (
    <>
      {/* View Modal */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Employee Details</h2>
                <p className="text-sm text-slate-500 mt-1">View employee information</p>
              </div>
              <button
                onClick={() => setViewingEmployee(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-200">
                {viewingEmployee.avatar ? (
                  <img
                    alt={viewingEmployee.name}
                    className="w-20 h-20 rounded-full border-4 border-amber-100"
                    src={viewingEmployee.avatar}
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                    <User className="text-amber-700" size={40} />
                  </div>
                )}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">{viewingEmployee.name}</h3>
                  <p className="text-amber-800 font-semibold">{viewingEmployee.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Mail className="text-blue-600" size={18} />
                    <label className="block text-sm font-medium text-blue-900">
                      Email Address
                    </label>
                  </div>
                  <p className="text-base text-gray-900">{viewingEmployee.email}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="text-purple-600" size={18} />
                    <label className="block text-sm font-medium text-purple-900">
                      Department
                    </label>
                  </div>
                  <p className="text-base text-gray-900">{viewingEmployee.department}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="text-green-600" size={18} />
                    <label className="block text-sm font-medium text-green-900">
                      Designation
                    </label>
                  </div>
                  <p className="text-base text-gray-900">{viewingEmployee.designation}</p>
                </div>

                <div className="bg-amber-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="text-amber-600" size={18} />
                    <label className="block text-sm font-medium text-amber-900">
                      Employee Type
                    </label>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${viewingEmployee.employmentStatus === 'Full-time'
                      ? 'bg-green-100 text-green-800'
                      : viewingEmployee.employmentStatus === 'Contract'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                    {viewingEmployee.employmentStatus}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200">
              <button
                onClick={() => setViewingEmployee(null)}
                className="w-full bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingEmployee && editForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Edit Employee</h2>
                <p className="text-sm text-slate-500 mt-1">Update employee information</p>
              </div>
              <button
                onClick={handleCancel}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Form Content */}
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Code
                </label>
                <input
                  type="text"
                  value={editForm.id}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  value={editForm.department}
                  onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                  <option value="Sales & Marketing">Sales & Marketing</option>
                  <option value="Product Development">Product Development</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Designation
                </label>
                <select
                  value={editForm.designation}
                  onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="">Select Designation</option>
                  <option value="Senior Engineer">Senior Engineer</option>
                  <option value="HR Manager">HR Manager</option>
                  <option value="Backend Lead">Backend Lead</option>
                  <option value="Marketing Head">Marketing Head</option>
                  <option value="Operations Lead">Operations Lead</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Employee Type
                </label>
                <select
                  value={editForm.employmentStatus}
                  onChange={(e) => setEditForm({ ...editForm, employmentStatus: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Intern">Intern</option>
                </select>
              </div>
            </div>

            {/* Footer with Buttons */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-amber-900 text-white py-2.5 px-4 rounded-lg hover:bg-amber-800 transition-colors font-medium"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                Employee Code
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
                Employee Type
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 text-right uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayedEmployees.map((employee) => (
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
                  {employee.employmentStatus}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center justify-end gap-3 text-slate-500">
                    <button
                      onClick={() => handleView(employee)}
                      className="hover:text-amber-400 transition-colors"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleEdit(employee)}
                      className="hover:text-amber-400 transition-colors"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(employee.id)}
                      className="hover:text-red-500 transition-colors"
                    >
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
            Showing {displayedEmployees.length > 0 ? 1 : 0} to {displayedEmployees.length} of {displayedEmployees.length} entries
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
    </>
  );
}

