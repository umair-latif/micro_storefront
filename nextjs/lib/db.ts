// Assuming the utility file is '@/lib/supabase-server'
import { createSupabaseServerClient } from '@/lib/supabase-server'; 

export async function getStorefront(slug: string){
    // 1. CALL the function to get the Supabase client instance
    const supabase = createSupabaseServerClient(); 
    
    // 2. Use the client instance to perform queries
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('slug', slug)
        .single();
    
    if(!profile) return null;
    
    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .eq('profile_id', profile.id)
        .order('position');
        
    const { data: products } = await supabase
        .from('products')
        .select('*')
        .eq('profile_id', profile.id)
        .eq('visible', true)
        .order('position');
        
    return { 
        profile, 
        categories: categories || [], 
        products: products || [] 
    };
}