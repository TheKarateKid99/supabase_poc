import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Retrieve the user's session token from cookies
    const accessToken = request.cookies.get('sb-access-token')?.value;

    if (!accessToken) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Pass the access token as a header for authorization
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);

    if (!user) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Proceed to the next middleware or route
    return NextResponse.next();
}
