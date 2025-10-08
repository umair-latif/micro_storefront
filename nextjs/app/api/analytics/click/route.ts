// pages/api/analytics/route.ts (or wherever your Route Handler is)

import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  // Extract data from the request body
  const { profile_id, product_id, cta, source, ua } = await req.json();

  // 1. Instantiate the Supabase client by CALLING the function
  const supabase = createSupabaseServerClient();

  // 2. Use the client object to perform the query
  const { error } = await supabase
    .from('analytics_clicks')
    .insert({ profile_id, product_id, cta, source, ua });

  // Handle errors
  if(error) {
    console.error("Supabase insert error:", error);
    return NextResponse.json({ ok:false, error:error.message }, { status: 400 });
  }

  // Success response
  return NextResponse.json({ ok:true });
}