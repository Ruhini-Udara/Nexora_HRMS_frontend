import React, { ElementType, ReactNode } from "react";

export type SummaryColorVariant = 
  | "primary" 
  | "orange" 
  | "amber" 
  | "emerald" 
  | "green" 
  | "rose" 
  | "red" 
  | "blue" 
  | "purple" 
  | "slate";

interface SupervisorSummaryCardProps {
  title: string;
  value: string | number;
  subtext?: string | ReactNode;
  icon: ElementType | ReactNode;
  variant?: SummaryColorVariant;
  badgeText?: string;
  className?: string;
}

const variantStyles: Record<SummaryColorVariant, { iconBg: string; text: string; border: string }> = {
  primary: {
    iconBg: "bg-primary/10 dark:bg-orange-950/40",
    text: "text-primary dark:text-orange-400",
    border: "border-primary/20 dark:border-orange-900/40"
  },
  orange: {
    iconBg: "bg-orange-50 dark:bg-orange-950/40",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-200/80 dark:border-orange-900/40"
  },
  amber: {
    iconBg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-200/80 dark:border-amber-900/40"
  },
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-200/80 dark:border-emerald-900/40"
  },
  green: {
    iconBg: "bg-green-50 dark:bg-green-950/40",
    text: "text-green-600 dark:text-green-400",
    border: "border-green-200/80 dark:border-green-900/40"
  },
  rose: {
    iconBg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-600 dark:text-rose-400",
    border: "border-rose-200/80 dark:border-rose-900/40"
  },
  red: {
    iconBg: "bg-red-50 dark:bg-red-950/40",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-200/80 dark:border-red-900/40"
  },
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-950/40",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-200/80 dark:border-blue-900/40"
  },
  purple: {
    iconBg: "bg-purple-50 dark:bg-purple-950/40",
    text: "text-purple-600 dark:text-purple-400",
    border: "border-purple-200/80 dark:border-purple-900/40"
  },
  slate: {
    iconBg: "bg-slate-100 dark:bg-slate-800",
    text: "text-slate-600 dark:text-slate-300",
    border: "border-slate-200 dark:border-slate-700"
  }
};

export default function SupervisorSummaryCard({
  title,
  value,
  subtext,
  icon,
  variant = "primary",
  badgeText,
  className = ""
}: SupervisorSummaryCardProps) {
  const currentVariant = variantStyles[variant] || variantStyles.primary;

  const renderIcon = () => {
    if (React.isValidElement(icon)) {
      return icon;
    }
    if (typeof icon === "function" || (typeof icon === "object" && icon !== null)) {
      const IconComponent = icon as ElementType<{ className?: string }>;
      return <IconComponent className={`w-5 h-5 ${currentVariant.text}`} />;
    }
    return null;
  };

  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-xl shadow-xs flex items-center justify-between transition-all duration-200 hover:shadow-sm ${className}`}>
      <div className="min-w-0 flex-1 pr-3">
        <div className="flex items-center gap-2">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400 truncate">
            {title}
          </p>
          {badgeText && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${currentVariant.iconBg} ${currentVariant.text} border ${currentVariant.border}`}>
              {badgeText}
            </span>
          )}
        </div>
        <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1.5 leading-none tracking-tight">
          {value}
        </h3>
        {subtext && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {subtext}
          </div>
        )}
      </div>

      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${currentVariant.iconBg} ${currentVariant.border} ${currentVariant.text}`}>
        {renderIcon()}
      </div>
    </div>
  );
}
