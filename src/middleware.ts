import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Get cookies
    const token = request.cookies.get('nexora-token')?.value;
    const role = request.cookies.get('nexora-role')?.value;

    console.log(`Middleware: ${pathname} | Token exists: ${!!token} | Role: ${role}`);

    // 2. Define protected routes
    const isAuthPage = pathname.startsWith('/login');
    const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');
    const isEmployeeRoute = pathname === '/employee' || pathname.startsWith('/employee/');
    const isHRRoute = pathname === '/hr' || pathname.startsWith('/hr/');
    const isDirectorRoute = pathname === '/director' || pathname.startsWith('/director/');
    const isSupervisorRoute = pathname === '/supervisor' || pathname.startsWith('/supervisor/');

    const isProtectedRoute = isAdminRoute || isEmployeeRoute || isHRRoute || isDirectorRoute || isSupervisorRoute;

    // 3. Authentication Check: If trying to access protected route without token
    if (isProtectedRoute && !token) {
        console.log(`Redirecting to login: Protected route ${pathname} accessed without token`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Strict Role-Based Authorization Check
    if (token && role) {
        let correctPath = '/employee';
        let isCorrectRoute = isEmployeeRoute;

        if (role === 'ROLE_ADMIN') {
            correctPath = '/admin';
            isCorrectRoute = isAdminRoute;
        } else if (role === 'ROLE_HR') {
            correctPath = '/hr';
            isCorrectRoute = isHRRoute;
        } else if (role === 'ROLE_DIRECTOR') {
            correctPath = '/director';
            isCorrectRoute = isDirectorRoute;
        } else if (role === 'ROLE_SUPERVISOR') {
            correctPath = '/supervisor';
            isCorrectRoute = isSupervisorRoute;
        }

        if (isSupervisorRoute && role !== 'ROLE_SUPERVISOR' && role !== 'ROLE_ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url));
        }

        // If user is accessing a protected route or auth page that doesn't match their role, redirect them
        if ((isProtectedRoute || isAuthPage) && !isCorrectRoute) {
            console.log(`Access Denied/Redirecting: ${role} on ${pathname} -> redirecting to ${correctPath}`);
            return NextResponse.redirect(new URL(correctPath, request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/admin/:path*',
        '/admin',
        '/employee/:path*',
        '/employee',
        '/hr/:path*',
        '/hr',
        '/director/:path*',
        '/director',
        '/supervisor/:path*',
        '/supervisor',
        '/login',
    ],
};
