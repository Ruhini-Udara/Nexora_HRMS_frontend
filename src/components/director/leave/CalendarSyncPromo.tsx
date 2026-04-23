import React from 'react';

const CalendarSyncPromo = () => {
    return (
        <div className="flex-1 bg-primary text-white p-6 rounded-xl shadow-lg relative overflow-hidden group">
            {/* Decor */}
            <div className="absolute -right-10 -bottom-10 size-40 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all"></div>
            <div className="relative z-10">
                <h4 className="text-lg font-bold mb-1">Company Calendar Sync</h4>
                <p className="text-xs text-white/80 mb-4 max-w-xs">Integrate HR MATE with Google Calendar or Outlook to keep your team informed.</p>
                <button className="px-4 py-2 bg-white text-primary rounded-lg text-xs font-bold hover:shadow-xl transition-all">Enable Integration</button>
            </div>
        </div>
    );
};

export default CalendarSyncPromo;
