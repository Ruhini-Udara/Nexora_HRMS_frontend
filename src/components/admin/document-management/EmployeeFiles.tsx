"use client";

import React, { useState } from "react";
import { Search, ChevronDown, Download, MoreVertical, Eye, Trash2, X, Users } from "lucide-react";

interface Document {
  id: string;
  name: string;
  category: string;
  version: string;
  uploaded: {
    date: string;
  };
  remarks: string;
  size: string;
  icon: string;
}

export default function EmployeeFiles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: "1",
      name: "Employment Contract - Signed",
      category: "Legal",
      version: "v3.0",
      uploaded: { date: "Oct 24, 2023" },
      remarks: "Final signed copy received fr...",
      size: "2.4 MB",
      icon: "📄",
    },
    {
      id: "2",
      name: "Tax Declaration Fu23",
      category: "Finance",
      version: "v1.2",
      uploaded: { date: "Oct 20, 2023" },
      remarks: "Updated with € 3 investment ...",
      size: "145 KB",
      icon: "📊",
    },
    {
      id: "3",
      name: "Passport Scan (Front/Back)",
      category: "Identity",
      version: "v1.0",
      uploaded: { date: "Sep 15, 2023" },
      remarks: "Expiry date verified: 2028.",
      size: "4.1 MB",
      icon: "🖼️",
    },
    {
      id: "4",
      name: "Code of Conduct Acknowledgement",
      category: "Policy",
      version: "v1.0",
      uploaded: { date: "Aug 01, 2023" },
      remarks: "Onboarding requirement.",
      size: "1.1 MB",
      icon: "📄",
    },
    {
      id: "5",
      name: "Previous Employment Records",
      category: "History",
      version: "v1.0",
      uploaded: { date: "Jul 10, 2023" },
      remarks: "Contains relieving letters...",
      size: "12 MB",
      icon: "📁",
    },
  ]);

  const handleDelete = (id: string) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
    setOpenActionMenu(null);
  };

  const handleView = (doc: Document) => {
    setSelectedDocument(doc);
    setShowModal(true);
    setOpenActionMenu(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Legal: "bg-purple-100 text-purple-700",
      Finance: "bg-blue-100 text-blue-700",
      Policy: "bg-gray-100 text-gray-700",
      History: "bg-indigo-100 text-indigo-700",
      Identity: "bg-orange-100 text-orange-700",
    };
    return colors[category] || "bg-gray-100 text-gray-700";
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Employee Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Sarah Jenkins"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Document Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Version
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uploaded
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Remarks
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="shrink-0 w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                      <span className="text-xl">{doc.icon}</span>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                      <div className="text-xs text-gray-500">{doc.size}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(
                      doc.category
                    )}`}
                  >
                    {doc.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-gray-900">{doc.version}</span>
                    <ChevronDown className="h-3 w-3 text-gray-400" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{doc.uploaded.date}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-600 max-w-xs truncate">
                    {doc.remarks}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                      title="Download"
                    >
                      <Download className="h-4 w-4 text-gray-600" />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setOpenActionMenu(openActionMenu === doc.id ? null : doc.id)}
                        className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        title="More options"
                      >
                        <MoreVertical className="h-4 w-4 text-gray-600" />
                      </button>
                      {openActionMenu === doc.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                          <button
                            onClick={() => handleView(doc)}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 last:rounded-b-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing 1 to 5 of {filteredDocuments.length} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronDown className="h-4 w-4 rotate-90" />
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? "bg-orange-500 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                1
              </button>
              <button
                className={`px-3 py-1 rounded ${
                  currentPage === 2
                    ? "bg-orange-500 text-white"
                    : "border border-gray-300 hover:bg-gray-50"
                }`}
              >
                2
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
              >
                <ChevronDown className="h-4 w-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Details Modal */}
      {showModal && selectedDocument && (
        <div 
          onClick={() => setShowModal(false)}
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'rgba(249, 250, 251, 0.6)' }}
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Document Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {/* Document Icon and Name */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center">
                  <span className="text-3xl">{selectedDocument.icon}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedDocument.name}</h3>
                  <p className="text-sm text-gray-500">{selectedDocument.size}</p>
                </div>
              </div>

              {/* Document Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Category</label>
                  <div className="mt-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(selectedDocument.category)}`}>
                      {selectedDocument.category}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Version</label>
                  <p className="mt-2 text-base text-gray-900">{selectedDocument.version}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Upload Date</label>
                  <p className="mt-2 text-base text-gray-900">{selectedDocument.uploaded.date}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">File Size</label>
                  <p className="mt-2 text-base text-gray-900">{selectedDocument.size}</p>
                </div>
              </div>

              {/* Remarks */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Remarks</label>
                <p className="mt-2 text-base text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedDocument.remarks}</p>
              </div>

              {/* Document Preview Placeholder */}
              <div className="mb-6">
                <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Preview</label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <div className="text-4xl mb-2">{selectedDocument.icon}</div>
                  <p className="text-gray-500">Document preview not available</p>
                  <p className="text-sm text-gray-400 mt-1">Download to view full content</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors font-medium"
              >
                Close
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium">
                <Download className="h-4 w-4" />
                Download
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
