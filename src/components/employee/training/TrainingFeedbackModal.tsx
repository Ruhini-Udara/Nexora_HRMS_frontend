"use client";

import React from "react";

interface TrainingFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const TrainingFeedbackModal: React.FC<TrainingFeedbackModalProps> = ({
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-800 flex items-center gap-2">
                        <span className="material-symbols-outlined text-[var(--color-training-primary)]">
                            reviews
                        </span>{" "}
                        Training Feedback
                    </h3>
                    <button
                        className="text-stone-400 hover:text-stone-600 cursor-pointer"
                        onClick={onClose}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>
                <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                    <div className="space-y-4">
                        {["Course Content", "Instructor", "Overall Experience"].map((label) => (
                            <div key={label} className="flex items-center justify-between">
                                <label className="text-sm font-bold text-stone-700">{label}</label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <span
                                            key={star}
                                            className={`material-symbols-outlined cursor-pointer text-xl ${star <= 4 ? "text-orange-400" : "text-stone-300"
                                                }`}
                                            style={{ fontVariationSettings: star <= 4 ? "'FILL' 1" : "'FILL' 0" }}
                                        >
                                            star
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3 pt-2">
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">
                                Key Takeaways
                            </label>
                            <textarea
                                className="w-full rounded-lg border-stone-200 focus:border-[var(--color-training-primary)] focus:ring-[var(--color-training-primary)] text-sm h-24 p-3"
                                placeholder="What was your biggest learning?"
                            ></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-stone-700 mb-2">
                                Suggestions for Improvement
                            </label>
                            <textarea
                                className="w-full rounded-lg border-stone-200 focus:border-[var(--color-training-primary)] focus:ring-[var(--color-training-primary)] text-sm h-24 p-3"
                                placeholder="How can we make this training better?"
                            ></textarea>
                        </div>
                    </div>
                </div>
                <div className="p-6 bg-stone-50 flex items-center justify-end gap-3">
                    <button
                        className="px-4 py-2 text-sm font-bold text-stone-600 hover:text-stone-800 cursor-pointer"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button className="px-6 py-2 bg-[var(--color-training-primary)] text-white text-sm font-bold rounded-lg hover:bg-[#853500] shadow-lg shadow-primary/20 transition-all cursor-pointer">
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TrainingFeedbackModal;
