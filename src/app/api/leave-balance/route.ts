import { NextResponse } from 'next/server';
// @ts-ignore
import { Client } from 'pg';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const year = searchParams.get('year') || String(new Date().getFullYear());

    if (!employeeId) {
        return NextResponse.json({ error: 'employeeId is required' }, { status: 400 });
    }

    const client = new Client({
        connectionString: 'postgres://postgres.uxvsqjektsssfvsfprtd:1ZThqfcXko1GsU7o@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        const res = await client.query(
            'SELECT * FROM leave_balance WHERE employee_id = $1 AND (year = $2 OR year IS NULL) ORDER BY year DESC LIMIT 1',
            [employeeId, year]
        );
        await client.end();

        if (res.rows.length > 0) {
            const row = res.rows[0];
            const annualQuota = row.annual_leave_quota ?? 14;
            const annualUsed = row.annual_leave_used ?? 0;
            const medicalQuota = row.medical_leave_quota ?? 7;
            const medicalUsed = row.medical_leave_used ?? 0;
            const casualQuota = row.casual_leave_quota ?? 7;
            const casualUsed = row.casual_leave_used ?? 0;

            return NextResponse.json({
                annualLeaveQuota: annualQuota,
                annualLeaveUsed: annualUsed,
                annualLeaveRemaining: Math.max(0, annualQuota - annualUsed),
                medicalLeaveQuota: medicalQuota,
                medicalLeaveUsed: medicalUsed,
                medicalLeaveRemaining: Math.max(0, medicalQuota - medicalUsed),
                casualLeaveQuota: casualQuota,
                casualLeaveUsed: casualUsed,
                casualLeaveRemaining: Math.max(0, casualQuota - casualUsed),
            });
        }

        return NextResponse.json({
            annualLeaveQuota: 14,
            annualLeaveUsed: 0,
            annualLeaveRemaining: 14,
            medicalLeaveQuota: 7,
            medicalLeaveUsed: 0,
            medicalLeaveRemaining: 7,
            casualLeaveQuota: 7,
            casualLeaveUsed: 0,
            casualLeaveRemaining: 7,
        });
    } catch (err) {
        console.error('Error in leave-balance API route:', err);
        return NextResponse.json({
            annualLeaveQuota: 14,
            annualLeaveUsed: 0,
            annualLeaveRemaining: 14,
            medicalLeaveQuota: 7,
            medicalLeaveUsed: 0,
            medicalLeaveRemaining: 7,
            casualLeaveQuota: 7,
            casualLeaveUsed: 0,
            casualLeaveRemaining: 7,
        });
    }
}
