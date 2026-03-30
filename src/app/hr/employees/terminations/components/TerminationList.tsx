"use client";

import React, { useState } from 'react';
import {
    useReactTable,
    getCoreRowModel,
    getFilteredRowModel,
    flexRender,
    ColumnDef,
    Table,
    Row,
} from '@tanstack/react-table';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TerminationRequest } from './TerminationRequestForm';

interface TerminationListProps {
    requests: TerminationRequest[];
    onUpdateRequests: (newRequests: TerminationRequest[]) => void;
    onCreateNew: () => void;
    onEdit: (request: TerminationRequest) => void;
    onView: (request: TerminationRequest) => void;
}

const CheckboxHeader = ({ table }: { table: Table<TerminationRequest> }) => {
    return (
        <input
            type="checkbox"
            className="rounded border-slate-300 w-4 h-4 cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
            ref={(el) => {
                if (el) {
                    el.indeterminate = !table.getIsAllPageRowsSelected() && table.getIsSomePageRowsSelected();
                }
            }}
        />
    );
};

const CheckboxCell = ({ row }: { row: Row<TerminationRequest> }) => {
    return (
        <div className="px-1">
            <input
                type="checkbox"
                className="rounded border-slate-300 w-4 h-4 cursor-pointer"
                checked={row.getIsSelected()}
                disabled={!row.getCanSelect()}
                onChange={row.getToggleSelectedHandler()}
                ref={(el) => {
                    if (el) {
                        el.indeterminate = row.getIsSomeSelected();
                    }
                }}
            />
        </div>
    );
};

