import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log(request.cookies.getAll());
    // Get cookies from the request
    const accessToken = request.cookies.get('sb-access-token')?.value;
    const refreshToken = request.cookies.get('sb-refresh-token')?.value;

    if (!accessToken || !refreshToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Set the session manually
    supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

    // Fetch the user session
    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (
        !user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/auth') &&
        !request.nextUrl.pathname.startsWith('/webhook')
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Refresh session tokens if needed
    const updatedSession = await supabase.auth.getSession();
    if (updatedSession.data.session) {
        const { access_token, refresh_token } = updatedSession.data.session;
        supabaseResponse.cookies.set('sb-access-token', access_token, {
            httpOnly: true,
            secure: true,
        });
        supabaseResponse.cookies.set('sb-refresh-token', refresh_token, {
            httpOnly: true,
            secure: true,
        });
    }

    return supabaseResponse;
}
