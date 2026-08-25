import { NextResponse } from 'next/server';
// @ts-ignore
import { Client } from 'pg';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const email = searchParams.get('email');

    if (!employeeId && !email) {
        return NextResponse.json({ error: 'employeeId or email is required' }, { status: 400 });
    }

    const client = new Client({
        connectionString: 'postgres://postgres.uxvsqjektsssfvsfprtd:1ZThqfcXko1GsU7o@aws-1-ap-northeast-1.pooler.supabase.com:6543/postgres',
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();
        let query = `
            SELECT 
                e.id, 
                e.full_name, 
                e.epf_number, 
                e.employee_code, 
                e.department, 
                e.branch, 
                e.joined_date, 
                e.employee_type, 
                e.email,
                d.designation_name 
            FROM employee e 
            LEFT JOIN designation d ON e.designation_id::text = d.designation_id::text 
            WHERE 1=1
        `;
        const params: any[] = [];
        if (employeeId) {
            params.push(employeeId);
            query += ` AND (e.id = $${params.length} OR e.employee_code = $${params.length})`;
        } else if (email) {
            params.push(email);
            query += ` AND e.email = $${params.length}`;
        }

        query += ` LIMIT 1`;

        const res = await client.query(query, params);
        await client.end();

        if (res.rows.length > 0) {
            const emp = res.rows[0];
            let joinedDateStr = 'N/A';
            if (emp.joined_date) {
                const d = new Date(emp.joined_date);
                if (!isNaN(d.getTime())) {
                    joinedDateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                }
            }

            return NextResponse.json({
                id: emp.id,
                employeeName: emp.full_name || '',
                epfNumber: emp.epf_number || emp.employee_code || '',
                designation: emp.designation_name || 'N/A',
                dateJoined: joinedDateStr,
                branch: emp.branch || emp.department || 'N/A',
                email: emp.email || '',
                employeeType: emp.employee_type || 'Permanent',
            });
        }

        return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    } catch (err) {
        console.error('Error fetching employee profile:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
