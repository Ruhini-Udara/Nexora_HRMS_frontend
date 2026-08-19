
import Link from 'next/link';
import { ReactNode } from 'react';

interface ModuleCardProps {
    title: string;
    description: string;
    icon: ReactNode;
    href: string;
}

const ModuleCard = ({ title, description, icon, href }: ModuleCardProps) => {
    return (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-custom border border-gray-200 dark:border-slate-800 flex flex-col h-full hover:shadow-lg transition-all hover:-translate-y-1 duration-200">
            <div className="w-10 h-10 bg-gray-50 dark:bg-slate-800 rounded-lg flex items-center justify-center text-primary mb-4 transition-colors">
                {icon}
            </div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 flex-grow mb-6 leading-relaxed">
                {description}
            </p>
            <Link href={href} className="text-primary text-sm font-semibold flex items-center hover:underline">
                Open Module <span className="ml-1">→</span>
            </Link>
        </div>
    );
};

export default ModuleCard;
