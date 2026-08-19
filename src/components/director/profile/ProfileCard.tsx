import { Camera, Mail, Phone } from 'lucide-react';

export default function ProfileCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-8 flex flex-col items-center shadow-sm transition-colors">
            <div className="relative group">
                <div className="w-32 h-32 rounded-full bg-orange-100 dark:bg-orange-950/40 flex items-center justify-center overflow-hidden border-4 border-white dark:border-slate-800 shadow-md">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        alt="Admin Profile"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCkAk-aqXgd51n5yBq6PJ6zniupXUkv617BIasBsOT13IE1MJ8NBMLomJOYPRbiRXt2R4eD3_LZFRvabAO8IClEP8APeM26k1u4-N3Yop4FY5HlmQUBfcIuDwgGAz_W3ihWjyB4PTP0l9AFKPoyZd4zui_hfaWqyWgK6Ial5Hg2uoJyxLoXENOZKe0sFVDyUemv4tybwmZm1PAOyB4weWLAwniXl88M5OZ9PPHU4S1T_h0YLv_x5BQtiI1NIN8-g_5Jkg7bV5IYXX0"
                    />
                </div>
                <button className="absolute bottom-1 right-1 bg-secondary hover:bg-secondary/90 text-white p-2 rounded-full shadow-lg transition-transform hover:scale-105">
                    <Camera className="w-[18px] h-[18px]" />
                </button>
            </div>

            <h2 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Admin Profile</h2>
            <p className="text-gray-500 dark:text-slate-400 text-sm font-medium">HR director</p>

            <button className="mt-6 w-full py-2.5 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition-colors shadow-sm cursor-pointer">
                Change Photo
            </button>

            <div className="w-full mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 space-y-4">
                <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">director@hrmate.com</span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-slate-300">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <span className="text-sm">+1 (555) 123-4567</span>
                </div>
            </div>
        </div>
    );
}

