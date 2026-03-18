import React from 'react';

interface FeedbackData {
    employeeName: string;
    ratings: {
        courseContent: number;
        instructor: number;
        overallExperience: number;
    };
    suggestions: string;
}

interface FeedbackDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    feedback: FeedbackData | null;
}

const StarRating = ({ rating }: { rating: number }) => {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <span 
                    key={star} 
                    className={`material-symbols-outlined text-[20px] ${star <= rating ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
                    style={star <= rating ? { fontVariationSettings: "'FILL' 1" } : {}}
                >
                    star
                </span>
            ))}
        </div>
    );
};

export default function FeedbackDetailsModal({ isOpen, onClose, feedback }: FeedbackDetailsModalProps) {
    if (!isOpen || !feedback) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-background-dark w-full max-w-lg rounded-2xl shadow-xl border border-primary/10 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-primary/10 bg-slate-50 dark:bg-background-dark/50">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Training Feedback</h3>
                        <p className="text-sm text-slate-500 mt-1">Submitted by {feedback.employeeName}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <span className="material-symbols-outlined">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto w-full">
                    {/* Ratings */}
                    <div className="space-y-6 mb-8">
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Ratings</h4>
                            
                            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Course Content</span>
                                    <StarRating rating={feedback.ratings.courseContent} />
                                </div>
                                <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Instructor</span>
                                    <StarRating rating={feedback.ratings.instructor} />
                                </div>
                                <div className="w-full h-px bg-slate-200 dark:bg-slate-700"></div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Overall Experience</span>
                                    <StarRating rating={feedback.ratings.overallExperience} />
                                </div>
                            </div>
                        </div>

                        {/* Suggestions */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Suggestions for Improvement</h4>
                            <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 p-4 rounded-xl">
                                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic">
                                    &quot;{feedback.suggestions}&quot;
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-primary/10 bg-slate-50 dark:bg-background-dark/50 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-xl text-sm font-bold transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}
