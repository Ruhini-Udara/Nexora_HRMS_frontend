"use client";

import React from "react";
import ReadOnlyCalendar from "@/components/calendar/ReadOnlyCalendar";

export default function DirectorCalendarPage() {
  return (
    <ReadOnlyCalendar
      title="Company Calendar"
      subtitle="Overview of scheduled corporate events, holiday calendars, and training sessions."
      themeColor="primary"
    />
  );
}
