"use client";

import React, { useState } from "react";
import { Save, X, Clock, AlignLeft } from "lucide-react";

export default function AddShift({ onClose }: { onClose?: () => void }) {
  const [shiftName, setShiftName] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    console.log("Saving Shift", {
      shiftName,
      startTime,
      endTime,
      description,
    });
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Add New Shift</h2>
            <p className="text-sm text-slate-500 mt-1">Create a new shift type and configure its timings</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Shift Name</label>
            <div className="relative">
              <input
                type="text"
                value={shiftName}
                onChange={(e) => setShiftName(e.target.value)}
                placeholder="e.g. Normal Shift"
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Start Time</label>
              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">End Time</label>
              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all text-slate-700"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <div className="relative">
              <AlignLeft
                 size={18}
                 className="absolute left-3 top-3.5 text-slate-400 pointer-events-none"
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add description and rules for this shift..."
                rows={4}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-400 focus:border-amber-400 outline-none transition-all resize-none bg-slate-50"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium flex items-center gap-2"
          >
            <Save size={18} />
            Save Shift
          </button>
        </div>
      </div>
    </div>
  );
}