export function TerminationList({ requests, onUpdateRequests, onCreateNew, onEdit, onView }: TerminationListProps) {
    const [globalFilter, setGlobalFilter] = useState('');
    const [rowSelection, setRowSelection] = useState({});
    const [showBoardModal, setShowBoardModal] = useState(false);
    const [boardDate, setBoardDate] = useState('');
    const [activeTab, setActiveTab] = useState<'pending' | 'board'>('pending');

    const filteredRequests = React.useMemo(() => requests.filter(req => {
        if (activeTab === 'pending') {
            return req.status === 'NEW';
        } else {
            return req.status === 'ADDED_TO_TERMINATION_APPROVAL_LIST' || req.status === 'SUBMITTED_FOR_APPROVAL' || req.status === 'BOARD_ASSIGNED';
        }
    }), [requests, activeTab]);

    const columns = React.useMemo<ColumnDef<TerminationRequest>[]>(() => [
        {
            id: 'select',
            header: CheckboxHeader,
            cell: CheckboxCell
        },
        {
            accessorKey: 'id',
            header: 'ID',
        },
        {
            accessorKey: 'employeeName',
            header: 'Employee Name',
        },
        {
            accessorKey: 'epfNumber',
            header: 'EPF',
        },
        {
            accessorKey: 'branch',
            header: 'Branch',
        },
        {
            accessorKey: 'type',
            header: 'Type',
        },
        {
            accessorKey: 'effectiveDate',
            header: 'Effective Date',
        },
        {
            accessorKey: 'status',
            header: 'Status',
            cell: ({ row }) => {
                const status = row.original.status;
                const config: Record<string, { label: string, classes: string }> = {
                    'NEW': { label: 'New', classes: 'bg-slate-100 text-slate-700' },
                    'SUBMITTED_FOR_APPROVAL': { label: 'Submitted', classes: 'bg-blue-100 text-blue-700' },
                    'ADDED_TO_TERMINATION_APPROVAL_LIST': { label: 'Ready for Board', classes: 'bg-amber-100 text-amber-700' },
                    'BOARD_ASSIGNED': { label: 'Board Assigned', classes: 'bg-emerald-100 text-emerald-700' }
                };
                const st = config[status] || { label: status, classes: 'bg-slate-100 text-slate-700' };
                return (
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${st.classes}`}>
                        {st.label}
                    </span>
                );
            }
        },
        {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }) => {
                const req = row.original;
                return (
                    <div className="flex items-center gap-2">
                        {req.status === 'NEW' && activeTab === 'pending' ? (
                            <Button variant="outline" onClick={() => onEdit(req)} className="h-8 gap-1">
                                <span className="material-symbols-outlined text-[16px]">edit</span>
                                Edit
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={() => onView(req)} className="h-8 gap-1">
                                <span className="material-symbols-outlined text-[16px]">visibility</span>
                                View
                            </Button>
                        )}
                    </div>
                );
            }
        }
    ], [activeTab, onEdit, onView]);

    const table = useReactTable({
        data: filteredRequests,
        columns,
        state: {
            globalFilter,
            rowSelection,
        },
        enableRowSelection: row => activeTab === 'pending' 
            ? row.original.status === 'NEW'
            : (row.original.status === 'ADDED_TO_TERMINATION_APPROVAL_LIST' || row.original.status === 'SUBMITTED_FOR_APPROVAL'),
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    const selectedIds = Object.keys(rowSelection).map(index => filteredRequests[parseInt(index, 10)].id);

    const handleAddToBoardList = () => {
        const updatedRequests = requests.map(req => {
            if (selectedIds.includes(req.id) && req.status === 'NEW') {
                return { ...req, status: 'ADDED_TO_TERMINATION_APPROVAL_LIST' as const };
            }
            return req;
        });
        onUpdateRequests(updatedRequests);
        setRowSelection({});
    };

    const handleAssignBoardDate = () => {
        if (!boardDate) return;
        
        const updatedRequests = requests.map(req => {
            if (selectedIds.includes(req.id)) {
                return { ...req, status: 'BOARD_ASSIGNED' as const, boardDate };
            }
            return req;
        });
        
        onUpdateRequests(updatedRequests);
        setShowBoardModal(false);
        setRowSelection({});
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <React.Fragment>
            <div className="space-y-6 print:hidden">
            <div className="flex items-center gap-6 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => { 
                        setActiveTab('pending'); 
                        setRowSelection({}); 
                    }}
                    type="button"
                    className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${
                        activeTab === 'pending'
                            ? 'text-primary'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    Pending Terminations
                    {activeTab === 'pending' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => { 
                        setActiveTab('board'); 
                        setRowSelection({}); 
                    }}
                    type="button"
                    className={`pb-4 px-2 text-sm font-semibold transition-colors relative ${
                        activeTab === 'board'
                            ? 'text-primary'
                            : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                    }`}
                >
                    Board Approval List
                    {activeTab === 'board' && (
                        <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:w-96">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-slate-400">search</span>
                    </span>
                    <Input
                        value={globalFilter ?? ''}
                        onChange={e => setGlobalFilter(e.target.value)}
                        className="pl-10"
                        placeholder="Search requests..."
                    />
                </div>
                <div className="flex items-center gap-3">
                    {activeTab === 'pending' && selectedIds.length > 0 && (
                        <Button onClick={handleAddToBoardList} variant="outline" className="gap-2 border-primary text-primary hover:bg-primary/5">
                            <span className="material-symbols-outlined text-sm">playlist_add_check</span>
                            Create Board List ({selectedIds.length})
                        </Button>
                    )}
                    
                    {activeTab === 'board' && (
                        <>
                            <Button onClick={handlePrint} variant="outline" className="gap-2">
                                <span className="material-symbols-outlined text-sm">print</span>
                                Print List
                            </Button>
                            {selectedIds.length > 0 && (
                                <Button onClick={() => setShowBoardModal(true)} className="gap-2">
                                    <span className="material-symbols-outlined text-sm">event</span>
                                    Submit to Board ({selectedIds.length})
                                </Button>
                            )}
                        </>
                    )}
                    
                    {activeTab === 'pending' && (
                        <Button onClick={onCreateNew} className="gap-2">
                            <span className="material-symbols-outlined text-sm">add</span>
                            New Request
                        </Button>
                    )}
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id} className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 text-sm font-semibold text-slate-500">
                                    {headerGroup.headers.map((header) => (
                                        <th key={header.id} className="py-4 px-6 font-medium whitespace-nowrap">
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody className="text-sm">
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        key={row.id}
                                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 transition-colors"
                                        data-state={row.getIsSelected() && "selected"}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td key={cell.id} className="py-4 px-6 text-slate-700 dark:text-slate-300">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length} className="py-12 text-center text-slate-500">
                                        No termination requests found in this view.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Board Date Modal */}
            {showBoardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                            <h3 className="font-bold">Assign Board Meeting Date</h3>
                        </div>
                        <div className="p-6 space-y-4">
                            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Select Date</label>
                            <Input
                                type="date"
                                value={boardDate}
                                onChange={(e) => setBoardDate(e.target.value)}
                            />
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                            <Button variant="outline" onClick={() => setShowBoardModal(false)}>Cancel</Button>
                            <Button disabled={!boardDate} onClick={handleAssignBoardDate}>Confirm Dates</Button>
                        </div>
                    </div>
                </div>
            )}
            </div>
            
            {/* Printable Document (Hidden on Screen, Visible on Print) */}
            <style type="text/css" media="print">
                {`
                    body * {
                        visibility: hidden;
                    }
                    #termination-print-section, #termination-print-section * {
                        visibility: visible;
                    }
                    #termination-print-section {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                    }
                `}
            </style>
            <div id="termination-print-section" className="hidden print:block w-full text-black bg-white min-h-screen text-left print:p-8">
                <div className="text-center mb-10 border-b-2 border-slate-800 pb-6">
                    <h1 className="text-3xl font-bold uppercase tracking-widest text-slate-900 mb-2">Nexora HRMS</h1>
                    <h2 className="text-xl font-semibold mb-1">Board Approval Request</h2>
                    <h3 className="text-lg font-medium text-slate-700">Employee Terminations</h3>
                    <p className="text-sm mt-3 text-slate-500 font-bold">List Generated: {new Date().toLocaleDateString()}</p>
                </div>

                <div className="bg-white overflow-hidden print:shadow-none print:border-none print:rounded-none">
                    <div className="overflow-x-auto print:overflow-visible">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-800 text-xs uppercase tracking-wider font-bold text-slate-800 bg-white">
                                    <th className="py-2 px-4">Req ID</th>
                                    <th className="py-2 px-4">Employee Name</th>
                                    <th className="py-2 px-4">EPF</th>
                                    <th className="py-2 px-4">Branch</th>
                                    <th className="py-2 px-4">Type</th>
                                    <th className="py-2 px-4">Effective Date</th>
                                    <th className="py-2 px-4 text-center w-32 border-l border-slate-300">Board Decision</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs">
                                {filteredRequests.map((req) => (
                                    <tr key={req.id} className="border-b border-slate-400 hover:bg-slate-50 transition-colors">
                                        <td className="py-3 px-4 font-semibold text-black">{req.id}</td>
                                        <td className="py-3 px-4 text-black">{req.employeeName}</td>
                                        <td className="py-3 px-4 text-black">{req.epfNumber}</td>
                                        <td className="py-3 px-4 text-black">{req.branch}</td>
                                        <td className="py-3 px-4 text-black">{req.type}</td>
                                        <td className="py-3 px-4 text-black">{req.effectiveDate}</td>
                                        <td className="py-3 px-4 text-center align-middle border-l border-slate-300">
                                            <div className="w-20 border-b border-black mx-auto"></div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredRequests.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="py-8 text-center text-slate-500 italic">
                                            No termination requests found for this board queue.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="hidden print:flex justify-between items-end mt-32 px-12">
                    <div className="text-center">
                        <div className="border-b border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-slate-800 text-sm">Prepared By (HR)</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Signature & Date</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-slate-800 text-sm">Reviewed By (Director)</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Signature & Date</p>
                    </div>
                    <div className="text-center">
                        <div className="border-b border-black w-48 mx-auto mb-2"></div>
                        <p className="font-bold text-slate-800 text-sm">Board Approval</p>
                        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Signature & Date</p>
                    </div>
                </div>
            </div>
        </React.Fragment>
    );
}
