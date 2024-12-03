import { createClient } from '@supabase/supabase-js';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Exclude specific routes from authentication checks
    if (
        pathname.startsWith('/login') ||
        pathname.startsWith('/auth') ||
        pathname.startsWith('/api')
    ) {
        return NextResponse.next();
    }

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log(request.cookies.getAll());
    // Retrieve the user's session token from cookies
    const accessToken = request.cookies.get('sb-vxyxbgiwnqkarvucweje-auth-token')?.value;
    console.log(accessToken);
    if (!accessToken) {
        console.log("Empty Access Token");
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Verify the user session with the access token
    const { data: { user }, error } = await supabase.auth.getUser();
    console.log(user);
    if (!user) {
        console.log("Invalid User");
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    // Proceed to the next middleware or route
    return NextResponse.next();
}
