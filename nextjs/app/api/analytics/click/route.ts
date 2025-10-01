import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  const { profile_id, product_id, cta, source, ua } = await req.json();
  const { error } = await supabase.from('analytics_clicks').insert({ profile_id, product_id, cta, source, ua });
  if(error) return NextResponse.json({ ok:false, error:error.message }, { status: 400 });
  return NextResponse.json({ ok:true });
}
