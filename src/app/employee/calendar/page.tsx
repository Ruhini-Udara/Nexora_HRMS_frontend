"use client";

import React from "react";
import ReadOnlyCalendar from "@/components/calendar/ReadOnlyCalendar";

export default function EmployeeCalendarPage() {
  return (
    <ReadOnlyCalendar
      title="Company Calendar"
      subtitle="View upcoming company events, scheduled trainings, and official holidays."
      themeColor="orange"
    />
  );
}
