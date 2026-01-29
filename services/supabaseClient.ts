
import { createClient } from '@supabase/supabase-js';
import { AppData } from '../types';

// These would be set in Netlify/Production environment variables
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

export const supabase = (supabaseUrl && supabaseAnonKey) 
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export const saveAppDataToCloud = async (userId: string, data: AppData) => {
    if (!supabase) return;
    const { error } = await supabase
        .from('user_data')
        .upsert({ id: userId, content: data, updated_at: new Date() });
    if (error) console.error('Cloud Sync Error:', error);
};

export const loadAppDataFromCloud = async (userId: string): Promise<AppData | null> => {
    if (!supabase) return null;
    const { data, error } = await supabase
        .from('user_data')
        .select('content')
        .eq('id', userId)
        .single();
    if (error) return null;
    return data?.content as AppData;
};
