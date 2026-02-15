import { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value?: ReactNode;
  subtext?: ReactNode;
  icon?: ReactNode;
  iconBgColor?: string;
  children?: ReactNode; // For custom content like progress bars
}

export default function StatCard({ 
  title, 
  value, 
  subtext, 
  icon,
  iconBgColor = 'bg-gray-50',
  children
}: StatCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center min-h-[140px]">
      <div className="flex items-start justify-between w-full">
        <div className="flex-1 w-full">
          <h3 className="text-sm font-medium text-gray-500 mb-2">{title}</h3>
          
          {value && <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>}
          {subtext && <div className="text-sm font-medium text-gray-500">{subtext}</div>}
          
          {/* Render custom children (like progress bars) if provided */}
          {children}
        </div>
        
        {icon && (
          <div className={`p-3 rounded-xl ${iconBgColor} flex-shrink-0 ml-4`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
