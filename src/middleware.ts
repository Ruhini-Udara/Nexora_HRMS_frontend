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

    // 3. Authentication Check: If trying to access protected route without token
    if ((isAdminRoute || isEmployeeRoute || isHRRoute || isDirectorRoute) && !token) {
        console.log(`Redirecting to login: Protected route ${pathname} accessed without token`);
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 4. Role-Based Authorization Check
    if (token && role) {
        if (isAdminRoute && role !== 'ROLE_ADMIN') {
            console.log(`Access Denied: ${role} tried to access ${pathname}`);
            return NextResponse.redirect(new URL('/login', request.url));
        }

        if (isEmployeeRoute) {
            // All authenticated users have an employee identity
            if (!role.startsWith('ROLE_')) {
                return NextResponse.redirect(new URL('/login', request.url));
            }
        }

        if (isHRRoute && role !== 'ROLE_HR' && role !== 'ROLE_ADMIN') {
            return NextResponse.redirect(new URL('/login', request.url));
        }

       

        // Redirect logged-in users away from the login page
        if (isAuthPage) {
            let redirectPath = '/employee';
            if (role === 'ROLE_ADMIN') redirectPath = '/admin';
            else if (role === 'ROLE_HR') redirectPath = '/hr';
            else if (role === 'ROLE_DIRECTOR') redirectPath = '/director';

            return NextResponse.redirect(new URL(redirectPath, request.url));
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
        '/login',
    ],
};
