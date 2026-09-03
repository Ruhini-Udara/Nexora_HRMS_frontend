"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axiosInstance";
import { useAuthStore } from "@/store/useAuthStore";
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarCheck2,
  AlertCircle,
  Loader2,
  Sparkles,
  Plane
} from "lucide-react";

interface LeaveTypeBalance {
  entitled: number;
  used: number;
  remaining: number;
}

interface NextPlannedVacation {
  leaveType: string;
  startDate: string;
  endDate: string;
  leaveDays: number;
  daysUntil: number;
  status: string;
}

interface LeaveOverviewData {
  leaveDetails: {
    annual: LeaveTypeBalance;
    medical: LeaveTypeBalance;
    casual: LeaveTypeBalance;
  };
  nextPlannedVacation: NextPlannedVacation | null;
}

function formatDateRange(startDateStr: string, endDateStr: string): string {
  if (!startDateStr || !endDateStr) return "—";
  const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  const start = new Date(startDateStr).toLocaleDateString("en-GB", options);
  const end = new Date(endDateStr).toLocaleDateString("en-GB", options);
  return `${start} – ${end}`;
}

export default function LeaveOverviewPage() {
  const { user } = useAuthStore();
  const [data, setData] = useState<LeaveOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOverview = async () => {
    setLoading(true);
    setError(null);
    try {
      // First attempt secure self-service endpoint
      const res = await api.get<LeaveOverviewData>("/api/v1/dashboard/employee/leave-overview");
      setData(res.data);
    } catch (err: any) {
      console.warn("Self-service endpoint fallback to ID lookup if needed", err);
      // Fallback with employeeId if session lookup requires ID path
      const employeeId = user?.employeeId || user?.id;
      if (employeeId) {
        try {
          const fallbackRes = await api.get<LeaveOverviewData>(`/api/v1/dashboard/employee/${employeeId}/leave-overview`);
          setData(fallbackRes.data);
          return;
        } catch (fallbackErr: any) {
          setError(fallbackErr?.response?.data?.message || "Failed to load leave overview details.");
        }
      } else {
        setError("Failed to load leave overview details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchOverview();
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading leave overview...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl p-6 text-center">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-red-800 dark:text-red-300 mb-1">Unable to Load Leave Data</h2>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error || "Something went wrong while retrieving your leave balances."}</p>
          <button
            onClick={fetchOverview}
            className="px-4 py-2 bg-primary hover:bg-[#7a3000] text-white text-sm font-semibold rounded-xl transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { leaveDetails, nextPlannedVacation } = data;

  const leaveCards = [
    {
      type: "Annual Leave",
      badge: "Paid Vacation",
      colorVariant: "primary",
      icon: Plane,
      data: leaveDetails.annual,
      iconBg: "bg-orange-50 dark:bg-orange-950/40 text-primary dark:text-orange-400 border-orange-200 dark:border-orange-900/40",
      accentBorder: "border-orange-100 dark:border-slate-800"
    },
    {
      type: "Medical Leave",
      badge: "Health & Care",
      colorVariant: "emerald",
      icon: CheckCircle2,
      data: leaveDetails.medical,
      iconBg: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40",
      accentBorder: "border-emerald-100 dark:border-slate-800"
    },
    {
      type: "Casual Leave",
      badge: "Short Absence",
      colorVariant: "amber",
      icon: CalendarCheck2,
      data: leaveDetails.casual,
      iconBg: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/40",
      accentBorder: "border-amber-100 dark:border-slate-800"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto w-full space-y-8 pb-10">
      {/* Header with Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-4">
          <Link
            href="/employee"
            className="w-10 h-10 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center shadow-xs border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-primary dark:hover:text-orange-400 transition-colors cursor-pointer"
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Leave Overview
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Your leave information and upcoming planned vacation
            </p>
          </div>
        </div>

        <Link
          href="/employee/leave-requests"
          className="inline-flex items-center gap-2 bg-primary hover:bg-[#7a3000] text-white text-xs sm:text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          <span>Apply For Leave</span>
        </Link>
      </div>

      {/* ── SECTION 1: MY LEAVE DETAILS ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>My Leave Details</span>
          </h2>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
            Active Year: {new Date().getFullYear()}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {leaveCards.map((card) => {
            const Icon = card.icon;
            const entitled = card.data?.entitled ?? 0;
            const used = card.data?.used ?? 0;
            const remaining = card.data?.remaining ?? 0;

            return (
              <div
                key={card.type}
                className={`bg-white dark:bg-slate-900 border ${card.accentBorder} rounded-2xl p-6 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md`}
              >
                {/* Card Top */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl border ${card.iconBg}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-base text-slate-900 dark:text-white">
                          {card.type}
                        </h3>
                        <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          {card.badge}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Main Remaining Metric */}
                  <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-4 mb-4 border border-slate-100 dark:border-slate-800">
                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-1">
                      Available Balance
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                        {remaining}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Days remaining
                      </span>
                    </div>
                  </div>
                </div>

                {/* Breakdown Row: Entitled & Used */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-sm">
                  <div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 block">Entitled</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-base">
                      {entitled} <span className="text-xs font-normal text-slate-400">days</span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400 dark:text-slate-500 block">Used</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-base">
                      {used} <span className="text-xs font-normal text-slate-400">days</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── SECTION 2: NEXT PLANNED VACATION ───────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span>Next Planned Vacation</span>
        </h2>

        {nextPlannedVacation ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-xs transition-all hover:shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              {/* Left Side: Vacation Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    {nextPlannedVacation.leaveType}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50">
                    <CheckCircle2 className="w-3 h-3" />
                    Approved
                  </span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                    {formatDateRange(nextPlannedVacation.startDate, nextPlannedVacation.endDate)}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{nextPlannedVacation.leaveDays} Leave Day{nextPlannedVacation.leaveDays !== 1 ? "s" : ""}</span>
                  </p>
                </div>
              </div>

              {/* Right Side: Countdown Card / Highlight */}
              <div className="bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 rounded-xl p-5 md:min-w-[260px] text-center flex flex-col items-center justify-center">
                <Clock className="w-6 h-6 text-primary dark:text-orange-400 mb-1.5" />
                {nextPlannedVacation.daysUntil > 0 ? (
                  <>
                    <p className="text-2xl font-extrabold text-primary dark:text-orange-400 leading-tight">
                      {nextPlannedVacation.daysUntil} {nextPlannedVacation.daysUntil === 1 ? "Day" : "Days"}
                    </p>
                    <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mt-0.5">
                      until your vacation starts
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 leading-tight">
                      Vacation Ongoing Today
                    </p>
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                      Enjoy your scheduled time off!
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 shadow-xs text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
              No planned vacation
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You currently have no upcoming approved leaves scheduled.
            </p>
            <div className="mt-5">
              <Link
                href="/employee/leave-requests"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-amber-800 dark:text-orange-400 dark:hover:text-orange-300 underline underline-offset-4"
              >
                Plan your next vacation →
              </Link>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
