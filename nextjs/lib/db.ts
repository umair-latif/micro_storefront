import { supabase } from './supabase-server';

export async function getStorefront(slug: string){
  const { data: profile } = await supabase.from('profiles').select('*').eq('slug', slug).single();
  if(!profile) return null;
  const { data: categories } = await supabase.from('categories').select('*').eq('profile_id', profile.id).order('position');
  const { data: products } = await supabase.from('products').select('*').eq('profile_id', profile.id).eq('visible', true).order('position');
  return { profile, categories: categories || [], products: products || [] };
}
