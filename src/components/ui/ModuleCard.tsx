import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  onClick?: () => void;
  className?: string;
}

export default function ModuleCard({ title, description, icon, href, onClick, className = "" }: ModuleCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className={`bg-white dark:bg-slate-900 p-6 rounded-xl border border-gray-200 dark:border-slate-800 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-slate-400 mb-6 flex-1 leading-relaxed">
        {description}
      </p>
      {onClick ? (
        <button onClick={handleClick} className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 group mt-auto text-left">
          Open Module
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </button>
      ) : (
        <Link href={href || "#"} className="inline-flex items-center text-sm font-bold text-primary hover:text-primary/80 group mt-auto">
          Open Module
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </div>

  );
}
