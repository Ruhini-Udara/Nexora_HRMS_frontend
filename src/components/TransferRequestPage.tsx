import React, { useState } from 'react';

const TransferRequestPage = () => {
    // State for form fields
    const [transferType, setTransferType] = useState('Promotion');
    const [expectedJoiningDate, setExpectedJoiningDate] = useState('');




    const currentDepartment = "Operations Division - Level 4";

    // Handle file drop (mock)
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        // Implementation for handling dropped files would go here
        console.log("Files dropped");
    };

    return (
        <div className="max-w-7xl w-full mx-auto">
            <h1 className="text-2xl font-bold text-[#8B3A00] mb-8">Transfer Request</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                <div className="flex-1">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-10">

                            {/* Transfer Type Selection */}
                            <div>
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em] mb-4">Select Transfer Type</label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {['Promotion', 'Relocation', 'Medical'].map((type) => (
                                        <label key={type} className="relative group cursor-pointer">
                                            <input
                                                type="radio"
                                                name="transfer_type"
                                                className="peer sr-only"
                                                checked={transferType === type}
                                                onChange={() => setTransferType(type)}
                                            />
                                            <div className={`h-full border rounded-xl p-6 transition-all group-hover:border-[#8B3A00] peer-checked:border-[#8B3A00] peer-checked:bg-[#FEF3EB] peer-checked:ring-1 peer-checked:ring-[#8B3A00] ${transferType === type ? 'border-[#8B3A00] bg-[#FEF3EB] ring-1 ring-[#8B3A00]' : 'border-slate-200'}`}>
                                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${type === 'Promotion' ? 'bg-[#FFF7F2]' : 'bg-slate-50'}`}>
                                                    <span className={`material-symbols-outlined ${type === 'Promotion' ? 'text-[#8B3A00]' : type === 'Relocation' ? 'text-teal-600' : 'text-blue-600'}`}>
                                                        {type === 'Promotion' ? 'trending_up' : type === 'Relocation' ? 'home' : 'medical_services'}
                                                    </span>
                                                </div>
                                                <h3 className="font-bold text-slate-900 text-sm">{type}</h3>
                                                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                                    {type === 'Promotion' ? 'Career advancement or grade level elevation.' :
                                                        type === 'Relocation' ? 'Moving due to residential or personal changes.' :
                                                            'Transfers based on health requirements.'}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Current Department</label>
                                    <input
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm text-slate-700"
                                        readOnly
                                        value={currentDepartment}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Expected Joining Date</label>
                                    <input
                                        type="date"
                                        className="w-full border border-slate-200 rounded-lg px-4 py-3 text-sm focus:ring-1 focus:ring-[#8B3A00] outline-none text-slate-700"
                                        value={expectedJoiningDate}
                                        onChange={(e) => setExpectedJoiningDate(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* File Upload */}
                            <div className="space-y-4">
                                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Supporting Documentation</label>
                                <div
                                    className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-2xl p-10 flex flex-col items-center justify-center group hover:border-[#8B3A00] transition-all cursor-pointer"
                                    onDrop={handleDrop}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm mb-4 border border-slate-100">
                                        <span className="material-symbols-outlined text-slate-400 text-3xl">upload_file</span>
                                    </div>
                                    <h4 className="font-bold text-slate-800">Drag & drop files here</h4>
                                    <p className="text-[11px] text-slate-400 mt-2">Maximum file size: 10MB (PDF, DOCX, JPG)</p>
                                    <button type="button" className="mt-4 px-5 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 hover:shadow-md transition-shadow">Browse Files</button>
                                </div>

                                {/* Example File List Item */}
                                <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl">
                                    <div className="w-12 h-12 bg-red-50 text-red-500 rounded flex items-center justify-center">
                                        <span className="material-symbols-outlined">picture_as_pdf</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-800">Internal_Transfer_Reason_Statement.pdf</p>
                                        <p className="text-[11px] text-slate-400">1.2 MB • Uploaded 2 mins ago</p>
                                    </div>
                                    <button type="button" className="text-slate-400 hover:text-red-500 p-2 transition-colors">
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                            </div>

                            <div className="pt-6">
                                <h2 className="text-xl font-bold text-slate-900">Transfer Request Details</h2>
                                <p className="text-sm text-slate-500 mt-1">Select your transfer reason and provide initial details.</p>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="px-8 py-6 border-t border-slate-100 flex items-center justify-between">
                            <button type="button" className="px-8 py-3 bg-white border border-slate-200 rounded-lg font-bold text-slate-600 text-sm hover:bg-slate-100 transition-all">
                                Save as Draft
                            </button>
                            <div className="flex items-center gap-3">
                                <button type="button" className="px-8 py-3 border border-slate-200 rounded-lg font-bold text-slate-400 text-sm">
                                    Back
                                </button>
                                <button type="submit" className="px-10 py-3 bg-[#8B3A00] text-white rounded-lg font-bold text-sm hover:opacity-90 shadow-lg shadow-[#8B3A00]/10 transition-all">
                                    Next: Review
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar / Info Panel */}
                <div className="w-full lg:w-80 space-y-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-[#FFF7F2] rounded-lg flex items-center justify-center">
                                <span className="material-symbols-outlined text-[#8B3A00] text-xl">info</span>
                            </div>
                            <h2 className="font-bold text-slate-800 text-sm">Transfer Policy</h2>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Minimum Tenure</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Must have completed at least 12 months in the current role.</p>
                                </div>
                            </li>
                            <li className="flex gap-3">
                                <span className="material-symbols-outlined text-green-500 text-sm mt-0.5">check_circle</span>
                                <div>
                                    <p className="text-xs font-bold text-slate-800">Performance Rating</p>
                                    <p className="text-[11px] text-slate-500 mt-1">Require a rating of 3.5 or above in latest appraisal.</p>
                                </div>
                            </li>
                        </ul>
                        <div className="mt-6 pt-6 border-t border-slate-100">
                            <a href="#" className="text-[11px] font-bold text-[#8B3A00] flex items-center gap-1 hover:underline transition-all">
                                Read Full Policy Documents
                                <span className="material-symbols-outlined text-xs">open_in_new</span>
                            </a>
                        </div>
                    </div>

                    <div className="bg-[#FEF3EB] rounded-xl p-6 text-slate-800 shadow-sm border border-[#FDE6D5] relative overflow-hidden">
                        <div className="absolute -right-4 -bottom-4 opacity-5">
                            <span className="material-symbols-outlined text-[100px] text-[#8B3A00]">help</span>
                        </div>
                        <h3 className="font-bold text-sm mb-3">Need Help?</h3>
                        <p className="text-xs text-slate-600 leading-relaxed mb-4">Contact HR Operations if you have questions regarding regional availability or relocation benefits.</p>
                        <button className="w-full py-2 bg-[#FFC5C0] text-slate-800 font-bold rounded-lg text-xs hover:opacity-90 transition-colors">
                            Contact HR
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TransferRequestPage;
