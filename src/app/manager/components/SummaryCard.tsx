
import { ReactNode } from 'react';

interface SummaryCardProps {
    title: string;
    value: string;
    subContent: ReactNode;
    icon: ReactNode;
    iconBgColor: string;
    iconColor: string;
}

const SummaryCard = ({ title, value, subContent, icon, iconBgColor, iconColor }: SummaryCardProps) => {
    return (
        <div className="bg-white p-6 rounded-custom border border-gray-200 shadow-sm flex justify-between">
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
                <div className="mt-2 flex items-center text-xs font-semibold">
                    {subContent}
                </div>
            </div>
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${iconBgColor} ${iconColor}`}>
                {icon}
            </div>
        </div>
    );
};

export default SummaryCard;
