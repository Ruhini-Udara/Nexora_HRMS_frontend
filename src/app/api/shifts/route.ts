import { NextResponse } from 'next/server';

const defaultShifts = [
  {
    id: 1,
    name: "Normal Shift",
    description: "Standard office working hours",
    startTime: "08:30:00",
    endTime: "17:00:00"
  },
  {
    id: 2,
    name: "Driver Shift",
    description: "Transport and logistics shift",
    startTime: "06:00:00",
    endTime: "15:00:00"
  },
  {
    id: 3,
    name: "Night Shift",
    description: "Night security and operations shift",
    startTime: "18:00:00",
    endTime: "06:00:00"
  }
];

export async function GET() {
  return NextResponse.json(defaultShifts);
}

export async function POST(req: Request) {
  const body = await req.json();
  return NextResponse.json({
    id: Date.now(),
    ...body
  });
}
