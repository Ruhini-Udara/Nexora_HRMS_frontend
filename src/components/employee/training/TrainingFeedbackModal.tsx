"use client";

import React, { useState, useEffect } from "react";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import { Toast } from "@/components/ui/Toast";

interface TrainingFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseName?: string;
    eventId?: number | null;
    onSubmitSuccess?: () => void;
}

interface FeedbackItem {
    employeeId: number;
    courseContentRating?: number;
    instructorRating?: number;
    overallExperienceRating?: number;
    suggestions?: string;
    feedback?: string;
}

const TrainingFeedbackModal: React.FC<TrainingFeedbackModalProps> = ({
    isOpen,
    onClose,
    courseName,
    eventId,
    onSubmitSuccess,
}) => {
    const { user } = useAuthStore();
    const [ratings, setRatings] = useState({
        "Course Content": 0,
        "Instructor": 0,
        "Overall Experience": 0,
    });
    const [suggestions, setSuggestions] = useState("");
    const [isConfirming, setIsConfirming] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isAlreadySubmitted, setIsAlreadySubmitted] = useState(false);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

    // Fetch existing feedback when modal opens
    useEffect(() => {
        if (isOpen && eventId && user?.id) {
            api.get(`/api/training/events/${eventId}/feedback`)
                .then(res => {
                    const feedbacks = res.data;
                    const existing = feedbacks.find((f: FeedbackItem) => f.employeeId === user.id);
                    
                    // Check if they have given non-zero ratings or custom feedback suggestions
                    if (existing && (existing.courseContentRating > 0 || existing.instructorRating > 0 || existing.overallExperienceRating > 0)) {
                        setRatings({
                            "Course Content": existing.courseContentRating || 0,
                            "Instructor": existing.instructorRating || 0,
                            "Overall Experience": existing.overallExperienceRating || 0,
                        });
                        setSuggestions(existing.suggestions || existing.feedback || "");
                        setIsAlreadySubmitted(true);
                    } else {
                        // Reset to empty for new submission
                        setRatings({ "Course Content": 0, "Instructor": 0, "Overall Experience": 0 });
                        setSuggestions("");
                        setIsAlreadySubmitted(false);
                    }
                })
                .catch(err => {
                    console.error("Failed to load existing feedback:", err);
                    setRatings({ "Course Content": 0, "Instructor": 0, "Overall Experience": 0 });
                    setSuggestions("");
                    setIsAlreadySubmitted(false);
                });
        }
    }, [isOpen, eventId, user?.id]);

    const handleStarClick = (category: string, value: number) => {
        if (isAlreadySubmitted) return;
        setRatings((prev) => ({ ...prev, [category]: value }));
    };

    const handleSubmitInitiate = () => {
        setIsConfirming(true);
    };

    const handleFinalSubmit = async () => {
        if (!eventId || !user) return;

        setIsSubmitting(true);
        try {
            const payload = {
                eventId: eventId,
                employeeId: user.id,
                attendanceStatus: "Present",
                feedback: suggestions, // Using suggestions as the main feedback text
                courseContentRating: ratings["Course Content"],
                instructorRating: ratings["Instructor"],
                overallExperienceRating: ratings["Overall Experience"],
                suggestions: suggestions
            };

            await api.post('/api/training/feedback', payload);
            
            // Reset form states
            setRatings({ "Course Content": 0, "Instructor": 0, "Overall Experience": 0 });
            setSuggestions("");
            setIsConfirming(false);
            
            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
            onClose();
        } catch (error) {
            console.error("Failed to submit feedback", error);
            setToast({ message: "Failed to submit feedback. Please try again.", type: "error" });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setIsConfirming(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-stone-800">
                        Feedback {courseName ? `- ${courseName}` : ""}
                    </h3>
                    <button
                        className="text-stone-400 hover:text-stone-600 cursor-pointer transition-colors"
                        onClick={handleClose}
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {isConfirming ? (
                    <div className="p-8 text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4 text-orange-600">
                            <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                                warning
                            </span>
                        </div>
                        <h4 className="text-lg font-bold text-stone-800 mb-2">Are you sure?</h4>
                        <p className="text-sm text-stone-500 mb-8 max-w-sm mx-auto">
                            Once submitted, your feedback for <strong>{courseName}</strong> cannot be edited or withdrawn. Do you want to proceed?
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                className="px-5 py-2.5 text-sm font-bold text-stone-600 bg-stone-100 rounded-lg hover:bg-stone-200 cursor-pointer transition-colors"
                                onClick={() => setIsConfirming(false)}
                            >
                                Go Back
                            </button>
                            <button
                                onClick={handleFinalSubmit}
                                disabled={isSubmitting}
                                className="px-5 py-2.5 bg-orange-600 text-white text-sm font-bold rounded-lg hover:bg-orange-700 shadow-lg shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50"
                            >
                                {isSubmitting ? "Submitting..." : "Yes, Submit Feedback"}
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                            <div className="space-y-4">
                                {(Object.keys(ratings) as Array<keyof typeof ratings>).map((label) => (
                                    <div key={label} className="flex items-center justify-between">
                                        <label className="text-sm font-bold text-stone-700">{label}</label>
                                        <div className="flex gap-1 group">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    disabled={isAlreadySubmitted}
                                                    onClick={() => handleStarClick(label, star)}
                                                    className={`material-symbols-outlined text-xl transition-colors ${
                                                        isAlreadySubmitted
                                                            ? ratings[label] >= star 
                                                                ? "text-orange-400 cursor-default" 
                                                                : "text-stone-200 cursor-default"
                                                            : ratings[label] >= star 
                                                                ? "text-orange-400 cursor-pointer" 
                                                                : "text-stone-300 hover:text-orange-200 cursor-pointer"
                                                    }`}
                                                    style={{ fontVariationSettings: ratings[label] >= star ? "'FILL' 1" : "'FILL' 0" }}
                                                >
                                                    star
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-3 pt-2">
                                <div>
                                    <label className="block text-sm font-bold text-stone-700 mb-2">
                                        Suggestions for Improvement
                                    </label>
                                    <textarea
                                        value={suggestions}
                                        readOnly={isAlreadySubmitted}
                                        onChange={(e) => setSuggestions(e.target.value)}
                                        className="w-full rounded-lg border border-stone-200 focus:border-[var(--color-training-primary)] focus:ring-[var(--color-training-primary)] text-sm h-24 p-3 read-only:bg-stone-50 read-only:text-stone-500"
                                        placeholder={isAlreadySubmitted ? "No suggestions provided." : "How can we make this training better?"}
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                        <div className="p-6 bg-stone-50 flex items-center justify-end gap-3">
                            <button
                                className="px-4 py-2 text-sm font-bold text-stone-600 hover:text-stone-800 cursor-pointer"
                                onClick={handleClose}
                            >
                                {isAlreadySubmitted ? "Close" : "Cancel"}
                            </button>
                            {!isAlreadySubmitted ? (
                                <button 
                                    onClick={handleSubmitInitiate}
                                    className="px-6 py-2 bg-[var(--color-training-primary)] text-white text-sm font-bold rounded-lg hover:bg-[#853500] shadow-lg shadow-primary/20 transition-all cursor-pointer"
                                >
                                    Submit Feedback
                                </button>
                            ) : (
                                <button 
                                    disabled={true}
                                    className="px-6 py-2 bg-emerald-600 text-white text-sm font-bold rounded-lg opacity-85 cursor-not-allowed flex items-center gap-1.5"
                                >
                                    <span className="material-symbols-outlined text-[18px]">verified</span>
                                    Submitted
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
};

export default TrainingFeedbackModal;
