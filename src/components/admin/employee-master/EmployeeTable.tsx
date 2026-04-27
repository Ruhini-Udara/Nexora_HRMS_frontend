import React, { useState, useEffect } from "react";
import { Eye, Edit, Trash2, ChevronLeft, ChevronRight, User, X, Mail, Building2, Briefcase, BadgeCheck } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";

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

interface ApiEmployee {
  employeeCode?: string;
  fullName?: string;
  email?: string;
  department?: string;
  designation?: { designationName?: string };
  dateJoined?: string;
  employeeType?: string;
}

interface Designation {
  designationId: number;
  designationName: string;
}

interface EmployeeTableProps {
  department: string;
  jobTitle: string;
  status: string;
}

export default function EmployeeTable({ department, jobTitle, status }: EmployeeTableProps) {
  const { user, token } = useAuthStore();
  const isAdmin = user?.role === 'ROLE_ADMIN';

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    setCurrentPage(1);
  }, [department, jobTitle, status]);

  useEffect(() => {
    fetch("http://localhost:8080/api/employees")
      .then(res => res.json())
      .then((data) => {
        const fetchedEmployees: Employee[] = data.map((emp: ApiEmployee) => ({
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

    fetch("http://localhost:8080/api/designations")
      .then(res => res.json())
      .then(data => setDesignations(data))
      .catch(err => console.error("Error fetching designations:", err));
  }, []);

  // Filter employees based on selected filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesDepartment = !department || employee.department?.toLowerCase() === department.toLowerCase();
    const matchesJobTitle = !jobTitle || employee.designation?.toLowerCase() === jobTitle.toLowerCase();
    const matchesStatus = !status || employee.employmentStatus?.toLowerCase() === status.toLowerCase();

    return matchesDepartment && matchesJobTitle && matchesStatus;
  });

  const handleDelete = async (employeeId: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        const response = await fetch(`http://localhost:8080/api/employees/${employeeId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          setEmployees(employees.filter((emp) => emp.id !== employeeId));
        } else {
          console.error("Failed to delete employee");
          alert("Failed to delete employee. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("An error occurred while deleting the employee.");
      }
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setEditForm({ ...employee });
  };

  const handleView = (employee: Employee) => {
    setViewingEmployee(employee);
  };

  const handleSave = async () => {
    if (editForm) {
      try {
        const selectedDesig = designations.find(d => d.designationName === editForm.designation);
        const designationId = selectedDesig ? selectedDesig.designationId : null;

        const updateData = {
          fullName: editForm.name,
          email: editForm.email,
          department: editForm.department,
          employeeType: editForm.employmentStatus,
          designationId: designationId
        };

        const response = await fetch(`http://localhost:8080/api/employees/${editForm.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(updateData)
        });

        if (response.ok) {
          setEmployees(employees.map((emp) =>
            emp.id === editForm.id ? editForm : emp
          ));
          setEditingEmployee(null);
          setEditForm(null);
        } else {
          console.error("Failed to update employee");
          alert("Failed to update employee. Please try again.");
        }
      } catch (error) {
        console.error("Error updating employee:", error);
        alert("An error occurred while updating the employee.");
      }
    }
  };

  const handleCancel = () => {
    setEditingEmployee(null);
    setEditForm(null);
  };

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const displayedEmployees = filteredEmployees.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

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
                  {designations.map((d) => (
                    <option key={d.designationId} value={d.designationName}>
                      {d.designationName}
                    </option>
                  ))}
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
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="px-6 py-4 flex items-center justify-between bg-slate-50 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Showing {filteredEmployees.length > 0 ? indexOfFirstItem + 1 : 0} to {Math.min(indexOfLastItem, filteredEmployees.length)} of {filteredEmployees.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1 || totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-10 h-10 rounded-lg font-medium ${
                  currentPage === page
                    ? "bg-amber-900 text-white"
                    : "border border-slate-200 hover:bg-white"
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 border border-slate-200 rounded-lg hover:bg-white disabled:opacity-50"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

