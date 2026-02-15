import React from "react";


const EmployeeLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-[#F9FAFB]">
      {/* Sidebar */}
      <aside
        className="fixed left-0 top-0 bottom-0 w-[260px] bg-white border-r border-[#E2E8F0] flex flex-col z-10"
        style={{ minHeight: '100vh' }}
      >
        <div className="px-6 pt-6 pb-2">
          <div className="flex items-center gap-2 mb-8">
            <div className="bg-[#8B4513] rounded-lg flex items-center justify-center w-[42px] h-[30px]">
              <span className="text-white font-bold text-lg leading-[18px]">HM</span>
            </div>
            <span className="font-bold text-2xl text-[#8B4513] tracking-tight">HR MATE</span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 px-4 flex-1">
          <a className="flex items-center px-4 py-3 bg-[#FFF3E6] border-r-4 border-[#8B3A00] rounded-none font-medium text-[#8B3A00] text-base" href="#">Dashboard</a>
          <a className="flex items-center px-4 py-3 rounded-xl font-medium text-[#64748B] text-base" href="#">My Documents</a>
          <a className="flex items-center px-4 py-3 rounded-xl font-medium text-[#64748B] text-base" href="#">Transfer Requests</a>
          <a className="flex items-center px-4 py-3 rounded-xl font-medium text-[#64748B] text-base" href="#">Resignation Requests</a>
          <a className="flex items-center px-4 py-3 rounded-xl font-medium text-[#64748B] text-base" href="#">Welfare Requests</a>
          <a className="flex items-center px-4 py-3 rounded-xl font-medium text-[#64748B] text-base" href="#">Training Requests</a>
          <a className="flex items-center px-4 py-3 rounded-xl font-medium text-[#64748B] text-base" href="#">Leave Requests</a>
        </nav>
        <div className="mt-auto px-4 pb-6 pt-4 border-t border-[#F1F5F9]">
          <button className="w-full border border-[#E2E8F0] rounded-xl py-2 text-[#475569] font-medium flex items-center justify-center gap-2">
            {/* Icon placeholder */}
            <span className="w-4 h-4 bg-[#475569] rounded-full inline-block"></span>
            Toggle Theme
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-[260px] p-8">
        {children}
      </main>
    </div>
  );
};

export default EmployeeLayout;
