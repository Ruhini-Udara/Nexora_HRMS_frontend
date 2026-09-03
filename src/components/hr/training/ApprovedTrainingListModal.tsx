import React, { useState, useEffect, useRef } from 'react';
import api from '@/lib/axiosInstance';
import { Toast } from '@/components/ui/Toast';

// Interface describing the structure of each training request
interface RequestDetails {
    id: number;
    employeeName: string;
    department: string;
    designation?: string;
    workEmail?: string;
    personalEmail?: string;
    status: string;
    avatar?: string;
    initials?: string;
}

interface EmployeeSuggestion {
    id: number;
    fullName: string;
    email: string;
    department: string;
    epfNumber?: string;
}

// Props for the Approved Training List Modal (shown to HR)
interface ApprovedTrainingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    requests: RequestDetails[];
    eventName: string;
    eventId?: number;
    eventStatus?: string;
    approvedBy?: string;
    approvedAt?: string;
    onStatusUpdate?: () => void;
}

// Modal showing approved participants for a training event
export default function ApprovedTrainingListModal({ isOpen, onClose, requests, eventName, eventId, eventStatus, approvedBy, approvedAt, onStatusUpdate }: ApprovedTrainingListModalProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Filter only approved requests
    const approvedRequests = requests.filter(req => req.status === 'Approved');

    // Check if training event is already sent, approved, or rejected
    const isAlreadySent = Boolean(approvedBy) || eventStatus === 'Pending Admin Approval' || eventStatus === 'Approved' || eventStatus === 'Sent' || eventStatus === 'Rejected';

    // States for adding employee (autocomplete search dropdown)
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [allEmployees, setAllEmployees] = useState<EmployeeSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Click outside to close search dropdown
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Fetch all employees when search dropdown is toggled open
    useEffect(() => {
        if (isSearchOpen && allEmployees.length === 0) {
            setIsSearching(true);
            api.get('/api/employees')
                .then(res => {
                    setAllEmployees(res.data);
                })
                .catch(err => {
                    console.error("Failed to fetch employees:", err);
                    setToast({ message: "Failed to load employees list.", type: 'error' });
                })
                .finally(() => {
                    setIsSearching(false);
                });
        }
    }, [isSearchOpen, allEmployees.length]);

    // Handle adding selected employee to the roster
    const handleAddEmployee = async (employeeId: number) => {
        if (!eventId) return;
        setIsAdding(true);
        try {
            await api.post('/api/training/requests', {
                eventId,
                employeeId,
                status: 'Approved',
                justification: 'Manually added by HR'
            });
            setToast({ message: "Employee added successfully!", type: 'success' });
            setIsSearchOpen(false);
            setSearchQuery("");
            if (onStatusUpdate) {
                onStatusUpdate();
            }
        } catch (err) {
            console.error("Failed to add employee:", err);
            setToast({ message: "Failed to add employee.", type: 'error' });
        } finally {
            setIsAdding(false);
        }
    };

    // Filter employees based on search query, excluding those already on this training roster
    const filteredEmployees = allEmployees.filter(emp => {
        const isAlreadyRequested = requests.some(req => 
            (req.workEmail && req.workEmail.toLowerCase() === emp.email.toLowerCase()) || 
            (req.personalEmail && req.personalEmail.toLowerCase() === emp.email.toLowerCase()) ||
            req.employeeName.toLowerCase() === emp.fullName.toLowerCase()
        );
        if (isAlreadyRequested) return false;

        if (!searchQuery.trim()) return true;

        const query = searchQuery.toLowerCase();
        return (
            (emp.fullName && emp.fullName.toLowerCase().includes(query)) ||
            (emp.epfNumber && emp.epfNumber.toLowerCase().includes(query)) ||
            (emp.email && emp.email.toLowerCase().includes(query)) ||
            (emp.department && emp.department.toLowerCase().includes(query))
        );
    });

    // CSV download functionality
    const handleDownloadCSV = () => {
        if (approvedRequests.length === 0) {
            setToast({ message: "No approved participants to download.", type: 'info' });
            return;
        }
        
        // CSV headers and content
        const headers = ["Employee Name", "Department", "Work Email"];
        const csvContent = [
            headers.join(","),
            ...approvedRequests.map(req => [
                `"${req.employeeName}"`,
                `"${req.department}"`,
                `"${req.personalEmail || req.workEmail || 'N/A'}"`
            ].join(","))
        ].join("\n");

        // Convert to CSV blob and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `Approved_Participants_${eventName.replace(/[^\w\s]/gi, '').replace(/\s+/g, '_')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setToast({ message: "List downloaded as CSV", type: 'success' });
    };

    // Print functionality (hides non-essential elements for clean printing)
    const handlePrint = () => {
        const originalTitle = document.title;
        const cleanName = (eventName || 'Training_Program')
            .replace(/[^a-zA-Z0-9]/g, '_')
            .replace(/_+/g, '_');
        document.title = `Approved_Participants_${cleanName}`;

        const printStyles = document.createElement('style');
        printStyles.innerHTML = `
            @media print {
                body * { visibility: hidden; }
                #printable-modal, #printable-modal * { visibility: visible; }
                #printable-modal {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100%;
                    background: white !important;
                }
                .no-print, .print-hide { display: none !important; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
                th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                .print-header { margin-bottom: 20px; border-bottom: 2px solid #334155; padding-bottom: 10px; }
            }
        `;
        document.head.appendChild(printStyles);
        window.print();
        setTimeout(() => {
            document.title = originalTitle;
            document.head.removeChild(printStyles);
        }, 1000);
    };

    if (!isOpen) return null;


    // Main modal JSX - contains header, filters, list, and export buttons
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 h-screen max-h-screen">
            <div id="printable-modal" className="bg-white dark:bg-slate-900 w-full max-w-5xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[85vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 print-header">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">groups</span>
                            Approved Training List
                        </h3>
                        <div className="flex items-center gap-3">
                            <p className="text-sm font-medium text-slate-500 mt-1">
                                Participants for <span className="text-primary font-bold">&quot;{eventName}&quot;</span>
                            </p>
                        </div>

                    </div>
                    <div className="flex items-center gap-4 relative" ref={searchRef}>
                        {!isAlreadySent && (
                            <button 
                                onClick={() => setIsSearchOpen(!isSearchOpen)}
                                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-semibold transition-colors no-print"
                            >
                                <span className="material-symbols-outlined text-[18px]">person_add</span>
                                Add Employee
                            </button>
                        )}

                        {!isAlreadySent && isSearchOpen && (

                            <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 z-[70] p-4 space-y-3 no-print">
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Search Employee</div>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Type name, EPF, or email..."
                                        className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg pl-3 pr-8 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-slate-800 dark:text-slate-200"
                                        autoFocus
                                    />
                                    {isSearching ? (
                                        <span className="animate-spin absolute right-3 top-1/2 -translate-y-1/2 border-2 border-primary border-t-transparent rounded-full w-4 h-4"></span>
                                    ) : searchQuery && (
                                        <button 
                                            onClick={() => setSearchQuery("")}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            <span className="material-symbols-outlined text-sm">close</span>
                                        </button>
                                    )}
                                </div>

                                <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                                    {filteredEmployees.length > 0 ? (
                                        filteredEmployees.map((emp: EmployeeSuggestion) => (
                                            <button
                                                key={emp.id}
                                                onClick={() => handleAddEmployee(emp.id)}
                                                disabled={isAdding}
                                                className="w-full text-left p-2 hover:bg-slate-50 dark:hover:bg-slate-900/60 rounded-lg flex items-center gap-3 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-800/40 disabled:opacity-50"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-bold text-xs shrink-0">
                                                    {emp.fullName ? emp.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'EE'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate leading-tight">{emp.fullName}</p>
                                                    <p className="text-[10px] text-slate-500 truncate leading-none mt-1">{emp.department} • {emp.epfNumber || 'No EPF'}</p>
                                                </div>
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-xs text-slate-400 font-medium">
                                            {searchQuery ? "No matching employees found" : "Type to search employees..."}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors no-print">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>
                </div>

                {/* Body (Scrollable) */}
                <div className="p-0 overflow-y-auto flex-1">
                    {approvedRequests.length === 0 ? (
                        <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500">
                            <span className="material-symbols-outlined text-5xl mb-3 opacity-30">group_off</span>
                            <p className="text-base font-medium">No employees have been approved for this training yet.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900/90 backdrop-blur-md z-10 border-b border-slate-100 dark:border-slate-800">
                                <tr>
                                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Employee</th>
                                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Department</th>
                                    <th className="py-3 px-6 text-xs font-bold text-slate-500 uppercase tracking-wider">Email</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {approvedRequests.map(req => (
                                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                        <td className="py-3 px-6">
                                            <div>
                                                <div className="font-semibold text-sm text-slate-900 dark:text-white">{req.employeeName}</div>
                                                <div className="text-xs text-slate-500">{req.designation || 'Employee'}</div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium">
                                            {req.department}
                                        </td>
                                        <td className="py-3 px-6 text-sm text-slate-600 dark:text-slate-300 font-medium" title={req.personalEmail || req.workEmail || 'N/A'}>
                                            {req.personalEmail || req.workEmail || 'N/A'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 shrink-0 flex items-center justify-between rounded-b-2xl no-print">
                    <span className="text-sm font-semibold text-slate-500">
                        Total Participants: <span className="text-primary">{approvedRequests.length}</span>
                    </span>
                    <div className="flex gap-2">
                        <button 
                            onClick={handleDownloadCSV}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">description</span>
                            CSV
                        </button>
                        <button 
                            onClick={handlePrint}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                            PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 rounded-lg font-bold text-sm transition-colors"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => setIsConfirming(true)}
                            disabled={isAlreadySent}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-2 shadow-sm ${
                                isAlreadySent
                                    ? 'bg-slate-200 text-slate-400 cursor-not-allowed dark:bg-slate-800 dark:text-slate-500'
                                    : 'bg-primary hover:bg-primary/90 text-white'
                            }`}
                        >
                            <span className="material-symbols-outlined text-[18px]">send</span>
                            Send for Admin Approval
                        </button>

                    </div>
                </div>

                {/* Confirmation Dialog Overlay inside the Modal */}
                {isConfirming && (
                    <div className="absolute inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-[2px] rounded-2xl">
                        <div className="bg-white dark:bg-slate-900 w-full max-w-sm p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center mx-4">
                            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="material-symbols-outlined text-3xl">help_center</span>
                            </div>
                            <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Confirm Submission</h4>
                            <p className="text-sm text-slate-500 mb-6 px-2">
                                Are you sure you want to send this list of {approvedRequests.length} approved participants for Administrator approval?
                            </p>
                            <div className="flex gap-3 justify-center">
                                <button 
                                    onClick={() => setIsConfirming(false)} 
                                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 rounded-xl font-semibold transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (eventId) {
                                            const todayStr = new Date().toISOString().split('T')[0];
                                            api.put(`/api/training/events/${eventId}/status`, { 
                                                status: 'Pending Admin Approval',
                                                dateSubmitted: todayStr
                                            })
                                                .then(() => {
                                                    setToast({ message: "Training list sent to Admin for approval!", type: 'success' });
                                                    if (onStatusUpdate) onStatusUpdate();
                                                    setTimeout(() => {
                                                        setIsConfirming(false);
                                                        onClose();
                                                    }, 1500);
                                                })
                                                .catch(err => {
                                                    console.error("Failed to send to admin", err);
                                                    setToast({ message: "Failed to send for Admin approval. Please try again.", type: 'error' });
                                                    setIsConfirming(false);
                                                });
                                        } else {
                                            setIsConfirming(false);
                                        }
                                    }} 
                                    className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold shadow-sm transition-colors"
                                >
                                    Confirm & Send
                                </button>
                            </div>
                        </div>
                    </div>
                )}
                {/* Toast Notifications */}
                {toast && (
                    <Toast 
                        message={toast.message} 
                        type={toast.type} 
                        onClose={() => setToast(null)} 
                    />
                )}
            </div>
        </div>
    );
}
