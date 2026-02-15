import { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  href?: string;
  className?: string;
}

export default function ModuleCard({ title, description, icon, href = "#", className = "" }: ModuleCardProps) {
  return (
    <div className={`bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col h-full hover:shadow-md transition-shadow ${className}`}>
      <div className="w-12 h-12 rounded-xl bg-orange-50 flex items-center justify-center mb-4 text-amber-800">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 mb-6 flex-1 leading-relaxed">
        {description}
      </p>
      <Link href={href} className="inline-flex items-center text-sm font-bold text-amber-800 hover:text-amber-900 group mt-auto">
        Open Module 
        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  );
}
